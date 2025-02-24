import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { isDir } from "../utils/files";
import path from "path";
import templatePro from "../templates/template.pro";
import { convertToAST, convertToProFile } from "../utils/ast_pro";

/**
 * 
 */
export const getProPath = (folder:string) => {
  if (!existsSync(folder)) return null;

  if (isDir(folder)) {
    for (let item of readdirSync(folder)) {
      if (path.extname(item) === ".pro") {
        return path.join(folder, item);
      } 
    }
    return null;
  }

  return folder;
}

/**
 * Return a list of all Headers and C Source files in relative path
 */
export const getCFiles = (rootfolder:string, folder:string = "") => {
  if (!isDir(rootfolder)) rootfolder = path.join(rootfolder, "..");
  
  let result:string[] = [];

  for(const item of readdirSync(path.join(rootfolder, folder))) {
    let itemPath = path.join(folder, item);

    if (isDir(path.join(rootfolder, itemPath))) {
      // recursive
      let recursiveResult = getCFiles(rootfolder, path.join(folder, item));
      result = result.concat(recursiveResult);
    }
    else if (path.extname(item) === ".c" || path.extname(item) === ".h") {
      result.push(itemPath);
    }
  }

  return result;
}

/**
 * 
 */
export const createProFile = (folder:string) => {
  let filePath = getProPath(folder);

  if (filePath) return filePath;
  if (isDir(folder)) {
    filePath = path.join(folder, path.basename(folder) + ".pro");
  }
  else filePath = folder;

  writeFileSync(filePath, templatePro);
  return filePath;
}

/**
 * 
 */
export const updateProSources = (folder:string) => {
  let sources = getCFiles(folder);
  let proPath = getProPath(folder);
  let ast = convertToAST(String(readFileSync(proPath)));
  let sourceAST:ASTVariable;
  let headerAST:ASTVariable;
  
  // search the variables (only the first match)
  for (const node of ast.values) {
    if (sourceAST && headerAST) break;
    if (node.type !== "variable") continue;

    if (!sourceAST && node.key.value === "SOURCES") {
      sourceAST = node;
    }
    else if (!headerAST && node.key.value === "HEADERS") {
      headerAST = node;
    }
  }
  
  // create variable if not exists
  if (!sourceAST) {
    ast.values.push(sourceAST = {
      type: "variable",
      line: ast.values[ast.values.length - 1].line + 2,
      key: {
        left: "\n\n",
        right: "",
        value: "SOURCES"
      },
      opt: {
        left:" ",
        right:"",
        value: "=",
      },
      values: []
    });
  }
  
  if (!headerAST) {
    ast.values.push(headerAST = {
      type: "variable",
      line: ast.values[ast.values.length - 1].line + 2,
      key: {
        left: "\n\n",
        right: "",
        value: "HEADERS"
      },
      opt: {
        left:" ",
        right:"",
        value: "=",
      },
      values: []
    });
  }

  sourceAST.values = [];
  headerAST.values = [];
  
  for (const item of sources) {
    if (path.extname(item) === ".c") {
      sourceAST.values.push({
        type: "literal",
        line: sourceAST.line,
        raws: {
          left: sourceAST.values.length ? " \\\n          \"" : " \"",
          right: "\"",
        },
        value: item,
      })
    }
    else if (path.extname(item) === ".h") {
      headerAST.values.push({
        type: "literal",
        line: headerAST.line,
        raws: {
          left: headerAST.values.length ? " \\\n          \"" : " \"",
          right: "\"",
        },
        value: item,
      })
    }
  }

  if (!headerAST.values.length) {
    headerAST.hidden = true;
  }
  if (!sourceAST.values.length) {
    sourceAST.hidden = true;
  }

  writeFileSync(proPath, convertToProFile(ast));
}
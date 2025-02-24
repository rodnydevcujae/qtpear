import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { isDir } from "../utils/files";
import charactersTable from "./characters-table";

/**
 * Transpile a folder content to a other folder
 * @param folder
 * @param outFolder 
 */
export const transpileFolder = (folder:string, outFolder:string) => {
  
  if (!existsSync(outFolder)) {
    // not exists, create the folder
    mkdirSync(outFolder);
  }

  for (let name of readdirSync(folder)) {
    if (isDir(path.join(folder, name))) {
      transpileFolder(
        path.join(folder, name),
        path.join(outFolder, name)
      );
    }
    else {
      transpileFile(
        path.join(folder, name),
        path.join(outFolder, name)
      );
    }
  
  }
};

/**
 * Transpile the file to a other file
 */
export const transpileFile = (file:string, outFile:string) => {
  
  if (path.extname(file) == ".c" || path.extname(file) == ".h") {
    // is a C file!
    let content = String(readFileSync(file));
    
    // replace only in strings
    content = content.replace(/"(.+)?"/g, (part) => {
      for (let i = 0; i < charactersTable.length; i++) {

        // replace each string based on characters table
        part = part.replace(
          new RegExp("\\" + charactersTable[i][0], "g"),
          charactersTable[i][1]
        );
        
      }
      return part;
    });

    // write the target
    writeFileSync(outFile, content);
  }
  else {
    if (existsSync(outFile)) rmSync(outFile);
    cpSync(file, outFile);
  }
}
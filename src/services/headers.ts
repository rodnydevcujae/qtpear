import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/**
 * Update all prototypes from *.c to *.h
 * @param file - A absolute path to the file to update
*/
export const updatePrototypes = (file:string) => {
  const functionRegex = /(\w+)(\s*\*\s*|\s+)(\w+)\s*\((.*)?\)\s*\{/;
  const protoRegex = /((\w+)(\s*\*\s*|\s+)(\w+)\s*\(((.*)?)\)\s*\;\s*)+/;
  const targetRegex = /(\/\/ *\-\-\- *prototypes) *\n.*\n*(\/\/ *---)/;
  const notPermited = ["if", "while", "for", "switch"];

  const hfile = path.join(file, '..', path.basename(file, path.extname(file)) + '.h');
  let content = String(readFileSync(file));
  let updates = "";

  for (let match of (content.match(new RegExp(functionRegex.source, "g")) || [])) {
    let [, returnType, pointer, functionName, paramsGroup] = match.match(functionRegex);
    
    if (functionName == "main") return null;
    if (notPermited.includes(functionName)) continue;

    pointer = pointer.trim().replace(/\s+/g, " ");
    paramsGroup = paramsGroup ? paramsGroup.split(",").map(v => v.trim().replace(/\s+/g, " ")).join(", ") : "";
    updates += "\n" + returnType + " " + pointer + functionName + "(" + paramsGroup + ");";
  }
  
  let hcontent = existsSync(hfile) ? String(readFileSync(hfile)) : "";
  let match = hcontent.match(targetRegex);

  if (match) {
    hcontent = hcontent.replace(targetRegex, match[1] + updates + "\n" + match[2]);
  }
  else {
    match = hcontent.match(protoRegex);
    updates = "// --- prototypes" + updates + "\n// ---\n" 

    if (match) {
      hcontent = hcontent.replace(protoRegex, updates);
    }
    else {
      let splitted = hcontent.split("\n");
      let pos = Math.floor(splitted.length * 0.9);
      hcontent = splitted.slice(0, pos).join("\n") 
        + "\n\n" + updates + "\n" 
        + splitted.slice(pos).join("\n");
    }
  }
  
  writeFileSync(hfile, hcontent);
  return hfile;
}
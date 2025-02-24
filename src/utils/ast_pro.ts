
/**
 * Utility to split a argument expression
 */
export const splitArguments = (str:string) => {
  const regex = /(?:\"([^\"]*)\"|([^\" ]+))/g;
  const result:string[] = [];
  let match:RegExpExecArray;

  while ((match = regex.exec(str)) !== null) {
    result.push((match[1] || match[2]).trim());
  }

  return result;
}


/**
 * AST Error handler
 */
export class ASTError extends Error {
  constructor (line:number, col:number, text?:string) {
    if (text) {
      super(`Malformed ATS:${line + 1}:${col + 1} -> ${text}`);
    }
    else {
      super(`Malformed ATS:${line + 1}:${col + 1}`);
    }
  }
}

/**
 * Convert a AST json to a pro file
 */
export const convertToProFile = (tree:AST) => {
  let pro = "";
  for (let node of tree.values) {
    if (node.hidden) continue;
    
    if (node.type === "variable") {
      pro += node.key.left + node.key.value + node.key.right;
      pro += node.opt.left + node.opt.value + node.opt.right;
      for (const literal of node.values) {
        if (literal.hidden) continue;
        pro += literal.raws.left + literal.value + literal.raws.right;
      }
    }
    else if (node.type === "comment") {
      pro += node.raws.left + node.value + node.raws.right;
    }
    else {
      throw new ASTError(0, 0, `Unknow node type`);
    }
  }

  return pro;
}

/**
 * Convert a pro file to a AST json
 * BETA
 */
export const convertToAST = (pro:string) => {
  let left = "";
  let line = 0;
  let col = 0;
  let charIndex = 0;
  
  let tree:AST = {
    type: "root",
    values: []
  };
  let astNode:ASTNode;
  let astStep:string = "root";

  while (charIndex < pro.length) {
    const char = pro.charAt(charIndex);
    const isLineBreak = char === "\n";
    const isSpace = char === " " || char === "\t" || char === "\n" || char === "\r";
    const isQuote = char === "\"";
    const isEscape = char === "\\";
    
    //
    // Is a ASTNode
    //
    if (astNode) {
      if (astNode.type === "comment") {
        if (isLineBreak) {
          astNode = null;
          continue;
        }
        else {
          astNode.value += char;
        }
      }
      else if (astNode.type === "variable") {


        // creating the var name
        if (astStep === "key") {
          if (/^\d/.test(char)) {
            if (!astNode.key.value.length) throw new ASTError(line, col, "Variable start with a number");
            astNode.key.value += char;
            charIndex++, col++;
            continue;
          }
          else if (/^[a-zA-Z]$/.test(char)) {
            astNode.key.value += char;
            charIndex++, col++;
            continue;
          }
          else if (char === " ") {
            left = char;
            astStep = "opt-left";
            charIndex++, col++;
            continue;
          }
          else {
            throw new ASTError(line, col, "Invalid character. Variable names only contain letters and numbers");
          }

        }


        // search the operator
        else if (astStep === "opt-left") {
          if (char === " ") {
            left += char;
            charIndex++, col++;
            continue;
          }
          else if (/\+|\-|\*|\=/.test(char)) {
            astNode.opt.left = left;
            astStep = "opt";
            left = "";
            continue;
          }
          else {
            throw new ASTError(line, col, "Invalid character. Operator or a space expected");
          }
        }


        // create the operator
        else if (astStep === "opt") {
          if (!astNode.opt.value.length) {
            if (char === "=") {
              astNode.opt.value = char;
              astStep = "value-left";
              left = "";
              charIndex++, col++;
              continue;
            }
            else if (/\+|\-|\*/.test(char)) {
              astNode.opt.value = char;
              charIndex++, col++;
              continue;
            }
            else {
              throw new ASTError(line, col, "Invalid character. Operator or a space expected");
            }
          }
          else {
            if (char === "=") {
              astNode.opt.value += char;
              astStep = "value-left";
              left = "";
              charIndex++, col++;
              continue;
            }
            else {
              throw new ASTError(line, col, "Invalid character. Equals sign expected");
            }
          }
        }


        // search a value
        else if (astStep === "value-left") {
          if (char === " " || isEscape || (isLineBreak && left.endsWith("\\"))) {
            left += char;
            charIndex++;
            if (isLineBreak) {
              col = 0;
              line++;
            }
            else col++;
            continue;
          }
          else if(isQuote) {
            left += char;
            astNode.values.push({
              type: "literal",
              line,
              raws: {
                left,
                right: ""
              },
              value: "",
            });
            left = "";
            astStep = "value";
            charIndex++;
            col++;
            continue;
          }
          else if (isLineBreak) {
            if (astNode.values.length) {
              // have some value
              charIndex++;
              col = 0, line++;
              astStep = null;
              astNode = null;
              continue;
            }
            else {
              throw new ASTError(line, col, `Invalid linebreak. Value in "${astNode.key.value}" variable expected`);
            }
          }
          else {
            astNode.values.push({
              type: "literal",
              line,
              raws: {
                left,
                right: ""
              },
              value: "",
            });
            left = "";
            astStep = "value";
            continue; // this character
          }
        }


        // create a value
        else if (astStep === "value") {
          const literal = astNode.values[astNode.values.length - 1];
          
          if (isQuote) {
            // is a literal with quotes
            if (literal.raws.left.endsWith("\"")) {
              literal.raws.right = char;
              charIndex++, col++;
              astStep = "value-left";
              continue;
            }
            else {
              throw new ASTError(line, col, "Invalid quote.");
            }
          }
          else if (char === " "){
            // is a escaped space or is a space into quotes literal
            if (literal.value.endsWith("\\") || literal.raws.left.endsWith("\"")) {
              literal.value += char;
              charIndex++, col++;
              continue;
            }
            else {
              left = char;
              charIndex++, col++;
              astStep = "value-left";
              continue;
            }
          }
          else if (isLineBreak) {
            // is a escaped line break
            if (literal.value.endsWith("\\")) {
              literal.value += char;
              charIndex++;
              col = 0, line++;
              continue;
            }
            else if (!literal.raws.left.endsWith("\"")) {
              astStep = "root";
              left = char;
              astNode = null;
              charIndex++;
              col = 0, line++;
              continue;
            }
            else {
              throw new ASTError(line, col, "Invalid linebreak. Quote expected");
            }
          }
          else {
            literal.value += char;
            charIndex++;
            col++;
            continue;
          }
        }
      }
    }

    //
    // Isn't a ASTNode
    //
    else {
      if (char === "#") {
        // is a start of a comment
        astNode = {
          type: "comment",
          line,
          raws: {
            left,
            right: "",
          },
          value: char,
        };
        tree.values.push(astNode);
        left = "";
        charIndex++;
        col++;
        continue;
      }
      else if (isSpace) {
        // is a space, add to the raw left characters
        left += char;
        charIndex++;
        if (isLineBreak) {
          col = 0;
          line++;
        }
        else col++;
        continue;
      }
      else {
        // is a start of a variable, start a new ASTNode
        astNode = {
          type: "variable",
          line,
          key: {
            left,
            right: "",
            value: "",
          },
          opt: {
            left: "",
            right: "",
            value: ""
          },
          values: []
        };
        tree.values.push(astNode);
        left = "";
        astStep = "key";
        continue;
      }
    }
  }

  return tree;
} 
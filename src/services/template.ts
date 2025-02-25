import template_basic from "../templates/template_basic.json"
import template_logic from "../templates/template_logic.json"
import template_logicEn from "../templates/template_logic-en.json"
import template_extended from "../templates/template_extended.json"
import template_extendedEn from "../templates/template_extended-en.json"
import { mkdirSync, writeFileSync } from "fs"
import path from "path"
import { createProFile, updateProSources } from "./qtpro"

export const templates = {
  "basic": template_basic,
  "logic": template_logic,
  "logic-en": template_logicEn,
  "extended": template_extended,
  "extended-en": template_extendedEn,
};

type TemplateFile = [string, string | TemplateFile[]];

export const createProject = (projectFolder:string, templateId = "basic") => {
  let template = templates[templateId];

  mkdirSync(projectFolder);

  const recursive = (list:TemplateFile[], folder:string) => {
    for (let [file, content] of list) {
      let filePath = path.join(folder, file);
      if (typeof(content) === "string") {
        writeFileSync(filePath, content);
      }
      else {
        mkdirSync(filePath);
        recursive(content, filePath);
      }
    }
  };

  recursive(template.structure, projectFolder);
  createProFile(projectFolder);
  updateProSources(projectFolder);
}
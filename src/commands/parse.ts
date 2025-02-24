
import path from "path";
import { Command } from "commander"
import { transpileFolder } from "../services/transpile";
import { existsSync } from "fs";
import { intro, log, outro, tasks } from "@clack/prompts";

export const parseCommand = () => {
  const program = new Command();

  program
    .name("parse")
    .description("Clona el proyecto y transpila los carácteres especiales que encuentra en las cadenas.")
    .command("parse [archivo]")
    .action(async (folder) => {
      let projectFolder = path.join(process.cwd(), folder || ".");
      let outProjectFolder = path.join(process.cwd(), "..", path.basename(projectFolder) + "_parsed_to_minwin_5.3.2");
      
      intro("< QtPear Parser >");
      if (!existsSync(projectFolder)) {
        log.error("El directorio indicado no existe.\n" + projectFolder);
        outro();
        return process.exit(1);
      }
      await tasks([
        {
          title: "Transpilando proyecto...",
          task: async () => {
            transpileFolder(projectFolder, outProjectFolder);
            return "Caracteres especiales transpilados exitosamente!\n" + "Ubicado en -> " + outProjectFolder;
          }
        }
      ]);
    })

  return program;
}
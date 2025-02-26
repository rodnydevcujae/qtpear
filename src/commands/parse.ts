
import path from "path";
import { Command } from "commander"
import { transpileFolder } from "../services/transpile";
import { intro, log, outro, tasks } from "@clack/prompts";
import { getProPath } from "../services/pro";

export const makeParseCommand = () => {
  const program = new Command();

  program
    .name("parse")
    .alias("p")
    .description("Clona el proyecto y transpila los carácteres especiales que encuentra en las cadenas.")
    .argument("[file]", "Archivo *.pro a actualizar. Si no se define, se buscará en el directorio actual.")
    .action(async (folder) => {
      folder = path.join(process.cwd(), folder || ".");
      let projectFile = getProPath(folder);
      
      intro("< Qtpear Parser >");
      if (!projectFile) {
        log.error("No fue encontrado un archivo de proyecto *.pro en la ubicación indicada.\n" + folder);
        outro();
        return process.exit(1);
      }
      
      let projectFolder = path.dirname(projectFile);
      let outProjectFolder = projectFolder + "_parsed_to_minwin_5.3.2";
      
      await tasks([
        {
          title: "Transpilando proyecto...",
          task: async () => {
            transpileFolder(projectFolder, outProjectFolder);
            return "Caracteres especiales transpilados exitosamente!\n" + "Ubicado en: " + outProjectFolder;
          }
        }
      ]);

      outro();
    })

  return program;
}
import path from "path";
import { intro, log, outro, select, tasks, text } from "@clack/prompts";
import { Command } from "commander"
import { isDir } from "../utils/files";
import { createProject, templates } from "../services/template";
import { existsSync } from "fs";

export const makeCreateCommand = () => {
  const program = new Command("create");

  program
    .alias("c")
    .description("Crear proyecto a partir de una plantilla")
    .argument("[name]", "Nombre del proyecto a crear")
    .option("-t, --template <TEMPLATE>", "Identificador de la plantilla")
    .option("-l, --list", "Listar plantillas disponibles")
    .action(async (name, options) => {

      if (options.list) {
        log.info("Plantillas disponibles:")
        Object.keys(templates).forEach(id => {
          log.message(id);
          log.message(`${templates[id].info}`);
        })
        return process.exit();
      }

      let cwd = process.cwd();
      let projectFolder:string;
      let templateId:string = options.template;
      
      intro("< Qtpear Crear Proyecto >");
      //
      // get folder name
      //
      const handleValidationName = (value:string) => {
        projectFolder = path.join(cwd, value);
        if (existsSync(projectFolder) && isDir(projectFolder)) {
          return new Error(`El directorio ${projectFolder} ya existe.`);
        }
        return undefined;
      }
      if (name) {
        let error = handleValidationName(name);
        if (error) {
          log.error(error.message);
          return process.exit(1);
        }
      }
      else {
        name = await text({
          message: "Nombre del proyecto",
          validate: handleValidationName 
        });
      } 

      //
      // get template id
      //
      if (templateId) {
        templateId = templateId.toLowerCase();
        if (!templates[templateId]) {
          log.error(`No se encontró la plantilla ${templateId}`);
          log.message(`Plantillas disponibles: ${Object.keys(templates).join(", ")}`);
          return process.exit(1);
        }
      }
      else {
        templateId = await select({
          message: "Plantilla del proyecto",
          options: Object.keys(templates).map((key) => {
            return { value: templates[key].id, hint: templates[key].info }
          })
        });
      }

      await tasks([{
        title: "Creando proyecto con plantilla " + templateId,
        task: () => {
          createProject(projectFolder, templateId);
          return "Proyecto creado exitosamente!"
        }
      }]);

      log.message("Ubicado en " + projectFolder);
      outro();
    })

  return program;
}
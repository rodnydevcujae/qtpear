
import path from 'path';
import { Command } from 'commander'
import { intro, log, outro, tasks } from '@clack/prompts';
import { createProFile, getCFiles, getProPath, updateProSources } from '../../services/pro';
import { updatePrototypes } from '../../services/headers';

export const makeAutoHeadersCommand = () => {
  const program = new Command('headers');

  program
    .alias("h")
    .alias("header")
    .description('Genera y actualiza automáticamente los *.h con sus respectivos prototipos.')
    .argument('[file]', 'Archivo *.pro a actualizar. Si no se define, se buscará en el directorio actual.')
    .action(async (file, options) => {
      let folder = path.join(process.cwd(), file || '.');
      let proPath = getProPath(folder);

      if (!proPath) {
        if (!options.force) {
          log.error(`Error! No se encontro un archivo de proyecto QT en ${folder}.`);
          log.error(`Has intentado probar con la opción --force ?`);
          return process.exit(1);
        }
        proPath = createProFile(folder);
        updateProSources(proPath);
      }
      
      intro('< Qtpear Autogenerar Headers/Prototipos >');
      log.info(`Actualizando proyecto ${path.basename(proPath, path.extname(proPath))} ...`);
      await tasks(getCFiles(folder).filter(v => v.endsWith('.c')).map(v => {
        return { 
          title: `Actualizando ${v}`,
          task: async () => {
            let hfile = updatePrototypes(path.join(folder, v));
            if (!hfile) return " ";
            return `-> ${hfile}`;
          }
        }
      }));
      log.info("Todos los encabezados han sido actualizados.");

      outro();
    });

  return program;
}
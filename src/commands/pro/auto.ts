
import path from 'path';
import { Command } from 'commander'
import { intro, log, outro, tasks } from '@clack/prompts';
import { createProFile, getProPath, updateProSources } from '../../services/qtpro';

export const proAutoCommand = () => {
  const program = new Command('auto');

  program
    .description('Genera o actualiza automáticamente el *.pro a partir de los archivos *.c y *.h en tu proyecto.')
    .argument('[file]', 'Archivo *.pro a actualizar. Si no se define, se buscará en el directorio actual.')
    .option('-f, --force', 'Si no existe el archivo .pro, crearlo.')
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
      }
      
      intro('< QtPear AutoPro >');
      log.info(`Actualizando ${path.basename(proPath)} ...`);
      await tasks([
        {
          title: 'Actualizando ...',
          task: async (message) => {
            updateProSources(proPath);
            return `Tarea finalizada exitosamente`;
          },
        },
      ]);
    });

  return program;
}
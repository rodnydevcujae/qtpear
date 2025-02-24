import { Command } from "commander"
import { proAutoCommand } from "./auto";

export const proCommand = () => {
  const program = new Command("pro");

  program
    .description("Procesa el archivo de proyecto (*.pro)")
    .addCommand(proAutoCommand())

  return program;
}
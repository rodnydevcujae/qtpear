import { Command } from "commander"
import { makeProAutoCommand } from "./auto";

export const makeProCommand = () => {
  const program = new Command("pro");

  program
    .description("Procesa el archivo de proyecto (*.pro)")
    .addCommand(makeProAutoCommand())

  return program;
}
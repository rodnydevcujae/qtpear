import { Command } from "commander"
import { makeAutoProCommand } from "./pro";
import { makeAutoHeadersCommand } from "./header";

export const makeAutoCommand = () => {
  const program = new Command("auto");

  program
    .description("Automatiza tareas comunes en el proyecto")
    .addCommand(makeAutoProCommand())
    .addCommand(makeAutoHeadersCommand())

  return program;
}
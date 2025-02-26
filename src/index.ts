import pkg from "../package.json";
import { Command } from "commander";
import { makeParseCommand } from "./commands/parse";
import { makeAutoCommand } from "./commands/auto";
import { makeCreateCommand } from "./commands/create";

const program = new Command();

program
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description);

program.addCommand(makeParseCommand());
program.addCommand(makeAutoCommand());
program.addCommand(makeCreateCommand());

program.parse();


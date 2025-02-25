import pkg from "../package.json";
import { Command } from "commander";
import { makeParseCommand } from "./commands/parse";
import { makeProCommand } from "./commands/pro";
import { makeCreateCommand } from "./commands/create";

const program = new Command();

program
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description);

program.addCommand(makeParseCommand());
program.addCommand(makeProCommand());
program.addCommand(makeCreateCommand());

program.parse();


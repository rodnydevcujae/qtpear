import pkg from "../package.json";
import { Command } from "commander";
import { parseCommand } from "./commands/parse";
import { proCommand } from "./commands/pro";

const program = new Command();

program
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description);

program.addCommand(parseCommand());
program.addCommand(proCommand());

program.parse();


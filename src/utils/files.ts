import { statSync } from "fs";

export const isDir = (dir:string) => statSync(dir).isDirectory();

import { exec } from "child_process"
import { existsSync, readFileSync, writeFileSync } from "fs";
import { randStr } from "../utils/rand";
import path from "path";

/**
 * 
 */
export const createBuildDir = (folder:string) => {
  const rcdir = path.join(folder, ".buildrc"); 
  let dir:string;
  let data:string;

  if (existsSync(rcdir)) {
    data = String(readFileSync(rcdir));
    try {
      dir = JSON.parse(data).bundle || null;
    } catch (e) {

    }
  }

  if (!dir) {
    dir = ".build-" + randStr(6);
    writeFileSync(rcdir, JSON.stringify({bundle: dir}));
  }

  return path.join(folder, dir);
}

/**
 * 
 */
export const generateMakefile = async (fromfolder:string, tofolder:string) => {
  await new Promise((resolve) => {
    exec(`cd "${tofolder}" && qmake ${fromfolder}`, (error, stdout, stderr) => {
      resolve(null);
    });
  });
}

/**
 * 
 */
export const compileMakefile = async (fromfolder:string, tofolder:string) => {
  await new Promise((resolve) => {
    exec(`cd "${tofolder}" && make ${fromfolder}`, (error, stdout, stderr) => {
      resolve(null);
    });
  });
}

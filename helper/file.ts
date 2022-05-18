import {
  ensureDir,
  ensureDirSync,
  ensureFile,
} from "https://deno.land/std@0.139.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.139.0/path/mod.ts";

import * as settings from "../settings.ts";

class File {
  private readonly dirPrefix = `.generated/${settings.docVer}`;

  async ensureDir(dirname: string): Promise<void> {
    await ensureDir(join(this.dirPrefix, dirname));
  }

  ensureDirSync(dirname: string): void {
    ensureDirSync(join(this.dirPrefix, dirname));
  }

  async ensureFile(filename: string): Promise<void> {
    await ensureFile(join(this.dirPrefix, filename));
  }

  async writeText(filename: string, content: string): Promise<void> {
    await Deno.writeTextFile(join(this.dirPrefix, filename), content);
  }

  writeTextSync(filename: string, content: string): void {
    Deno.writeTextFileSync(join(this.dirPrefix, filename), content);
  }

  async readText(filename: string): Promise<string> {
    return await Deno.readTextFile(join(this.dirPrefix, filename));
  }
}

export const file = new File();

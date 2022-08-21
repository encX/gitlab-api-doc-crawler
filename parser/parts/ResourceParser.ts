import { cheerio, TagElement } from "https://deno.land/x/cheerio@1.0.6/mod.ts";

import { Resource } from "../../types/models.ts";
import { Parser } from "../../types/Parser.ts";

export class ResourceParser implements Parser<Resource[]> {
  constructor(private readonly elem: TagElement) {}

  isValid(): boolean {
    return this.elem.name === "div" && /language-(plaintext|shell)/gi.test(this.elem.attribs["class"]);
  }

  parse(): Resource[] {
    return cheerio(this.elem)
      .find("code")
      .text()
      .split("\n")
      .filter((u) => u && this.isResource(u))
      .map((u) => {
        const [method, _path] = u.split(/ +/);
        const path = _path
          .replace(/https:\/\/gitlab.example.com\/api\/v4(.+)/, "$1")
          .replace(/^(?!\/)(.+)/, "/$1")
          .replace("environments_id", "environment_id"); // fix for editAnExistingEnvironment
        return { method, path };
      });
  }

  private isResource(str: string): boolean {
    const [method, path] = str.split(/ +/);
    return /^(GET|POST|PUT|PATCH|DELETE)$/i.test(method) && /^(\/?:?\w+)((\/:?\w+))*/.test(path);
  }
}

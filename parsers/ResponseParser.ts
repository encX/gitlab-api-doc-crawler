import { cheerio, TagElement } from "https://deno.land/x/cheerio@1.0.4/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.132.0/fs/mod.ts";

import { Parser } from "./Parser.ts";

export class ResponseParser implements Parser<any> {
  constructor(
    private readonly elem: TagElement,
    private readonly page: string,
    private readonly apiName: string
  ) {}

  isValid(): boolean {
    return /language-json/gi.test(this.elem.attribs["class"]);
  }

  parse() {
    return this.sanitizeAndParse(
      cheerio(this.elem).find("code").text().replace(/\n/g, "")
    );
  }

  private sanitizeAndParse(json: string): any {
    const sanitized = json
      // truncated list/objects
      .replace(/\.\.\. *(]|})/g, "$1")
      .replace(/(\[|{) *\.\.\./g, "$1")
      .replace(/, *(]|})/g, "$1")
      // json comments
      .replace(/([\[{,]) *\/\/[\w\s\d`,.]+"/g, '$1"')
      .replace(/\[ *\/\/[\w\s\d`,.]+{/g, "[{")
      // bad string in diff
      .replace(/\\ /g, "\\\\ ")
      // missing colon (this is so stupid, GitLab!)
      .replace(/("job_artifacts_size": 0|"user_id": 1)[\s\n]+"/g, '$1,"')
      // key without quote
      .replace(/ {4}(\w+): (?=["ntf\[\{\d])/g, '"$1":');

    try {
      return JSON.parse(sanitized);
    } catch {
      ensureDirSync(`.generated/unparsable`);
      Deno.writeTextFileSync(
        ".generated/unparsable/" +
          this.page.replace(/\.html/, "") +
          "__" +
          this.apiName.replace(/[ \\\/\.]/g, "_").toLowerCase() +
          ".json",
        sanitized
      );
      return sanitized;
    }
  }
}

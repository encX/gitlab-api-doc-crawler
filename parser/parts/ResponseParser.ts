import { cheerio, TagElement } from "https://deno.land/x/cheerio@1.0.6/mod.ts";
import { join } from "https://deno.land/std@0.152.0/path/mod.ts";

import { Parser } from "../../types/Parser.ts";
import { file } from "../../helper/file.ts";

export class ResponseParser implements Parser<unknown> {
  constructor(private readonly elem: TagElement, private readonly page: string, private readonly apiName: string) {}

  isValid(): boolean {
    return /language-json/gi.test(this.elem.attribs["class"]);
  }

  parse() {
    return this.sanitizeAndParse(cheerio(this.elem).find("code").text().replace(/\n/g, ""));
  }

  private sanitizeAndParse(json: string): unknown {
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
      const unparseableDir = "unparsable_response";
      const filename =
        this.page.replace(/\.html/, "") + "__" + this.apiName.replace(/[ \\\/\.]/g, "_").toLowerCase() + ".json";

      file.ensureDirSync(unparseableDir);
      file.writeTextSync(join(unparseableDir, filename), sanitized);
      return sanitized;
    }
  }
}

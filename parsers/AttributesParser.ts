import { cheerio, TagElement } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

import { Attribute } from "../models.ts";
import { Parser } from "./Parser.ts";

export class AttributesParser implements Parser<Attribute[]> {
  constructor(private readonly elem: TagElement) {}

  isValid(): boolean {
    return this.elem.name === "table";
  }

  parse(): Attribute[] {
    return cheerio(this.elem)
      .find("tbody>tr")
      .toArray()
      .map((tr) => {
        const [_name, type, _required, _descr] = cheerio(tr)
          .find("td")
          .toArray()
          .map((td) => cheerio(td).text().replace(/\n/g, " ").trim());
        return {
          name: _name,
          type,
          required: _required === "yes",
          description: _descr,
        };
      });
  }
}

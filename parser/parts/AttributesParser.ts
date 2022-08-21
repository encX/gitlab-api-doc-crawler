import { cheerio, TagElement } from "https://deno.land/x/cheerio@1.0.6/mod.ts";

import { Attribute } from "../../types/models.ts";
import { Parser } from "../../types/Parser.ts";

export class AttributesParser implements Parser<Attribute[]> {
  constructor(private readonly elem: TagElement) {}

  isValid(): boolean {
    return (
      this.elem.name === "table" &&
      cheerio(this.elem)
        .find("thead>tr>th")
        .toArray()
        .some((th) => /attribute|parameter/i.test(cheerio(th).text()))
    );
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

import {
  TextElement,
  TagElement,
  cheerio,
} from "https://deno.land/x/cheerio@1.0.4/mod.ts";

import { Api, Attribute, Resource } from "./models.ts";
import { load } from "./helper/page.ts";
import { glUrl } from "./helper/url.ts";

export class PageCrawler {
  constructor(private pagePath: string) {}

  async getApis(): Promise<Api[]> {
    const $ = await load(glUrl.pageUrl(this.pagePath));
    const content = $("div.article-content");

    const tagElems = content
      .children()
      .toArray()
      .map((c) => this.getTagElem(c))
      .filter((c) => c !== null && c !== undefined) as TagElement[];

    const chunks = this.getChunksByH2(tagElems);

    const apis = chunks
      .map((c) => this.tryParseApi(c))
      .filter((a) => a) as Api[];

    return apis;
  }

  private getTagElem(
    elem: TagElement | TextElement | null
  ): TagElement | undefined {
    if (!elem || elem.type !== "tag") return undefined;
    return elem;
  }

  private getChunksByH2(elems: TagElement[]): TagElement[][] {
    const groups: TagElement[][] = [];
    let current: TagElement[];

    elems.forEach((e) => {
      if (e.name === "h2") {
        if (current) groups.push(current);
        current = [e];
      } else if (Array.isArray(current)) {
        current.push(e);
      } else {
        console.warn(
          "=> Uncatched element",
          e.name,
          cheerio(e).text().replace(/\n/g, "\\\\n")
        );
      }
    });

    return groups;
  }

  private tryParseApi(elems: TagElement[]): Api | undefined {
    let name = "";
    // introduced-in
    let description = "";
    // h3
    let resources: Resource[] = [];
    // "Parameters:"
    let attributes: Attribute[] = [];
    // ? "Example Request:"
    let exampleRequest: string[] = [];
    // "Example Response:"
    let exampleResponse = "";

    let invalid = false;

    elems.forEach((e) => {
      if (this.shouldSkip(e)) return;

      if (e.name === "h2") {
        name = cheerio(e.children).text().replace(/\n/g, " ").trim();
      }

      if (e.name === "p") {
        description = cheerio(e.children).text().replace(/\n/g, " ").trim();
      }

      if (e.name === "div" && /language-plaintext/gi.test(e.attribs["class"])) {
        resources = cheerio(e)
          .find("code")
          .text()
          .split("\n")
          .filter((u) => u)
          .map((u) => {
            const [method, path] = u.split(" ");
            return { method, path };
          });
      }

      if (e.name === "table") {
        attributes = cheerio(e)
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

      if (/language-json/gi.test(e.attribs["class"])) {
        exampleResponse = JSON.stringify(
          JSON.parse(cheerio(e).find("code").text().replace(/\n/g, ""))
        );
      }
    });

    if (invalid) return undefined;
    return { name, description, resources, attributes, response: {} };
    // at least title, desc?, urls, attrs?, reqEx, resEx?
  }

  private shouldSkip(elem: TagElement): boolean {
    if (/introduced-in/gi.test(elem.attribs["class"])) return true;
    return false;
  }
}

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
      if (/h[1-3]/.test(e.name)) {
        if (current) {
          groups.push(current);
        }
        current = [e];
      } else if (Array.isArray(current)) {
        current.push(e);
      } else {
        // console.warn(
        //   "=> Uncatched element",
        //   e.name,
        //   cheerio(e).text().replace(/\n/g, "\\\\n")
        // );
      }
    });

    if (current! && Array.isArray(current)) groups.push(current);

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
    let exampleResponse: any = null;

    let invalid = false;

    elems.forEach((e) => {
      if (this.shouldSkip(e)) return;

      if (/h[1-3]/.test(e.name)) {
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

      if (
        /language-json/gi.test(e.attribs["class"]) &&
        (exampleResponse === null || typeof exampleResponse === "string")
      ) {
        // check if api hit cultiple code blocks
        const text = cheerio(e).find("code").text().replace(/\n/g, "");
        exampleResponse = this.sanitizeAndParse(text);
      }
    });

    if (invalid) return undefined;
    if (typeof exampleResponse === "string") {
      console.warn("Parsing error persist!", `${this.pagePath} > ${name}`);
    }
    return {
      name,
      description,
      resources,
      attributes,
      response: exampleResponse,
    };
    // at least title, desc?, urls, attrs?, reqEx, resEx?
  }

  private shouldSkip(elem: TagElement): boolean {
    if (/introduced-in/gi.test(elem.attribs["class"])) return true;
    if (/Example (request|response):?/gi.test(cheerio(elem).text()))
      return true;
    return false;
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
      .replace(/("job_artifacts_size": 0)[\s\n]+"/g, '$1,"');

    try {
      return JSON.parse(sanitized);
    } catch {
      return sanitized;
    }
  }
}

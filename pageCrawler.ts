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
      }
    });

    if (current! && Array.isArray(current)) {
      groups.push(current);
    }
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
        // nice to have: handle if h2&  h3 coexist in the same block
      }

      if (e.name === "p" && !description) {
        description = cheerio(e.children).text().replace(/\n/g, " ").trim();
      }

      if (
        e.name === "div" &&
        /language-(plaintext|shell)/gi.test(e.attribs["class"])
      ) {
        resources.push(
          ...cheerio(e)
            .find("code")
            .text()
            .split("\n")
            .filter((u) => u && this.isResource(u))
            .map((u) => {
              const [method, path] = u.split(/ +/);
              return { method, path };
            })
        );
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
        if (exampleResponse !== null) {
          console.log(
            `${glUrl.pageUrl(this.pagePath)}#${name
              .toLowerCase()
              .replace(/ /g, "-")
              .replace(/\//g, "")}`,
            "Hit multiple code block!"
          );
        }

        if (exampleResponse === null || typeof exampleResponse === "string") {
          // check if api hit cultiple code blocks
          const text = cheerio(e).find("code").text().replace(/\n/g, "");
          exampleResponse = this.sanitizeAndParse(text);
        }
      }
    });

    if (invalid) return undefined;
    if (typeof exampleResponse === "string") {
      console.warn("Parsing error persist!", `${this.pagePath} > ${name}`);
    }

    if (!name || resources.length === 0) return undefined;

    return {
      name,
      description,
      resources,
      attributes,
      response: exampleResponse,
    };
  }

  private shouldSkip(elem: TagElement): boolean {
    if (/introduced-in/gi.test(elem.attribs["class"])) return true;
    if (
      /Parameters|(Example (request|response)):?/gi.test(cheerio(elem).text())
    )
      return true;
    return false;
  }

  private isResource(str: string): boolean {
    const [method, path] = str.split(/ +/);
    return (
      /^(GET|POST|PUT|PATCH|DELETE)$/i.test(method) &&
      /^(\/?:?\w+)((\/:?\w+))*/.test(path)
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
      return sanitized;
    }
  }
}

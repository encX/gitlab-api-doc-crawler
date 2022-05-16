import {
  TextElement,
  TagElement,
  cheerio,
} from "https://deno.land/x/cheerio@1.0.4/mod.ts";

import { Api } from "./types/models.ts";
import { load } from "./helper/page.ts";
import { glUrl } from "./helper/url.ts";
import { ResourceParser } from "./parsers/ResourceParser.ts";
import { AttributesParser } from "./parsers/AttributesParser.ts";
import { ResponseParser } from "./parsers/ResponseParser.ts";
import { ApiBuilder } from "./ApiBuilder.ts";

export class PageParser {
  constructor(private pagePath: string) {}

  async getApis(): Promise<Api[]> {
    const $ = await load(glUrl.pageUrl(this.pagePath));
    const content = $("div.article-content");

    const tagElems = content
      .children()
      .toArray()
      .map((c) => PageParser.getTagElem(c))
      .filter((c) => c !== null && c !== undefined) as TagElement[];

    const chunks = PageParser.getChunksByHElem(tagElems);

    const apis = chunks
      .map((c) => this.tryParseApi(c))
      .filter((a) => a) as Api[];

    return apis;
  }

  private static getTagElem(
    elem: TagElement | TextElement | null
  ): TagElement | undefined {
    if (!elem || elem.type !== "tag") return undefined;
    return elem;
  }

  private static isHElem(e: TagElement): boolean {
    return /h[1-3]/.test(e.name);
  }

  private static getChunksByHElem(elems: TagElement[]): TagElement[][] {
    const groups: TagElement[][] = [];
    let current: TagElement[];

    elems.forEach((e) => {
      if (PageParser.isHElem(e)) {
        if (current) groups.push(current);
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
    const apiBuilder = new ApiBuilder();

    elems.forEach((e) => {
      const resourceParser = new ResourceParser(e);
      const attributesParser = new AttributesParser(e);
      const responseParser = new ResponseParser(
        e,
        this.pagePath,
        apiBuilder.getName()
      );

      if (PageParser.shouldSkip(e)) return;

      if (PageParser.isHElem(e))
        apiBuilder.withName(PageParser.getElementText(e));

      if (e.name === "p")
        apiBuilder.withDescription(PageParser.getElementText(e));

      if (resourceParser.isValid())
        apiBuilder.withResources(resourceParser.parse());

      if (attributesParser.isValid())
        apiBuilder.withAttributes(attributesParser.parse());

      if (responseParser.isValid())
        apiBuilder.withResponse(responseParser.parse());
    });

    const api = apiBuilder.build();

    if (typeof api.response === "string") {
      console.warn("Parsing error persist!", `${this.pagePath} > ${api.name}`);
    }

    if (!api.name || api.resources.length === 0) return undefined;
    return api;
  }

  private static getElementText(elem: TagElement): string {
    return cheerio(elem.children).text().replace(/\n/g, " ").trim();
  }

  private static shouldSkip(elem: TagElement): boolean {
    if (/introduced-in/gi.test(elem.attribs["class"])) return true;
    if (
      /Parameters|(Example (request|response)):?/gi.test(cheerio(elem).text())
    )
      return true;
    return false;
  }
}

import { TagElement, cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

import { ApiBuilder } from "./ApiBuilder.ts";
import { ResourceParser } from "./parts/ResourceParser.ts";
import { AttributesParser } from "./parts/AttributesParser.ts";
import { ResponseParser } from "./parts/ResponseParser.ts";
import { loadPage } from "../helper/page.ts";
import { getChunksByHElem, getElementText, getTagElem, isHElem } from "../helper/dom.ts";
import { glUrl } from "../helper/url.ts";
import { Api } from "../types/models.ts";

export class PageParser {
  constructor(private pagePath: string) {}

  async getApis(): Promise<Api[]> {
    const $ = await loadPage(glUrl.pageUrl(this.pagePath));
    const content = $("div.article-content");

    const tagElems = content
      .children()
      .toArray()
      .map((c) => getTagElem(c))
      .filter((c) => c !== null && c !== undefined) as TagElement[];

    const chunks = getChunksByHElem(tagElems);

    const apis = chunks.map((c) => this.tryParseApi(c)).filter((a) => a) as Api[];

    return apis;
  }

  private tryParseApi(chunk: TagElement[]): Api | undefined {
    const apiBuilder = new ApiBuilder();

    chunk.forEach((elem) => {
      const resourceParser = new ResourceParser(elem);
      const attributesParser = new AttributesParser(elem);
      const responseParser = new ResponseParser(elem, this.pagePath, apiBuilder.getName());

      if (PageParser.shouldSkip(elem)) return;

      if (isHElem(elem)) apiBuilder.withName(getElementText(elem));
      if (elem.name === "p") apiBuilder.withDescription(getElementText(elem));
      if (resourceParser.isValid()) apiBuilder.withResources(resourceParser.parse());
      if (attributesParser.isValid()) apiBuilder.withAttributes(attributesParser.parse());
      if (responseParser.isValid()) apiBuilder.withResponse(responseParser.parse());
    });

    const api = apiBuilder.build();

    if (!api.name || api.resources.length === 0) return undefined;

    if (typeof api.response === "string") console.warn("Parsing error persist!", `${this.pagePath} > ${api.name}`);

    return api;
  }

  private static shouldSkip(elem: TagElement): boolean {
    return PageParser.isInfoBubble(elem) || PageParser.isBlockTitle(elem);
  }

  private static isBlockTitle(elem: TagElement): boolean {
    return elem.name === "p" && /Parameters|(Example (request|response)):?/gi.test(cheerio(elem).text());
  }

  private static isInfoBubble(elem: TagElement): boolean {
    return /introduced-in/gi.test(elem.attribs["class"]);
  }
}

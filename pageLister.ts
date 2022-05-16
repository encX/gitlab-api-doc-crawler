import { Page } from "./types/models.ts";
import { load } from "./helper/page.ts";
import { glUrl } from "./helper/url.ts";

export class PagesLister {
  constructor() {}

  async getPages(): Promise<Page[]> {
    const $ = await load(glUrl.pageUrl("api_resources.html"));
    const links = $("h2+p+table tr>td:first-child>a");

    const recs: Page[] = [];

    links.each((_, elem) => {
      const name = $(elem).text();
      const path = $(elem).attr("href") ?? "";

      recs.push({ name, path });
    });

    return recs;
  }
}

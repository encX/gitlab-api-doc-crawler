import { Page } from "./types/models.ts";
import { load } from "./helper/page.ts";
import { glUrl } from "./helper/url.ts";

export async function getPages(): Promise<Page[]> {
  const $ = await load(glUrl.pageUrl("api_resources.html"));
  const links = $("h2+p+table tr>td:first-child>a");

  const recs: Page[] = [];

  links.each((_, elem) => {
    const name = $(elem).text();
    const path = $(elem).attr("href") ?? "";

    recs.push({ name, path });
  });

  return dedupePages(recs);
}

function dedupePages(pages: Page[]): Page[] {
  return pages
    .sort((a, b) => (a.path > b.path ? 1 : -1))
    .filter((x, i, a) => {
      if (i >= a.length - 1) return false;
      if (x.path === a[i + 1].path) return false;
      return true;
    });
}

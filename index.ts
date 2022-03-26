import { join } from "https://deno.land/std@0.132.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.132.0/fs/mod.ts";

import { PagesLister } from "./pageLister.ts";
import { PageCrawler } from "./pageCrawler.ts";
import { glUrl } from "./helper/url.ts";
import { DocVer } from "./enums/docVer.ts";

glUrl.setDocVer(DocVer.current);
const pages = await new PagesLister().getPages();
console.log(`Got ${pages.length} pages or APIs`);

await ensureDir("specs");

for await (const page of pages) {
  try {
    const apis = await new PageCrawler(page.path).getApis();
    console.log(`"${page.name}" has ${apis.length} APIs`);
    const specPath = join("specs", page.path.replace(/\.html/, ".json"));
    await Deno.writeTextFile(specPath, JSON.stringify(apis, null, 2));
    console.log(`==> write ${specPath}`);
  } catch (e) {
    console.error(`"${page.name}" fetch APIs failed`, e);
  }
}

console.log("done");
Deno.exit(0);

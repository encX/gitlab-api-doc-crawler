import { join } from "https://deno.land/std@0.132.0/path/mod.ts";
import { ensureDir, ensureFile } from "https://deno.land/std@0.132.0/fs/mod.ts";

import { PagesLister } from "./pageLister.ts";
import { PageCrawler } from "./pageCrawler.ts";
import { glUrl } from "./helper/url.ts";
import { DocVer } from "./enums/docVer.ts";
import { Api } from "./models.ts";

glUrl.setDocVer(DocVer.current);
const pages = await new PagesLister().getPages();
console.log(`Got ${pages.length} pages or APIs`);

await ensureDir(".generated/specs");
await Deno.writeTextFile(
  ".generated/allPages.json",
  JSON.stringify(pages, null, 2)
);

for await (const page of pages) {
  const specPath = join(
    ".generated",
    "specs",
    page.path.replace(/\.html/, ".json")
  );
  await ensureFile(specPath);

  let apis: Api[] | string = "failed";

  try {
    apis = await new PageCrawler(page.path).getApis();
    console.log(`"${page.name}" has ${apis.length} APIs`);
    console.log(`==> write ${specPath}`);
  } catch (e) {
    console.error(`"${page.name}" fetch APIs failed`, e);
  }

  const wrapper = {
    origin: glUrl.pageUrl(page.path),
    pageName: page.name,
    apis,
  };

  await Deno.writeTextFile(specPath, JSON.stringify(wrapper, null, 2));
}

console.log("done");
Deno.exit(0);

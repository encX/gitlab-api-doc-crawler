import { join } from "https://deno.land/std@0.139.0/path/mod.ts";
import { ensureDir, ensureFile } from "https://deno.land/std@0.139.0/fs/mod.ts";

import { SwaggerBuilder } from "./swaggerBuilder/swaggerBuilder.ts";
import { PagesLister } from "./pageLister.ts";
import { PageParser } from "./pageParser.ts";
import { glUrl } from "./helper/url.ts";
import { DocVer } from "./enums/docVer.ts";
import { Api } from "./types/models.ts";

glUrl.setDocVer(DocVer.current);
const pages = (await new PagesLister().getPages())
  .sort((a, b) => (a.path > b.path ? 1 : -1))
  .filter((x, i, a) => {
    if (i >= a.length - 1) return false;
    if (x.path === a[i + 1].path) return false;
    return true;
  });
console.log(`Got ${pages.length} pages or APIs`);

await ensureDir(".generated/specs");
await ensureDir(".generated/swagger");

await Deno.writeTextFile(
  ".generated/allPages.json",
  JSON.stringify(pages, null, 2)
);

const swaggerBuilder = new SwaggerBuilder();

for await (const page of pages) {
  const specPath = join(
    ".generated",
    "specs",
    page.path.replace(/\.html/, ".json")
  );
  await ensureFile(specPath);

  let apis: Api[] | string = "failed";

  try {
    apis = await new PageParser(page.path).getApis();
  } catch (e) {
    apis = e.message;
    console.error(`"${page.name}" fetch APIs failed`, e);
  }

  const wrapper = {
    origin: glUrl.pageUrl(page.path),
    pageSlug: page.path.replace(/\.\w+$/, ""),
    pageName: page.name,
    apis,
  };

  await Deno.writeTextFile(specPath, JSON.stringify(wrapper, null, 2));

  if (Array.isArray(apis)) swaggerBuilder.push(apis, wrapper.pageSlug);
}

console.log("done");
Deno.exit(0);

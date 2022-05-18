import { join } from "https://deno.land/std@0.139.0/path/mod.ts";
import { ensureDir, ensureFile } from "https://deno.land/std@0.139.0/fs/mod.ts";

import { SwaggerBuilder } from "./swaggerBuilder/swaggerBuilder.ts";
import { PagesLister } from "./pageLister.ts";
import { PageParser } from "./pageParser.ts";
import { glUrl } from "./helper/url.ts";
import { Api } from "./types/models.ts";
import { file } from "./helper/file.ts";

const pages = (await new PagesLister().getPages())
  .sort((a, b) => (a.path > b.path ? 1 : -1))
  .filter((x, i, a) => {
    if (i >= a.length - 1) return false;
    if (x.path === a[i + 1].path) return false;
    return true;
  });
console.log(`Got ${pages.length} pages or APIs`);

await file.ensureDir("specs");
await file.ensureDir("swagger");

await file.writeText("allPages.json", JSON.stringify(pages, null, 2));

const swaggerBuilder = new SwaggerBuilder();

for await (const page of pages) {
  const pageSlug = page.path.replace(/\//g, "__").replace(/\.\w+$/, "");
  const specPath = join("specs", `${pageSlug}.json`);
  await file.ensureFile(specPath);

  let apis: Api[] | string = "failed";

  try {
    apis = await new PageParser(page.path).getApis();
  } catch (e) {
    apis = e.message;
    console.error(`"${page.name}" fetch APIs failed`, e);
  }

  const wrapper = {
    origin: glUrl.pageUrl(page.path),
    pageSlug,
    pageName: page.name,
    apis,
  };

  await file.writeText(specPath, JSON.stringify(wrapper, null, 2));

  if (Array.isArray(apis)) swaggerBuilder.push(apis, pageSlug);
}

console.log("done");
Deno.exit(0);

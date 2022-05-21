import { join } from "https://deno.land/std@0.139.0/path/mod.ts";

import { getPages } from "./parser/pagesListing.ts";
import { PageParser } from "./parser/pageParser.ts";
import { SwaggerBuilder } from "./swaggerBuilder/swaggerBuilder.ts";
import { glUrl } from "./helper/url.ts";
import { file } from "./helper/file.ts";
import { Api } from "./types/models.ts";

const pages = await getPages();
console.log(`Got ${pages.length} pages`);
await file.writeText("allPages.json", JSON.stringify(pages, null, 2));

await file.ensureDir("specs");
await file.ensureDir("swagger");

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

  if (Array.isArray(apis)) await swaggerBuilder.push(apis, pageSlug);
}

await swaggerBuilder.saveMain();

console.log("done");
Deno.exit(0);

import { Cheerio, Root, cheerio } from "https://deno.land/x/cheerio@1.0.6/mod.ts";
import { join } from "https://deno.land/std@0.139.0/path/mod.ts";

import { file } from "./file.ts";

export async function loadPage(url: string, ignoreCache = false): Promise<Cheerio & Root> {
  await file.ensureDir("cache");

  const uObj = new URL(url);
  const cacheFileName = join("cache", uObj.pathname.replace(/\//g, "_"));
  let cachedContent = "";

  try {
    cachedContent = await file.readText(cacheFileName);
  } catch (e) {
    console.warn(`Error reading cache ${cacheFileName}`, e);
  }

  if (cachedContent && !ignoreCache) {
    return cheerio.load(cachedContent);
  }
  const res = await fetch(url);
  const body = new Uint8Array(await res.arrayBuffer());
  const htmlText = new TextDecoder().decode(body);
  await file.writeText(cacheFileName, htmlText);

  return cheerio.load(htmlText);
}

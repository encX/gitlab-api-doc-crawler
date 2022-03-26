import {
  Cheerio,
  Root,
  cheerio,
} from "https://deno.land/x/cheerio@1.0.4/mod.ts";
import { join } from "https://deno.land/std@0.132.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.132.0/fs/mod.ts";

export const load = async (
  url: string,
  ignoreCache = false
): Promise<Cheerio & Root> => {
  await ensureDir(".generated/cache");

  const uObj = new URL(url);
  const cacheFileName = join(
    ".generated",
    "cache",
    uObj.pathname.replace(/\//g, "_")
  );
  let cachedContent = "";

  try {
    cachedContent = await Deno.readTextFile(cacheFileName);
  } catch {}

  if (cachedContent && !ignoreCache) {
    return cheerio.load(cachedContent);
  }
  const res = await fetch(url);
  const body = new Uint8Array(await res.arrayBuffer());
  const htmlText = new TextDecoder().decode(body);
  await Deno.writeTextFile(cacheFileName, htmlText);

  return cheerio.load(htmlText);
};

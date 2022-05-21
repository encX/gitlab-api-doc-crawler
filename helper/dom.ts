import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";
import { TagElement, TextElement } from "https://deno.land/x/cheerio@1.0.4/types.ts";

// Parsed element primarily consist of TagElements and TextElements
export function getTagElem(elem: TagElement | TextElement | null): TagElement | undefined {
  if (!elem || elem.type !== "tag") return undefined;
  return elem;
}

export function isHElem(e: TagElement): boolean {
  return /h[1-3]/.test(e.name);
}

export function getElementText(elem: TagElement): string {
  return cheerio(elem.children).text().replace(/\n/g, " ").trim();
}

export function getChunksByHElem(elems: TagElement[]): TagElement[][] {
  const groups: TagElement[][] = [];
  let current: TagElement[];

  elems.forEach((e) => {
    if (isHElem(e)) {
      if (current) groups.push(current);
      current = [e];
    } else if (Array.isArray(current)) {
      current.push(e);
    }
  });

  if (current! && Array.isArray(current)) {
    groups.push(current);
  }

  return groups;
}

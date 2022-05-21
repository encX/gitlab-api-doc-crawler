export function operationIDify(text: string): string {
  const out = text
    .replace(/[’'"]s/g, "")
    .replace(/[-()/]/g, " ")
    .replace(/ +/g, " ")
    .trim()
    .split(" ")
    .map((t) => [t[0].toUpperCase(), t.slice(1).toLowerCase()].join(""))
    .join("");

  return [out[0].toLowerCase(), out.slice(1)].join("");
}

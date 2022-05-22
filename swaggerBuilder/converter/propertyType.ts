import { SchemaObject } from "../../types/OpenAPIV3.ts";

const intArr = /integer array|array of integers?/i;
const strArr = /array of (strings?|hash(es)?)|string array/i;
const intOrStr = /integer( or |\/)string/i;

export function asPropertyType(_type: string): SchemaObject | undefined {
  const type = _type.toLowerCase();

  if (type === "string" || type === "boolean" || type === "number" || type === "integer") return { type };

  if (intOrStr.test(type)) return { oneOf: [{ type: "integer" }, { type: "string" }] };
  if (type === "file/string") return { oneOf: [{ type: "string", format: "binary" }, { type: "string" }] };
  if (type === "file") return { type: "string", format: "binary" };

  if (type === "float") return { type: "number" };
  // hash = key[someprop] = primitive val
  if (type === "hash" || type === "object") return { type: "object", additionalProperties: true };
  if (strArr.test(type)) return { type: "array", items: { type: "string" } };
  if (intArr.test(type)) return { type: "array", items: { type: "integer" } };
  if (type === "datetime") return { type: "string", format: "date-time" };
  if (type === "date") return { type: "string", format: "date" };
  // todo: type "array" defaults to string[] // could be more specified by descrption/name
  if (type === "array" || type === "array[string]") return { type: "array", items: { type: "string" } };
}

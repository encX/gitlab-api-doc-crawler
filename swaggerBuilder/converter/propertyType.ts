import { SchemaObject } from "../../types/OpenAPIV3.ts";

const intArr = /integer array|array of integers?/i;
const strArr = /array of (strings?|hash(es)?)|string array/i;

export function asPropertyType(_type: string): SchemaObject | undefined {
  const type = _type.toLowerCase();

  if (
    type === "string" ||
    type === "boolean" ||
    type === "number" ||
    type === "integer"
  )
    return { type };

  if (type === "float") return { type: "number" };
  // if (type === "hash") return { type: "string" }; // hash = key[someprop] = val
  if (strArr.test(type)) return { type: "array", items: { type: "string" } };
  if (intArr.test(type)) return { type: "array", items: { type: "integer" } };
  if (type === "datetime") return { type: "string", format: "date-time" };
  if (type === "date") return { type: "string", format: "date" };
}

import { SchemaObject } from "../types/OpenAPIV3.ts";

// deno-lint-ignore no-explicit-any
export function parseSchema(obj: any): SchemaObject {
  if (obj === null || obj === undefined) return { type: "string" };
  if (Array.isArray(obj)) {
    if (obj.length === 0) throw new Error(`Schema has array with no child`);
    return { type: "array", items: parseSchema(obj[0]) };
  }

  const type = typeof obj;

  switch (type) {
    case "boolean":
    case "string":
      return { type };
    case "number":
      return { type: Math.floor(obj) === obj ? "integer" : "number" };
    case "object": {
      const properties: { [key: string]: SchemaObject } = {};
      Object.entries(obj).forEach(([key, value]) => {
        properties[key] = parseSchema(value);
      });
      return { type: "object", properties };
    }
    default:
      throw new Error(`Unknow schema type ${type}`);
  }
}

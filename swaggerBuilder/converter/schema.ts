import { PropertiesObject, SchemaObject } from "../../types/OpenAPIV3.ts";

// deno-lint-ignore no-explicit-any
export function makeSchemaFrom(obj: any, name?: string): SchemaObject {
  if (obj === null || obj === undefined) return { type: "string" };
  if (Array.isArray(obj)) {
    if (obj.length === 0) return { type: "array", items: {} };
    return { type: "array", items: makeSchemaFrom(obj[0]) };
  }

  const type = typeof obj;

  switch (type) {
    case "boolean":
    case "string": {
      if (name && /_at$/i.test(name)) return { type, format: "date-time" };
      return { type };
    }
    case "number":
    case "bigint":
      return { type: Math.floor(obj) === obj ? "integer" : "number" };
    case "object": {
      const properties: PropertiesObject = {};
      Object.entries(obj).forEach(([key, value]) => {
        properties[key] = makeSchemaFrom(value, key);
      });
      return { type: "object", properties };
    }
    default:
      throw new Error(`Unknow schema type ${type}`);
  }
}

import { NonArraySchemaObject } from "../../types/OpenAPIV3.ts";

export function asPropertyType(
  _type: string
): NonArraySchemaObject | undefined {
  const type = _type.toLowerCase();

  if (
    type === "string" ||
    type === "boolean" ||
    type === "number" ||
    type === "integer"
  )
    return { type };

  if (type === "datetime") return { type: "string", format: "date-time" };
  if (type === "date") return { type: "string", format: "date" };
}

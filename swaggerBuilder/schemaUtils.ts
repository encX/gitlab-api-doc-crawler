import {
  HttpMethods,
  PathsObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from "../types/OpenAPIV3.ts";

export function deepCompareSchema(a: SchemaObject, b: SchemaObject): boolean {
  if (a.type !== b.type) return false;

  if (a.type === "object") {
    const aKeys = Object.keys(a.properties as SchemaObject).sort();
    const bKeys = Object.keys(b.properties as SchemaObject).sort();

    // check if a and b has same property names
    if (JSON.stringify(aKeys) !== JSON.stringify(bKeys)) return false;

    aKeys.reduce((match, k) => {
      if (!match) return false;
      if (!a.properties && !b.properties) return true;
      if (!a.properties || !b.properties) return false;

      return deepCompareSchema(a.properties[k] as SchemaObject, b.properties[k] as SchemaObject);
    }, true);
  }

  if (a.type === "array" && b.type === "array") {
    // unnessary b.type check for TS typing
    return deepCompareSchema(a.items as SchemaObject, b.items as SchemaObject);
  }

  // only same type of primitives left
  return true;
}

export function replaceRefs(paths: PathsObject, ref: string, replaces: string[]) {
  const replaceRegex = new RegExp(replaces.join("|"), "ig");
  const json = "application/json";

  Object.keys(paths).forEach((p) => {
    paths[p] &&
      Object.keys(paths[p]!).forEach((method) => {
        // prettier-ignore
        const reqRef = ((paths[p]![method as HttpMethods]!.requestBody as RequestBodyObject)?.content[json].schema as ReferenceObject)?.$ref;

        if (reqRef && replaceRegex.test(reqRef)) {
          // prettier-ignore
          ((paths[p]![method as HttpMethods]!.requestBody as RequestBodyObject).content[json].schema as ReferenceObject).$ref = reqRef.replace(replaceRegex, ref);
        }

        // prettier-ignore
        const resRef = ((paths[p]![method as HttpMethods]!.responses?.["200"] as ResponseObject)?.content?.[json].schema as ReferenceObject)?.$ref;

        if (resRef && replaceRegex.test(resRef)) {
          // prettier-ignore
          ((paths[p]![method as HttpMethods]!.responses["200"] as ResponseObject).content![json].schema as ReferenceObject).$ref = resRef.replace(replaceRegex, ref);
        }
      });
  });
}

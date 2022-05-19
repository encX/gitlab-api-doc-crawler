import { stringify } from "https://deno.land/std@0.139.0/encoding/yaml.ts";
import { file } from "../helper/file.ts";

import { Api } from "../types/models.ts";
import {
  Document,
  HttpMethods,
  NamedSchemaObject,
  PathsObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";

export class SwaggerBuilder {
  constructor() {}

  private mainSwagger: Document = {
    openapi: "3.0.2",
    info: {
      title: `GitLabKit: REST API`,
      version: "1.0",
    },
    paths: {},
    components: { schemas: {} },
  };

  async push(_apis: Api[], _pageSlug: string): Promise<void> {
    console.log(_pageSlug);

    const paths: PathsObject = {};
    let schemas: NamedSchemaObject = {};

    const endpoints = _apis.map((api) =>
      new Endpoint(api, _pageSlug).getSwaggerDef()
    );
    endpoints.forEach(([path, request, response]) => {
      Object.keys(path).forEach(
        (p) => (paths[p] = { ...paths[p], ...path[p] })
      );

      schemas = { ...schemas, ...request, ...response };
    });

    // todo merge like-schemas
    Object.entries(schemas).forEach(([sname, s], i, entries) => {
      // compare s with entries [i+1, ]
      const toCheck = entries.slice(i + 1);
      const matches = toCheck
        .filter(([_, m]) => deepCompareSchema(s, m))
        .map(([mname]) => mname);

      // if find match m, find $ref with name of m and replace with sname
      const regex = new RegExp(matches.join("|"), "ig");
      const json = "application/json";
      if (matches.length) {
        /* REF REPLACEMENT LOGIC*/
        Object.keys(paths).forEach((p) => {
          paths[p] &&
            Object.keys(paths[p]!).forEach((method) => {
              const reqRef = (
                (
                  paths[p]![method as HttpMethods]!
                    .requestBody as RequestBodyObject
                )?.content[json].schema as ReferenceObject
              )?.$ref;

              if (reqRef && regex.test(reqRef)) {
                (
                  (
                    paths[p]![method as HttpMethods]!
                      .requestBody as RequestBodyObject
                  ).content[json].schema as ReferenceObject
                ).$ref = reqRef.replace(regex, sname);
              }

              const resRef = (
                (
                  paths[p]![method as HttpMethods]!.responses?.[
                    "200"
                  ] as ResponseObject
                )?.content?.[json].schema as ReferenceObject
              )?.$ref;

              if (resRef && regex.test(resRef)) {
                (
                  (
                    paths[p]![method as HttpMethods]!.responses[
                      "200"
                    ] as ResponseObject
                  ).content![json].schema as ReferenceObject
                ).$ref = resRef.replace(regex, sname);
              }
            });
        });

        /* END REF REPLACEMENT LOGIC*/
        matches.forEach((m) => {
          delete schemas[m];
        });
      }
    });

    const swagger: Document = {
      openapi: "3.0.2",
      info: {
        title: `GitLabKit: REST API / ${_pageSlug}`,
        version: "1.0",
      },
      paths,
      components: { schemas },
    };

    Object.assign(this.mainSwagger.paths, paths);
    Object.assign(this.mainSwagger.components?.schemas, schemas);

    try {
      await file.writeText(
        `swagger/${_pageSlug}.yml`,
        stringify(swagger as Record<string, any>, {
          skipInvalid: true,
          lineWidth: 120,
        }) // todo check yaml errors
      );
    } catch (e) {
      console.error(e);
      await file.writeText(
        `.generated/swagger_gen_file/${_pageSlug}.json`,
        JSON.stringify(endpoints, null, 2)
      );
    }
  }

  async saveMain() {
    await file.writeText(
      `swagger.yml`,
      stringify(this.mainSwagger as Record<string, any>, {
        skipInvalid: true,
        lineWidth: 120,
      }) // todo check yaml errors
    );
  }
}

function deepCompareSchema(a: SchemaObject, b: SchemaObject): boolean {
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

      return deepCompareSchema(
        a.properties[k] as SchemaObject,
        b.properties[k] as SchemaObject
      );
    }, true);
  }

  if (a.type === "array" && b.type === "array") {
    // unnessary b.type check for TS typing
    return deepCompareSchema(a.items as SchemaObject, b.items as SchemaObject);
  }

  // only same type of primitives left
  return true;
}

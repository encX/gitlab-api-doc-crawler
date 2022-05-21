import { stringify } from "https://deno.land/std@0.139.0/encoding/yaml.ts";
import { file } from "../helper/file.ts";

import { Api } from "../types/models.ts";
import { Document, NamedSchemaObject, OperationObject, PathsObject } from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";
import { deepCompareSchema, replaceRefs } from "./schemaUtils.ts";

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
    const schemas: NamedSchemaObject = {};

    const endpoints = _apis.map((api) => new Endpoint(api, _pageSlug).getSwaggerDef());

    // merge paths and schemas
    endpoints.forEach(([path, request, response]) => {
      Object.keys(path).forEach((p) => (paths[p] = { ...paths[p], ...path[p] }));
      Object.assign(schemas, request, response);
    });

    // dedupe schemas
    Object.entries(schemas).forEach(([sname, s], i, entries) => {
      // compare s with entries [i+1, ]
      const toCheck = entries.slice(i + 1);
      const matches = toCheck.filter(([_, m]) => deepCompareSchema(s, m)).map(([mname]) => mname);

      // if find matches, replace refs and delete schema
      if (matches.length) {
        replaceRefs(paths, sname, matches);
        matches.forEach((m) => delete schemas[m]);
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
      await file.writeText(`.generated/swagger_gen_file/${_pageSlug}.json`, JSON.stringify(endpoints, null, 2));
    }
  }

  renameDuplicatedOpId() {
    // 1. put `x-pageslug` in every endpoint
    // 2. find duplicates
    const opIds = Object.entries(this.mainSwagger.paths).flatMap(([_, pathitem]) =>
      Object.entries(pathitem!)
        .filter(([method]) => ["get", "post", "put", "patch", "delete"].includes(method))
        .map(([_, op]) => (op as OperationObject).operationId)
    );

    file.writeText("opIds.txt", opIds.join("\n"));
    // 3. rename duplicates with <pageslug><opname>
  }

  async saveMain() {
    this.renameDuplicatedOpId();

    await file.writeText(
      `swagger.yml`,
      stringify(this.mainSwagger as Record<string, any>, {
        skipInvalid: true,
        lineWidth: 120,
      }) // todo check yaml errors
    );
  }
}

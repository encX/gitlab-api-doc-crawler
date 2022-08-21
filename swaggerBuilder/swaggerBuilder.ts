import { stringify } from "https://deno.land/std@0.152.0/encoding/yaml.ts";
import { file } from "../helper/file.ts";

import { Api } from "../types/models.ts";
import {
  ArraySchemaObject,
  Document,
  NamedSchemaObject,
  OperationObject,
  PathsObject,
  SchemaObject,
} from "../types/OpenAPIV3.ts";
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

  writeOpIds() {
    const opIds = Object.entries(this.mainSwagger.paths).flatMap(([_, pathitem]) =>
      Object.entries(pathitem!)
        .filter(([method]) => ["get", "post", "put", "patch", "delete"].includes(method))
        .map(([_, op]) => (op as OperationObject).operationId)
    );

    file.writeText("opIds.txt", opIds.join("\n"));
  }

  mergeSecondLevelObjects() {
    const firstOrder = this.mainSwagger.components?.schemas;
    if (!firstOrder) return;

    Object.entries(firstOrder).map(([currentname, currentschema], i, all) => {
      if ((currentschema as SchemaObject).type === "object") {
        Object.entries((currentschema as SchemaObject).properties!)
          .filter(([_, prop]) => (prop as SchemaObject).type === "object")
          .map(([name2, second]) => {
            // second level of current
            const match = Object.entries(all).filter(([_, first]) =>
              deepCompareSchema(first as SchemaObject, second as SchemaObject)
            );

            if (match.length > 1) console.warn("match more than 1 top level models");
            if (match.length === 1) {
              const originName = match[0][0];
              console.log("Matched!", originName, name2);
              (
                (this.mainSwagger.components!.schemas as SchemaObject)!.properties![currentname] as SchemaObject
              ).properties![name2] = {
                $ref: `#/components/schemas/${originName}`,
              };
            }
          });
      }
    });
  }

  mergeArrayAndSingleItem() {
    const topLevel = this.mainSwagger.components?.schemas;
    Object.entries(topLevel!)
      .filter(
        ([_, schema]) =>
          (schema as SchemaObject).type === "array" &&
          ((schema as ArraySchemaObject).items as SchemaObject).type === "object"
      )
      .forEach(([currentname, currentarray]) => {
        const matches = Object.entries(topLevel!).filter(([_, toplevelschema]) =>
          deepCompareSchema(toplevelschema as SchemaObject, (currentarray as ArraySchemaObject).items as SchemaObject)
        );

        if (matches.length > 1) {
          console.warn(currentname, "has > 1 match", matches.map(([name]) => name).join(", "));
        }

        matches.forEach(([matchname]) => {
          (this.mainSwagger.components!.schemas![currentname] as ArraySchemaObject).items = {
            $ref: `#/components/schemas/${matchname}`,
          };
        });
      });
  }

  async saveMain() {
    this.writeOpIds();
    this.mergeArrayAndSingleItem();

    await file.writeText(
      `swagger.yml`,
      stringify(this.mainSwagger as Record<string, any>, {
        skipInvalid: true,
        lineWidth: 120,
      }) // todo check yaml errors
    );
  }
}

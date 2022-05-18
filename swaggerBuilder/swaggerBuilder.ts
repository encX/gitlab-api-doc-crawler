import { stringify } from "https://deno.land/std@0.139.0/encoding/yaml.ts";
import { file } from "../helper/file.ts";

import { Api } from "../types/models.ts";
import {
  Document,
  NamedSchemaObject,
  PathsObject,
} from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";

export class SwaggerBuilder {
  constructor() {}

  async push(_apis: Api[], _pageSlug: string): Promise<void> {
    console.log(_pageSlug);

    const paths: PathsObject = {};
    let schemas: NamedSchemaObject = {};

    const endpoints = _apis.map((api) => new Endpoint(api).getSwaggerDef());
    endpoints.forEach(([path, request, response]) => {
      Object.keys(path).forEach(
        (p) => (paths[p] = { ...paths[p], ...path[p] })
      );

      schemas = { ...schemas, ...request, ...response };
    });

    // todo merge like-schemas

    const swagger: Document = {
      openapi: "3.0.2",
      info: {
        title: `GitLabKit: REST API / ${_pageSlug}`,
        version: "1.0",
      },
      paths,
      components: { schemas },
    };

    try {
      await file.writeText(
        `swagger/${_pageSlug}.tmp.yml`,
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
}

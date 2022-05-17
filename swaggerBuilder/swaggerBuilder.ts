import { stringify } from "https://deno.land/std@0.139.0/encoding/yaml.ts";

import { Api } from "../types/models.ts";
import { Document } from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";

export class SwaggerBuilder {
  private swagger: Document = {
    openapi: "3.0.2",
    info: {
      title: "GitLabKit: REST API",
      version: "1.0",
    },
    paths: {},
  };
  constructor() {}

  async push(_apis: Api[], _pageSlug: string): Promise<void> {
    console.log(_pageSlug);
    const endpoints = _apis.map((api) => new Endpoint(api).getEndpoint());
    try {
      await Deno.writeTextFile(
        `.generated/swagger/.${_pageSlug}.tmp.yml`,
        stringify({ endpoints }, { skipInvalid: true }) // check yaml errors
      );
    } catch (e) {
      console.error(e);
      await Deno.writeTextFile(
        `.generated/swagger/error.${_pageSlug}.tmp.json`,
        JSON.stringify(endpoints, null, 2)
      );
    }

    // todo
    // - merge ops with same paths [REQUIRED]
    // - make responses ref object and name it
    // - merge response object with same properties
  }
}

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
    const endpoints = _apis.map((api) => new Endpoint(api).getEndpoint());
    await Deno.writeTextFile(
      `.generated/swagger/.${_pageSlug}.tmp.json`,
      JSON.stringify(endpoints, null, 2)
    );

    // todo
    // - merge ops with same paths [REQUIRED]
    // - make responses ref object and name it
    // - merge response object with same properties
  }
}

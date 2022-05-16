import { Api } from "../types/models.ts";
import { Document } from "../types/OpenAPIV3.ts";

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

  push(_apis: Api[]): void {
    // todo
  }
}

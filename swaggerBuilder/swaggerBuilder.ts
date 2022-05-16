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

  push(apis: Api[]): void {
    // todo
  }
}

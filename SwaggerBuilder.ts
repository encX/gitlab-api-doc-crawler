import { Api } from "./types/models.ts";
import { PathsObject } from "./types/OpenAPIV3.ts";

class SwaggerBuilder {
  private document: PathsObject = {};
  constructor(private readonly api: Api) {}

  asSwagger(): PathsObject {
    throw new Error("todo");
  }
}

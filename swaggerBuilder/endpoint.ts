import { Api } from "../types/models.ts";
import {
  OperationObject,
  ParameterObject,
  PathsObject,
  PropertiesObject,
  RequestBodyObject,
  ResponsesObject,
} from "../types/OpenAPIV3.ts";
import { extractEndpointInfo } from "./converter/path.ts";
import { asPropertyType } from "./converter/propertyType.ts";
import { parseSchema } from "./converter/schema.ts";
import { operationIDify } from "./converter/text.ts";

export class Endpoint {
  // private pathsObject: PathsObject = {};
  private method: string;
  private path: string;
  private operation?: OperationObject;
  private pathParams: string[];

  constructor(private readonly api: Api) {
    [this.method, this.path, this.pathParams] = extractEndpointInfo(
      this.api.resources
    );
    this.setOperationObject();
  }

  getEndpoint(): PathsObject {
    return {
      [this.path]: {
        [this.method]: this.operation,
      },
    };
  }

  private setOperationObject() {
    this.operation = {
      summary: this.api.name,
      description: this.api.description,
      operationId: operationIDify(this.api.name),
      parameters: this.getParams(),
      responses: this.getResponse(),
    };

    const requestBody = this.getRequestBody();
    if (requestBody) this.operation.requestBody = requestBody;
  }

  private getParams(): ParameterObject[] {
    // todo get+delete = query params / post+put+patch = form data ... or json?
    return this.api.attributes
      .filter((a) => this.isPathParam(a.name) || !this.isMethodHasbody())
      .map<ParameterObject>((a) => ({
        name: a.name,
        in: this.isPathParam(a.name) ? "path" : "query",
        description: a.description,
        required: a.required,
        schema: { type: a.type === "integer" ? "integer" : "string" },
      }));
  }
  // todo paginated requests

  private getRequestBody(): RequestBodyObject | undefined {
    if (!this.isMethodHasbody()) return undefined;

    const nonPathParams = this.api.attributes.filter(
      (a) => !this.isPathParam(a.name)
    );
    if (nonPathParams.length === 0) return undefined;

    const properties: PropertiesObject = {};

    nonPathParams.forEach((p) => {
      const type = asPropertyType(p.type);

      if (type) {
        properties[p.name] = type;
      } else {
        console.warn(
          `Property "${p.name}" has non-primitive type of "${p.type}"`
        );
      }
    });

    const required = nonPathParams
      .filter((a) => a.required)
      .map<string>((a) => a.name);

    return {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties,
            required,
          },
        },
      },
    };
  }

  private isMethodHasbody = (): boolean =>
    ["post", "put", "patch"].includes(this.method);

  private isPathParam = (param: string): boolean =>
    this.pathParams.some((p) => p === param);

  private getResponse(): ResponsesObject {
    return {
      "200": {
        description: "successful operation",
        content: {
          "application/json": { schema: parseSchema(this.api.response) },
        },
      },
    };
  }
}

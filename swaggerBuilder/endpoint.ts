import { Api } from "../types/models.ts";
import {
  OperationObject,
  ParameterObject,
  PathsObject,
  PropertiesObject,
  RequestBodyObject,
  ResponsesObject,
} from "../types/OpenAPIV3.ts";
import { asSwaggerPathAndParams } from "./converter/path.ts";
import { asPropertyType } from "./converter/propertyType.ts";
import { parseSchema } from "./converter/schema.ts";
import { operationIDify } from "./converter/text.ts";

export class Endpoint {
  // private pathsObject: PathsObject = {};
  private method?: string;
  private path?: string;
  private operation?: OperationObject;
  private pathParams?: string[];

  constructor(private readonly api: Api) {
    this.setEndpointInfo();
    this.setOperationObject();
  }

  getEndpoint(): PathsObject {
    if (!this.path) throw new Error();
    if (!this.method) throw new Error();
    if (!this.operation) throw new Error();

    return {
      [this.path]: {
        [this.method]: this.operation,
      },
    };
  }

  private setEndpointInfo() {
    const methods = new Set<string>();
    const paths = new Set<string>();

    this.api.resources.forEach(({ method, path }) => {
      methods.add(method.toUpperCase());
      paths.add(path.split("?")[0]);
    });

    if (methods.size > 1)
      throw new Error(`API "${this.api.name}" has >1 http methods defined`);

    // if (paths.size > 1)
    //   throw new Error(`API "${this.api.name}" has >1 paths defined`);

    this.method = [...methods][0].toLowerCase();
    [this.path, this.pathParams] = asSwaggerPathAndParams([...paths][0]);
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
    ["post", "put", "patch"].includes(this.method ?? "");

  private isPathParam = (param: string): boolean =>
    this.pathParams?.some((p) => p === param) ?? false;

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

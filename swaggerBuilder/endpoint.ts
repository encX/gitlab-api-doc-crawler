import { Api } from "../types/models.ts";
import {
  NamedSchemaObject,
  OperationObject,
  ParameterObject,
  PathsObject,
  PropertiesObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
} from "../types/OpenAPIV3.ts";
import { extractEndpointInfo } from "./converter/path.ts";
import { asPropertyType } from "./converter/propertyType.ts";
import { makeSchemaFrom } from "./converter/schema.ts";
import { operationIDify } from "./converter/text.ts";

export class Endpoint {
  private method: string;
  private path: string;
  private operation: OperationObject;
  private pathParams: string[];
  private requestBody?: NamedSchemaObject;
  private response?: NamedSchemaObject;
  private operationId: string;

  constructor(private readonly api: Api, private readonly pageSlug: string) {
    [this.method, this.path, this.pathParams] = extractEndpointInfo(this.api.resources);
    this.operationId = operationIDify(this.api.name);

    this.operation = {
      summary: this.api.name,
      description: this.api.description,
      operationId: this.operationId,
      parameters: this.getParams(),
      responses: this.setResponse(),
    };

    const requestBody = this.setRequestBody();
    if (requestBody) this.operation.requestBody = requestBody;
    if (pageSlug) this.operation.tags = [pageSlug];
  }

  getSwaggerDef(): [PathsObject, NamedSchemaObject | undefined, NamedSchemaObject | undefined] {
    const path = {
      [this.path]: {
        [this.method]: this.operation,
      },
    };

    return [path, this.requestBody, this.response];
  }

  private getParams(): ParameterObject[] {
    return this.api.attributes
      .filter((a) => this.isPathParam(a.name) || !this.isMethodHasbody())
      .map<ParameterObject>((a) => ({
        name: a.name,
        in: this.isPathParam(a.name) ? "path" : "query",
        description: a.description,
        required: a.required || this.isPathParam(a.name),
        schema: { type: a.type === "integer" ? "integer" : "string" },
      }));
  }
  // todo paginated requests

  private setRequestBody(): RequestBodyObject | undefined {
    if (!this.isMethodHasbody()) return undefined;

    const nonPathParams = this.api.attributes.filter((a) => !this.isPathParam(a.name));
    if (nonPathParams.length === 0) return undefined;

    const properties: PropertiesObject = {};

    nonPathParams.forEach((p) => {
      const type = asPropertyType(p.type);

      if (type) {
        properties[p.name] = type;
      } else {
        console.warn(`Property "${p.name}" has unknown type of "${p.type}"`);
      }
    });

    // todo?: search for foo, foo[bar], foo[baz]  or foo, foo:bar, foo:baz and merge too { foo: { bar: , baz: } }

    const required = nonPathParams.filter((a) => a.required).map<string>((a) => a.name);

    const schemaName = `${this.operationId}Request`;
    const schema: SchemaObject = {
      type: "object",
      properties,
    };

    if (required.length > 0) schema.required = required;

    this.requestBody = { [schemaName]: schema };

    return {
      content: {
        "application/json": {
          schema: { $ref: `#/components/schemas/${schemaName}` },
        },
      },
    };
  }

  private isMethodHasbody = (): boolean => ["post", "put", "patch"].includes(this.method);

  private isPathParam = (param: string): boolean => this.pathParams.some((p) => p === param);

  private setResponse(): ResponsesObject {
    const response200Base: ResponseObject = {
      description: "successful operation",
    };

    if (this.api.response) {
      const schemaName = `${this.operationId}Response`;
      const schema = makeSchemaFrom(this.api.response);

      response200Base.content = {
        "application/json": {
          schema: { $ref: `#/components/schemas/${schemaName}` },
        },
      };

      this.response = { [schemaName]: schema };
    }

    return { "200": response200Base };
  }
}

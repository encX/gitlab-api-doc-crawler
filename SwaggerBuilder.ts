import { Api, Resource } from "./types/models.ts";
import {
  PathsObject,
  ParameterObject,
  SchemaObject,
  PathItemObject,
  OperationObject,
} from "./types/OpenAPIV3.ts";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

class SwaggerBuilder {
  private readonly method: string;
  private readonly resources: Resource[];
  private readonly pathParams: string[];

  constructor(private readonly api: Api) {
    this.method = this.getHttpMethod();
    this.resources = this.getDedupedResources();
    this.pathParams = this.getPathParams();
  }

  private mapOperation(): OperationObject {
    const { name, description, response } = this.api;
    const operationId = name.replace(/ /g, "");

    return { summary: name, operationId, description, responses: {} };
  }

  private mapParameters(): ParameterObject[] {
    return this.api.attributes.map<ParameterObject>(
      ({ name, description, required, type }) => {
        const _in = this.pathParams.includes(name)
          ? "path"
          : /post|patch|put/i.test(this.method)
          ? "body"
          : "query";

        return {
          name,
          description,
          required,
          in: _in,
          schema: this.getFieldType(name, type),
        };
      }
    );
  }

  private getFieldType(fieldName: string, type: string): SchemaObject {
    // todo: exceptions for specific name (eg: created_at, merged_at, etc.)
    if (
      type === "boolean" ||
      type === "object" ||
      type === "number" ||
      type === "string" ||
      type === "integer"
    )
      return { type };

    throw new Error(`Unknown field type "${type}" for field "${fieldName}"`);
  }

  private getPathParams(): string[] {
    const pathParams = this.api.resources.map((r) =>
      r.path.match(/\/:(\w+)/g)?.map((m) => m.slice(2))
    );

    if (!pathParams || pathParams.length === 0) return [];

    const paramSet = new Set(pathParams[0]);

    if (
      pathParams.length > 1 &&
      pathParams.some(
        (path) => !path || path.some((param) => !paramSet.has(param))
      )
    ) {
      console.error(pathParams);
      throw new Error(`Path parameters are not consistant on ${this.api.name}`);
    }

    return pathParams[0]!;
  }

  private getDedupedResources(): Resource[] {
    return this.api.resources
      .map((r) => {
        const [path] = r.path.split("&");
        return { ...r, path };
      })
      .reduce(
        (acc, r) =>
          acc.find((a) => a.method === r.method && a.path === r.path)
            ? [...acc, r]
            : acc,
        [] as Resource[]
      );
  }

  private getHttpMethod(): HttpMethod {
    const methods = [...new Set(this.api.resources.map((r) => r.method))];
    if (methods.length > 1)
      throw new Error(`Unmatched http method in single api ${this.api.name}`);

    if (methods.length < 1)
      throw new Error(`No http method in single api ${this.api.name}`);

    const method = methods[0].toLowerCase();
    if (
      method !== "get" &&
      method !== "post" &&
      method !== "put" &&
      method !== "patch" &&
      method !== "delete"
    )
      throw new Error(`Unknown http method ${method} on ${this.api.name}`);

    return method;
  }
}

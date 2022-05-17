// deno-lint-ignore-file no-unused-vars
import { Api, Resource } from "../types/models.ts";
import {
  OperationObject,
  ParameterObject,
  PathsObject,
  ResponsesObject,
  SchemaObject,
} from "../types/OpenAPIV3.ts";
import { parseSchema } from "./schema.ts";

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

    // convert /:foo to /{foo}
    this.path = [...paths][0].replace(/\/:(\w+)/g, "/{$1}");

    this.pathParams = [...this.api.resources[0].path.matchAll(/:(\w+)/g)].map(
      ([_, match]) => match
    );
  }

  private setOperationObject() {
    this.operation = {
      summary: this.api.name,
      description: this.api.description,
      operationId: this.operationIDify(this.api.name),
      parameters: this.getParams(),
      responses: this.getResponse(),
    };
  }

  private getParams(): ParameterObject[] {
    // todo post body?????
    return this.api.attributes.map<ParameterObject>((a) => ({
      name: a.name,
      in: this.pathParams?.some((p) => p === a.name) ? "path" : "query",
      description: a.description,
      required: a.required,
      schema: { type: a.type === "integer" ? "integer" : "string" },
    }));
  }

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

  private operationIDify(text: string): string {
    const out = text
      .replace(/[’'"]s/g, "")
      .split(" ")
      .map((t) => [t[0].toUpperCase(), t.slice(1).toLowerCase()].join(""))
      .join("");

    return [out[0].toLowerCase(), out.slice(1)].join("");
  }
}

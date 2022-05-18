import { Api, Attribute, Resource } from "./types/models.ts";

export class ApiBuilder {
  private api: Api = {
    name: "",
    description: "",
    resources: [],
    attributes: [],
    response: null,
  };

  withName(name: string): ApiBuilder {
    this.api.name = name;
    return this;
  }

  withDescription(description: string): ApiBuilder {
    if (!this.api.description) this.api.description = description;
    return this;
  }

  withResources(resources: Resource[]): ApiBuilder {
    this.api.resources.push(...resources);
    return this;
  }

  withAttributes(attributes: Attribute[]): ApiBuilder {
    this.api.attributes = attributes;
    return this;
  }

  withResponse(response: unknown): ApiBuilder {
    if (this.api.response === null || typeof this.api.response === "string") {
      this.api.response = response;
    } else if (Array.isArray(this.api.response) && Array.isArray(response)) {
      this.api.response = [...response, ...this.api.response];
    } else if (
      typeof this.api.response === "object" &&
      typeof response === "object" &&
      !Array.isArray(this.api.response) &&
      !Array.isArray(response)
    ) {
      this.api.response = { ...response, ...this.api.response };
    }

    return this;
  }

  getName(): string {
    return this.api.name;
  }

  build(): Api {
    return this.api;
  }
}

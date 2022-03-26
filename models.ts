import { type JSONSchema } from "https://deno.land/x/json_schema_typed@v8.0.0/draft_2020_12.ts";

export interface Page {
  name: string;
  path: string;
}

export interface Api {
  name: string;
  description: string;
  resources: Resource[];
  attributes: Attribute[];
  response: any;
}

export interface Resource {
  method: string;
  path: string;
}

export interface Attribute {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

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

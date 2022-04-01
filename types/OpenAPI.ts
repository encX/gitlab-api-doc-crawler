import * as OpenAPIV3_1 from "./OpenAPIV3_1.ts";
import * as OpenAPIV3 from "./OpenAPIV3.ts";
import * as OpenAPIV2 from "./OpenAPIV2.ts";

export type Document<T extends {} = {}> =
  | OpenAPIV2.Document<T>
  | OpenAPIV3.Document<T>
  | OpenAPIV3_1.Document<T>;

export type Operation<T extends {} = {}> =
  | OpenAPIV2.OperationObject<T>
  | OpenAPIV3.OperationObject<T>
  | OpenAPIV3_1.OperationObject<T>;

export type Parameter =
  | OpenAPIV3_1.ReferenceObject
  | OpenAPIV3_1.ParameterObject
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3.ParameterObject
  | OpenAPIV2.ReferenceObject
  | OpenAPIV2.Parameter;

export type Parameters =
  | (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject)[]
  | (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
  | (OpenAPIV2.ReferenceObject | OpenAPIV2.Parameter)[];

export interface Request {
  body?: any;
  headers?: object;
  params?: object;
  query?: object;
}

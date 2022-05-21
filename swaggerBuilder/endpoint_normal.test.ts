import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Api } from "../types/models.ts";
import { PathsObject } from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";

Deno.test("Endpoint converstion test - normal", () => {
  const [actualPath, actualRequest, actualResponse] = new Endpoint(input, "pageslug").getSwaggerDef();
  assertEquals(actualPath, expectedPath);
  assertEquals(actualRequest, expectedRequestBody);
  assertEquals(actualResponse, expectedResponse);
});

const input: Api = {
  name: "List owned runners",
  description: "Get a list of specific runners available to the user.",
  resources: [
    {
      method: "GET",
      path: "/runners",
    },
  ],
  attributes: [
    {
      name: "foo",
      type: "string",
      required: false,
      description: "param description",
    },
  ],
  response: [
    {
      active: true,
      paused: false,
      description: "test-1-20150125",
      id: 6,
      ip_address: "127.0.0.1",
      is_shared: false,
      runner_type: "project_type",
      name: null,
      online: true,
      status: "online",
    },
  ],
};

const expectedPath: PathsObject = {
  "/runners": {
    get: {
      summary: "List owned runners",
      description: "Get a list of specific runners available to the user.",
      operationId: "listOwnedRunners",
      tags: ["pageslug"],
      parameters: [
        {
          name: "foo",
          in: "query",
          description: "param description",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "successful operation",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/listOwnedRunnersResponse" },
            },
          },
        },
      },
    },
  },
};

const expectedRequestBody = undefined;
const expectedResponse = {
  listOwnedRunnersResponse: {
    type: "array",
    items: {
      type: "object",
      properties: {
        active: { type: "boolean" },
        paused: { type: "boolean" },
        description: { type: "string" },
        id: { type: "integer" },
        ip_address: { type: "string" },
        is_shared: { type: "boolean" },
        runner_type: { type: "string" },
        name: { type: "string" },
        online: { type: "boolean" },
        status: { type: "string" },
      },
    },
  },
};

import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Api } from "../types/models.ts";
import { PathsObject } from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";

Deno.test("Endpoint converstion test - with path params", () => {
  const result = new Endpoint(input).getEndpoint();
  assertEquals(result, expected);
});

const input: Api = {
  name: "Foo bar's baz",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  resources: [
    {
      method: "GET",
      path: "/foo/:id/bar/:another",
    },
  ],
  attributes: [
    {
      name: "id",
      type: "integer",
      required: true,
      description: "The ID",
    },
    {
      name: "another",
      type: "integer",
      required: true,
      description: "Another ID",
    },
  ],
  response: {},
};

const expected: PathsObject = {
  "/foo/{id}/bar/{another}": {
    get: {
      summary: "Foo bar's baz",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      operationId: "fooBarBaz",
      parameters: [
        {
          name: "id",
          in: "path",
          description: "The ID",
          required: true,
          schema: { type: "integer" },
        },
        {
          name: "another",
          in: "path",
          description: "Another ID",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        "200": {
          description: "successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {},
              },
            },
          },
        },
      },
    },
  },
};

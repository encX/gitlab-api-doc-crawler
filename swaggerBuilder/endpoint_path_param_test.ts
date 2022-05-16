import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Api } from "../types/models.ts";
import { PathsObject } from "../types/OpenAPIV3.ts";
import { Endpoint } from "./endpoint.ts";

Deno.test("Endpoint converstion test - with path params", () => {
  const result = new Endpoint(input).getEndpoint();
  assertEquals(result, expected);
});

const input: Api = {
  name: "Get runner’s details",
  description: "Get details of a runner.",
  resources: [
    {
      method: "GET",
      path: "/runners/:id",
    },
  ],
  attributes: [
    {
      name: "id",
      type: "integer",
      required: true,
      description: "The ID of a runner",
    },
  ],
  response: {
    active: true,
    paused: false,
    architecture: null,
    description: "test-1-20150125",
    id: 6,
    ip_address: "127.0.0.1",
    is_shared: false,
    runner_type: "project_type",
    contacted_at: "2016-01-25T16:39:48.066Z",
    name: null,
    online: true,
    status: "online",
    platform: null,
    projects: [
      {
        id: 1,
        name: "GitLab Community Edition",
        name_with_namespace: "GitLab.org / GitLab Community Edition",
        path: "gitlab-foss",
        path_with_namespace: "gitlab-org/gitlab-foss",
      },
    ],
    revision: null,
    tag_list: ["ruby", "mysql"],
    version: null,
    access_level: "ref_protected",
    maximum_timeout: 3600,
  },
};

const expected: PathsObject = {
  "/runners/{id}": {
    get: {
      summary: "Get runner’s details",
      description: "Get details of a runner.",
      operationId: "getRunnerDetails",
      parameters: [
        {
          name: "id",
          in: "path",
          description: "The ID of a runner",
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
                properties: {
                  active: { type: "boolean" },
                  paused: { type: "boolean" },
                  architecture: { type: "string" },
                  description: { type: "string" },
                  id: { type: "integer" },
                  ip_address: { type: "string" },
                  is_shared: { type: "boolean" },
                  runner_type: { type: "string" },
                  contacted_at: { type: "string" },
                  name: { type: "string" },
                  online: { type: "boolean" },
                  status: { type: "string" },
                  platform: { type: "string" },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        name_with_namespace: { type: "string" },
                        path: { type: "string" },
                        path_with_namespace: { type: "string" },
                      },
                    },
                  },
                  revision: { type: "string" },
                  tag_list: { type: "array", items: { type: "string" } },
                  version: { type: "string" },
                  access_level: { type: "string" },
                  maximum_timeout: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
  },
};

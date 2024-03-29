import { assertEquals, assertThrows } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { NonArraySchemaObject, SchemaObject } from "../../types/OpenAPIV3.ts";
import { makeSchemaFrom } from "./schema.ts";

Deno.test("makeSchemaFrom - string", () => {
  assertEquals(makeSchemaFrom("foo"), { type: "string" });
});

Deno.test("makeSchemaFrom - integer", () => {
  assertEquals(makeSchemaFrom(1), { type: "integer" });
});

Deno.test("makeSchemaFrom - number", () => {
  assertEquals(makeSchemaFrom(1.2), { type: "number" });
});

Deno.test("makeSchemaFrom - boolean", () => {
  assertEquals(makeSchemaFrom(false), { type: "boolean" });
});

Deno.test("makeSchemaFrom - null", () => {
  assertEquals(makeSchemaFrom(null), { type: "string" }, "type null should be treated as string");
});

Deno.test("makeSchemaFrom - function (throw)", () => {
  assertThrows(() => makeSchemaFrom(() => {}));
});

Deno.test("makeSchemaFrom - symbol (throw)", () => {
  assertThrows(() => makeSchemaFrom(Symbol));
});

Deno.test("makeSchemaFrom - object - flat", () => {
  const actual = makeSchemaFrom({
    bool: true,
    str: "test-1-20150125",
    int: 6,
    num: 6.5,
    nil: null,
  });

  const expected: SchemaObject = {
    type: "object",
    properties: {
      bool: { type: "boolean" },
      str: { type: "string" },
      int: { type: "integer" },
      num: { type: "number" },
      nil: { type: "string" },
    },
  };

  assertEquals(actual, expected);
});

Deno.test("makeSchemaFrom - object - nested", () => {
  const actual = makeSchemaFrom({ foo: { bar: { baz: "value" } } });

  const expected: SchemaObject = {
    type: "object",
    properties: {
      foo: {
        type: "object",
        properties: {
          bar: {
            type: "object",
            properties: {
              baz: { type: "string" },
            },
          },
        },
      },
    },
  };

  assertEquals(actual, expected);
});

Deno.test("makeSchemaFrom - array of primitives", () => {
  assertEquals(makeSchemaFrom([1]), {
    type: "array",
    items: { type: "integer" },
  });
  assertEquals(makeSchemaFrom(["1"]), {
    type: "array",
    items: { type: "string" },
  });
  assertEquals(makeSchemaFrom([1.1]), {
    type: "array",
    items: { type: "number" },
  });
  assertEquals(makeSchemaFrom([false]), {
    type: "array",
    items: { type: "boolean" },
  });
});

Deno.test("makeSchemaFrom - array of arrays", () => {
  assertEquals(makeSchemaFrom([[1]]), {
    type: "array",
    items: { type: "array", items: { type: "integer" } },
  });
});

Deno.test("makeSchemaFrom - array of objects", () => {
  assertEquals(makeSchemaFrom([{ foo: 1 }]), {
    type: "array",
    items: { type: "object", properties: { foo: { type: "integer" } } },
  });
});

Deno.test("makeSchemaFrom - real example", () => {
  const actual = makeSchemaFrom({
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
  });
  const expected: NonArraySchemaObject = {
    type: "object",
    properties: {
      active: {
        type: "boolean",
      },
      paused: {
        type: "boolean",
      },
      architecture: {
        type: "string",
      },
      description: {
        type: "string",
      },
      id: {
        type: "integer",
      },
      ip_address: {
        type: "string",
      },
      is_shared: {
        type: "boolean",
      },
      runner_type: {
        type: "string",
      },
      contacted_at: {
        type: "string",
        format: "date-time",
      },
      name: {
        type: "string",
      },
      online: {
        type: "boolean",
      },
      status: {
        type: "string",
      },
      platform: {
        type: "string",
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            name: {
              type: "string",
            },
            name_with_namespace: {
              type: "string",
            },
            path: {
              type: "string",
            },
            path_with_namespace: {
              type: "string",
            },
          },
        },
      },
      revision: {
        type: "string",
      },
      tag_list: {
        type: "array",
        items: {
          type: "string",
        },
      },
      version: {
        type: "string",
      },
      access_level: {
        type: "string",
      },
      maximum_timeout: {
        type: "integer",
      },
    },
  };

  assertEquals(actual, expected);
});

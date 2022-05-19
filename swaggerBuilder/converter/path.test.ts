import { assertEquals, assertThrows } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { extractEndpointInfo, formatPath, getPathParams } from "./path.ts";

Deno.test("extractEndpointInfo - normal", () => {
  const resources = [
    {
      method: "GET",
      path: "/projects/:id/runners",
    },
    {
      method: "GET",
      path: "/projects/:id/runners?scope=active",
    },
    {
      method: "GET",
      path: "/projects/:id/runners?type=project_type",
    },
  ];

  const [method, path, params] = extractEndpointInfo(resources);

  assertEquals(method, "get");
  assertEquals(path, "/projects/{id}/runners");
  assertEquals(params, ["id"]);
});

Deno.test("extractEndpointInfo - method conflict (throw)", () => {
  const resources = [
    {
      method: "GET",
      path: "/projects/:id/runners",
    },
    {
      method: "POST",
      path: "/projects/:id/runners?scope=active",
    },
  ];

  assertThrows(() => extractEndpointInfo(resources), Error);
});

Deno.test("formatPath & getPathParams - single param", () => {
  const path = "/foo/:bar";

  const actualPath = formatPath(path);
  const expectedPath = "/foo/{bar}";
  assertEquals(actualPath, expectedPath);

  const actualParams = getPathParams(path);
  const expectedParam = ["bar"];

  assertEquals(actualParams, expectedParam);
});

Deno.test("formatPath & getPathParams - multi param", () => {
  const path = "/foo/:bar/baz/:pop";

  const actualPath = formatPath(path);
  const expectedPath = "/foo/{bar}/baz/{pop}";
  assertEquals(actualPath, expectedPath);

  const actualParams = getPathParams(path);
  const expectedParam = ["bar", "pop"];
  assertEquals(actualParams, expectedParam);
});

Deno.test("formatPath & getPathParams - no param", () => {
  const path = "/foo/bar/baz";

  const actualPath = formatPath(path);
  const expectedPath = "/foo/bar/baz";
  assertEquals(actualPath, expectedPath);

  const actualParams = getPathParams(path);
  const expectedParam: string[] = [];
  assertEquals(actualParams, expectedParam);
});

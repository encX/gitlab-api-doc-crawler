import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { asSwaggerPathAndParams } from "./path.ts";

Deno.test("asSwaggerPathAndParams - single param", () => {
  const path = "/foo/:bar";
  const [actualPath, actualParams] = asSwaggerPathAndParams(path);
  const expectedPath = "/foo/{bar}";
  const expectedParam = ["bar"];

  assertEquals(actualPath, expectedPath);
  assertEquals(actualParams, expectedParam);
});

Deno.test("asSwaggerPathAndParams - multi param", () => {
  const path = "/foo/:bar/baz/:pop";
  const [actualPath, actualParams] = asSwaggerPathAndParams(path);
  const expectedPath = "/foo/{bar}/baz/{pop}";
  const expectedParam = ["bar", "pop"];

  assertEquals(actualPath, expectedPath);
  assertEquals(actualParams, expectedParam);
});

Deno.test("asSwaggerPathAndParams - no param", () => {
  const path = "/foo/bar/baz";
  const [actualPath, actualParams] = asSwaggerPathAndParams(path);
  const expectedPath = "/foo/bar/baz";
  const expectedParam: string[] = [];

  assertEquals(actualPath, expectedPath);
  assertEquals(actualParams, expectedParam);
});

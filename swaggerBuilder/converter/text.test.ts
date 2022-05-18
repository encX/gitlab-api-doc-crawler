import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";

import { operationIDify } from "./text.ts";

Deno.test("operationIDify - normal", () => {
  assertEquals(operationIDify("Foo Bar Baz"), "fooBarBaz");
});

Deno.test("operationIDify - apostrophe U+0027 s", () => {
  assertEquals(operationIDify("List group’s runners"), "listGroupRunners");
});

Deno.test("operationIDify - apostrophe U+2019 s", () => {
  assertEquals(operationIDify("List group's runners"), "listGroupRunners");
});

Deno.test("operationIDify - single word", () => {
  assertEquals(operationIDify("word"), "word");
});
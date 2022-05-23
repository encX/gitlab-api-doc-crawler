import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";

import { operationIDify } from "./text.ts";

Deno.test("operationIDify - normal", () => {
  assertEquals(operationIDify("Foo Bar Baz"), "fooBarBaz");
});

Deno.test("operationIDify - ,", () => {
  assertEquals(operationIDify("Word, Another word"), "wordAnotherWord");
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

Deno.test("operationIDify - dash between words", () => {
  assertEquals(operationIDify("Create a to-do item"), "createAToDoItem");
});

Deno.test("operationIDify - dash surrounded by space", () => {
  assertEquals(operationIDify("Update epic - issue association"), "updateEpicIssueAssociation");
});

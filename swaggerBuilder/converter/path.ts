import { Resource } from "../../types/models.ts";

const paramRegex = /\/:(\w+)/g;

export function extractEndpointInfo(resources: Resource[]): [string, string, string[]] {
  const methods = new Set<string>();
  const paths = new Set<string>();

  resources.forEach(({ method, path }) => {
    methods.add(method.toUpperCase());
    paths.add(path.split("?")[0]);
  });

  if (methods.size > 1) throw new Error(`API has >1 http methods defined`);

  const method = [...methods][0].toLowerCase();
  const path = [...paths][0];

  return [method.toLowerCase(), formatPath(path), getPathParams(path)];
}

export function formatPath(path: string): string {
  return path.replace(paramRegex, "/{$1}");
}

export function getPathParams(path: string): string[] {
  return [...path.matchAll(/:(\w+)/g)].map(([_, match]) => match);
}

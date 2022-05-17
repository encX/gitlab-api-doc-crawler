export function asSwaggerPathAndParams(path: string): [string, string[]] {
  const paramRegex = /\/:(\w+)/g;
  const formattedPath = path.replace(paramRegex, "/{$1}");
  const pathParams = [...path.matchAll(/:(\w+)/g)].map(([_, match]) => match);

  return [formattedPath, pathParams];
}

# GitLab API doc crawler
Crawl GitLab API doc for OpenAPI spec generation.  
GitLab doesn't provide official Swagger/OpenAPI nor official API client in any language neither.  

With 895 endpoint (as of GitLab 15.0, not including pages with weird arrangement that I can't parse)
I can do it myself.

## Crawling/Generation process
![process](doc/process.png)

## Run instruction
### Prerequisite 
- [Deno](https://deno.land/)

Recommend to also use VSCode and install official Deno extension for the best development experiences.  
Deno options and launch settings are preconfigured for VSCode.

Or run via command line
```shell
$ deno run --allow-all index.ts
```

Run tests
```shell
$ deno test
```

## Generated content
All generated content are contained in [.generated](.generated) directory.
Which has content for each GitLab versions.

In each version contains
- `cache` — HTML pages cache
- `specs` — Intermediate models generated from HTML pages (corrections are applied)
- `swagger` — Generated Swagger/OpenAPI specs from intermediate models (each yaml for each API doc page)
- `unparsable_response` — Unparsable response body from webpage that can't really handle
- `allPages.json` — API doc page list with
- `opIds.txt` — List of API operation IDs
- `swagger.yml` — Main swagger spec for all APIs

## Roadmap
- [x] Crawl pages and create intermediate models
- [x] Make corrections to page parsing up to 90%
- [x] Generate and freeze
  - [x] 14.10
  - [x] 15.0
- [ ] Put specs to a separated repo and crowdsource hand corrections
- [ ] Generate GitLabKit REST API clients
  - [ ] .net
  - [ ] JavaScript/TypeScript
  - [ ] python
  - [ ] Go
  - [ ] Rust
  - [ ] Java
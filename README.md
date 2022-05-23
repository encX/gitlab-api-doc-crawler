# GitLab API doc crawler
Crawl GitLab API doc for OpenAPI spec generation.  
GitLab doesn't provide official Swagger/OpenAPI nor official API client in any language neither.  

With 885 endpoint (not including pages with weird arrangement that I can't parse)
I can do it myself.

### Crawling/Generation process
![process](doc/process.png)

### Run instruction
#### Prerequisite 
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
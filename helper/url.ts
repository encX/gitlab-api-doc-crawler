import { join } from "https://deno.land/std@0.139.0/path/mod.ts";
import { DocVer } from "../enums/docVer.ts";

class GLUrl {
  private docVer = DocVer.current;
  private host = "docs.gitlab.com";

  constructor() {}

  pageUrl(path: string): string {
    switch (this.docVer) {
      case DocVer.v14_8:
        return `https://${join(this.host, "/14.8/ee/api/", path)}`;
      case DocVer.v14_7:
        return `https://${join(this.host, "/14.7/ee/api/", path)}`;
      case DocVer.v14_6:
        return `https://${join(this.host, "/14.6/ee/api/", path)}`;
      case DocVer.v13_12:
        return `https://${join(this.host, "/13.12/ee/api/", path)}`;
      case DocVer.current:
      default:
        return `https://${join(this.host, "/ee/api/", path)}`;
    }
  }

  setDocVer(ver: DocVer): void {
    this.docVer = ver;
  }
}

export const glUrl = new GLUrl();

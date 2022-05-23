import { join } from "https://deno.land/std@0.139.0/path/mod.ts";

import { DocVer } from "../enums/docVer.ts";
import * as settings from "../settings.ts";

class GLUrl {
  private host = "docs.gitlab.com";

  constructor() {}

  pageUrl(path: string): string {
    switch (settings.docVer) {
      case DocVer.v15_0:
        return `https://${join(this.host, "/15.0/ee/api/", path)}`;
      case DocVer.v14_10:
        return `https://${join(this.host, "/14.10/ee/api/", path)}`;
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
}

export const glUrl = new GLUrl();

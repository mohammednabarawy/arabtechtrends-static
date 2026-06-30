import sitemap from "@astrojs/sitemap";
import { readFileSync, existsSync } from "node:fs";
import { defineConfig } from "astro/config";

const redirectMapPath = new URL("./tools/redirect-map.json", import.meta.url);
let redirects = {};
if (existsSync(redirectMapPath)) {
  redirects = JSON.parse(readFileSync(redirectMapPath, "utf8"));
}

export default defineConfig({
  site: process.env.SITE_URL ?? "https://www.arabtechtrends.com",
  base: process.env.BASE_PATH ?? "/",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/admin/")
    })
  ],
  redirects,
  vite: {
    define: {
      "import.meta.env.GSC_VERIFICATION_TOKEN": JSON.stringify(process.env.GSC_VERIFICATION_TOKEN ?? "")
    }
  }
});

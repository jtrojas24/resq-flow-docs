import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import type { Config } from "@react-router/dev/config";
import { createGetUrl, getSlugs } from "fumadocs-core/source";
import { getPageImagePath } from "./app/lib/og";

const getUrl = createGetUrl("/docs");

async function collectMdxFiles(
  directory: string,
  rootDirectory = directory,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectMdxFiles(entryPath, rootDirectory);
      }

      if (entry.isFile() && entry.name.endsWith(".mdx")) {
        return [relative(rootDirectory, entryPath)];
      }

      return [];
    }),
  );

  return files.flat();
}

export default {
  ssr: true,
  future: {
    v8_middleware: true,
  },
  async prerender({ getStaticPaths }) {
    const paths: string[] = [];
    const excluded: string[] = ["/api/search"];

    for (const path of getStaticPaths()) {
      if (!excluded.includes(path)) paths.push(path);
    }

    const entries = await collectMdxFiles("content/docs");

    for (const entry of entries) {
      const slugs = getSlugs(entry);

      paths.push(getUrl(slugs));
      paths.push(getPageImagePath(slugs));
    }

    return paths;
  },
} satisfies Config;

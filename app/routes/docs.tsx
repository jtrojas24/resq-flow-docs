import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { Link, redirect } from "react-router";
import { getMDXComponents } from "@/components/mdx";
import { baseOptions, gitConfig } from "@/lib/layout.shared";
import { getPageImagePath } from "@/lib/og";
import { source } from "@/lib/source";
import type { Route } from "./+types/docs";

export async function loader({ params }: Route.LoaderArgs) {
  const raw = params["*"] ?? "";
  const slugs = raw.split("/").filter((v) => v.length > 0);
  if (slugs.length === 0) return redirect("/docs/overview");

  const page = source.getPage(slugs);
  if (!page) throw new Response("Not found", { status: 404 });

  return {
    slugs: page.slugs,
    path: page.path,
    pageTree: await source.serializePageTree(source.getPageTree()),
    imagePath: getPageImagePath(slugs),
  };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: Mdx },
    // you can define props for the `<Content />` component
    {
      markdownUrl,
      path,
      imagePath,
      topTabs,
      currentSection,
    }: {
      markdownUrl: string;
      path: string;
      imagePath: string;
      topTabs: { title: string; url: string }[];
      currentSection: string;
    },
  ) {
    return (
      <DocsPage toc={toc}>
        <title>{`${frontmatter.title} | ResQ Flow Docs`}</title>
        <meta name="description" content={frontmatter.description} />
        <meta property="og:image" content={imagePath} />
        <div className="mb-6 hidden md:flex items-end gap-6 border-b">
          {topTabs.map((tab) => {
            const active = tab.url === `/docs/${currentSection}`;

            return (
              <Link
                className={[
                  "inline-flex items-center border-b-2 pb-2 text-sm font-medium transition-colors",
                  active
                    ? "border-fd-primary text-fd-primary"
                    : "border-transparent text-fd-muted-foreground hover:text-fd-foreground",
                ].join(" ")}
                key={tab.url}
                to={tab.url}
              >
                {tab.title}
              </Link>
            );
          })}
        </div>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <Mdx components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const { slugs, path, pageTree, imagePath } = useFumadocsLoader(loaderData);
  const markdownUrl = `/llms.mdx/docs/${slugs.join("/")}`;
  const topTabs = pageTree.children
    .filter((item) => item.type === "folder")
    .map((item) => ({
      title: String(item.name ?? ""),
      url: item.index?.url ?? "#",
    }));
  const currentSection = slugs[0] ?? "overview";

  return (
    <DocsLayout {...baseOptions()} sidebar={{ tabs: false }} tree={pageTree}>
      {clientLoader.useContent(path, {
        markdownUrl,
        path,
        imagePath,
        topTabs,
        currentSection,
      })}
    </DocsLayout>
  );
}

import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Link } from "react-router";
import { baseOptions } from "@/lib/layout.shared";

export function meta() {
  return [
    { title: "ResQ Flow Docs" },
    {
      name: "description",
      content:
        "Documentation for running, understanding, and integrating resq-flow.",
    },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="p-4 flex flex-col items-center justify-center text-center flex-1">
        <img
          alt="ResQ Flow logo"
          className="h-20 w-20 mb-4 rounded-2xl"
          src="/logo.png"
        />
        <h1 className="text-xl font-bold mb-2">ResQ Flow Docs</h1>
        <p className="text-fd-muted-foreground mb-4">
          Documentation for running, understanding, and integrating{" "}
          <code>resq-flow</code>.
        </p>
        <Link
          className="text-sm bg-fd-primary text-fd-primary-foreground rounded-full font-medium px-4 py-2.5"
          to="/docs"
        >
          Open docs
        </Link>
      </div>
    </HomeLayout>
  );
}

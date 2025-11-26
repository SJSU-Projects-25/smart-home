"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues
const RedirectComponent = dynamic(
  () =>
    import("@/src/components/HomeRedirect").then((mod) => ({
      default: mod.HomeRedirect,
    })),
  { ssr: false }
);

export default function Home() {
  return <RedirectComponent />;
}

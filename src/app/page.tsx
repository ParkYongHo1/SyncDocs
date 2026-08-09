"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/features/document-editing/ui/Editor"), {
  ssr: false,
});

export default function Home() {
  return <Editor />;
}

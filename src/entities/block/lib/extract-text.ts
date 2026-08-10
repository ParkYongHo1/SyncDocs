type InlineContent = {
  type: string;
  text?: string;
  styles?: Record<string, unknown>;
};

function isInlineContent(item: unknown): item is InlineContent {
  return typeof item === "object" && item !== null && "type" in item;
}

export function extractText(content: unknown): string {
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => (isInlineContent(item) ? (item.text ?? "") : ""))
    .join("");
}

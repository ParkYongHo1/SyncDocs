import { createClient } from "@/shared/lib/supabase/client";
import type { Block } from "../model/types";

function mapToBlock(row: {
  id: string;
  document_id: string;
  order: number;
  content: unknown;
  type: string;
  version: number;
  updated_by: string;
  updated_at: string;
  deleted_at: string | null;
}): Block {
  return {
    id: row.id,
    documentId: row.document_id,
    order: row.order,
    content: row.content,
    type: row.type,
    version: row.version,
    updatedBy: row.updated_by,
    updatedAt: new Date(row.updated_at).getTime(),
    deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
  };
}

export async function fetchBlocks(documentId: string): Promise<Block[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("document_id", documentId)
    .is("deleted_at", null)
    .order("order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapToBlock);
}

export async function createBlock(block: {
  id: string;
  documentId: string;
  order: number;
  content: unknown;
  type: string;
}): Promise<Block> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blocks")
    .insert({
      id: block.id,
      document_id: block.documentId,
      order: block.order,
      content: block.content,
      type: block.type,
    })
    .select()
    .single();

  if (error) throw error;
  return mapToBlock(data);
}

export async function updateBlockContent(
  blockId: string,
  content: unknown,
  baseVersion: number,
): Promise<Block> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blocks")
    .update({ content, version: baseVersion + 1 })
    .eq("id", blockId)
    .eq("version", baseVersion)
    .select()
    .single();

  if (error) throw error;
  return mapToBlock(data);
}

export async function fetchBlock(blockId: string): Promise<Block> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("id", blockId)
    .single();

  if (error) throw error;
  return mapToBlock(data);
}

export async function softDeleteBlock(blockId: string): Promise<Block> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blocks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", blockId)
    .select()
    .single();

  if (error) throw error;
  return mapToBlock(data);
}

export async function restoreDeletedBlock(blockId: string): Promise<Block> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blocks")
    .update({ deleted_at: null })
    .eq("id", blockId)
    .select()
    .single();

  if (error) throw error;
  return mapToBlock(data);
}

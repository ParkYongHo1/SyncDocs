import { createClient } from "@/shared/lib/supabase/client";
import type { Document } from "../model/types";

function mapToDocument(row: {
  id: string;
  title: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  is_readonly: boolean;
}): Document {
  return {
    id: row.id,
    title: row.title,
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    isReadonly: row.is_readonly,
  };
}

export async function fetchDocumentById(documentId: string): Promise<Document> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error) throw error;

  return mapToDocument(data);
}

export async function fetchDocuments(): Promise<Document[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data.map(mapToDocument);
}

export async function createDocument(
  title: string,
  ownerId: string,
): Promise<Document> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      title,
      owner_id: ownerId,
      is_readonly: false,
    })
    .select()
    .single();

  if (error) throw error;

  return mapToDocument(data);
}

export async function updateDocumentTitle(
  documentId: string,
  title: string,
): Promise<Document> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({ title })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;

  return mapToDocument(data);
}

export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) throw error;
}

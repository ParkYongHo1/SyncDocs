import { createClient } from "@/shared/lib/supabase/client";

export async function signInAsDemo() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  return data.user;
}
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  return data.user;
}

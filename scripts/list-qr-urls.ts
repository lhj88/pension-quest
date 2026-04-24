import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  .replace(/\/$/, "");

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await supabase
  .from("hunt_items")
  .select("code,title,type,is_active,sort_order")
  .order("sort_order", { ascending: true });

if (error) {
  console.error(error.message);
  process.exit(1);
}

for (const item of data ?? []) {
  const url = `${appUrl}/claim/${encodeURIComponent(item.code)}`;
  const activeLabel = item.is_active ? "active" : "inactive";
  console.log(`${item.code}\t${item.title}\t${item.type}\t${activeLabel}\t${url}`);
}

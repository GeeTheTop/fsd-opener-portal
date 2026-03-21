import { getStore } from "@netlify/blobs";

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders()
    });
  }

  try {
    const body = await req.json();
    const { id, manager_notes } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    const store = getStore("fsd-files");
    const existing = await store.get(id, { type: "json" });

    if (!existing) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    const updated = {
      ...existing,
      manager_notes: manager_notes || "",
      updated_at: new Date().toISOString()
    };

    await store.setJSON(id, updated);

    return new Response(JSON.stringify({ success: true, record: updated }), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to update manager note" }), {
      status: 500,
      headers: corsHeaders()
    });
  }
};

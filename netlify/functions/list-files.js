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

  try {
    const store = getStore("fsd-files");
    const files = [];

    for await (const { key } of store.list()) {
      const item = await store.get(key, { type: "json" });
      if (item) files.push(item);
    }

    files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return new Response(JSON.stringify({ success: true, files }), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to list files" }), {
      status: 500,
      headers: corsHeaders()
    });
  }
};

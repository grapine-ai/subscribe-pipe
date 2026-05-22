// src/server.ts
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function extractString(body, key) {
  if (body !== null && typeof body === "object" && key in body) {
    const val = body[key];
    if (typeof val === "string") return val.trim();
  }
  return "";
}
function createSubscribeHandler(provider) {
  return {
    POST: async (req) => {
      let body;
      try {
        body = await req.json();
      } catch {
        return Response.json({ error: "Invalid request body." }, { status: 400 });
      }
      const email = extractString(body, "email").toLowerCase();
      const source = extractString(body, "source") || "unknown";
      if (!email || !isValidEmail(email)) {
        return Response.json({ error: "A valid email is required." }, { status: 400 });
      }
      try {
        await provider.subscribe({ email, source });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not subscribe. Please try again.";
        return Response.json({ error: message }, { status: 500 });
      }
      return Response.json({ ok: true }, { status: 200 });
    }
  };
}
export {
  createSubscribeHandler
};

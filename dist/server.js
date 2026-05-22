"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  createSubscribeHandler: () => createSubscribeHandler
});
module.exports = __toCommonJS(server_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createSubscribeHandler
});

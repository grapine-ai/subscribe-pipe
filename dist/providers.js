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

// src/providers/index.ts
var providers_exports = {};
__export(providers_exports, {
  brevoProvider: () => brevoProvider,
  convertkitProvider: () => convertkitProvider,
  dbProvider: () => dbProvider,
  multiProvider: () => multiProvider,
  resendProvider: () => resendProvider
});
module.exports = __toCommonJS(providers_exports);

// src/providers/resend.ts
function resendProvider(config) {
  return {
    subscribe: async ({ email }) => {
      const res = await fetch(
        `https://api.resend.com/audiences/${config.audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, unsubscribed: false })
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message ?? `Resend error ${res.status}`
        );
      }
    }
  };
}

// src/providers/convertkit.ts
function convertkitProvider(config) {
  return {
    subscribe: async ({ email }) => {
      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${config.formId}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: config.apiKey,
            email,
            ...config.tagIds ? { tags: config.tagIds } : {}
          })
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message ?? `ConvertKit error ${res.status}`
        );
      }
    }
  };
}

// src/providers/brevo.ts
function brevoProvider(config) {
  return {
    subscribe: async ({ email, source }) => {
      const listIds = config.sourceListMap?.[source] != null ? [config.sourceListMap[source]] : config.listIds;
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          listIds,
          updateEnabled: true
        })
      });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message ?? `Brevo error ${res.status}`
        );
      }
    }
  };
}

// src/providers/db.ts
function dbProvider(config) {
  return {
    subscribe: async (data) => {
      await config.insert({ ...data, subscribedAt: /* @__PURE__ */ new Date() });
    }
  };
}

// src/providers/multi.ts
function multiProvider(...providers) {
  return {
    subscribe: async (data) => {
      await Promise.all(providers.map((p) => p.subscribe(data)));
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  brevoProvider,
  convertkitProvider,
  dbProvider,
  multiProvider,
  resendProvider
});

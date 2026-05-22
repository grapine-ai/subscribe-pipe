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
export {
  brevoProvider,
  convertkitProvider,
  dbProvider,
  multiProvider,
  resendProvider
};

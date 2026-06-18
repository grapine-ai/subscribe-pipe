# @grapine.ai/subscribe-pipe

Email signup form for Next.js. Drop it into any site, point it at your email platform, done.

Supports **Resend**, **ConvertKit**, **Brevo**, and **any database**. No styles included — bring your own. No provider SDKs bundled — uses `fetch` under the hood.

## Install

```bash
npm install @grapine.ai/subscribe-pipe
```

## How it works

Two pieces:

1. **A React form component** — handles input, loading, success, and error states. You style it.
2. **A server route** — validates the email and sends it to wherever you configure.

You connect them by picking a provider and dropping two files into your project.

---

## Quick start

### Step 1 — Tell it where signups should go

Create `app/api/subscribe/route.ts` and pick your provider:

**Resend**
```ts
import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
import { resendProvider } from "@grapine.ai/subscribe-pipe/providers";

export const { POST } = createSubscribeHandler(
  resendProvider({
    apiKey: process.env.RESEND_API_KEY!,
    segmentIds: [process.env.RESEND_SEGMENT_ID!],  // optional
    topicIds:   [process.env.RESEND_TOPIC_ID!],    // optional
  })
);
```

**ConvertKit**
```ts
import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
import { convertkitProvider } from "@grapine.ai/subscribe-pipe/providers";

export const { POST } = createSubscribeHandler(
  convertkitProvider({
    apiKey: process.env.CONVERTKIT_API_KEY!,
    formId: process.env.CONVERTKIT_FORM_ID!,
  })
);
```

**Brevo**
```ts
import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
import { brevoProvider } from "@grapine.ai/subscribe-pipe/providers";

export const { POST } = createSubscribeHandler(
  brevoProvider({
    apiKey: process.env.BREVO_API_KEY!,
    listIds: [3],
  })
);
```

**Your own database**
```ts
import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
import { dbProvider } from "@grapine.ai/subscribe-pipe/providers";

export const { POST } = createSubscribeHandler(
  dbProvider({
    insert: (data) => db.insert(subscribers).values(data),  // Drizzle
    // insert: (data) => prisma.subscriber.create({ data })  // Prisma
    // insert: (data) => supabase.from("subscribers").insert(data)  // Supabase
  })
);
```

### Step 2 — Add the form

```tsx
import { EmailCaptureForm } from "@grapine.ai/subscribe-pipe";

<EmailCaptureForm
  source="my-site"
  placeholder="your@email.com"
  buttonLabel="Subscribe"
  successMessage="You're in. We'll be in touch."
  inputClassName="..."
  buttonClassName="..."
/>
```

The `source` field identifies which site or page the signup came from. It gets passed to your provider so you can filter or tag by it.

---

## Resend — segments and topics

Resend has first-class **segments** and **topics** that attach to a contact at creation time. Both are created in the Resend dashboard and referenced by their IDs.

| Concept | Where to create | What it does |
|---------|----------------|--------------|
| **Segment** | Audiences → Segments → New | Groups contacts by a shared attribute (e.g. which site they came from) |
| **Topic** | Audiences → Topics → New | Lets contacts opt in/out of specific content streams |

Once you have the IDs, pass them to the provider:

```ts
resendProvider({
  apiKey: process.env.RESEND_API_KEY!,
  segmentIds: [process.env.RESEND_SEGMENT_ID!],
  topicIds:   [process.env.RESEND_TOPIC_ID!],
})
```

Under the hood this makes up to two calls per subscriber:

1. `POST /contacts` — creates the contact and subscribes to topics inline
2. `POST /contacts/{email}/segments/{segmentId}` — one call per segment ID, run in parallel

Resend does not support segment assignment in the create-contact body — segments must be added via a separate endpoint. Topics work inline and do not need a separate call.

Both `segmentIds` and `topicIds` are optional — omit either if you don't need it.

---

## Topic routing (ConvertKit / Brevo)

The `topic` prop on `<EmailCaptureForm>` routes a subscriber to the right tags or lists on ConvertKit and Brevo based on which product or page they signed up from.

> **Resend users:** Resend uses its own native segment/topic IDs (see above). The `topic` form prop has no effect on the Resend provider.

| Provider | Routing field | Native concept | How it works |
|---|---|---|---|
| `convertkitProvider` | `topic` (via `topicTagMap`) | **Tags** | Tags from `tagIds` plus any topic-specific tags from `topicTagMap` are merged and applied |
| `brevoProvider` | `source` / `topic` | **List** | `source` picks a list via `sourceListMap`; `topic` adds an additional list via `topicListMap` |
| `dbProvider` | all fields | **Column** | All of `email`, `source`, `topic`, and `subscribedAt` are passed to your `insert` function |
| Custom provider | all fields | — | `topic` is available in `SubscribeData`; implement routing however your platform needs |

### ConvertKit — topics as tags

```ts
convertkitProvider({
  apiKey: process.env.CONVERTKIT_API_KEY!,
  formId: process.env.CONVERTKIT_FORM_ID!,
  tagIds: [100],                    // applied to every subscriber
  topicTagMap: {
    "product-a": [111, 222],        // applied when topic = "product-a"
    "product-b": [333],             // applied when topic = "product-b"
  },
})
```

A subscriber arriving with `topic="product-a"` receives tags `[100, 111, 222]`.

```tsx
<EmailCaptureForm source="landing" topic="product-a" ... />
```

### Brevo — topics as additional lists

```ts
brevoProvider({
  apiKey: process.env.BREVO_API_KEY!,
  listIds: [3],                     // base list — all subscribers
  sourceListMap: { "my-site": 4 },  // source-based routing
  topicListMap: {
    "product-a": 10,
    "product-b": 11,
  },
})
```

A subscriber from `source="my-site"` with `topic="product-a"` lands in lists `[4, 10]`.

---

## Send to multiple places at once

Use `multiProvider` to run more than one provider simultaneously — for example, Resend and your own database in parallel.

```ts
import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
import { multiProvider, resendProvider, dbProvider } from "@grapine.ai/subscribe-pipe/providers";

export const { POST } = createSubscribeHandler(
  multiProvider(
    resendProvider({
      apiKey: process.env.RESEND_API_KEY!,
      segmentIds: [process.env.RESEND_SEGMENT_ID!],
      topicIds:   [process.env.RESEND_TOPIC_ID!],
    }),
    dbProvider({ insert: (data) => db.insert(subscribers).values(data) }),
  )
);
```

Both run in parallel. If one fails, the API returns a 500.

---

## All providers

All providers are imported from `@grapine.ai/subscribe-pipe/providers`.

### `resendProvider`

```ts
resendProvider({
  apiKey:      string,     // required — RESEND_API_KEY
  segmentIds?: string[],   // Resend segment IDs (from Audiences → Segments)
  topicIds?:   string[],   // Resend topic IDs (from Audiences → Topics)
})
```

Calls `POST https://api.resend.com/contacts`. All segment and topic assignments are made in a single request.

### `convertkitProvider`

```ts
convertkitProvider({
  apiKey:         string,                          // CONVERTKIT_API_KEY
  formId:         string,                          // form ID from ConvertKit
  tagIds?:        number[],                        // tags applied to every subscriber
  topicTagMap?:   Record<string, number[]>,        // topic → additional tag IDs
})
```

### `brevoProvider`

```ts
brevoProvider({
  apiKey:          string,                         // BREVO_API_KEY
  listIds:         number[],                       // default list IDs
  sourceListMap?:  Record<string, number>,         // source → list ID (overrides listIds)
  topicListMap?:   Record<string, number>,         // topic → list ID (additive)
})
```

### `dbProvider`

```ts
dbProvider({
  insert: (data: {
    email:       string,
    source:      string,
    topic?:      string,
    subscribedAt: Date,
  }) => Promise<unknown>,
})
```

Works with any ORM or database client.

### `multiProvider`

```ts
multiProvider(...providers)
```

Runs all providers in parallel.

---

## Build your own provider

If your platform isn't listed, wiring it up takes about five lines:

```ts
import type { SubscribeProvider } from "@grapine.ai/subscribe-pipe";

const myProvider: SubscribeProvider = {
  subscribe: async ({ email, source, topic }) => {
    await fetch("https://your-platform.com/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, topic }),
    });
  },
};

export const { POST } = createSubscribeHandler(myProvider);
```

---

## Form props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `string` | — | **Required.** Identifies which site or page this form is on. |
| `topic` | `string` | — | Routes the subscriber to matching tags/lists (ConvertKit, Brevo). No effect on Resend. |
| `endpoint` | `string` | `/api/subscribe` | API route to POST to. |
| `placeholder` | `string` | `your@email.com` | Input placeholder. |
| `buttonLabel` | `string` | `Subscribe` | Submit button text. |
| `loadingLabel` | `string` | `...` | Button text while submitting. |
| `successMessage` | `string` | `You're in.` | Shown after a successful signup. |
| `errorMessage` | `string` | `Something went wrong. Try again.` | Fallback error message. |
| `className` | `string` | — | Class on the `<form>`. |
| `inputClassName` | `string` | — | Class on the `<input>`. |
| `buttonClassName` | `string` | — | Class on the `<button>`. |
| `errorClassName` | `string` | — | Class on the error message. |
| `successClassName` | `string` | — | Class on the success message. |
| `renderSuccess` | `() => ReactNode` | — | Replace the success state with your own UI. |

---

## Changelog

### 0.4.0

- **Resend provider rewritten** to use the correct `POST /contacts` endpoint (was incorrectly using `/audiences/{id}/contacts`)
- **`segmentIds` / `topicIds` replace the old `topics` / `segments` audience-routing maps** — segments and topics are now native Resend objects assigned via their IDs, matching the Resend API's actual data model
- Contacts are assigned to segments via `segments: [{ id }]` and subscribed to topics via `topics: [{ id, subscription: "opt_in" }]` in a single request

### 0.3.0

- Added `segments` routing and `defaultSegment` to `resendProvider`
- Added `topicTagMap` to `convertkitProvider`
- Added `topicListMap` to `brevoProvider`

### 0.2.0

- Added `convertkitProvider`, `brevoProvider`, `dbProvider`, `multiProvider`
- Added `topic` prop to `<EmailCaptureForm>`

### 0.1.0

- Initial release

## License

MIT

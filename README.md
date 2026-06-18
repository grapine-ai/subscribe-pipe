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
    topics: {
      "product-a": process.env.RESEND_AUDIENCE_PRODUCT_A!,
      "product-b": process.env.RESEND_AUDIENCE_PRODUCT_B!,
    },
    defaultTopic: "product-a",
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
  source="promptspar"
  placeholder="your@email.com"
  buttonLabel="Join waitlist"
  successMessage="You're in. We'll be in touch."
  inputClassName="..."
  buttonClassName="..."
/>
```

The `source` field identifies which site or page the signup came from. It gets passed to your provider so you can filter or tag by it.

---

## Send to multiple places at once

Use `multiProvider` to send signups to more than one destination simultaneously — for example, your database and your email platform at the same time.

```ts
import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
import { multiProvider, resendProvider, dbProvider } from "@grapine.ai/subscribe-pipe/providers";

export const { POST } = createSubscribeHandler(
  multiProvider(
    resendProvider({
      apiKey: "...",
      topics: { "product-a": "aud_111", "product-b": "aud_222" },
      defaultTopic: "product-a",
    }),
    dbProvider({ insert: (data) => db.insert(subscribers).values(data) }),
  )
);
```

Both run in parallel.

---

## Topic routing

The `topic` prop on `<EmailCaptureForm>` (and the `topic` field in `SubscribeData`) lets you route a subscriber to the right bucket on your email platform — audience, list, tag, or database column — based on which product or page they signed up from.

Every provider exposes this differently because the underlying platforms have different native concepts:

| Provider | Routing field | Native concept | How it works |
|---|---|---|---|
| `resendProvider` | `topic` | **Audience** | `topic` is looked up in the `topics` config map and the subscriber is added to the matching Resend audience ID |
| `convertkitProvider` | `tagIds` (config) | **Tags** | Tags are set at config time via `tagIds`; use a separate provider instance per form/product if you need different tags |
| `brevoProvider` | `source` (via `sourceListMap`) | **List** | `source` is matched against `sourceListMap` in config to pick a list ID; falls back to `listIds` |
| `dbProvider` | all fields | **Column** | All of `email`, `source`, `topic`, and `subscribedAt` are passed to your `insert` function — store and query however you like |
| Custom provider | all fields | — | `topic` is available in `SubscribeData`; implement routing however your platform needs |

### Example — Resend with multiple products

If you run multiple products under one Resend account, map each product to its own Resend audience. Subscribers are kept completely separate and you can broadcast to each audience independently.

**1. Create one audience per product** at resend.com/audiences and copy each audience ID.

**2. Configure the provider:**

```ts
// app/api/subscribe/route.ts
resendProvider({
  apiKey: process.env.RESEND_API_KEY!,
  topics: {
    "product-a": process.env.RESEND_AUDIENCE_PRODUCT_A!,
    "product-b": process.env.RESEND_AUDIENCE_PRODUCT_B!,
    "product-c": process.env.RESEND_AUDIENCE_PRODUCT_C!,
  },
  defaultTopic: "product-a",
})
```

**3. Pass the topic from each form:**

```tsx
// Product A landing page
<EmailCaptureForm source="product-a-landing" topic="product-a" ... />

// Product B landing page
<EmailCaptureForm source="product-b-landing" topic="product-b" ... />
```

Subscribers land in the correct audience. Broadcast to any of them independently from the Resend dashboard or via the Resend Broadcasts API.

---

## All providers

All providers are imported from `@grapine.ai/subscribe-pipe/providers`.

### `resendProvider`

```ts
resendProvider({
  apiKey: string,                    // RESEND_API_KEY
  topics: Record<string, string>,    // topic name → Resend audience ID
  defaultTopic?: string,             // used when no topic is passed at subscribe time
})
```

Each key in `topics` is a name you choose (e.g. your product slug). Each value is a Resend audience ID from resend.com/audiences. Subscribers are routed to the audience that matches the `topic` passed by the form.

```ts
// One Resend account, three products — each gets its own audience
resendProvider({
  apiKey: process.env.RESEND_API_KEY!,
  topics: {
    "product-a": process.env.RESEND_AUDIENCE_PRODUCT_A!,
    "product-b": process.env.RESEND_AUDIENCE_PRODUCT_B!,
    "product-c": process.env.RESEND_AUDIENCE_PRODUCT_C!,
  },
  defaultTopic: "product-a",
})
```

### `convertkitProvider`

```ts
convertkitProvider({
  apiKey: string,       // CONVERTKIT_API_KEY
  formId: string,       // form ID from ConvertKit
  tagIds?: number[],    // optional tag IDs to apply
})
```

### `brevoProvider`

```ts
brevoProvider({
  apiKey: string,       // BREVO_API_KEY
  listIds: number[],    // list IDs from Brevo
  sourceListMap?: Record<string, number>,  // route specific sources to specific lists
})
```

```ts
// sourceListMap example — promptspar signups go to list 4, rivalrift to list 5
brevoProvider({
  apiKey: process.env.BREVO_API_KEY!,
  listIds: [3],           // default list
  sourceListMap: {
    promptspar: 4,
    rivalrift: 5,
  },
})
```

### `dbProvider`

```ts
dbProvider({
  insert: (data: { email: string; source: string; subscribedAt: Date }) => Promise<unknown>,
})
```

Works with any ORM or database client.

### `multiProvider`

```ts
multiProvider(...providers)
```

Runs all providers in parallel. If one fails, the API returns a 500.

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
| `topic` | `string` | — | Routes the subscriber to the matching audience/list. Required when using `resendProvider`. |
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

## License

MIT

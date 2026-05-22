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
    audienceId: process.env.RESEND_AUDIENCE_ID!,
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
    resendProvider({ apiKey: "...", audienceId: "..." }),
    dbProvider({ insert: (data) => db.insert(subscribers).values(data) }),
  )
);
```

Both run in parallel.

---

## All providers

All providers are imported from `@grapine.ai/subscribe-pipe/providers`.

### `resendProvider`

```ts
resendProvider({
  apiKey: string,       // RESEND_API_KEY
  audienceId: string,   // from resend.com/audiences
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
  subscribe: async ({ email, source }) => {
    await fetch("https://your-platform.com/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
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

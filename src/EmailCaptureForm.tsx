"use client";

import { useState, type FormEvent } from "react";

export interface EmailCaptureFormProps {
  /** Which page/product this form is on. Sent to the API for your records. */
  source: string;
  /** API route to POST to. Defaults to /api/subscribe */
  endpoint?: string;
  placeholder?: string;
  buttonLabel?: string;
  loadingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  /** className on the <form> wrapper */
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
  successClassName?: string;
  /** Render prop — replace the success state with your own UI */
  renderSuccess?: () => React.ReactNode;
}

type Status = "idle" | "loading" | "success" | "error";

export function EmailCaptureForm({
  source,
  endpoint = "/api/subscribe",
  placeholder = "your@email.com",
  buttonLabel = "Subscribe",
  loadingLabel = "...",
  successMessage = "You're in.",
  errorMessage = "Something went wrong. Try again.",
  className,
  inputClassName,
  buttonClassName,
  errorClassName,
  successClassName,
  renderSuccess,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setError("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? errorMessage);
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setError(errorMessage);
      setStatus("error");
    }
  }

  if (status === "success") {
    if (renderSuccess) return <>{renderSuccess()}</>;
    return <p className={successClassName}>{successMessage}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        disabled={status === "loading"}
        className={inputClassName}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={buttonClassName}
      >
        {status === "loading" ? loadingLabel : buttonLabel}
      </button>
      {status === "error" && (
        <p className={errorClassName}>{error}</p>
      )}
    </form>
  );
}

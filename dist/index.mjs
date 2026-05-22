// src/EmailCaptureForm.tsx
import { useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function EmailCaptureForm({
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
  renderSuccess
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source })
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
    if (renderSuccess) return /* @__PURE__ */ jsx(Fragment, { children: renderSuccess() });
    return /* @__PURE__ */ jsx("p", { className: successClassName, children: successMessage });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "email",
        required: true,
        value: email,
        onChange: (e) => setEmail(e.target.value),
        placeholder,
        disabled: status === "loading",
        className: inputClassName
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: status === "loading",
        className: buttonClassName,
        children: status === "loading" ? loadingLabel : buttonLabel
      }
    ),
    status === "error" && /* @__PURE__ */ jsx("p", { className: errorClassName, children: error })
  ] });
}
export {
  EmailCaptureForm
};

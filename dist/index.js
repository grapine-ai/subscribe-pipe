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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  EmailCaptureForm: () => EmailCaptureForm
});
module.exports = __toCommonJS(src_exports);

// src/EmailCaptureForm.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [email, setEmail] = (0, import_react.useState)("");
  const [status, setStatus] = (0, import_react.useState)("idle");
  const [error, setError] = (0, import_react.useState)("");
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
    if (renderSuccess) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: renderSuccess() });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: successClassName, children: successMessage });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { onSubmit: handleSubmit, className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "submit",
        disabled: status === "loading",
        className: buttonClassName,
        children: status === "loading" ? loadingLabel : buttonLabel
      }
    ),
    status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: errorClassName, children: error })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmailCaptureForm
});

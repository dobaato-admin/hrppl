import { j as jsxRuntimeExports } from "../_libs/react.mjs";
const SplitErrorComponent = ({
  error,
  reset
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Couldn't load the blog" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: error.message }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground", children: "Try again" })
] }) });
export {
  SplitErrorComponent as errorComponent
};

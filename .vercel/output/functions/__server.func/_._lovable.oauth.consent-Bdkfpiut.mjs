import { j as jsxRuntimeExports } from "./_libs/react.mjs";
const SplitErrorComponent = ({
  error
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-lg p-8 text-sm text-foreground", children: [
  "Could not load this authorization request: ",
  String(error?.message ?? error)
] });
export {
  SplitErrorComponent as errorComponent
};

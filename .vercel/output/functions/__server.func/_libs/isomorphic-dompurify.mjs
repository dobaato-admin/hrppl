import { p as purify$1 } from "./dompurify.mjs";
import { a as apiExports } from "./jsdom.mjs";
var window = new apiExports.JSDOM("<!DOCTYPE html>").window;
var purify = purify$1(window);
var DOMPurify = new Proxy(
  ((root) => purify$1(root)),
  {
    get(_, prop) {
      const value = purify[prop];
      return typeof value === "function" ? value.bind(purify) : value;
    },
    apply(_, __, [root]) {
      return purify$1(root);
    }
  }
);
var src_default = DOMPurify;
DOMPurify.isSupported;
DOMPurify.version;
new Proxy([], {
  get(_, prop) {
    return Reflect.get(purify.removed, prop);
  }
});
export {
  src_default as s
};

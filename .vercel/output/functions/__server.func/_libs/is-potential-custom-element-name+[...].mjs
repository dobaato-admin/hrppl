import { g as getDefaultExportFromCjs } from "./react.mjs";
var isPotentialCustomElementName_1;
var hasRequiredIsPotentialCustomElementName;
function requireIsPotentialCustomElementName() {
  if (hasRequiredIsPotentialCustomElementName) return isPotentialCustomElementName_1;
  hasRequiredIsPotentialCustomElementName = 1;
  var regex = /^[a-z](?:[\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
  var isPotentialCustomElementName = function(string) {
    return regex.test(string);
  };
  isPotentialCustomElementName_1 = isPotentialCustomElementName;
  return isPotentialCustomElementName_1;
}
var isPotentialCustomElementNameExports = requireIsPotentialCustomElementName();
const isCustomElementName = /* @__PURE__ */ getDefaultExportFromCjs(isPotentialCustomElementNameExports);
export {
  isCustomElementName as i,
  requireIsPotentialCustomElementName as r
};

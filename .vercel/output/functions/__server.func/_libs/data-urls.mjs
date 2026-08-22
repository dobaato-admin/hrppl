import { r as requireLib } from "./whatwg-mimetype.mjs";
import { r as requireWhatwgUrl } from "./whatwg-url.mjs";
var parser = { exports: {} };
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  utils.stripLeadingAndTrailingASCIIWhitespace = (string) => {
    return string.replace(/^[ \t\n\f\r]+/u, "").replace(/[ \t\n\f\r]+$/u, "");
  };
  utils.isomorphicDecode = (input) => {
    return Array.from(input, (byte) => String.fromCodePoint(byte)).join("");
  };
  utils.forgivingBase64Decode = (data) => {
    let asString;
    try {
      asString = atob(data);
    } catch {
      return null;
    }
    return Uint8Array.from(asString, (c) => c.codePointAt(0));
  };
  return utils;
}
var hasRequiredParser;
function requireParser() {
  if (hasRequiredParser) return parser.exports;
  hasRequiredParser = 1;
  (function(module) {
    const { MIMEType } = requireLib();
    const { parseURL, serializeURL, percentDecodeString } = requireWhatwgUrl();
    const { stripLeadingAndTrailingASCIIWhitespace, isomorphicDecode, forgivingBase64Decode } = requireUtils();
    module.exports = (stringInput) => {
      const urlRecord = parseURL(stringInput);
      if (urlRecord === null) {
        return null;
      }
      return module.exports.fromURLRecord(urlRecord);
    };
    module.exports.fromURLRecord = (urlRecord) => {
      if (urlRecord.scheme !== "data") {
        return null;
      }
      const input = serializeURL(urlRecord, true).substring("data:".length);
      let position = 0;
      let mimeType = "";
      while (position < input.length && input[position] !== ",") {
        mimeType += input[position];
        ++position;
      }
      mimeType = stripLeadingAndTrailingASCIIWhitespace(mimeType);
      if (position === input.length) {
        return null;
      }
      ++position;
      const encodedBody = input.substring(position);
      let body = percentDecodeString(encodedBody);
      const mimeTypeBase64MatchResult = /(.*); *[Bb][Aa][Ss][Ee]64$/u.exec(mimeType);
      if (mimeTypeBase64MatchResult) {
        const stringBody = isomorphicDecode(body);
        body = forgivingBase64Decode(stringBody);
        if (body === null) {
          return null;
        }
        mimeType = mimeTypeBase64MatchResult[1];
      }
      if (mimeType.startsWith(";")) {
        mimeType = `text/plain${mimeType}`;
      }
      let mimeTypeRecord;
      try {
        mimeTypeRecord = new MIMEType(mimeType);
      } catch {
        mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
      }
      return {
        mimeType: mimeTypeRecord,
        body
      };
    };
  })(parser);
  return parser.exports;
}
export {
  requireParser as r
};

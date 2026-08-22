import { b as require$$0 } from "./exodus__bytes.mjs";
var htmlEncodingSniffer;
var hasRequiredHtmlEncodingSniffer;
function requireHtmlEncodingSniffer() {
  if (hasRequiredHtmlEncodingSniffer) return htmlEncodingSniffer;
  hasRequiredHtmlEncodingSniffer = 1;
  const { getBOMEncoding, labelToName } = require$$0;
  htmlEncodingSniffer = (uint8Array, { xml = false, transportLayerEncodingLabel, defaultEncoding } = {}) => {
    if (defaultEncoding === void 0) {
      defaultEncoding = xml ? "UTF-8" : "windows-1252";
    }
    let encoding = labelToName(getBOMEncoding(uint8Array));
    if (encoding === null && transportLayerEncodingLabel !== void 0) {
      encoding = labelToName(transportLayerEncodingLabel);
    }
    if (encoding === null && !xml) {
      encoding = prescanMetaCharset(uint8Array);
    }
    if (encoding === null) {
      encoding = defaultEncoding;
    }
    return encoding;
  };
  function prescanMetaCharset(uint8Array) {
    const l = Math.min(uint8Array.byteLength, 1024);
    for (let i = 0; i < l; i++) {
      let c = uint8Array[i];
      if (c === 60) {
        const c1 = uint8Array[i + 1];
        const c2 = uint8Array[i + 2];
        const c3 = uint8Array[i + 3];
        const c4 = uint8Array[i + 4];
        const c5 = uint8Array[i + 5];
        if (c1 === 33 && c2 === 45 && c3 === 45) {
          i += 4;
          for (; i < l; i++) {
            c = uint8Array[i];
            const cMinus1 = uint8Array[i - 1];
            const cMinus2 = uint8Array[i - 2];
            if (c === 62 && cMinus1 === 45 && cMinus2 === 45) {
              break;
            }
          }
        } else if ((c1 === 77 || c1 === 109) && (c2 === 69 || c2 === 101) && (c3 === 84 || c3 === 116) && (c4 === 65 || c4 === 97) && (isSpaceCharacter(c5) || c5 === 47)) {
          i += 6;
          const attributeList = /* @__PURE__ */ new Set();
          let gotPragma = false;
          let needPragma = null;
          let charset = null;
          let attrRes;
          do {
            attrRes = getAttribute(uint8Array, i, l);
            if (attrRes.attr && !attributeList.has(attrRes.attr.name)) {
              attributeList.add(attrRes.attr.name);
              if (attrRes.attr.name === "http-equiv") {
                gotPragma = attrRes.attr.value === "content-type";
              } else if (attrRes.attr.name === "content" && !charset) {
                charset = extractCharacterEncodingFromMeta(attrRes.attr.value);
                if (charset !== null) {
                  needPragma = true;
                }
              } else if (attrRes.attr.name === "charset") {
                charset = labelToName(attrRes.attr.value);
                needPragma = false;
              }
            }
            i = attrRes.i;
          } while (attrRes.attr);
          if (needPragma === null) {
            continue;
          }
          if (needPragma === true && gotPragma === false) {
            continue;
          }
          if (charset === null) {
            continue;
          }
          if (charset === "UTF-16LE" || charset === "UTF-16BE") {
            charset = "UTF-8";
          }
          if (charset === "x-user-defined") {
            charset = "windows-1252";
          }
          return charset;
        } else if (c1 >= 65 && c1 <= 90 || c1 >= 97 && c1 <= 122) {
          for (i += 2; i < l; i++) {
            c = uint8Array[i];
            if (isSpaceCharacter(c) || c === 62) {
              break;
            }
          }
          let attrRes;
          do {
            attrRes = getAttribute(uint8Array, i, l);
            i = attrRes.i;
          } while (attrRes.attr);
        } else if (c1 === 33 || c1 === 47 || c1 === 63) {
          for (i += 2; i < l; i++) {
            c = uint8Array[i];
            if (c === 62) {
              break;
            }
          }
        }
      }
    }
    return null;
  }
  function getAttribute(uint8Array, i, l) {
    for (; i < l; i++) {
      let c = uint8Array[i];
      if (isSpaceCharacter(c) || c === 47) {
        continue;
      }
      if (c === 62) {
        break;
      }
      let name = "";
      let value = "";
      nameLoop: for (; i < l; i++) {
        c = uint8Array[i];
        if (c === 61 && name !== "") {
          i++;
          break;
        }
        if (isSpaceCharacter(c)) {
          for (i++; i < l; i++) {
            c = uint8Array[i];
            if (isSpaceCharacter(c)) {
              continue;
            }
            if (c !== 61) {
              return { attr: { name, value }, i };
            }
            i++;
            break nameLoop;
          }
          break;
        }
        if (c === 47 || c === 62) {
          return { attr: { name, value }, i };
        }
        if (c >= 65 && c <= 90) {
          name += String.fromCharCode(c + 32);
        } else {
          name += String.fromCharCode(c);
        }
      }
      c = uint8Array[i];
      if (isSpaceCharacter(c)) {
        for (i++; i < l; i++) {
          c = uint8Array[i];
          if (isSpaceCharacter(c)) {
            continue;
          } else {
            break;
          }
        }
      }
      if (c === 34 || c === 39) {
        const quote = c;
        for (i++; i < l; i++) {
          c = uint8Array[i];
          if (c === quote) {
            i++;
            return { attr: { name, value }, i };
          }
          if (c >= 65 && c <= 90) {
            value += String.fromCharCode(c + 32);
          } else {
            value += String.fromCharCode(c);
          }
        }
      }
      if (c === 62) {
        return { attr: { name, value }, i };
      }
      if (c >= 65 && c <= 90) {
        value += String.fromCharCode(c + 32);
      } else {
        value += String.fromCharCode(c);
      }
      for (i++; i < l; i++) {
        c = uint8Array[i];
        if (isSpaceCharacter(c) || c === 62) {
          return { attr: { name, value }, i };
        }
        if (c >= 65 && c <= 90) {
          value += String.fromCharCode(c + 32);
        } else {
          value += String.fromCharCode(c);
        }
      }
    }
    return { i };
  }
  function extractCharacterEncodingFromMeta(string) {
    let position = 0;
    while (true) {
      const indexOfCharset = string.substring(position).search(/charset/ui);
      if (indexOfCharset === -1) {
        return null;
      }
      let subPosition = position + indexOfCharset + "charset".length;
      while (isSpaceCharacter(string[subPosition].charCodeAt(0))) {
        ++subPosition;
      }
      if (string[subPosition] !== "=") {
        position = subPosition - 1;
        continue;
      }
      ++subPosition;
      while (isSpaceCharacter(string[subPosition].charCodeAt(0))) {
        ++subPosition;
      }
      position = subPosition;
      break;
    }
    if (string[position] === '"' || string[position] === "'") {
      const nextIndex = string.indexOf(string[position], position + 1);
      if (nextIndex !== -1) {
        return labelToName(string.substring(position + 1, nextIndex));
      }
      return null;
    }
    if (string.length === position + 1) {
      return null;
    }
    const indexOfASCIIWhitespaceOrSemicolon = string.substring(position + 1).search(/\x09|\x0A|\x0C|\x0D|\x20|;/u);
    const end = indexOfASCIIWhitespaceOrSemicolon === -1 ? string.length : position + indexOfASCIIWhitespaceOrSemicolon + 1;
    return labelToName(string.substring(position, end));
  }
  function isSpaceCharacter(c) {
    return c === 9 || c === 10 || c === 12 || c === 13 || c === 32;
  }
  return htmlEncodingSniffer;
}
export {
  requireHtmlEncodingSniffer as r
};

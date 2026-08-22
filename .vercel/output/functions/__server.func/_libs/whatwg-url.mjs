import { r as requireLib } from "./webidl-conversions.mjs";
import { c as require$$1 } from "./exodus__bytes.mjs";
import { r as requireTr46 } from "./tr46.mjs";
var whatwgUrl = {};
var webidl2jsWrapper = {};
var URL = {};
var utils = { exports: {} };
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils.exports;
  hasRequiredUtils = 1;
  (function(module, exports$1) {
    function isObject(value) {
      return typeof value === "object" && value !== null || typeof value === "function";
    }
    const call = Function.call.bind(Function.call);
    function define(target, source) {
      for (const key of Reflect.ownKeys(source)) {
        const descriptor = Reflect.getOwnPropertyDescriptor(source, key);
        if (descriptor && !Reflect.defineProperty(target, key, descriptor)) {
          throw new TypeError(`Cannot redefine property: ${String(key)}`);
        }
      }
    }
    function newObjectInRealm(globalObject, object) {
      const ctorRegistry = initCtorRegistry(globalObject);
      return Object.defineProperties(
        Object.create(ctorRegistry["%Object.prototype%"]),
        Object.getOwnPropertyDescriptors(object)
      );
    }
    const wrapperSymbol = /* @__PURE__ */ Symbol("wrapper");
    const implSymbol = /* @__PURE__ */ Symbol("impl");
    const sameObjectCaches = /* @__PURE__ */ Symbol("SameObject caches");
    const ctorRegistrySymbol = /* @__PURE__ */ Symbol.for("[webidl2js] constructor registry");
    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
    }).prototype);
    function initCtorRegistry(globalObject) {
      if (Object.hasOwn(globalObject, ctorRegistrySymbol)) {
        return globalObject[ctorRegistrySymbol];
      }
      const ctorRegistry = /* @__PURE__ */ Object.create(null);
      ctorRegistry["%Object.prototype%"] = globalObject.Object.prototype;
      ctorRegistry["%IteratorPrototype%"] = Object.getPrototypeOf(
        Object.getPrototypeOf(new globalObject.Array()[Symbol.iterator]())
      );
      try {
        ctorRegistry["%AsyncIteratorPrototype%"] = Object.getPrototypeOf(
          Object.getPrototypeOf(
            globalObject.eval("(async function* () {})").prototype
          )
        );
      } catch {
        ctorRegistry["%AsyncIteratorPrototype%"] = AsyncIteratorPrototype;
      }
      globalObject[ctorRegistrySymbol] = ctorRegistry;
      return ctorRegistry;
    }
    function getSameObject(wrapper, prop, creator) {
      if (!wrapper[sameObjectCaches]) {
        wrapper[sameObjectCaches] = /* @__PURE__ */ Object.create(null);
      }
      if (prop in wrapper[sameObjectCaches]) {
        return wrapper[sameObjectCaches][prop];
      }
      wrapper[sameObjectCaches][prop] = creator();
      return wrapper[sameObjectCaches][prop];
    }
    function wrapperForImpl(impl) {
      return impl ? impl[wrapperSymbol] : null;
    }
    function implForWrapper(wrapper) {
      return wrapper ? wrapper[implSymbol] : null;
    }
    function tryWrapperForImpl(impl) {
      const wrapper = wrapperForImpl(impl);
      return wrapper ? wrapper : impl;
    }
    function tryImplForWrapper(wrapper) {
      const impl = implForWrapper(wrapper);
      return impl ? impl : wrapper;
    }
    const iterInternalSymbol = /* @__PURE__ */ Symbol("internal");
    function isArrayIndexPropName(P) {
      if (typeof P !== "string") {
        return false;
      }
      const i = P >>> 0;
      if (i === 2 ** 32 - 1) {
        return false;
      }
      const s = `${i}`;
      if (P !== s) {
        return false;
      }
      return true;
    }
    const arrayBufferByteLengthGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
    function isArrayBuffer(value) {
      try {
        arrayBufferByteLengthGetter.call(value);
        return true;
      } catch {
        return false;
      }
    }
    const sharedArrayBufferByteLengthGetter = Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get;
    function isSharedArrayBuffer(value) {
      try {
        sharedArrayBufferByteLengthGetter.call(value);
        return true;
      } catch {
        return false;
      }
    }
    function iteratorResult([key, value], kind) {
      let result;
      switch (kind) {
        case "key":
          result = key;
          break;
        case "value":
          result = value;
          break;
        case "key+value":
          result = [key, value];
          break;
      }
      return { value: result, done: false };
    }
    function ordinarySetWithOwnDescriptor(target, property, value, receiver, ownDesc) {
      if (ownDesc === void 0) {
        const parent = Reflect.getPrototypeOf(target);
        if (parent !== null) {
          return Reflect.set(parent, property, value, receiver);
        }
        ownDesc = { writable: true, enumerable: true, configurable: true, value: void 0 };
      }
      if (isDataDescriptor(ownDesc)) {
        if (!ownDesc.writable) {
          return false;
        }
        if (!isObject(receiver)) {
          return false;
        }
        const existingDesc = Reflect.getOwnPropertyDescriptor(receiver, property);
        if (existingDesc !== void 0) {
          if (isAccessorDescriptor(existingDesc)) {
            return false;
          }
          if (existingDesc.writable === false) {
            return false;
          }
          const valueDesc = { value };
          return Reflect.defineProperty(receiver, property, valueDesc);
        }
        return Reflect.defineProperty(
          receiver,
          property,
          { value, writable: true, enumerable: true, configurable: true }
        );
      }
      const setter = ownDesc.set;
      if (setter === void 0) {
        return false;
      }
      call(setter, receiver, value);
      return true;
    }
    function isDataDescriptor(desc) {
      return Object.hasOwn(desc, "value") || Object.hasOwn(desc, "writable");
    }
    function isAccessorDescriptor(desc) {
      return Object.hasOwn(desc, "get") || Object.hasOwn(desc, "set");
    }
    const supportsPropertyIndex = /* @__PURE__ */ Symbol("supports property index");
    const supportedPropertyIndices = /* @__PURE__ */ Symbol("supported property indices");
    const supportsPropertyName = /* @__PURE__ */ Symbol("supports property name");
    const supportedPropertyNames = /* @__PURE__ */ Symbol("supported property names");
    const indexedGet = /* @__PURE__ */ Symbol("indexed property get");
    const indexedSetNew = /* @__PURE__ */ Symbol("indexed property set new");
    const indexedSetExisting = /* @__PURE__ */ Symbol("indexed property set existing");
    const namedGet = /* @__PURE__ */ Symbol("named property get");
    const namedSetNew = /* @__PURE__ */ Symbol("named property set new");
    const namedSetExisting = /* @__PURE__ */ Symbol("named property set existing");
    const namedDelete = /* @__PURE__ */ Symbol("named property delete");
    const asyncIteratorNext = /* @__PURE__ */ Symbol("async iterator get the next iteration result");
    const asyncIteratorReturn = /* @__PURE__ */ Symbol("async iterator return steps");
    const asyncIteratorInit = /* @__PURE__ */ Symbol("async iterator initialization steps");
    const asyncIteratorEOI = /* @__PURE__ */ Symbol("async iterator end of iteration");
    module.exports = {
      isObject,
      define,
      newObjectInRealm,
      wrapperSymbol,
      implSymbol,
      getSameObject,
      ctorRegistrySymbol,
      initCtorRegistry,
      wrapperForImpl,
      implForWrapper,
      tryWrapperForImpl,
      tryImplForWrapper,
      iterInternalSymbol,
      isArrayBuffer,
      isSharedArrayBuffer,
      isArrayIndexPropName,
      supportsPropertyIndex,
      supportedPropertyIndices,
      supportsPropertyName,
      supportedPropertyNames,
      indexedGet,
      indexedSetNew,
      indexedSetExisting,
      namedGet,
      namedSetNew,
      namedSetExisting,
      namedDelete,
      asyncIteratorNext,
      asyncIteratorReturn,
      asyncIteratorInit,
      asyncIteratorEOI,
      iteratorResult,
      ordinarySetWithOwnDescriptor
    };
  })(utils);
  return utils.exports;
}
var URLImpl = {};
var urlStateMachine = { exports: {} };
var infra;
var hasRequiredInfra;
function requireInfra() {
  if (hasRequiredInfra) return infra;
  hasRequiredInfra = 1;
  function isASCIIDigit(c) {
    return c >= 48 && c <= 57;
  }
  function isASCIIAlpha(c) {
    return c >= 65 && c <= 90 || c >= 97 && c <= 122;
  }
  function isASCIIAlphanumeric(c) {
    return isASCIIAlpha(c) || isASCIIDigit(c);
  }
  function isASCIIHex(c) {
    return isASCIIDigit(c) || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  infra = {
    isASCIIDigit,
    isASCIIAlpha,
    isASCIIAlphanumeric,
    isASCIIHex
  };
  return infra;
}
var encoding;
var hasRequiredEncoding;
function requireEncoding() {
  if (hasRequiredEncoding) return encoding;
  hasRequiredEncoding = 1;
  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true });
  function utf8Encode(string) {
    return utf8Encoder.encode(string);
  }
  function utf8DecodeWithoutBOM(bytes) {
    return utf8Decoder.decode(bytes);
  }
  encoding = {
    utf8Encode,
    utf8DecodeWithoutBOM
  };
  return encoding;
}
var percentEncoding;
var hasRequiredPercentEncoding;
function requirePercentEncoding() {
  if (hasRequiredPercentEncoding) return percentEncoding;
  hasRequiredPercentEncoding = 1;
  const { isASCIIHex } = requireInfra();
  const { utf8Encode } = requireEncoding();
  function p(char) {
    return char.codePointAt(0);
  }
  function percentEncode(c) {
    let hex = c.toString(16).toUpperCase();
    if (hex.length === 1) {
      hex = `0${hex}`;
    }
    return `%${hex}`;
  }
  function percentDecodeBytes(input) {
    const output = new Uint8Array(input.byteLength);
    let outputIndex = 0;
    for (let i = 0; i < input.byteLength; ++i) {
      const byte = input[i];
      if (byte !== 37) {
        output[outputIndex++] = byte;
      } else if (byte === 37 && (!isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2]))) {
        output[outputIndex++] = byte;
      } else {
        const bytePoint = parseInt(String.fromCodePoint(input[i + 1], input[i + 2]), 16);
        output[outputIndex++] = bytePoint;
        i += 2;
      }
    }
    return output.slice(0, outputIndex);
  }
  function percentDecodeString(input) {
    const bytes = utf8Encode(input);
    return percentDecodeBytes(bytes);
  }
  function isC0ControlPercentEncode(c) {
    return c <= 31 || c > 126;
  }
  const extraFragmentPercentEncodeSet = /* @__PURE__ */ new Set([p(" "), p('"'), p("<"), p(">"), p("`")]);
  function isFragmentPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.has(c);
  }
  const extraQueryPercentEncodeSet = /* @__PURE__ */ new Set([p(" "), p('"'), p("#"), p("<"), p(">")]);
  const extraQueryPercentEncodeChars = String.fromCodePoint(...[...extraQueryPercentEncodeSet].sort());
  function isQueryPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraQueryPercentEncodeSet.has(c);
  }
  const extraSpecialQueryPercentEncodeSet = /* @__PURE__ */ new Set([...extraQueryPercentEncodeSet, p("'")]);
  const extraSpecialQueryPercentEncodeChars = String.fromCodePoint(...[...extraSpecialQueryPercentEncodeSet].sort());
  function isSpecialQueryPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraSpecialQueryPercentEncodeSet.has(c);
  }
  const extraPathPercentEncodeSet = /* @__PURE__ */ new Set([p("?"), p("`"), p("{"), p("}"), p("^")]);
  function isPathPercentEncode(c) {
    return isQueryPercentEncode(c) || extraPathPercentEncodeSet.has(c);
  }
  const extraUserinfoPercentEncodeSet = /* @__PURE__ */ new Set([p("/"), p(":"), p(";"), p("="), p("@"), p("["), p("\\"), p("]"), p("|")]);
  function isUserinfoPercentEncode(c) {
    return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
  }
  const extraComponentPercentEncodeSet = /* @__PURE__ */ new Set([p("$"), p("%"), p("&"), p("+"), p(",")]);
  function isComponentPercentEncode(c) {
    return isUserinfoPercentEncode(c) || extraComponentPercentEncodeSet.has(c);
  }
  const extraURLEncodedPercentEncodeSet = /* @__PURE__ */ new Set([p("!"), p("'"), p("("), p(")"), p("~")]);
  function isURLEncodedPercentEncode(c) {
    return isComponentPercentEncode(c) || extraURLEncodedPercentEncodeSet.has(c);
  }
  function utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate) {
    const bytes = utf8Encode(codePoint);
    let output = "";
    for (const byte of bytes) {
      if (!percentEncodePredicate(byte)) {
        output += String.fromCharCode(byte);
      } else {
        output += percentEncode(byte);
      }
    }
    return output;
  }
  function utf8PercentEncodeCodePoint(codePoint, percentEncodePredicate) {
    return utf8PercentEncodeCodePointInternal(String.fromCodePoint(codePoint), percentEncodePredicate);
  }
  function utf8PercentEncodeString(input, percentEncodePredicate, spaceAsPlus = false) {
    let output = "";
    for (const codePoint of input) {
      if (spaceAsPlus && codePoint === " ") {
        output += "+";
      } else {
        output += utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate);
      }
    }
    return output;
  }
  percentEncoding = {
    isC0ControlPercentEncode,
    isFragmentPercentEncode,
    isQueryPercentEncode,
    isSpecialQueryPercentEncode,
    isPathPercentEncode,
    isUserinfoPercentEncode,
    isURLEncodedPercentEncode,
    extraQueryPercentEncodeChars,
    extraSpecialQueryPercentEncodeChars,
    percentDecodeString,
    percentDecodeBytes,
    utf8PercentEncodeString,
    utf8PercentEncodeCodePoint
  };
  return percentEncoding;
}
var hasRequiredUrlStateMachine;
function requireUrlStateMachine() {
  if (hasRequiredUrlStateMachine) return urlStateMachine.exports;
  hasRequiredUrlStateMachine = 1;
  (function(module) {
    const { percentEncodeAfterEncoding } = require$$1;
    const tr46 = requireTr46();
    const infra2 = requireInfra();
    const { utf8DecodeWithoutBOM } = requireEncoding();
    const {
      percentDecodeString,
      utf8PercentEncodeCodePoint,
      utf8PercentEncodeString,
      isC0ControlPercentEncode,
      isFragmentPercentEncode,
      extraQueryPercentEncodeChars,
      extraSpecialQueryPercentEncodeChars,
      isPathPercentEncode,
      isUserinfoPercentEncode
    } = requirePercentEncoding();
    function p(char) {
      return char.codePointAt(0);
    }
    const specialSchemes = {
      ftp: 21,
      file: null,
      http: 80,
      https: 443,
      ws: 80,
      wss: 443
    };
    const failure = /* @__PURE__ */ Symbol("failure");
    function countSymbols(str) {
      return [...str].length;
    }
    function at(input, idx) {
      const c = input[idx];
      return isNaN(c) ? void 0 : String.fromCodePoint(c);
    }
    function isSingleDot(buffer) {
      return buffer === "." || buffer.toLowerCase() === "%2e";
    }
    function isDoubleDot(buffer) {
      buffer = buffer.toLowerCase();
      return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
    }
    function isWindowsDriveLetterCodePoints(cp1, cp2) {
      return infra2.isASCIIAlpha(cp1) && (cp2 === p(":") || cp2 === p("|"));
    }
    function isWindowsDriveLetterString(string) {
      return string.length === 2 && infra2.isASCIIAlpha(string.codePointAt(0)) && (string[1] === ":" || string[1] === "|");
    }
    function isNormalizedWindowsDriveLetterString(string) {
      return string.length === 2 && infra2.isASCIIAlpha(string.codePointAt(0)) && string[1] === ":";
    }
    function containsForbiddenHostCodePoint(string) {
      return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u) !== -1;
    }
    function containsForbiddenDomainCodePoint(string) {
      return containsForbiddenHostCodePoint(string) || string.search(/[\u0000-\u001F]|%|\u007F/u) !== -1;
    }
    function isSpecialScheme(scheme) {
      return specialSchemes[scheme] !== void 0;
    }
    function isSpecial(url) {
      return isSpecialScheme(url.scheme);
    }
    function isNotSpecial(url) {
      return !isSpecialScheme(url.scheme);
    }
    function defaultPort(scheme) {
      return specialSchemes[scheme];
    }
    function parseIPv4Number(input) {
      if (input === "") {
        return failure;
      }
      let R = 10;
      if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
        input = input.substring(2);
        R = 16;
      } else if (input.length >= 2 && input.charAt(0) === "0") {
        input = input.substring(1);
        R = 8;
      }
      if (input === "") {
        return 0;
      }
      let regex = /[^0-7]/u;
      if (R === 10) {
        regex = /[^0-9]/u;
      }
      if (R === 16) {
        regex = /[^0-9A-Fa-f]/u;
      }
      if (regex.test(input)) {
        return failure;
      }
      return parseInt(input, R);
    }
    function parseIPv4(input) {
      const parts = input.split(".");
      if (parts[parts.length - 1] === "") {
        if (parts.length > 1) {
          parts.pop();
        }
      }
      if (parts.length > 4) {
        return failure;
      }
      const numbers = [];
      for (const part of parts) {
        const n = parseIPv4Number(part);
        if (n === failure) {
          return failure;
        }
        numbers.push(n);
      }
      for (let i = 0; i < numbers.length - 1; ++i) {
        if (numbers[i] > 255) {
          return failure;
        }
      }
      if (numbers[numbers.length - 1] >= 256 ** (5 - numbers.length)) {
        return failure;
      }
      let ipv4 = numbers.pop();
      let counter = 0;
      for (const n of numbers) {
        ipv4 += n * 256 ** (3 - counter);
        ++counter;
      }
      return ipv4;
    }
    function serializeIPv4(address) {
      let output = "";
      let n = address;
      for (let i = 1; i <= 4; ++i) {
        output = String(n % 256) + output;
        if (i !== 4) {
          output = `.${output}`;
        }
        n = Math.floor(n / 256);
      }
      return output;
    }
    function parseIPv6(input) {
      const address = [0, 0, 0, 0, 0, 0, 0, 0];
      let pieceIndex = 0;
      let compress = null;
      let pointer = 0;
      input = Array.from(input, (c) => c.codePointAt(0));
      if (input[pointer] === p(":")) {
        if (input[pointer + 1] !== p(":")) {
          return failure;
        }
        pointer += 2;
        ++pieceIndex;
        compress = pieceIndex;
      }
      while (pointer < input.length) {
        if (pieceIndex === 8) {
          return failure;
        }
        if (input[pointer] === p(":")) {
          if (compress !== null) {
            return failure;
          }
          ++pointer;
          ++pieceIndex;
          compress = pieceIndex;
          continue;
        }
        let value = 0;
        let length = 0;
        while (length < 4 && infra2.isASCIIHex(input[pointer])) {
          value = value * 16 + parseInt(at(input, pointer), 16);
          ++pointer;
          ++length;
        }
        if (input[pointer] === p(".")) {
          if (length === 0) {
            return failure;
          }
          pointer -= length;
          if (pieceIndex > 6) {
            return failure;
          }
          let numbersSeen = 0;
          while (input[pointer] !== void 0) {
            let ipv4Piece = null;
            if (numbersSeen > 0) {
              if (input[pointer] === p(".") && numbersSeen < 4) {
                ++pointer;
              } else {
                return failure;
              }
            }
            if (!infra2.isASCIIDigit(input[pointer])) {
              return failure;
            }
            while (infra2.isASCIIDigit(input[pointer])) {
              const number = parseInt(at(input, pointer));
              if (ipv4Piece === null) {
                ipv4Piece = number;
              } else if (ipv4Piece === 0) {
                return failure;
              } else {
                ipv4Piece = ipv4Piece * 10 + number;
              }
              if (ipv4Piece > 255) {
                return failure;
              }
              ++pointer;
            }
            address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
            ++numbersSeen;
            if (numbersSeen === 2 || numbersSeen === 4) {
              ++pieceIndex;
            }
          }
          if (numbersSeen !== 4) {
            return failure;
          }
          break;
        } else if (input[pointer] === p(":")) {
          ++pointer;
          if (input[pointer] === void 0) {
            return failure;
          }
        } else if (input[pointer] !== void 0) {
          return failure;
        }
        address[pieceIndex] = value;
        ++pieceIndex;
      }
      if (compress !== null) {
        let swaps = pieceIndex - compress;
        pieceIndex = 7;
        while (pieceIndex !== 0 && swaps > 0) {
          const temp = address[compress + swaps - 1];
          address[compress + swaps - 1] = address[pieceIndex];
          address[pieceIndex] = temp;
          --pieceIndex;
          --swaps;
        }
      } else if (compress === null && pieceIndex !== 8) {
        return failure;
      }
      return address;
    }
    function serializeIPv6(address) {
      let output = "";
      const compress = findTheIPv6AddressCompressedPieceIndex(address);
      let ignore0 = false;
      for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
        if (ignore0 && address[pieceIndex] === 0) {
          continue;
        } else if (ignore0) {
          ignore0 = false;
        }
        if (compress === pieceIndex) {
          const separator = pieceIndex === 0 ? "::" : ":";
          output += separator;
          ignore0 = true;
          continue;
        }
        output += address[pieceIndex].toString(16);
        if (pieceIndex !== 7) {
          output += ":";
        }
      }
      return output;
    }
    function parseHost(input, isOpaque = false) {
      if (input[0] === "[") {
        if (input[input.length - 1] !== "]") {
          return failure;
        }
        return parseIPv6(input.substring(1, input.length - 1));
      }
      if (isOpaque) {
        return parseOpaqueHost(input);
      }
      const domain = utf8DecodeWithoutBOM(percentDecodeString(input));
      const asciiDomain = domainToASCII(domain);
      if (asciiDomain === failure) {
        return failure;
      }
      if (endsInANumber(asciiDomain)) {
        return parseIPv4(asciiDomain);
      }
      return asciiDomain;
    }
    function endsInANumber(input) {
      const parts = input.split(".");
      if (parts[parts.length - 1] === "") {
        if (parts.length === 1) {
          return false;
        }
        parts.pop();
      }
      const last = parts[parts.length - 1];
      if (parseIPv4Number(last) !== failure) {
        return true;
      }
      if (/^[0-9]+$/u.test(last)) {
        return true;
      }
      return false;
    }
    function parseOpaqueHost(input) {
      if (containsForbiddenHostCodePoint(input)) {
        return failure;
      }
      return utf8PercentEncodeString(input, isC0ControlPercentEncode);
    }
    function findTheIPv6AddressCompressedPieceIndex(address) {
      let longestIndex = null;
      let longestSize = 1;
      let foundIndex = null;
      let foundSize = 0;
      for (let pieceIndex = 0; pieceIndex < address.length; ++pieceIndex) {
        if (address[pieceIndex] !== 0) {
          if (foundSize > longestSize) {
            longestIndex = foundIndex;
            longestSize = foundSize;
          }
          foundIndex = null;
          foundSize = 0;
        } else {
          if (foundIndex === null) {
            foundIndex = pieceIndex;
          }
          ++foundSize;
        }
      }
      if (foundSize > longestSize) {
        return foundIndex;
      }
      return longestIndex;
    }
    function serializeHost(host) {
      if (typeof host === "number") {
        return serializeIPv4(host);
      }
      if (host instanceof Array) {
        return `[${serializeIPv6(host)}]`;
      }
      return host;
    }
    function domainToASCII(domain, beStrict = false) {
      const result = tr46.toASCII(domain, {
        checkHyphens: beStrict,
        checkBidi: true,
        checkJoiners: true,
        useSTD3ASCIIRules: beStrict,
        transitionalProcessing: false,
        verifyDNSLength: beStrict,
        ignoreInvalidPunycode: false
      });
      if (result === null) {
        return failure;
      }
      if (!beStrict) {
        if (result === "") {
          return failure;
        }
        if (containsForbiddenDomainCodePoint(result)) {
          return failure;
        }
      }
      return result;
    }
    function trimControlChars(string) {
      let start = 0;
      let end = string.length;
      for (; start < end; ++start) {
        if (string.charCodeAt(start) > 32) {
          break;
        }
      }
      for (; end > start; --end) {
        if (string.charCodeAt(end - 1) > 32) {
          break;
        }
      }
      return string.substring(start, end);
    }
    function trimTabAndNewline(url) {
      return url.replace(/\u0009|\u000A|\u000D/ug, "");
    }
    function shortenPath(url) {
      const { path } = url;
      if (path.length === 0) {
        return;
      }
      if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
        return;
      }
      path.pop();
    }
    function includesCredentials(url) {
      return url.username !== "" || url.password !== "";
    }
    function cannotHaveAUsernamePasswordPort(url) {
      return url.host === null || url.host === "" || url.scheme === "file";
    }
    function hasAnOpaquePath(url) {
      return typeof url.path === "string";
    }
    function isNormalizedWindowsDriveLetter(string) {
      return /^[A-Za-z]:$/u.test(string);
    }
    function URLStateMachine(input, base, encoding2, url, stateOverride) {
      this.pointer = 0;
      this.input = input;
      this.base = base || null;
      this.encoding = encoding2 || "utf-8";
      this.stateOverride = stateOverride;
      this.url = url;
      this.failure = false;
      this.parseError = false;
      if (!this.url) {
        this.url = {
          scheme: "",
          username: "",
          password: "",
          host: null,
          port: null,
          path: [],
          query: null,
          fragment: null
        };
        const res2 = trimControlChars(this.input);
        if (res2 !== this.input) {
          this.parseError = true;
        }
        this.input = res2;
      }
      const res = trimTabAndNewline(this.input);
      if (res !== this.input) {
        this.parseError = true;
      }
      this.input = res;
      this.state = stateOverride || "scheme start";
      this.buffer = "";
      this.atSignSeen = false;
      this.insideBrackets = false;
      this.passwordTokenSeen = false;
      this.input = Array.from(this.input, (c) => c.codePointAt(0));
      for (; this.pointer <= this.input.length; ++this.pointer) {
        const c = this.input[this.pointer];
        const cStr = isNaN(c) ? void 0 : String.fromCodePoint(c);
        const ret = this[`parse ${this.state}`](c, cStr);
        if (!ret) {
          break;
        } else if (ret === failure) {
          this.failure = true;
          break;
        }
      }
    }
    URLStateMachine.prototype["parse scheme start"] = function parseSchemeStart(c, cStr) {
      if (infra2.isASCIIAlpha(c)) {
        this.buffer += cStr.toLowerCase();
        this.state = "scheme";
      } else if (!this.stateOverride) {
        this.state = "no scheme";
        --this.pointer;
      } else {
        this.parseError = true;
        return failure;
      }
      return true;
    };
    URLStateMachine.prototype["parse scheme"] = function parseScheme(c, cStr) {
      if (infra2.isASCIIAlphanumeric(c) || c === p("+") || c === p("-") || c === p(".")) {
        this.buffer += cStr.toLowerCase();
      } else if (c === p(":")) {
        if (this.stateOverride) {
          if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
            return false;
          }
          if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
            return false;
          }
          if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
            return false;
          }
          if (this.url.scheme === "file" && this.url.host === "") {
            return false;
          }
        }
        this.url.scheme = this.buffer;
        if (this.stateOverride) {
          if (this.url.port === defaultPort(this.url.scheme)) {
            this.url.port = null;
          }
          return false;
        }
        this.buffer = "";
        if (this.url.scheme === "file") {
          if (this.input[this.pointer + 1] !== p("/") || this.input[this.pointer + 2] !== p("/")) {
            this.parseError = true;
          }
          this.state = "file";
        } else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
          this.state = "special relative or authority";
        } else if (isSpecial(this.url)) {
          this.state = "special authority slashes";
        } else if (this.input[this.pointer + 1] === p("/")) {
          this.state = "path or authority";
          ++this.pointer;
        } else {
          this.url.path = "";
          this.state = "opaque path";
        }
      } else if (!this.stateOverride) {
        this.buffer = "";
        this.state = "no scheme";
        this.pointer = -1;
      } else {
        this.parseError = true;
        return failure;
      }
      return true;
    };
    URLStateMachine.prototype["parse no scheme"] = function parseNoScheme(c) {
      if (this.base === null || hasAnOpaquePath(this.base) && c !== p("#")) {
        return failure;
      } else if (hasAnOpaquePath(this.base) && c === p("#")) {
        this.url.scheme = this.base.scheme;
        this.url.path = this.base.path;
        this.url.query = this.base.query;
        this.url.fragment = "";
        this.state = "fragment";
      } else if (this.base.scheme === "file") {
        this.state = "file";
        --this.pointer;
      } else {
        this.state = "relative";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse special relative or authority"] = function parseSpecialRelativeOrAuthority(c) {
      if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
        this.state = "special authority ignore slashes";
        ++this.pointer;
      } else {
        this.parseError = true;
        this.state = "relative";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse path or authority"] = function parsePathOrAuthority(c) {
      if (c === p("/")) {
        this.state = "authority";
      } else {
        this.state = "path";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse relative"] = function parseRelative(c) {
      this.url.scheme = this.base.scheme;
      if (c === p("/")) {
        this.state = "relative slash";
      } else if (isSpecial(this.url) && c === p("\\")) {
        this.parseError = true;
        this.state = "relative slash";
      } else {
        this.url.username = this.base.username;
        this.url.password = this.base.password;
        this.url.host = this.base.host;
        this.url.port = this.base.port;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        if (c === p("?")) {
          this.url.query = "";
          this.state = "query";
        } else if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        } else if (!isNaN(c)) {
          this.url.query = null;
          this.url.path.pop();
          this.state = "path";
          --this.pointer;
        }
      }
      return true;
    };
    URLStateMachine.prototype["parse relative slash"] = function parseRelativeSlash(c) {
      if (isSpecial(this.url) && (c === p("/") || c === p("\\"))) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "special authority ignore slashes";
      } else if (c === p("/")) {
        this.state = "authority";
      } else {
        this.url.username = this.base.username;
        this.url.password = this.base.password;
        this.url.host = this.base.host;
        this.url.port = this.base.port;
        this.state = "path";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse special authority slashes"] = function parseSpecialAuthoritySlashes(c) {
      if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
        this.state = "special authority ignore slashes";
        ++this.pointer;
      } else {
        this.parseError = true;
        this.state = "special authority ignore slashes";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse special authority ignore slashes"] = function parseSpecialAuthorityIgnoreSlashes(c) {
      if (c !== p("/") && c !== p("\\")) {
        this.state = "authority";
        --this.pointer;
      } else {
        this.parseError = true;
      }
      return true;
    };
    URLStateMachine.prototype["parse authority"] = function parseAuthority(c, cStr) {
      if (c === p("@")) {
        this.parseError = true;
        if (this.atSignSeen) {
          this.buffer = `%40${this.buffer}`;
        }
        this.atSignSeen = true;
        const len = countSymbols(this.buffer);
        for (let pointer = 0; pointer < len; ++pointer) {
          const codePoint = this.buffer.codePointAt(pointer);
          if (codePoint === p(":") && !this.passwordTokenSeen) {
            this.passwordTokenSeen = true;
            continue;
          }
          const encodedCodePoints = utf8PercentEncodeCodePoint(codePoint, isUserinfoPercentEncode);
          if (this.passwordTokenSeen) {
            this.url.password += encodedCodePoints;
          } else {
            this.url.username += encodedCodePoints;
          }
        }
        this.buffer = "";
      } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
        if (this.atSignSeen && this.buffer === "") {
          this.parseError = true;
          return failure;
        }
        this.pointer -= countSymbols(this.buffer) + 1;
        this.buffer = "";
        this.state = "host";
      } else {
        this.buffer += cStr;
      }
      return true;
    };
    URLStateMachine.prototype["parse hostname"] = URLStateMachine.prototype["parse host"] = function parseHostName(c, cStr) {
      if (this.stateOverride && this.url.scheme === "file") {
        --this.pointer;
        this.state = "file host";
      } else if (c === p(":") && !this.insideBrackets) {
        if (this.buffer === "") {
          this.parseError = true;
          return failure;
        }
        if (this.stateOverride === "hostname") {
          return failure;
        }
        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
          return failure;
        }
        this.url.host = host;
        this.buffer = "";
        this.state = "port";
      } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
        --this.pointer;
        if (isSpecial(this.url) && this.buffer === "") {
          this.parseError = true;
          return failure;
        } else if (this.stateOverride && this.buffer === "" && (includesCredentials(this.url) || this.url.port !== null)) {
          this.parseError = true;
          return failure;
        }
        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
          return failure;
        }
        this.url.host = host;
        this.buffer = "";
        this.state = "path start";
        if (this.stateOverride) {
          return false;
        }
      } else {
        if (c === p("[")) {
          this.insideBrackets = true;
        } else if (c === p("]")) {
          this.insideBrackets = false;
        }
        this.buffer += cStr;
      }
      return true;
    };
    URLStateMachine.prototype["parse port"] = function parsePort(c, cStr) {
      if (infra2.isASCIIDigit(c)) {
        this.buffer += cStr;
      } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\") || this.stateOverride) {
        if (this.buffer !== "") {
          const port = parseInt(this.buffer);
          if (port > 2 ** 16 - 1) {
            this.parseError = true;
            return failure;
          }
          this.url.port = port === defaultPort(this.url.scheme) ? null : port;
          this.buffer = "";
          if (this.stateOverride) {
            return false;
          }
        }
        if (this.stateOverride) {
          return failure;
        }
        this.state = "path start";
        --this.pointer;
      } else {
        this.parseError = true;
        return failure;
      }
      return true;
    };
    const fileOtherwiseCodePoints = /* @__PURE__ */ new Set([p("/"), p("\\"), p("?"), p("#")]);
    function startsWithWindowsDriveLetter(input, pointer) {
      const length = input.length - pointer;
      return length >= 2 && isWindowsDriveLetterCodePoints(input[pointer], input[pointer + 1]) && (length === 2 || fileOtherwiseCodePoints.has(input[pointer + 2]));
    }
    URLStateMachine.prototype["parse file"] = function parseFile(c) {
      this.url.scheme = "file";
      this.url.host = "";
      if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "file slash";
      } else if (this.base !== null && this.base.scheme === "file") {
        this.url.host = this.base.host;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        if (c === p("?")) {
          this.url.query = "";
          this.state = "query";
        } else if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        } else if (!isNaN(c)) {
          this.url.query = null;
          if (!startsWithWindowsDriveLetter(this.input, this.pointer)) {
            shortenPath(this.url);
          } else {
            this.parseError = true;
            this.url.path = [];
          }
          this.state = "path";
          --this.pointer;
        }
      } else {
        this.state = "path";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse file slash"] = function parseFileSlash(c) {
      if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "file host";
      } else {
        if (this.base !== null && this.base.scheme === "file") {
          if (!startsWithWindowsDriveLetter(this.input, this.pointer) && isNormalizedWindowsDriveLetterString(this.base.path[0])) {
            this.url.path.push(this.base.path[0]);
          }
          this.url.host = this.base.host;
        }
        this.state = "path";
        --this.pointer;
      }
      return true;
    };
    URLStateMachine.prototype["parse file host"] = function parseFileHost(c, cStr) {
      if (isNaN(c) || c === p("/") || c === p("\\") || c === p("?") || c === p("#")) {
        --this.pointer;
        if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
          this.parseError = true;
          this.state = "path";
        } else if (this.buffer === "") {
          this.url.host = "";
          if (this.stateOverride) {
            return false;
          }
          this.state = "path start";
        } else {
          let host = parseHost(this.buffer, isNotSpecial(this.url));
          if (host === failure) {
            return failure;
          }
          if (host === "localhost") {
            host = "";
          }
          this.url.host = host;
          if (this.stateOverride) {
            return false;
          }
          this.buffer = "";
          this.state = "path start";
        }
      } else {
        this.buffer += cStr;
      }
      return true;
    };
    URLStateMachine.prototype["parse path start"] = function parsePathStart(c) {
      if (isSpecial(this.url)) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "path";
        if (c !== p("/") && c !== p("\\")) {
          --this.pointer;
        }
      } else if (!this.stateOverride && c === p("?")) {
        this.url.query = "";
        this.state = "query";
      } else if (!this.stateOverride && c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
      } else if (c !== void 0) {
        this.state = "path";
        if (c !== p("/")) {
          --this.pointer;
        }
      } else if (this.stateOverride && this.url.host === null) {
        this.url.path.push("");
      }
      return true;
    };
    URLStateMachine.prototype["parse path"] = function parsePath(c) {
      if (isNaN(c) || c === p("/") || isSpecial(this.url) && c === p("\\") || !this.stateOverride && (c === p("?") || c === p("#"))) {
        if (isSpecial(this.url) && c === p("\\")) {
          this.parseError = true;
        }
        if (isDoubleDot(this.buffer)) {
          shortenPath(this.url);
          if (c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
            this.url.path.push("");
          }
        } else if (isSingleDot(this.buffer) && c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
          this.url.path.push("");
        } else if (!isSingleDot(this.buffer)) {
          if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
            this.buffer = `${this.buffer[0]}:`;
          }
          this.url.path.push(this.buffer);
        }
        this.buffer = "";
        if (c === p("?")) {
          this.url.query = "";
          this.state = "query";
        }
        if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        }
      } else {
        if (c === p("%") && (!infra2.isASCIIHex(this.input[this.pointer + 1]) || !infra2.isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        this.buffer += utf8PercentEncodeCodePoint(c, isPathPercentEncode);
      }
      return true;
    };
    URLStateMachine.prototype["parse opaque path"] = function parseOpaquePath(c) {
      if (c === p("?")) {
        this.url.query = "";
        this.state = "query";
      } else if (c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
      } else if (c === p(" ")) {
        const remaining = this.input[this.pointer + 1];
        if (remaining === p("?") || remaining === p("#")) {
          this.url.path += "%20";
        } else {
          this.url.path += " ";
        }
      } else {
        if (!isNaN(c) && c !== p("%")) {
          this.parseError = true;
        }
        if (c === p("%") && (!infra2.isASCIIHex(this.input[this.pointer + 1]) || !infra2.isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        if (!isNaN(c)) {
          this.url.path += utf8PercentEncodeCodePoint(c, isC0ControlPercentEncode);
        }
      }
      return true;
    };
    URLStateMachine.prototype["parse query"] = function parseQuery(c, cStr) {
      if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
        this.encoding = "utf-8";
      }
      if (!this.stateOverride && c === p("#") || isNaN(c)) {
        const percentEncodeSet = isSpecial(this.url) ? extraSpecialQueryPercentEncodeChars : extraQueryPercentEncodeChars;
        this.url.query += percentEncodeAfterEncoding(
          this.encoding,
          this.buffer,
          percentEncodeSet
        );
        this.buffer = "";
        if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        }
      } else if (!isNaN(c)) {
        if (c === p("%") && (!infra2.isASCIIHex(this.input[this.pointer + 1]) || !infra2.isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        this.buffer += cStr;
      }
      return true;
    };
    URLStateMachine.prototype["parse fragment"] = function parseFragment(c) {
      if (!isNaN(c)) {
        if (c === p("%") && (!infra2.isASCIIHex(this.input[this.pointer + 1]) || !infra2.isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        this.url.fragment += utf8PercentEncodeCodePoint(c, isFragmentPercentEncode);
      }
      return true;
    };
    function serializeURL(url, excludeFragment) {
      let output = `${url.scheme}:`;
      if (url.host !== null) {
        output += "//";
        if (url.username !== "" || url.password !== "") {
          output += url.username;
          if (url.password !== "") {
            output += `:${url.password}`;
          }
          output += "@";
        }
        output += serializeHost(url.host);
        if (url.port !== null) {
          output += `:${url.port}`;
        }
      }
      if (url.host === null && !hasAnOpaquePath(url) && url.path.length > 1 && url.path[0] === "") {
        output += "/.";
      }
      output += serializePath(url);
      if (url.query !== null) {
        output += `?${url.query}`;
      }
      if (!excludeFragment && url.fragment !== null) {
        output += `#${url.fragment}`;
      }
      return output;
    }
    function serializeOrigin(tuple) {
      let result = `${tuple.scheme}://`;
      result += serializeHost(tuple.host);
      if (tuple.port !== null) {
        result += `:${tuple.port}`;
      }
      return result;
    }
    function serializePath(url) {
      if (hasAnOpaquePath(url)) {
        return url.path;
      }
      let output = "";
      for (const segment of url.path) {
        output += `/${segment}`;
      }
      return output;
    }
    module.exports.serializeURL = serializeURL;
    module.exports.serializePath = serializePath;
    module.exports.serializeURLOrigin = function(url) {
      switch (url.scheme) {
        case "blob": {
          const pathURL = module.exports.parseURL(serializePath(url));
          if (pathURL === null) {
            return "null";
          }
          if (pathURL.scheme !== "http" && pathURL.scheme !== "https") {
            return "null";
          }
          return module.exports.serializeURLOrigin(pathURL);
        }
        case "ftp":
        case "http":
        case "https":
        case "ws":
        case "wss":
          return serializeOrigin({
            scheme: url.scheme,
            host: url.host,
            port: url.port
          });
        case "file":
          return "null";
        default:
          return "null";
      }
    };
    module.exports.basicURLParse = function(input, options) {
      if (options === void 0) {
        options = {};
      }
      const usm = new URLStateMachine(input, options.baseURL, options.encoding, options.url, options.stateOverride);
      if (usm.failure) {
        return null;
      }
      return usm.url;
    };
    module.exports.setTheUsername = function(url, username) {
      url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode);
    };
    module.exports.setThePassword = function(url, password) {
      url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode);
    };
    module.exports.serializeHost = serializeHost;
    module.exports.cannotHaveAUsernamePasswordPort = cannotHaveAUsernamePasswordPort;
    module.exports.hasAnOpaquePath = hasAnOpaquePath;
    module.exports.serializeInteger = function(integer) {
      return String(integer);
    };
    module.exports.parseURL = function(input, options) {
      if (options === void 0) {
        options = {};
      }
      return module.exports.basicURLParse(input, { baseURL: options.baseURL, encoding: options.encoding });
    };
  })(urlStateMachine);
  return urlStateMachine.exports;
}
var urlencoded;
var hasRequiredUrlencoded;
function requireUrlencoded() {
  if (hasRequiredUrlencoded) return urlencoded;
  hasRequiredUrlencoded = 1;
  const { utf8Encode, utf8DecodeWithoutBOM } = requireEncoding();
  const { percentDecodeBytes, utf8PercentEncodeString, isURLEncodedPercentEncode } = requirePercentEncoding();
  function p(char) {
    return char.codePointAt(0);
  }
  function parseUrlencoded(input) {
    const sequences = strictlySplitByteSequence(input, p("&"));
    const output = [];
    for (const bytes of sequences) {
      if (bytes.length === 0) {
        continue;
      }
      let name, value;
      const indexOfEqual = bytes.indexOf(p("="));
      if (indexOfEqual >= 0) {
        name = bytes.slice(0, indexOfEqual);
        value = bytes.slice(indexOfEqual + 1);
      } else {
        name = bytes;
        value = new Uint8Array(0);
      }
      name = replaceByteInByteSequence(name, 43, 32);
      value = replaceByteInByteSequence(value, 43, 32);
      const nameString = utf8DecodeWithoutBOM(percentDecodeBytes(name));
      const valueString = utf8DecodeWithoutBOM(percentDecodeBytes(value));
      output.push([nameString, valueString]);
    }
    return output;
  }
  function parseUrlencodedString(input) {
    return parseUrlencoded(utf8Encode(input));
  }
  function serializeUrlencoded(tuples) {
    let output = "";
    for (const [i, tuple] of tuples.entries()) {
      const name = utf8PercentEncodeString(tuple[0], isURLEncodedPercentEncode, true);
      const value = utf8PercentEncodeString(tuple[1], isURLEncodedPercentEncode, true);
      if (i !== 0) {
        output += "&";
      }
      output += `${name}=${value}`;
    }
    return output;
  }
  function strictlySplitByteSequence(buf, cp) {
    const list = [];
    let last = 0;
    let i = buf.indexOf(cp);
    while (i >= 0) {
      list.push(buf.slice(last, i));
      last = i + 1;
      i = buf.indexOf(cp, last);
    }
    if (last !== buf.length) {
      list.push(buf.slice(last));
    }
    return list;
  }
  function replaceByteInByteSequence(buf, from, to) {
    let i = buf.indexOf(from);
    while (i >= 0) {
      buf[i] = to;
      i = buf.indexOf(from, i + 1);
    }
    return buf;
  }
  urlencoded = {
    parseUrlencodedString,
    serializeUrlencoded
  };
  return urlencoded;
}
var URLSearchParams = {};
var _Function = {};
var hasRequired_Function;
function require_Function() {
  if (hasRequired_Function) return _Function;
  hasRequired_Function = 1;
  const conversions = requireLib();
  const utils2 = requireUtils();
  _Function.convert = (globalObject, value, { context = "The provided value" } = {}) => {
    if (typeof value !== "function") {
      throw new globalObject.TypeError(context + " is not a function");
    }
    function invokeTheCallbackFunction(...args) {
      const thisArg = utils2.tryWrapperForImpl(this);
      let callResult;
      for (let i = 0; i < args.length; i++) {
        args[i] = utils2.tryWrapperForImpl(args[i]);
      }
      callResult = Reflect.apply(value, thisArg, args);
      callResult = conversions["any"](callResult, { context, globals: globalObject });
      return callResult;
    }
    invokeTheCallbackFunction.construct = (...args) => {
      for (let i = 0; i < args.length; i++) {
        args[i] = utils2.tryWrapperForImpl(args[i]);
      }
      let callResult = Reflect.construct(value, args);
      callResult = conversions["any"](callResult, { context, globals: globalObject });
      return callResult;
    };
    invokeTheCallbackFunction[utils2.wrapperSymbol] = value;
    invokeTheCallbackFunction.objectReference = value;
    return invokeTheCallbackFunction;
  };
  return _Function;
}
var URLSearchParamsImpl = {};
var hasRequiredURLSearchParamsImpl;
function requireURLSearchParamsImpl() {
  if (hasRequiredURLSearchParamsImpl) return URLSearchParamsImpl;
  hasRequiredURLSearchParamsImpl = 1;
  const urlencoded2 = requireUrlencoded();
  URLSearchParamsImpl.implementation = class URLSearchParamsImpl {
    constructor(globalObject, constructorArgs, { doNotStripQMark = false }) {
      let init = constructorArgs[0];
      this._list = [];
      this._url = null;
      if (!doNotStripQMark && typeof init === "string" && init[0] === "?") {
        init = init.slice(1);
      }
      if (Array.isArray(init)) {
        for (const pair of init) {
          if (pair.length !== 2) {
            throw new TypeError("Failed to construct 'URLSearchParams': parameter 1 sequence's element does not contain exactly two elements.");
          }
          this._list.push([pair[0], pair[1]]);
        }
      } else if (typeof init === "object" && Object.getPrototypeOf(init) === null) {
        for (const name of Object.keys(init)) {
          const value = init[name];
          this._list.push([name, value]);
        }
      } else {
        this._list = urlencoded2.parseUrlencodedString(init);
      }
    }
    _updateSteps() {
      if (this._url !== null) {
        let serializedQuery = urlencoded2.serializeUrlencoded(this._list);
        if (serializedQuery === "") {
          serializedQuery = null;
        }
        this._url._url.query = serializedQuery;
      }
    }
    get size() {
      return this._list.length;
    }
    append(name, value) {
      this._list.push([name, value]);
      this._updateSteps();
    }
    delete(name, value) {
      let i = 0;
      while (i < this._list.length) {
        if (this._list[i][0] === name && (value === void 0 || this._list[i][1] === value)) {
          this._list.splice(i, 1);
        } else {
          i++;
        }
      }
      this._updateSteps();
    }
    get(name) {
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          return tuple[1];
        }
      }
      return null;
    }
    getAll(name) {
      const output = [];
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          output.push(tuple[1]);
        }
      }
      return output;
    }
    has(name, value) {
      for (const tuple of this._list) {
        if (tuple[0] === name && (value === void 0 || tuple[1] === value)) {
          return true;
        }
      }
      return false;
    }
    set(name, value) {
      let found = false;
      let i = 0;
      while (i < this._list.length) {
        if (this._list[i][0] === name) {
          if (found) {
            this._list.splice(i, 1);
          } else {
            found = true;
            this._list[i][1] = value;
            i++;
          }
        } else {
          i++;
        }
      }
      if (!found) {
        this._list.push([name, value]);
      }
      this._updateSteps();
    }
    sort() {
      this._list.sort((a, b) => {
        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }
        return 0;
      });
      this._updateSteps();
    }
    [Symbol.iterator]() {
      return this._list[Symbol.iterator]();
    }
    toString() {
      return urlencoded2.serializeUrlencoded(this._list);
    }
  };
  return URLSearchParamsImpl;
}
var hasRequiredURLSearchParams;
function requireURLSearchParams() {
  if (hasRequiredURLSearchParams) return URLSearchParams;
  hasRequiredURLSearchParams = 1;
  (function(exports$1) {
    const conversions = requireLib();
    const utils2 = requireUtils();
    const Function2 = require_Function();
    const newObjectInRealm = utils2.newObjectInRealm;
    const implSymbol = utils2.implSymbol;
    const ctorRegistrySymbol = utils2.ctorRegistrySymbol;
    const interfaceName = "URLSearchParams";
    exports$1.is = (value) => {
      return utils2.isObject(value) && Object.hasOwn(value, implSymbol) && value[implSymbol] instanceof Impl.implementation;
    };
    exports$1.isImpl = (value) => {
      return utils2.isObject(value) && value instanceof Impl.implementation;
    };
    exports$1.convert = (globalObject, value, { context = "The provided value" } = {}) => {
      if (exports$1.is(value)) {
        return utils2.implForWrapper(value);
      }
      throw new globalObject.TypeError(`${context} is not of type 'URLSearchParams'.`);
    };
    exports$1.createDefaultIterator = (globalObject, target, kind) => {
      const ctorRegistry = globalObject[ctorRegistrySymbol];
      const iteratorPrototype = ctorRegistry["URLSearchParams Iterator"];
      const iterator = Object.create(iteratorPrototype);
      Object.defineProperty(iterator, utils2.iterInternalSymbol, {
        value: { target, kind, index: 0 },
        configurable: true
      });
      return iterator;
    };
    function makeWrapper(globalObject, newTarget) {
      let proto;
      if (newTarget !== void 0) {
        proto = newTarget.prototype;
      }
      if (!utils2.isObject(proto)) {
        proto = globalObject[ctorRegistrySymbol]["URLSearchParams"].prototype;
      }
      return Object.create(proto);
    }
    exports$1.create = (globalObject, constructorArgs, privateData) => {
      const wrapper = makeWrapper(globalObject);
      return exports$1.setup(wrapper, globalObject, constructorArgs, privateData);
    };
    exports$1.createImpl = (globalObject, constructorArgs, privateData) => {
      const wrapper = exports$1.create(globalObject, constructorArgs, privateData);
      return utils2.implForWrapper(wrapper);
    };
    exports$1._internalSetup = (wrapper, globalObject) => {
    };
    exports$1.setup = (wrapper, globalObject, constructorArgs = [], privateData = {}) => {
      privateData.wrapper = wrapper;
      exports$1._internalSetup(wrapper, globalObject);
      Object.defineProperty(wrapper, implSymbol, {
        value: new Impl.implementation(globalObject, constructorArgs, privateData),
        configurable: true
      });
      wrapper[implSymbol][utils2.wrapperSymbol] = wrapper;
      if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
      }
      return wrapper;
    };
    exports$1.new = (globalObject, newTarget) => {
      const wrapper = makeWrapper(globalObject, newTarget);
      exports$1._internalSetup(wrapper, globalObject);
      Object.defineProperty(wrapper, implSymbol, {
        value: Object.create(Impl.implementation.prototype),
        configurable: true
      });
      wrapper[implSymbol][utils2.wrapperSymbol] = wrapper;
      if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
      }
      return wrapper[implSymbol];
    };
    const exposed = /* @__PURE__ */ new Set(["Window", "Worker"]);
    exports$1.install = (globalObject, globalNames) => {
      if (!globalNames.some((globalName) => exposed.has(globalName))) {
        return;
      }
      const ctorRegistry = utils2.initCtorRegistry(globalObject);
      class URLSearchParams2 {
        constructor() {
          const args = [];
          {
            let curArg = arguments[0];
            if (curArg !== void 0) {
              if (utils2.isObject(curArg)) {
                if (curArg[Symbol.iterator] !== void 0) {
                  if (!utils2.isObject(curArg)) {
                    throw new globalObject.TypeError(
                      "Failed to construct 'URLSearchParams': parameter 1 sequence is not an iterable object."
                    );
                  } else {
                    const V = [];
                    const tmp = curArg;
                    for (let nextItem of tmp) {
                      if (!utils2.isObject(nextItem)) {
                        throw new globalObject.TypeError(
                          "Failed to construct 'URLSearchParams': parameter 1 sequence's element is not an iterable object."
                        );
                      } else {
                        const V2 = [];
                        const tmp2 = nextItem;
                        for (let nextItem2 of tmp2) {
                          nextItem2 = conversions["USVString"](nextItem2, {
                            context: "Failed to construct 'URLSearchParams': parameter 1 sequence's element's element",
                            globals: globalObject
                          });
                          V2.push(nextItem2);
                        }
                        nextItem = V2;
                      }
                      V.push(nextItem);
                    }
                    curArg = V;
                  }
                } else {
                  if (!utils2.isObject(curArg)) {
                    throw new globalObject.TypeError(
                      "Failed to construct 'URLSearchParams': parameter 1 record is not an object."
                    );
                  } else {
                    const result = /* @__PURE__ */ Object.create(null);
                    for (const key of Reflect.ownKeys(curArg)) {
                      const desc = Object.getOwnPropertyDescriptor(curArg, key);
                      if (desc && desc.enumerable) {
                        let typedKey = key;
                        typedKey = conversions["USVString"](typedKey, {
                          context: "Failed to construct 'URLSearchParams': parameter 1 record's key",
                          globals: globalObject
                        });
                        let typedValue = curArg[key];
                        typedValue = conversions["USVString"](typedValue, {
                          context: "Failed to construct 'URLSearchParams': parameter 1 record's value",
                          globals: globalObject
                        });
                        result[typedKey] = typedValue;
                      }
                    }
                    curArg = result;
                  }
                }
              } else {
                curArg = conversions["USVString"](curArg, {
                  context: "Failed to construct 'URLSearchParams': parameter 1",
                  globals: globalObject
                });
              }
            } else {
              curArg = "";
            }
            args.push(curArg);
          }
          return exports$1.setup(Object.create(new.target.prototype), globalObject, args);
        }
        append(name, value) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError(
              "'append' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          if (arguments.length < 2) {
            throw new globalObject.TypeError(
              `Failed to execute 'append' on 'URLSearchParams': 2 arguments required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'append' on 'URLSearchParams': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'append' on 'URLSearchParams': parameter 2",
              globals: globalObject
            });
            args.push(curArg);
          }
          return utils2.tryWrapperForImpl(esValue[implSymbol].append(...args));
        }
        delete(name) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError(
              "'delete' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to execute 'delete' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'delete' on 'URLSearchParams': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            if (curArg !== void 0) {
              curArg = conversions["USVString"](curArg, {
                context: "Failed to execute 'delete' on 'URLSearchParams': parameter 2",
                globals: globalObject
              });
            }
            args.push(curArg);
          }
          return utils2.tryWrapperForImpl(esValue[implSymbol].delete(...args));
        }
        get(name) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get' called on an object that is not a valid instance of URLSearchParams.");
          }
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to execute 'get' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'get' on 'URLSearchParams': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          return esValue[implSymbol].get(...args);
        }
        getAll(name) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError(
              "'getAll' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to execute 'getAll' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'getAll' on 'URLSearchParams': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          return utils2.tryWrapperForImpl(esValue[implSymbol].getAll(...args));
        }
        has(name) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'has' called on an object that is not a valid instance of URLSearchParams.");
          }
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to execute 'has' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'has' on 'URLSearchParams': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            if (curArg !== void 0) {
              curArg = conversions["USVString"](curArg, {
                context: "Failed to execute 'has' on 'URLSearchParams': parameter 2",
                globals: globalObject
              });
            }
            args.push(curArg);
          }
          return esValue[implSymbol].has(...args);
        }
        set(name, value) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set' called on an object that is not a valid instance of URLSearchParams.");
          }
          if (arguments.length < 2) {
            throw new globalObject.TypeError(
              `Failed to execute 'set' on 'URLSearchParams': 2 arguments required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'set' on 'URLSearchParams': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'set' on 'URLSearchParams': parameter 2",
              globals: globalObject
            });
            args.push(curArg);
          }
          return utils2.tryWrapperForImpl(esValue[implSymbol].set(...args));
        }
        sort() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'sort' called on an object that is not a valid instance of URLSearchParams.");
          }
          return utils2.tryWrapperForImpl(esValue[implSymbol].sort());
        }
        toString() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError(
              "'toString' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          return esValue[implSymbol].toString();
        }
        keys() {
          if (!exports$1.is(this)) {
            throw new globalObject.TypeError("'keys' called on an object that is not a valid instance of URLSearchParams.");
          }
          return exports$1.createDefaultIterator(globalObject, this, "key");
        }
        values() {
          if (!exports$1.is(this)) {
            throw new globalObject.TypeError(
              "'values' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          return exports$1.createDefaultIterator(globalObject, this, "value");
        }
        entries() {
          if (!exports$1.is(this)) {
            throw new globalObject.TypeError(
              "'entries' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          return exports$1.createDefaultIterator(globalObject, this, "key+value");
        }
        forEach(callback) {
          if (!exports$1.is(this)) {
            throw new globalObject.TypeError(
              "'forEach' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              "Failed to execute 'forEach' on 'iterable': 1 argument required, but only 0 present."
            );
          }
          callback = Function2.convert(globalObject, callback, {
            context: "Failed to execute 'forEach' on 'iterable': The callback provided as parameter 1"
          });
          const thisArg = arguments[1];
          let pairs = Array.from(this[implSymbol]);
          let i = 0;
          while (i < pairs.length) {
            const [key, value] = pairs[i].map(utils2.tryWrapperForImpl);
            callback.call(thisArg, value, key, this);
            pairs = Array.from(this[implSymbol]);
            i++;
          }
        }
        get size() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError(
              "'get size' called on an object that is not a valid instance of URLSearchParams."
            );
          }
          return esValue[implSymbol]["size"];
        }
      }
      Object.defineProperties(URLSearchParams2.prototype, {
        append: { enumerable: true },
        delete: { enumerable: true },
        get: { enumerable: true },
        getAll: { enumerable: true },
        has: { enumerable: true },
        set: { enumerable: true },
        sort: { enumerable: true },
        toString: { enumerable: true },
        keys: { enumerable: true },
        values: { enumerable: true },
        entries: { enumerable: true },
        forEach: { enumerable: true },
        size: { enumerable: true },
        [Symbol.toStringTag]: { value: "URLSearchParams", configurable: true },
        [Symbol.iterator]: { value: URLSearchParams2.prototype.entries, configurable: true, writable: true }
      });
      ctorRegistry[interfaceName] = URLSearchParams2;
      ctorRegistry["URLSearchParams Iterator"] = Object.create(ctorRegistry["%IteratorPrototype%"], {
        [Symbol.toStringTag]: {
          configurable: true,
          value: "URLSearchParams Iterator"
        }
      });
      utils2.define(ctorRegistry["URLSearchParams Iterator"], {
        next() {
          const internal = this && this[utils2.iterInternalSymbol];
          if (!internal) {
            throw new globalObject.TypeError("next() called on a value that is not a URLSearchParams iterator object");
          }
          const { target, kind, index } = internal;
          const values = Array.from(target[implSymbol]);
          const len = values.length;
          if (index >= len) {
            return newObjectInRealm(globalObject, { value: void 0, done: true });
          }
          const pair = values[index];
          internal.index = index + 1;
          return newObjectInRealm(globalObject, utils2.iteratorResult(pair.map(utils2.tryWrapperForImpl), kind));
        }
      });
      Object.defineProperty(globalObject, interfaceName, {
        configurable: true,
        writable: true,
        value: URLSearchParams2
      });
    };
    const Impl = requireURLSearchParamsImpl();
  })(URLSearchParams);
  return URLSearchParams;
}
var hasRequiredURLImpl;
function requireURLImpl() {
  if (hasRequiredURLImpl) return URLImpl;
  hasRequiredURLImpl = 1;
  const usm = requireUrlStateMachine();
  const urlencoded2 = requireUrlencoded();
  const URLSearchParams2 = requireURLSearchParams();
  const URL2 = requireURL();
  URLImpl.implementation = class URLImpl {
    // Unlike the spec, we duplicate some code between the constructor and canParse, because we want to give useful error
    // messages in the constructor that distinguish between the different causes of failure.
    constructor(globalObject, [url, base]) {
      let parsedBase = null;
      if (base !== void 0) {
        parsedBase = usm.basicURLParse(base);
        if (parsedBase === null) {
          throw new TypeError(`Invalid base URL: ${base}`);
        }
      }
      const parsedURL = usm.basicURLParse(url, { baseURL: parsedBase });
      if (parsedURL === null) {
        throw new TypeError(`Invalid URL: ${url}`);
      }
      const query = parsedURL.query !== null ? parsedURL.query : "";
      this._url = parsedURL;
      this._query = URLSearchParams2.createImpl(globalObject, [query], { doNotStripQMark: true });
      this._query._url = this;
    }
    static parse(globalObject, input, base) {
      try {
        return URL2.createImpl(globalObject, [input, base]);
      } catch {
        return null;
      }
    }
    static canParse(url, base) {
      let parsedBase = null;
      if (base !== void 0) {
        parsedBase = usm.basicURLParse(base);
        if (parsedBase === null) {
          return false;
        }
      }
      const parsedURL = usm.basicURLParse(url, { baseURL: parsedBase });
      if (parsedURL === null) {
        return false;
      }
      return true;
    }
    get href() {
      return usm.serializeURL(this._url);
    }
    set href(v) {
      const parsedURL = usm.basicURLParse(v);
      if (parsedURL === null) {
        throw new TypeError(`Invalid URL: ${v}`);
      }
      this._url = parsedURL;
      this._query._list.splice(0);
      const { query } = parsedURL;
      if (query !== null) {
        this._query._list = urlencoded2.parseUrlencodedString(query);
      }
    }
    get origin() {
      return usm.serializeURLOrigin(this._url);
    }
    get protocol() {
      return `${this._url.scheme}:`;
    }
    set protocol(v) {
      usm.basicURLParse(`${v}:`, { url: this._url, stateOverride: "scheme start" });
    }
    get username() {
      return this._url.username;
    }
    set username(v) {
      if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
        return;
      }
      usm.setTheUsername(this._url, v);
    }
    get password() {
      return this._url.password;
    }
    set password(v) {
      if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
        return;
      }
      usm.setThePassword(this._url, v);
    }
    get host() {
      const url = this._url;
      if (url.host === null) {
        return "";
      }
      if (url.port === null) {
        return usm.serializeHost(url.host);
      }
      return `${usm.serializeHost(url.host)}:${usm.serializeInteger(url.port)}`;
    }
    set host(v) {
      if (usm.hasAnOpaquePath(this._url)) {
        return;
      }
      usm.basicURLParse(v, { url: this._url, stateOverride: "host" });
    }
    get hostname() {
      if (this._url.host === null) {
        return "";
      }
      return usm.serializeHost(this._url.host);
    }
    set hostname(v) {
      if (usm.hasAnOpaquePath(this._url)) {
        return;
      }
      usm.basicURLParse(v, { url: this._url, stateOverride: "hostname" });
    }
    get port() {
      if (this._url.port === null) {
        return "";
      }
      return usm.serializeInteger(this._url.port);
    }
    set port(v) {
      if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
        return;
      }
      if (v === "") {
        this._url.port = null;
      } else {
        usm.basicURLParse(v, { url: this._url, stateOverride: "port" });
      }
    }
    get pathname() {
      return usm.serializePath(this._url);
    }
    set pathname(v) {
      if (usm.hasAnOpaquePath(this._url)) {
        return;
      }
      this._url.path = [];
      usm.basicURLParse(v, { url: this._url, stateOverride: "path start" });
    }
    get search() {
      if (this._url.query === null || this._url.query === "") {
        return "";
      }
      return `?${this._url.query}`;
    }
    set search(v) {
      const url = this._url;
      if (v === "") {
        url.query = null;
        this._query._list = [];
        return;
      }
      const input = v[0] === "?" ? v.substring(1) : v;
      url.query = "";
      usm.basicURLParse(input, { url, stateOverride: "query" });
      this._query._list = urlencoded2.parseUrlencodedString(input);
    }
    get searchParams() {
      return this._query;
    }
    get hash() {
      if (this._url.fragment === null || this._url.fragment === "") {
        return "";
      }
      return `#${this._url.fragment}`;
    }
    set hash(v) {
      if (v === "") {
        this._url.fragment = null;
        return;
      }
      const input = v[0] === "#" ? v.substring(1) : v;
      this._url.fragment = "";
      usm.basicURLParse(input, { url: this._url, stateOverride: "fragment" });
    }
    toJSON() {
      return this.href;
    }
  };
  return URLImpl;
}
var hasRequiredURL;
function requireURL() {
  if (hasRequiredURL) return URL;
  hasRequiredURL = 1;
  (function(exports$1) {
    const conversions = requireLib();
    const utils2 = requireUtils();
    const implSymbol = utils2.implSymbol;
    const ctorRegistrySymbol = utils2.ctorRegistrySymbol;
    const interfaceName = "URL";
    exports$1.is = (value) => {
      return utils2.isObject(value) && Object.hasOwn(value, implSymbol) && value[implSymbol] instanceof Impl.implementation;
    };
    exports$1.isImpl = (value) => {
      return utils2.isObject(value) && value instanceof Impl.implementation;
    };
    exports$1.convert = (globalObject, value, { context = "The provided value" } = {}) => {
      if (exports$1.is(value)) {
        return utils2.implForWrapper(value);
      }
      throw new globalObject.TypeError(`${context} is not of type 'URL'.`);
    };
    function makeWrapper(globalObject, newTarget) {
      let proto;
      if (newTarget !== void 0) {
        proto = newTarget.prototype;
      }
      if (!utils2.isObject(proto)) {
        proto = globalObject[ctorRegistrySymbol]["URL"].prototype;
      }
      return Object.create(proto);
    }
    exports$1.create = (globalObject, constructorArgs, privateData) => {
      const wrapper = makeWrapper(globalObject);
      return exports$1.setup(wrapper, globalObject, constructorArgs, privateData);
    };
    exports$1.createImpl = (globalObject, constructorArgs, privateData) => {
      const wrapper = exports$1.create(globalObject, constructorArgs, privateData);
      return utils2.implForWrapper(wrapper);
    };
    exports$1._internalSetup = (wrapper, globalObject) => {
    };
    exports$1.setup = (wrapper, globalObject, constructorArgs = [], privateData = {}) => {
      privateData.wrapper = wrapper;
      exports$1._internalSetup(wrapper, globalObject);
      Object.defineProperty(wrapper, implSymbol, {
        value: new Impl.implementation(globalObject, constructorArgs, privateData),
        configurable: true
      });
      wrapper[implSymbol][utils2.wrapperSymbol] = wrapper;
      if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
      }
      return wrapper;
    };
    exports$1.new = (globalObject, newTarget) => {
      const wrapper = makeWrapper(globalObject, newTarget);
      exports$1._internalSetup(wrapper, globalObject);
      Object.defineProperty(wrapper, implSymbol, {
        value: Object.create(Impl.implementation.prototype),
        configurable: true
      });
      wrapper[implSymbol][utils2.wrapperSymbol] = wrapper;
      if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
      }
      return wrapper[implSymbol];
    };
    const exposed = /* @__PURE__ */ new Set(["Window", "Worker"]);
    exports$1.install = (globalObject, globalNames) => {
      if (!globalNames.some((globalName) => exposed.has(globalName))) {
        return;
      }
      const ctorRegistry = utils2.initCtorRegistry(globalObject);
      class URL2 {
        constructor(url) {
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to construct 'URL': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to construct 'URL': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            if (curArg !== void 0) {
              curArg = conversions["USVString"](curArg, {
                context: "Failed to construct 'URL': parameter 2",
                globals: globalObject
              });
            }
            args.push(curArg);
          }
          return exports$1.setup(Object.create(new.target.prototype), globalObject, args);
        }
        toJSON() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'toJSON' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol].toJSON();
        }
        get href() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get href' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["href"];
        }
        set href(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set href' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'href' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["href"] = V;
        }
        toString() {
          const esValue = this;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'toString' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["href"];
        }
        get origin() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get origin' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["origin"];
        }
        get protocol() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get protocol' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["protocol"];
        }
        set protocol(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set protocol' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'protocol' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["protocol"] = V;
        }
        get username() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get username' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["username"];
        }
        set username(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set username' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'username' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["username"] = V;
        }
        get password() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get password' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["password"];
        }
        set password(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set password' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'password' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["password"] = V;
        }
        get host() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get host' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["host"];
        }
        set host(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set host' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'host' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["host"] = V;
        }
        get hostname() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get hostname' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["hostname"];
        }
        set hostname(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set hostname' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'hostname' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["hostname"] = V;
        }
        get port() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get port' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["port"];
        }
        set port(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set port' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'port' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["port"] = V;
        }
        get pathname() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get pathname' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["pathname"];
        }
        set pathname(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set pathname' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'pathname' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["pathname"] = V;
        }
        get search() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get search' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["search"];
        }
        set search(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set search' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'search' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["search"] = V;
        }
        get searchParams() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get searchParams' called on an object that is not a valid instance of URL.");
          }
          return utils2.getSameObject(this, "searchParams", () => {
            return utils2.tryWrapperForImpl(esValue[implSymbol]["searchParams"]);
          });
        }
        get hash() {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'get hash' called on an object that is not a valid instance of URL.");
          }
          return esValue[implSymbol]["hash"];
        }
        set hash(V) {
          const esValue = this !== null && this !== void 0 ? this : globalObject;
          if (!exports$1.is(esValue)) {
            throw new globalObject.TypeError("'set hash' called on an object that is not a valid instance of URL.");
          }
          V = conversions["USVString"](V, {
            context: "Failed to set the 'hash' property on 'URL': The provided value",
            globals: globalObject
          });
          esValue[implSymbol]["hash"] = V;
        }
        static parse(url) {
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to execute 'parse' on 'URL': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'parse' on 'URL': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            if (curArg !== void 0) {
              curArg = conversions["USVString"](curArg, {
                context: "Failed to execute 'parse' on 'URL': parameter 2",
                globals: globalObject
              });
            }
            args.push(curArg);
          }
          return utils2.tryWrapperForImpl(Impl.implementation.parse(globalObject, ...args));
        }
        static canParse(url) {
          if (arguments.length < 1) {
            throw new globalObject.TypeError(
              `Failed to execute 'canParse' on 'URL': 1 argument required, but only ${arguments.length} present.`
            );
          }
          const args = [];
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'canParse' on 'URL': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            if (curArg !== void 0) {
              curArg = conversions["USVString"](curArg, {
                context: "Failed to execute 'canParse' on 'URL': parameter 2",
                globals: globalObject
              });
            }
            args.push(curArg);
          }
          return Impl.implementation.canParse(...args);
        }
      }
      Object.defineProperties(URL2.prototype, {
        toJSON: { enumerable: true },
        href: { enumerable: true },
        toString: { enumerable: true },
        origin: { enumerable: true },
        protocol: { enumerable: true },
        username: { enumerable: true },
        password: { enumerable: true },
        host: { enumerable: true },
        hostname: { enumerable: true },
        port: { enumerable: true },
        pathname: { enumerable: true },
        search: { enumerable: true },
        searchParams: { enumerable: true },
        hash: { enumerable: true },
        [Symbol.toStringTag]: { value: "URL", configurable: true }
      });
      Object.defineProperties(URL2, { parse: { enumerable: true }, canParse: { enumerable: true } });
      ctorRegistry[interfaceName] = URL2;
      Object.defineProperty(globalObject, interfaceName, {
        configurable: true,
        writable: true,
        value: URL2
      });
      if (globalNames.includes("Window")) {
        Object.defineProperty(globalObject, "webkitURL", {
          configurable: true,
          writable: true,
          value: URL2
        });
      }
    };
    const Impl = requireURLImpl();
  })(URL);
  return URL;
}
var hasRequiredWebidl2jsWrapper;
function requireWebidl2jsWrapper() {
  if (hasRequiredWebidl2jsWrapper) return webidl2jsWrapper;
  hasRequiredWebidl2jsWrapper = 1;
  const URL2 = requireURL();
  const URLSearchParams2 = requireURLSearchParams();
  webidl2jsWrapper.URL = URL2;
  webidl2jsWrapper.URLSearchParams = URLSearchParams2;
  return webidl2jsWrapper;
}
var hasRequiredWhatwgUrl;
function requireWhatwgUrl() {
  if (hasRequiredWhatwgUrl) return whatwgUrl;
  hasRequiredWhatwgUrl = 1;
  const { URL: URL2, URLSearchParams: URLSearchParams2 } = requireWebidl2jsWrapper();
  const urlStateMachine2 = requireUrlStateMachine();
  const percentEncoding2 = requirePercentEncoding();
  const sharedGlobalObject = { Array, Object, Promise, String, TypeError };
  URL2.install(sharedGlobalObject, ["Window"]);
  URLSearchParams2.install(sharedGlobalObject, ["Window"]);
  whatwgUrl.URL = sharedGlobalObject.URL;
  whatwgUrl.URLSearchParams = sharedGlobalObject.URLSearchParams;
  whatwgUrl.parseURL = urlStateMachine2.parseURL;
  whatwgUrl.basicURLParse = urlStateMachine2.basicURLParse;
  whatwgUrl.serializeURL = urlStateMachine2.serializeURL;
  whatwgUrl.serializePath = urlStateMachine2.serializePath;
  whatwgUrl.serializeHost = urlStateMachine2.serializeHost;
  whatwgUrl.serializeInteger = urlStateMachine2.serializeInteger;
  whatwgUrl.serializeURLOrigin = urlStateMachine2.serializeURLOrigin;
  whatwgUrl.setTheUsername = urlStateMachine2.setTheUsername;
  whatwgUrl.setThePassword = urlStateMachine2.setThePassword;
  whatwgUrl.cannotHaveAUsernamePasswordPort = urlStateMachine2.cannotHaveAUsernamePasswordPort;
  whatwgUrl.hasAnOpaquePath = urlStateMachine2.hasAnOpaquePath;
  whatwgUrl.percentDecodeString = percentEncoding2.percentDecodeString;
  whatwgUrl.percentDecodeBytes = percentEncoding2.percentDecodeBytes;
  return whatwgUrl;
}
export {
  requireWebidl2jsWrapper as a,
  requireWhatwgUrl as r
};

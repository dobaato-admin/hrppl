var lib = {};
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  utils.removeLeadingAndTrailingHTTPWhitespace = (string) => {
    return string.replace(/^[ \t\n\r]+/u, "").replace(/[ \t\n\r]+$/u, "");
  };
  utils.removeTrailingHTTPWhitespace = (string) => {
    return string.replace(/[ \t\n\r]+$/u, "");
  };
  utils.isHTTPWhitespaceChar = (char) => {
    return char === " " || char === "	" || char === "\n" || char === "\r";
  };
  utils.solelyContainsHTTPTokenCodePoints = (string) => {
    return /^[-!#$%&'*+.^_`|~A-Za-z0-9]*$/u.test(string);
  };
  utils.soleyContainsHTTPQuotedStringTokenCodePoints = (string) => {
    return /^[\t\u0020-\u007E\u0080-\u00FF]*$/u.test(string);
  };
  utils.asciiLowercase = (string) => {
    return string.replace(/[A-Z]/ug, (l) => l.toLowerCase());
  };
  utils.collectAnHTTPQuotedString = (input, position) => {
    let value = "";
    position++;
    while (true) {
      while (position < input.length && input[position] !== '"' && input[position] !== "\\") {
        value += input[position];
        ++position;
      }
      if (position >= input.length) {
        break;
      }
      const quoteOrBackslash = input[position];
      ++position;
      if (quoteOrBackslash === "\\") {
        if (position >= input.length) {
          value += "\\";
          break;
        }
        value += input[position];
        ++position;
      } else {
        break;
      }
    }
    return [value, position];
  };
  return utils;
}
var mimeTypeParameters;
var hasRequiredMimeTypeParameters;
function requireMimeTypeParameters() {
  if (hasRequiredMimeTypeParameters) return mimeTypeParameters;
  hasRequiredMimeTypeParameters = 1;
  const {
    asciiLowercase,
    solelyContainsHTTPTokenCodePoints,
    soleyContainsHTTPQuotedStringTokenCodePoints
  } = requireUtils();
  mimeTypeParameters = class MIMETypeParameters {
    constructor(map) {
      this._map = map;
    }
    get size() {
      return this._map.size;
    }
    get(name) {
      name = asciiLowercase(String(name));
      return this._map.get(name);
    }
    has(name) {
      name = asciiLowercase(String(name));
      return this._map.has(name);
    }
    set(name, value) {
      name = asciiLowercase(String(name));
      value = String(value);
      if (!solelyContainsHTTPTokenCodePoints(name)) {
        throw new Error(`Invalid MIME type parameter name "${name}": only HTTP token code points are valid.`);
      }
      if (!soleyContainsHTTPQuotedStringTokenCodePoints(value)) {
        throw new Error(`Invalid MIME type parameter value "${value}": only HTTP quoted-string token code points are valid.`);
      }
      return this._map.set(name, value);
    }
    clear() {
      this._map.clear();
    }
    delete(name) {
      name = asciiLowercase(String(name));
      return this._map.delete(name);
    }
    forEach(callbackFn, thisArg) {
      this._map.forEach(callbackFn, thisArg);
    }
    keys() {
      return this._map.keys();
    }
    values() {
      return this._map.values();
    }
    entries() {
      return this._map.entries();
    }
    [Symbol.iterator]() {
      return this._map[Symbol.iterator]();
    }
  };
  return mimeTypeParameters;
}
var parser;
var hasRequiredParser;
function requireParser() {
  if (hasRequiredParser) return parser;
  hasRequiredParser = 1;
  const {
    removeLeadingAndTrailingHTTPWhitespace,
    removeTrailingHTTPWhitespace,
    isHTTPWhitespaceChar,
    solelyContainsHTTPTokenCodePoints,
    soleyContainsHTTPQuotedStringTokenCodePoints,
    asciiLowercase,
    collectAnHTTPQuotedString
  } = requireUtils();
  parser = (input) => {
    input = removeLeadingAndTrailingHTTPWhitespace(input);
    let position = 0;
    let type = "";
    while (position < input.length && input[position] !== "/") {
      type += input[position];
      ++position;
    }
    if (type.length === 0 || !solelyContainsHTTPTokenCodePoints(type)) {
      return null;
    }
    if (position >= input.length) {
      return null;
    }
    ++position;
    let subtype = "";
    while (position < input.length && input[position] !== ";") {
      subtype += input[position];
      ++position;
    }
    subtype = removeTrailingHTTPWhitespace(subtype);
    if (subtype.length === 0 || !solelyContainsHTTPTokenCodePoints(subtype)) {
      return null;
    }
    const mimeType2 = {
      type: asciiLowercase(type),
      subtype: asciiLowercase(subtype),
      parameters: /* @__PURE__ */ new Map()
    };
    while (position < input.length) {
      ++position;
      while (isHTTPWhitespaceChar(input[position])) {
        ++position;
      }
      let parameterName = "";
      while (position < input.length && input[position] !== ";" && input[position] !== "=") {
        parameterName += input[position];
        ++position;
      }
      parameterName = asciiLowercase(parameterName);
      if (position < input.length) {
        if (input[position] === ";") {
          continue;
        }
        ++position;
      }
      let parameterValue = null;
      if (input[position] === '"') {
        [parameterValue, position] = collectAnHTTPQuotedString(input, position);
        while (position < input.length && input[position] !== ";") {
          ++position;
        }
      } else {
        parameterValue = "";
        while (position < input.length && input[position] !== ";") {
          parameterValue += input[position];
          ++position;
        }
        parameterValue = removeTrailingHTTPWhitespace(parameterValue);
        if (parameterValue === "") {
          continue;
        }
      }
      if (parameterName.length > 0 && solelyContainsHTTPTokenCodePoints(parameterName) && soleyContainsHTTPQuotedStringTokenCodePoints(parameterValue) && !mimeType2.parameters.has(parameterName)) {
        mimeType2.parameters.set(parameterName, parameterValue);
      }
    }
    return mimeType2;
  };
  return parser;
}
var serializer;
var hasRequiredSerializer;
function requireSerializer() {
  if (hasRequiredSerializer) return serializer;
  hasRequiredSerializer = 1;
  const { solelyContainsHTTPTokenCodePoints } = requireUtils();
  serializer = (mimeType2) => {
    let serialization = `${mimeType2.type}/${mimeType2.subtype}`;
    if (mimeType2.parameters.size === 0) {
      return serialization;
    }
    for (let [name, value] of mimeType2.parameters) {
      serialization += ";";
      serialization += name;
      serialization += "=";
      if (!solelyContainsHTTPTokenCodePoints(value) || value.length === 0) {
        value = value.replace(/(["\\])/ug, "\\$1");
        value = `"${value}"`;
      }
      serialization += value;
    }
    return serialization;
  };
  return serializer;
}
var mimeType;
var hasRequiredMimeType;
function requireMimeType() {
  if (hasRequiredMimeType) return mimeType;
  hasRequiredMimeType = 1;
  const MIMETypeParameters = requireMimeTypeParameters();
  const parse = requireParser();
  const serialize = requireSerializer();
  const {
    asciiLowercase,
    solelyContainsHTTPTokenCodePoints
  } = requireUtils();
  mimeType = class MIMEType {
    constructor(string) {
      string = String(string);
      const result = parse(string);
      if (result === null) {
        throw new Error(`Could not parse MIME type string "${string}"`);
      }
      this._type = result.type;
      this._subtype = result.subtype;
      this._parameters = new MIMETypeParameters(result.parameters);
    }
    static parse(string) {
      try {
        return new this(string);
      } catch {
        return null;
      }
    }
    get essence() {
      return `${this.type}/${this.subtype}`;
    }
    get type() {
      return this._type;
    }
    set type(value) {
      value = asciiLowercase(String(value));
      if (value.length === 0) {
        throw new Error("Invalid type: must be a non-empty string");
      }
      if (!solelyContainsHTTPTokenCodePoints(value)) {
        throw new Error(`Invalid type ${value}: must contain only HTTP token code points`);
      }
      this._type = value;
    }
    get subtype() {
      return this._subtype;
    }
    set subtype(value) {
      value = asciiLowercase(String(value));
      if (value.length === 0) {
        throw new Error("Invalid subtype: must be a non-empty string");
      }
      if (!solelyContainsHTTPTokenCodePoints(value)) {
        throw new Error(`Invalid subtype ${value}: must contain only HTTP token code points`);
      }
      this._subtype = value;
    }
    get parameters() {
      return this._parameters;
    }
    toString() {
      return serialize(this);
    }
    isJavaScript({ prohibitParameters = false } = {}) {
      switch (this._type) {
        case "text": {
          switch (this._subtype) {
            case "ecmascript":
            case "javascript":
            case "javascript1.0":
            case "javascript1.1":
            case "javascript1.2":
            case "javascript1.3":
            case "javascript1.4":
            case "javascript1.5":
            case "jscript":
            case "livescript":
            case "x-ecmascript":
            case "x-javascript": {
              return !prohibitParameters || this._parameters.size === 0;
            }
            default: {
              return false;
            }
          }
        }
        case "application": {
          switch (this._subtype) {
            case "ecmascript":
            case "javascript":
            case "x-ecmascript":
            case "x-javascript": {
              return !prohibitParameters || this._parameters.size === 0;
            }
            default: {
              return false;
            }
          }
        }
        default: {
          return false;
        }
      }
    }
    isXML() {
      return this._subtype === "xml" && (this._type === "text" || this._type === "application") || this._subtype.endsWith("+xml");
    }
    isHTML() {
      return this._subtype === "html" && this._type === "text";
    }
  };
  return mimeType;
}
var sniff;
var hasRequiredSniff;
function requireSniff() {
  if (hasRequiredSniff) return sniff;
  hasRequiredSniff = 1;
  const MIMEType = requireMimeType();
  function normalizeMIMEType(input) {
    return MIMEType.parse(`${input}`);
  }
  function isXMLMIMEType(mimeType2) {
    return mimeType2.subtype.endsWith("+xml") || mimeType2.type === "text" && mimeType2.subtype === "xml" || mimeType2.type === "application" && mimeType2.subtype === "xml";
  }
  function isHTMLMIMEType(mimeType2) {
    return mimeType2.type === "text" && mimeType2.subtype === "html";
  }
  const RESOURCE_HEADER_LENGTH = 1445;
  function getResourceHeader(resource) {
    if (resource.length <= RESOURCE_HEADER_LENGTH) {
      return resource;
    }
    return resource.subarray(0, RESOURCE_HEADER_LENGTH);
  }
  function isImageMIMEType(mimeType2) {
    return mimeType2.type === "image";
  }
  function isAudioOrVideoMIMEType(mimeType2) {
    return mimeType2.type === "audio" || mimeType2.type === "video" || mimeType2.type === "application" && mimeType2.subtype === "ogg";
  }
  function isWhitespaceByte(byte) {
    return byte === 9 || byte === 10 || byte === 12 || byte === 13 || byte === 32;
  }
  function isBinaryDataByte(byte) {
    return byte >= 0 && byte <= 8 || byte === 11 || byte >= 14 && byte <= 26 || byte >= 28 && byte <= 31;
  }
  function matchesSignature(resource, signature) {
    const { pattern, mask, ignoredLeadingBytes, mimeType: mimeType2 } = signature;
    let s = 0;
    if (ignoredLeadingBytes) {
      while (s < resource.length && ignoredLeadingBytes(resource[s])) {
        s++;
      }
    }
    if (resource.length < s + pattern.length) {
      return null;
    }
    for (let i = 0; i < pattern.length; i++) {
      if ((resource[s + i] & mask[i]) !== (pattern[i] & mask[i])) {
        return null;
      }
    }
    return mimeType2;
  }
  const step1Table = [
    // <!DOCTYPE HTML TT
    {
      pattern: [60, 33, 68, 79, 67, 84, 89, 80, 69, 32, 72, 84, 77, 76, 32],
      mask: [255, 255, 223, 223, 223, 223, 223, 223, 223, 255, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <HTML TT
    {
      pattern: [60, 72, 84, 77, 76, 32],
      mask: [255, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <HEAD TT
    {
      pattern: [60, 72, 69, 65, 68, 32],
      mask: [255, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <SCRIPT TT
    {
      pattern: [60, 83, 67, 82, 73, 80, 84, 32],
      mask: [255, 223, 223, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <IFRAME TT
    {
      pattern: [60, 73, 70, 82, 65, 77, 69, 32],
      mask: [255, 223, 223, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <H1 TT
    {
      pattern: [60, 72, 49, 32],
      mask: [255, 223, 255, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <DIV TT
    {
      pattern: [60, 68, 73, 86, 32],
      mask: [255, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <FONT TT
    {
      pattern: [60, 70, 79, 78, 84, 32],
      mask: [255, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <TABLE TT
    {
      pattern: [60, 84, 65, 66, 76, 69, 32],
      mask: [255, 223, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <A TT
    {
      pattern: [60, 65, 32],
      mask: [255, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <STYLE TT
    {
      pattern: [60, 83, 84, 89, 76, 69, 32],
      mask: [255, 223, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <TITLE TT
    {
      pattern: [60, 84, 73, 84, 76, 69, 32],
      mask: [255, 223, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <B TT
    {
      pattern: [60, 66, 32],
      mask: [255, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <BODY TT
    {
      pattern: [60, 66, 79, 68, 89, 32],
      mask: [255, 223, 223, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <BR TT
    {
      pattern: [60, 66, 82, 32],
      mask: [255, 223, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <P TT
    {
      pattern: [60, 80, 32],
      mask: [255, 223, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <!-- TT
    {
      pattern: [60, 33, 45, 45, 32],
      mask: [255, 255, 255, 255, 225],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/html"
    },
    // <?xml
    {
      pattern: [60, 63, 120, 109, 108],
      mask: [255, 255, 255, 255, 255],
      ignoredLeadingBytes: isWhitespaceByte,
      mimeType: "text/xml"
    },
    // %PDF-
    {
      pattern: [37, 80, 68, 70, 45],
      mask: [255, 255, 255, 255, 255],
      mimeType: "application/pdf"
    }
  ];
  const step2Table = [
    // %!PS-Adobe-
    {
      pattern: [37, 33, 80, 83, 45, 65, 100, 111, 98, 101, 45],
      mask: [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
      mimeType: "application/postscript"
    },
    // UTF-16BE BOM
    {
      pattern: [254, 255, 0, 0],
      mask: [255, 255, 0, 0],
      mimeType: "text/plain"
    },
    // UTF-16LE BOM
    {
      pattern: [255, 254, 0, 0],
      mask: [255, 255, 0, 0],
      mimeType: "text/plain"
    },
    // UTF-8 BOM
    {
      pattern: [239, 187, 191, 0],
      mask: [255, 255, 255, 0],
      mimeType: "text/plain"
    }
  ];
  const imageSignatures = [
    { pattern: [0, 0, 1, 0], mask: [255, 255, 255, 255], mimeType: "image/x-icon" },
    { pattern: [0, 0, 2, 0], mask: [255, 255, 255, 255], mimeType: "image/x-icon" },
    { pattern: [66, 77], mask: [255, 255], mimeType: "image/bmp" },
    {
      pattern: [71, 73, 70, 56, 55, 97],
      mask: [255, 255, 255, 255, 255, 255],
      mimeType: "image/gif"
    },
    {
      pattern: [71, 73, 70, 56, 57, 97],
      mask: [255, 255, 255, 255, 255, 255],
      mimeType: "image/gif"
    },
    {
      pattern: [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80, 86, 80],
      mask: [255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255],
      mimeType: "image/webp"
    },
    {
      pattern: [137, 80, 78, 71, 13, 10, 26, 10],
      mask: [255, 255, 255, 255, 255, 255, 255, 255],
      mimeType: "image/png"
    },
    { pattern: [255, 216, 255], mask: [255, 255, 255], mimeType: "image/jpeg" }
  ];
  const audioVideoSignatures = [
    {
      pattern: [70, 79, 82, 77, 0, 0, 0, 0, 65, 73, 70, 70],
      mask: [255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255],
      mimeType: "audio/aiff"
    },
    { pattern: [73, 68, 51], mask: [255, 255, 255], mimeType: "audio/mpeg" },
    {
      pattern: [79, 103, 103, 83, 0],
      mask: [255, 255, 255, 255, 255],
      mimeType: "application/ogg"
    },
    {
      pattern: [77, 84, 104, 100, 0, 0, 0, 6],
      mask: [255, 255, 255, 255, 255, 255, 255, 255],
      mimeType: "audio/midi"
    },
    {
      pattern: [82, 73, 70, 70, 0, 0, 0, 0, 65, 86, 73, 32],
      mask: [255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255],
      mimeType: "video/avi"
    },
    {
      pattern: [82, 73, 70, 70, 0, 0, 0, 0, 87, 65, 86, 69],
      mask: [255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255],
      mimeType: "audio/wave"
    }
  ];
  function matchMP4(resource) {
    if (resource.length < 12) {
      return null;
    }
    if (resource[4] !== 102 || resource[5] !== 116 || resource[6] !== 121 || resource[7] !== 112) {
      return null;
    }
    const length = resource[0] << 24 | resource[1] << 16 | resource[2] << 8 | resource[3];
    if (length < 12 || length > resource.length) {
      return null;
    }
    const brand = String.fromCharCode(resource[8], resource[9], resource[10], resource[11]);
    const mp4Brands = ["mp41", "mp42", "isom", "iso2", "mmp4", "M4V ", "M4A ", "M4P ", "avc1"];
    if (mp4Brands.includes(brand)) {
      return "video/mp4";
    }
    for (let i = 16; i + 4 <= length && i + 4 <= resource.length; i += 4) {
      const compat = String.fromCharCode(resource[i], resource[i + 1], resource[i + 2], resource[i + 3]);
      if (mp4Brands.includes(compat)) {
        return "video/mp4";
      }
    }
    return null;
  }
  function parseVint(sequence, iter) {
    let mask = 128;
    const maxVintLength = 8;
    let numberSize = 1;
    while (numberSize < maxVintLength && numberSize < sequence.length) {
      if ((sequence[iter] & mask) !== 0) {
        break;
      }
      mask >>= 1;
      ++numberSize;
    }
    return numberSize;
  }
  function matchPaddedSequence(sequence, offset, pattern) {
    while (offset < sequence.length && sequence[offset] === 0) {
      offset++;
    }
    if (sequence.length < offset + pattern.length) {
      return false;
    }
    for (let i = 0; i < pattern.length; i++) {
      if (sequence[offset + i] !== pattern[i]) {
        return false;
      }
    }
    return true;
  }
  function matchWebM(resource) {
    const { length } = resource;
    if (length < 4) {
      return null;
    }
    if (resource[0] !== 26 || resource[1] !== 69 || resource[2] !== 223 || resource[3] !== 163) {
      return null;
    }
    let iter = 4;
    while (iter < length && iter < 38) {
      if (iter + 1 < length && resource[iter] === 66 && resource[iter + 1] === 130) {
        iter += 2;
        if (iter >= length) {
          break;
        }
        const numberSize = parseVint(resource, iter);
        iter += numberSize;
        if (iter >= length - 4) {
          break;
        }
        if (matchPaddedSequence(resource, iter, [119, 101, 98, 109])) {
          return "video/webm";
        }
      }
      iter++;
    }
    return null;
  }
  const mp3Rates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const mp25Rates = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const sampleRates = [44100, 48e3, 32e3, 0];
  function matchMP3Header(sequence, s) {
    const { length } = sequence;
    if (length < s + 4) {
      return false;
    }
    if (sequence[s] !== 255 || (sequence[s + 1] & 224) !== 224) {
      return false;
    }
    const layer = (sequence[s + 1] & 6) >> 1;
    if (layer === 0) {
      return false;
    }
    const bitRate = (sequence[s + 2] & 240) >> 4;
    if (bitRate === 15) {
      return false;
    }
    const sampleRate = (sequence[s + 2] & 12) >> 2;
    if (sampleRate === 3) {
      return false;
    }
    const finalLayer = 4 - layer & 3;
    if (finalLayer !== 3) {
      return false;
    }
    return true;
  }
  function parseMP3Frame(sequence, s) {
    const version = (sequence[s + 1] & 24) >> 3;
    const bitrateIndex = (sequence[s + 2] & 240) >> 4;
    const bitrate = (version & 1) !== 0 ? mp3Rates[bitrateIndex] : mp25Rates[bitrateIndex];
    const samplerateIndex = (sequence[s + 2] & 12) >> 2;
    const samplerate = sampleRates[samplerateIndex];
    const pad = (sequence[s + 2] & 2) >> 1;
    return { version, bitrate, samplerate, pad };
  }
  function computeMP3FrameSize(version, bitrate, samplerate, pad) {
    const scale = version === 1 ? 72 : 144;
    let size = Math.floor(bitrate * 1e3 * scale / samplerate);
    if (pad !== 0) {
      size += 1;
    }
    return size;
  }
  function matchMP3WithoutID3(resource) {
    const { length } = resource;
    let s = 0;
    if (!matchMP3Header(resource, s)) {
      return null;
    }
    const { version, bitrate, samplerate, pad } = parseMP3Frame(resource, s);
    const skippedBytes = computeMP3FrameSize(version, bitrate, samplerate, pad);
    if (skippedBytes < 4 || skippedBytes > length - s) {
      return null;
    }
    s += skippedBytes;
    if (!matchMP3Header(resource, s)) {
      return null;
    }
    return "audio/mpeg";
  }
  const archiveSignatures = [
    { pattern: [31, 139, 8], mask: [255, 255, 255], mimeType: "application/x-gzip" },
    { pattern: [80, 75, 3, 4], mask: [255, 255, 255, 255], mimeType: "application/zip" },
    {
      pattern: [82, 97, 114, 33, 26, 7, 0],
      mask: [255, 255, 255, 255, 255, 255, 255],
      mimeType: "application/x-rar-compressed"
    }
  ];
  function matchImageType(resource) {
    for (const sig of imageSignatures) {
      const result = matchesSignature(resource, sig);
      if (result) {
        return result;
      }
    }
    return null;
  }
  function matchAudioOrVideoType(resource) {
    for (const sig of audioVideoSignatures) {
      const result = matchesSignature(resource, sig);
      if (result) {
        return result;
      }
    }
    const mp4Result = matchMP4(resource);
    if (mp4Result) {
      return mp4Result;
    }
    const webmResult = matchWebM(resource);
    if (webmResult) {
      return webmResult;
    }
    const mp3Result = matchMP3WithoutID3(resource);
    if (mp3Result) {
      return mp3Result;
    }
    return null;
  }
  function distinguishTextOrBinary(resourceHeader) {
    const { length } = resourceHeader;
    if (length >= 2) {
      if (resourceHeader[0] === 254 && resourceHeader[1] === 255) {
        return "text/plain";
      }
      if (resourceHeader[0] === 255 && resourceHeader[1] === 254) {
        return "text/plain";
      }
    }
    if (length >= 3) {
      if (resourceHeader[0] === 239 && resourceHeader[1] === 187 && resourceHeader[2] === 191) {
        return "text/plain";
      }
    }
    for (let i = 0; i < length; i++) {
      if (isBinaryDataByte(resourceHeader[i])) {
        return "application/octet-stream";
      }
    }
    return "text/plain";
  }
  function identifyAnUnknownMIMEType(resourceHeader, { sniffScriptable = false } = {}) {
    if (sniffScriptable) {
      for (const sig of step1Table) {
        const result = matchesSignature(resourceHeader, sig);
        if (result) {
          return result;
        }
      }
    }
    for (const sig of step2Table) {
      const result = matchesSignature(resourceHeader, sig);
      if (result) {
        return result;
      }
    }
    for (const sig of imageSignatures) {
      const result = matchesSignature(resourceHeader, sig);
      if (result) {
        return result;
      }
    }
    for (const sig of audioVideoSignatures) {
      const result = matchesSignature(resourceHeader, sig);
      if (result) {
        return result;
      }
    }
    const mp4Result = matchMP4(resourceHeader);
    if (mp4Result) {
      return mp4Result;
    }
    const webmResult = matchWebM(resourceHeader);
    if (webmResult) {
      return webmResult;
    }
    const mp3Result = matchMP3WithoutID3(resourceHeader);
    if (mp3Result) {
      return mp3Result;
    }
    for (const sig of archiveSignatures) {
      const result = matchesSignature(resourceHeader, sig);
      if (result) {
        return result;
      }
    }
    for (let i = 0; i < resourceHeader.length; i++) {
      if (isBinaryDataByte(resourceHeader[i])) {
        return "application/octet-stream";
      }
    }
    return "text/plain";
  }
  const apacheBugValues = /* @__PURE__ */ new Set([
    "text/plain",
    "text/plain; charset=ISO-8859-1",
    "text/plain; charset=iso-8859-1",
    "text/plain; charset=UTF-8"
  ]);
  function detectSuppliedMIMEType({ contentTypeHeader, providedType }) {
    let suppliedMIMEType = null;
    let checkForApacheBug = false;
    if (contentTypeHeader !== void 0) {
      suppliedMIMEType = normalizeMIMEType(contentTypeHeader);
      if (suppliedMIMEType !== null && typeof contentTypeHeader === "string") {
        checkForApacheBug = apacheBugValues.has(contentTypeHeader);
      }
    } else if (providedType !== void 0) {
      suppliedMIMEType = normalizeMIMEType(providedType);
    }
    return { suppliedMIMEType, checkForApacheBug };
  }
  sniff = function computedMIMEType(resource, { contentTypeHeader, providedType, noSniff = false, isSupported = () => true } = {}) {
    const resourceHeader = getResourceHeader(resource);
    const { suppliedMIMEType, checkForApacheBug } = detectSuppliedMIMEType({ contentTypeHeader, providedType });
    if (suppliedMIMEType !== null && (isXMLMIMEType(suppliedMIMEType) || isHTMLMIMEType(suppliedMIMEType))) {
      return suppliedMIMEType;
    }
    if (suppliedMIMEType === null || suppliedMIMEType.essence === "unknown/unknown" || suppliedMIMEType.essence === "application/unknown" || suppliedMIMEType.essence === "*/*") {
      return new MIMEType(identifyAnUnknownMIMEType(resourceHeader, { sniffScriptable: !noSniff }));
    }
    if (noSniff) {
      return suppliedMIMEType;
    }
    if (checkForApacheBug) {
      return new MIMEType(distinguishTextOrBinary(resourceHeader));
    }
    if (isImageMIMEType(suppliedMIMEType) && isSupported(suppliedMIMEType)) {
      const imageResult = matchImageType(resourceHeader);
      if (imageResult !== null) {
        return new MIMEType(imageResult);
      }
    }
    if (isAudioOrVideoMIMEType(suppliedMIMEType) && isSupported(suppliedMIMEType)) {
      const avResult = matchAudioOrVideoType(resourceHeader);
      if (avResult !== null) {
        return new MIMEType(avResult);
      }
    }
    return suppliedMIMEType;
  };
  return sniff;
}
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  lib.MIMEType = requireMimeType();
  lib.computedMIMEType = requireSniff();
  return lib;
}
export {
  requireLib as r
};

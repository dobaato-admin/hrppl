import { c as getAugmentedNamespace } from "./react.mjs";
import { G as GenerationalCache } from "./asamuzakjp__generational-cache.mjs";
import { t as tokenize, c } from "./csstools__css-tokenizer.mjs";
import { c as calc } from "./csstools__css-calc.mjs";
import { c as color, m as me } from "./csstools__css-color-parser.mjs";
import { p as parseComponentValue } from "./@csstools/css-parser-algorithms+[...].mjs";
var CACHE_SIZE = 2048;
var CacheItem = class {
  #isNull;
  #item;
  constructor(item, isNull = false) {
    this.#item = item;
    this.#isNull = !!isNull;
  }
  get item() {
    return this.#item;
  }
  get isNull() {
    return this.#isNull;
  }
};
var NullObject = class extends CacheItem {
  constructor() {
    super(/* @__PURE__ */ Symbol("null"), true);
  }
};
var genCache = new GenerationalCache(CACHE_SIZE);
var sharedNullObject = new NullObject();
var setCache = (key, value) => {
  if (!key) return;
  if (value === null) genCache.set(key, sharedNullObject);
  else if (value instanceof CacheItem) genCache.set(key, value);
  else genCache.set(key, new CacheItem(value));
};
var getCache = (key) => {
  if (!key) return false;
  const item = genCache.get(key);
  if (item !== void 0) return item;
  return false;
};
var stringifySorted = (obj) => {
  const keys = Object.keys(obj);
  if (keys.length === 0) return "";
  keys.sort();
  let result = "";
  for (const key of keys) result += `${key}:${JSON.stringify(obj[key])};`;
  return result;
};
var createCacheKey = (keyData, opt = {}) => {
  if (!keyData || opt.customProperty && typeof opt.customProperty.callback === "function" || opt.dimension && typeof opt.dimension.callback === "function") return "";
  const namespace = keyData.namespace || "";
  const name = keyData.name || "";
  const value = keyData.value || "";
  if (!namespace && !name && !value) return "";
  return `${`${namespace}:${name}:${value}`}::${`${opt.format || ""}|${opt.colorSpace || ""}|${opt.colorScheme || ""}|${opt.currentColor || ""}|${opt.d50 ? "1" : "0"}|${opt.nullable ? "1" : "0"}|${opt.preserveComment ? "1" : "0"}|${opt.delimiter || ""}`}::${opt.customProperty ? stringifySorted(opt.customProperty) : ""}::${opt.dimension ? stringifySorted(opt.dimension) : ""}`;
};
var isString = (o) => typeof o === "string" || o instanceof String;
var isStringOrNumber = (o) => isString(o) || typeof o === "number";
var _DIGIT = "(?:0|[1-9]\\d*)";
var _MATH = `clamp|max|min|exp|hypot|log|pow|sqrt|abs|sign|mod|rem|round|a?(?:cos|sin|tan)|atan2`;
var _CALC = `calc|${_MATH}`;
var _VAR = `var|${_CALC}`;
var ANGLE = "deg|g?rad|turn";
var LENGTH = "[cm]m|[dls]?v(?:[bhiw]|max|min)|in|p[ctx]|q|r?(?:[cl]h|cap|e[mx]|ic)";
var NUM$1 = `[+-]?(?:${_DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${_DIGIT})?`;
var NUM_POSITIVE = `\\+?(?:${_DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${_DIGIT})?`;
var NONE = "none";
var PCT$1 = `${NUM$1}%`;
var SYN_FN_CALC = `^(?:${_CALC})\\(|(?<=[*\\/\\s\\(])(?:${_CALC})\\(`;
var SYN_FN_MATH_START = `^(?:${_MATH})\\($`;
var SYN_FN_VAR = "^var\\(|(?<=[*\\/\\s\\(])var\\(";
var SYN_FN_VAR_START = `^(?:${_VAR})\\(`;
var _ALPHA = `(?:\\s*\\/\\s*(?:${NUM$1}|${PCT$1}|${NONE}))?`;
var _ALPHA_LV3 = `(?:\\s*,\\s*(?:${NUM$1}|${PCT$1}))?`;
var _COLOR_FUNC = "(?:ok)?l(?:ab|ch)|color|hsla?|hwb|rgba?";
var _COLOR_KEY = "[a-z]+|#[\\da-f]{3}|#[\\da-f]{4}|#[\\da-f]{6}|#[\\da-f]{8}";
var _CS_HUE = "(?:ok)?lch|hsl|hwb";
var _CS_HUE_ARC = "(?:de|in)creasing|longer|shorter";
var _NUM_ANGLE = `${NUM$1}(?:${ANGLE})?`;
var _NUM_ANGLE_NONE = `(?:${NUM$1}(?:${ANGLE})?|${NONE})`;
var _NUM_PCT_NONE = `(?:${NUM$1}|${PCT$1}|${NONE})`;
var CS_HUE = `(?:${_CS_HUE})(?:\\s(?:${_CS_HUE_ARC})\\shue)?`;
var CS_HUE_CAPT = `(${_CS_HUE})(?:\\s(${_CS_HUE_ARC})\\shue)?`;
var CS_LAB = "(?:ok)?lab";
var CS_LCH = "(?:ok)?lch";
var CS_RGB = `(?:a98|prophoto)-rgb|display-p3|rec2020|srgb(?:-linear)?`;
var CS_XYZ = "xyz(?:-d(?:50|65))?";
var CS_RECT = `${CS_LAB}|${CS_RGB}|${CS_XYZ}`;
var CS_MIX = `${CS_HUE}|${CS_RECT}`;
var FN_MIX = "color-mix(";
var FN_REL = `(?:${_COLOR_FUNC})\\(\\s*from\\s+`;
var FN_REL_CAPT = `(${_COLOR_FUNC})\\(\\s*from\\s+`;
var FN_VAR = "var(";
var SYN_FN_COLOR = `(?:${CS_RGB}|${CS_XYZ})(?:\\s+${_NUM_PCT_NONE}){3}${_ALPHA}`;
var SYN_FN_LIGHT_DARK = "^light-dark\\(";
var SYN_FN_REL = `^${FN_REL}|(?<=[\\s])${FN_REL}`;
var SYN_HSL = `${_NUM_ANGLE_NONE}(?:\\s+${_NUM_PCT_NONE}){2}${_ALPHA}`;
var SYN_HSL_LV3 = `${_NUM_ANGLE}(?:\\s*,\\s*${PCT$1}){2}${_ALPHA_LV3}`;
var SYN_LCH = `(?:${_NUM_PCT_NONE}\\s+){2}${_NUM_ANGLE_NONE}${_ALPHA}`;
var SYN_MOD = `${_NUM_PCT_NONE}(?:\\s+${_NUM_PCT_NONE}){2}${_ALPHA}`;
var SYN_RGB_LV3 = `(?:${NUM$1}(?:\\s*,\\s*${NUM$1}){2}|${PCT$1}(?:\\s*,\\s*${PCT$1}){2})${_ALPHA_LV3}`;
var SYN_COLOR_TYPE = `${_COLOR_KEY}|hsla?\\(\\s*${SYN_HSL_LV3}\\s*\\)|rgba?\\(\\s*${SYN_RGB_LV3}\\s*\\)|(?:hsla?|hwb)\\(\\s*${SYN_HSL}\\s*\\)|(?:(?:ok)?lab|rgba?)\\(\\s*${SYN_MOD}\\s*\\)|(?:ok)?lch\\(\\s*${SYN_LCH}\\s*\\)|color\\(\\s*${SYN_FN_COLOR}\\s*\\)`;
var SYN_MIX_PART = `(?:${SYN_COLOR_TYPE})(?:\\s+${PCT$1})?`;
var SYN_MIX = `color-mix\\(\\s*in\\s+(?:${CS_MIX})\\s*,\\s*${SYN_MIX_PART}\\s*,\\s*${SYN_MIX_PART}\\s*\\)`;
var SYN_MIX_CAPT = `color-mix\\(\\s*in\\s+(${CS_MIX})\\s*,\\s*(${SYN_MIX_PART})\\s*,\\s*(${SYN_MIX_PART})\\s*\\)`;
var VAL_COMP = "computedValue";
var VAL_MIX = "mixValue";
var VAL_SPEC = "specifiedValue";
var { CloseParen: PAREN_CLOSE$3, Comma: COMMA, Comment: COMMENT$3, Delim: DELIM$1, EOF: EOF$3, Function: FUNC$2, OpenParen: PAREN_OPEN$2, Whitespace: W_SPACE$3 } = c;
var NAMESPACE$7 = "util";
var DEC$2 = 10;
var HEX$3 = 16;
var DEG$1 = 360;
var DEG_HALF$1 = 180;
var REG_COLOR$1 = new RegExp(`^(?:${SYN_COLOR_TYPE})$`);
var REG_DIMENSION = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)([a-z]*)$/i;
var REG_FN_COLOR$1 = /^(?:(?:ok)?l(?:ab|ch)|color(?:-mix)?|hsla?|hwb|rgba?|var)\(/;
var REG_MIX$1 = new RegExp(SYN_MIX);
var REG_DASHED_IDENT = /--[\w-]+/g;
var REG_COMMA = /^,$/;
var REG_SLASH = /^\/$/;
var REG_WHITESPACE = /^\s+$/;
var splitValue = (value, opt = {}) => {
  if (!isString(value)) throw new TypeError(`${value} is not a string.`);
  const strValue = value.trim();
  const { delimiter = " ", preserveComment = false } = opt;
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$7,
    name: "splitValue",
    value: strValue
  }, {
    delimiter,
    preserveComment
  });
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) return cachedResult.item;
  let regDelimiter;
  switch (delimiter) {
    case ",":
      regDelimiter = REG_COMMA;
      break;
    case "/":
      regDelimiter = REG_SLASH;
      break;
    default:
      regDelimiter = REG_WHITESPACE;
  }
  const tokens = tokenize({ css: strValue });
  let nest = 0;
  let currentStr = "";
  const res = [];
  for (const [type, val] of tokens) switch (type) {
    case COMMA:
    case DELIM$1:
      if (nest === 0 && regDelimiter.test(val)) {
        res.push(currentStr.trim());
        currentStr = "";
      } else currentStr += val;
      break;
    case COMMENT$3:
      if (preserveComment && (delimiter === "," || delimiter === "/")) currentStr += val;
      break;
    case FUNC$2:
    case PAREN_OPEN$2:
      currentStr += val;
      nest++;
      break;
    case PAREN_CLOSE$3:
      currentStr += val;
      nest--;
      break;
    case W_SPACE$3:
      if (regDelimiter.test(val)) if (nest === 0) {
        if (currentStr) {
          res.push(currentStr.trim());
          currentStr = "";
        }
      } else currentStr += " ";
      else if (!currentStr.endsWith(" ")) currentStr += " ";
      break;
    default:
      if (type === EOF$3) {
        res.push(currentStr.trim());
        currentStr = "";
      } else currentStr += val;
  }
  setCache(cacheKey, res);
  return res;
};
var extractDashedIdent = (value) => {
  if (!isString(value)) throw new TypeError(`${value} is not a string.`);
  const strValue = value.trim();
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$7,
    name: "extractDashedIdent",
    value: strValue
  });
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) return cachedResult.item;
  const matches = strValue.match(REG_DASHED_IDENT);
  const res = matches ? [...new Set(matches)] : [];
  setCache(cacheKey, res);
  return res;
};
var isColor = (value, opt = {}) => {
  if (!isString(value)) return false;
  const str = value.toLowerCase().trim();
  if (!str) return false;
  if (/^[a-z]+$/.test(str)) return str === "currentcolor" || str === "transparent" || Object.hasOwn(NAMED_COLORS, str);
  if (REG_COLOR$1.test(str) || REG_MIX$1.test(str)) return true;
  if (REG_FN_COLOR$1.test(str)) {
    const colorOpt = {
      ...opt,
      nullable: true
    };
    if (!colorOpt.format) colorOpt.format = VAL_SPEC;
    return !!resolveColor(str, colorOpt);
  }
  return false;
};
var roundToPrecision = (value, bit = 0) => {
  if (!Number.isFinite(value)) throw new TypeError(`${value} is not a finite number.`);
  if (!Number.isFinite(bit)) throw new TypeError(`${bit} is not a finite number.`);
  if (bit < 0 || bit > HEX$3) throw new RangeError(`${bit} is not between 0 and ${HEX$3}.`);
  if (bit === 0) return Math.round(value);
  const precision = bit === HEX$3 ? 6 : bit < DEC$2 ? 4 : 5;
  return parseFloat(value.toPrecision(precision));
};
var interpolateHue = (hueA, hueB, arc = "shorter") => {
  if (!Number.isFinite(hueA)) throw new TypeError(`${hueA} is not a finite number.`);
  if (!Number.isFinite(hueB)) throw new TypeError(`${hueB} is not a finite number.`);
  let a = hueA;
  let b = hueB;
  switch (arc) {
    case "decreasing":
      if (b > a) a += DEG$1;
      break;
    case "increasing":
      if (b < a) b += DEG$1;
      break;
    case "longer":
      if (b > a && b < a + DEG_HALF$1) a += DEG$1;
      else if (b > a - DEG_HALF$1 && b <= a) b += DEG$1;
      break;
    default:
      if (b > a + DEG_HALF$1) a += DEG$1;
      else if (b < a - DEG_HALF$1) b += DEG$1;
  }
  return [a, b];
};
var absoluteFontSize = /* @__PURE__ */ new Map([
  ["xx-small", 9 / 16],
  ["x-small", 5 / 8],
  ["small", 13 / 16],
  ["medium", 1],
  ["large", 9 / 8],
  ["x-large", 3 / 2],
  ["xx-large", 2],
  ["xxx-large", 3]
]);
var relativeFontSize = /* @__PURE__ */ new Map([["smaller", 1 / 1.2], ["larger", 1.2]]);
var absoluteLength = /* @__PURE__ */ new Map([
  ["cm", 96 / 2.54],
  ["mm", 96 / 25.4],
  ["q", 96 / 101.6],
  ["in", 96],
  ["pc", 16],
  ["pt", 96 / 72],
  ["px", 1]
]);
var relativeLength = /* @__PURE__ */ new Map([
  ["rcap", 1],
  ["rch", 0.5],
  ["rem", 1],
  ["rex", 0.5],
  ["ric", 1],
  ["rlh", 1.2]
]);
var resolveLengthInPixels = (value, unit, opt = {}) => {
  const { dimension = {} } = opt;
  const { callback, em, rem, vh, vw } = dimension;
  if (isString(value)) {
    const str = value.toLowerCase().trim();
    const ratio = absoluteFontSize.get(str);
    if (ratio !== void 0) return ratio * rem;
    const relRatio = relativeFontSize.get(str);
    if (relRatio !== void 0) return relRatio * em;
    return NaN;
  }
  if (Number.isFinite(value) && unit) {
    const u = unit.toLowerCase();
    if (Object.hasOwn(dimension, u)) return value * Number(dimension[u]);
    if (typeof callback === "function") return value * (callback(u) ?? NaN);
    const absRatio = absoluteLength.get(u);
    if (absRatio !== void 0) return value * absRatio;
    const relRatio = relativeLength.get(u);
    if (relRatio !== void 0) return value * relRatio * rem;
    const rUnitRatio = relativeLength.get(`r${u}`);
    if (rUnitRatio !== void 0) return value * rUnitRatio * em;
    switch (u) {
      case "vb":
      case "vi":
        return value * vw;
      case "vmax":
        return value * Math.max(vh, vw);
      case "vmin":
        return value * Math.min(vh, vw);
    }
  }
  return NaN;
};
var isAbsoluteSizeOrLength = (value, unit) => {
  if (isString(value)) return absoluteFontSize.has(value.toLowerCase().trim());
  if (isString(unit)) return absoluteLength.has(unit.toLowerCase().trim());
  return value === 0;
};
var isAbsoluteFontSize = (css) => {
  if (!isString(css)) return false;
  const str = css.trim();
  if (isAbsoluteSizeOrLength(str, void 0)) return true;
  const match = str.match(REG_DIMENSION);
  return match ? isAbsoluteSizeOrLength(Number(match[1]), match[2] || void 0) : false;
};
var NAMESPACE$6 = "color";
var PPTH = 1e-3;
var HALF = 0.5;
var DUO = 2;
var TRIA$1 = 3;
var QUAD = 4;
var OCT$1 = 8;
var DEC$1 = 10;
var DOZ = 12;
var HEX$2 = 16;
var SEXA = 60;
var DEG_HALF = 180;
var DEG = 360;
var MAX_PCT$2 = 100;
var MAX_RGB$1 = 255;
var POW_SQR = 2;
var POW_CUBE = 3;
var POW_LINEAR = 2.4;
var LINEAR_COEF = 12.92;
var LINEAR_OFFSET = 0.055;
var LAB_L = 116;
var LAB_A = 500;
var LAB_B = 200;
var LAB_EPSILON = 216 / 24389;
var LAB_KAPPA = 24389 / 27;
var D50 = [
  0.3457 / 0.3585,
  1,
  0.2958 / 0.3585
];
var MATRIX_D50_TO_D65 = [
  [
    0.955473421488075,
    -0.02309845494876471,
    0.06325924320057072
  ],
  [
    -0.0283697093338637,
    1.0099953980813041,
    0.021041441191917323
  ],
  [
    0.012314014864481998,
    -0.020507649298898964,
    1.330365926242124
  ]
];
var MATRIX_D65_TO_D50 = [
  [
    1.0479297925449969,
    0.022946870601609652,
    -0.05019226628920524
  ],
  [
    0.02962780877005599,
    0.9904344267538799,
    -0.017073799063418826
  ],
  [
    -0.009243040646204504,
    0.015055191490298152,
    0.7518742814281371
  ]
];
var MATRIX_L_RGB_TO_XYZ = [
  [
    506752 / 1228815,
    87881 / 245763,
    12673 / 70218
  ],
  [
    87098 / 409605,
    175762 / 245763,
    12673 / 175545
  ],
  [
    7918 / 409605,
    87881 / 737289,
    1001167 / 1053270
  ]
];
var MATRIX_XYZ_TO_L_RGB = [
  [
    12831 / 3959,
    -329 / 214,
    -1974 / 3959
  ],
  [
    -851781 / 878810,
    1648619 / 878810,
    36519 / 878810
  ],
  [
    705 / 12673,
    -2585 / 12673,
    705 / 667
  ]
];
var MATRIX_XYZ_TO_LMS = [
  [
    0.819022437996703,
    0.3619062600528904,
    -0.1288737815209879
  ],
  [
    0.0329836539323885,
    0.9292868615863434,
    0.0361446663506424
  ],
  [
    0.0481771893596242,
    0.2642395317527308,
    0.6335478284694309
  ]
];
var MATRIX_LMS_TO_XYZ = [
  [
    1.2268798758459243,
    -0.5578149944602171,
    0.2813910456659647
  ],
  [
    -0.0405757452148008,
    1.112286803280317,
    -0.0717110580655164
  ],
  [
    -0.0763729366746601,
    -0.4214933324022432,
    1.5869240198367816
  ]
];
var MATRIX_OKLAB_TO_LMS = [
  [
    1,
    0.3963377773761749,
    0.2158037573099136
  ],
  [
    1,
    -0.1055613458156586,
    -0.0638541728258133
  ],
  [
    1,
    -0.0894841775298119,
    -1.2914855480194092
  ]
];
var MATRIX_LMS_TO_OKLAB = [
  [
    0.210454268309314,
    0.7936177747023054,
    -0.0040720430116193
  ],
  [
    1.9779985324311684,
    -2.42859224204858,
    0.450593709617411
  ],
  [
    0.0259040424655478,
    0.7827717124575296,
    -0.8086757549230774
  ]
];
var MATRIX_P3_TO_XYZ = [
  [
    608311 / 1250200,
    189793 / 714400,
    198249 / 1000160
  ],
  [
    35783 / 156275,
    247089 / 357200,
    198249 / 2500400
  ],
  [
    0 / 1,
    32229 / 714400,
    5220557 / 5000800
  ]
];
var MATRIX_REC2020_TO_XYZ = [
  [
    63426534 / 99577255,
    20160776 / 139408157,
    47086771 / 278816314
  ],
  [
    26158966 / 99577255,
    472592308 / 697040785,
    8267143 / 139408157
  ],
  [
    0 / 1,
    19567812 / 697040785,
    295819943 / 278816314
  ]
];
var MATRIX_A98_TO_XYZ = [
  [
    573536 / 994567,
    263643 / 1420810,
    187206 / 994567
  ],
  [
    591459 / 1989134,
    6239551 / 9945670,
    374412 / 4972835
  ],
  [
    53769 / 1989134,
    351524 / 4972835,
    4929758 / 4972835
  ]
];
var MATRIX_PROPHOTO_TO_XYZ_D50 = [
  [
    0.7977666449006423,
    0.13518129740053308,
    0.0313477341283922
  ],
  [
    0.2880748288194013,
    0.711835234241873,
    8993693872564e-17
  ],
  [
    0,
    0,
    0.8251046025104602
  ]
];
var REG_COLOR = new RegExp(`^(?:${SYN_COLOR_TYPE})$`);
var REG_CS_HUE = new RegExp(`^${CS_HUE_CAPT}$`);
var REG_CS_XYZ = /^xyz(?:-d(?:50|65))?$/;
var REG_CURRENT = /^currentColor$/i;
var REG_FN_COLOR = new RegExp(`^color\\(\\s*(${SYN_FN_COLOR})\\s*\\)$`);
var REG_HSL = new RegExp(`^hsla?\\(\\s*(${SYN_HSL}|${SYN_HSL_LV3})\\s*\\)$`);
var REG_HWB = new RegExp(`^hwb\\(\\s*(${SYN_HSL})\\s*\\)$`);
var REG_LAB = new RegExp(`^lab\\(\\s*(${SYN_MOD})\\s*\\)$`);
var REG_LCH = new RegExp(`^lch\\(\\s*(${SYN_LCH})\\s*\\)$`);
var REG_MIX = new RegExp(`^${SYN_MIX}$`);
var REG_MIX_CAPT = new RegExp(`^${SYN_MIX_CAPT}$`);
var REG_MIX_NEST = new RegExp(`${SYN_MIX}`, "g");
var REG_OKLAB = new RegExp(`^oklab\\(\\s*(${SYN_MOD})\\s*\\)$`);
var REG_OKLCH = new RegExp(`^oklch\\(\\s*(${SYN_LCH})\\s*\\)$`);
var REG_SPEC = /^(?:specifi|comput)edValue$/;
var REG_ANGLE_TO_DEG = new RegExp(`^(${NUM$1})(${ANGLE})?$`);
var REG_PARSE_RGB = new RegExp(`^rgba?\\(\\s*(${SYN_MOD}|${SYN_RGB_LV3})\\s*\\)$`);
var REG_MIX_CS_RGB_XYZ = new RegExp(`^(?:${CS_RGB}|${CS_XYZ})$`);
var REG_MIX_IN_CS = new RegExp(`in\\s+(${CS_MIX})`);
var REG_MIX_START = new RegExp(`^color-mix\\(\\s*in\\s+(${CS_MIX})\\s*,`);
var REG_MIX_COLOR_PART = new RegExp(`^(${SYN_COLOR_TYPE})(?:\\s+(${PCT$1}))?$`);
var NAMED_COLORS = {
  aliceblue: [
    240,
    248,
    255
  ],
  antiquewhite: [
    250,
    235,
    215
  ],
  aqua: [
    0,
    255,
    255
  ],
  aquamarine: [
    127,
    255,
    212
  ],
  azure: [
    240,
    255,
    255
  ],
  beige: [
    245,
    245,
    220
  ],
  bisque: [
    255,
    228,
    196
  ],
  black: [
    0,
    0,
    0
  ],
  blanchedalmond: [
    255,
    235,
    205
  ],
  blue: [
    0,
    0,
    255
  ],
  blueviolet: [
    138,
    43,
    226
  ],
  brown: [
    165,
    42,
    42
  ],
  burlywood: [
    222,
    184,
    135
  ],
  cadetblue: [
    95,
    158,
    160
  ],
  chartreuse: [
    127,
    255,
    0
  ],
  chocolate: [
    210,
    105,
    30
  ],
  coral: [
    255,
    127,
    80
  ],
  cornflowerblue: [
    100,
    149,
    237
  ],
  cornsilk: [
    255,
    248,
    220
  ],
  crimson: [
    220,
    20,
    60
  ],
  cyan: [
    0,
    255,
    255
  ],
  darkblue: [
    0,
    0,
    139
  ],
  darkcyan: [
    0,
    139,
    139
  ],
  darkgoldenrod: [
    184,
    134,
    11
  ],
  darkgray: [
    169,
    169,
    169
  ],
  darkgreen: [
    0,
    100,
    0
  ],
  darkgrey: [
    169,
    169,
    169
  ],
  darkkhaki: [
    189,
    183,
    107
  ],
  darkmagenta: [
    139,
    0,
    139
  ],
  darkolivegreen: [
    85,
    107,
    47
  ],
  darkorange: [
    255,
    140,
    0
  ],
  darkorchid: [
    153,
    50,
    204
  ],
  darkred: [
    139,
    0,
    0
  ],
  darksalmon: [
    233,
    150,
    122
  ],
  darkseagreen: [
    143,
    188,
    143
  ],
  darkslateblue: [
    72,
    61,
    139
  ],
  darkslategray: [
    47,
    79,
    79
  ],
  darkslategrey: [
    47,
    79,
    79
  ],
  darkturquoise: [
    0,
    206,
    209
  ],
  darkviolet: [
    148,
    0,
    211
  ],
  deeppink: [
    255,
    20,
    147
  ],
  deepskyblue: [
    0,
    191,
    255
  ],
  dimgray: [
    105,
    105,
    105
  ],
  dimgrey: [
    105,
    105,
    105
  ],
  dodgerblue: [
    30,
    144,
    255
  ],
  firebrick: [
    178,
    34,
    34
  ],
  floralwhite: [
    255,
    250,
    240
  ],
  forestgreen: [
    34,
    139,
    34
  ],
  fuchsia: [
    255,
    0,
    255
  ],
  gainsboro: [
    220,
    220,
    220
  ],
  ghostwhite: [
    248,
    248,
    255
  ],
  gold: [
    255,
    215,
    0
  ],
  goldenrod: [
    218,
    165,
    32
  ],
  gray: [
    128,
    128,
    128
  ],
  green: [
    0,
    128,
    0
  ],
  greenyellow: [
    173,
    255,
    47
  ],
  grey: [
    128,
    128,
    128
  ],
  honeydew: [
    240,
    255,
    240
  ],
  hotpink: [
    255,
    105,
    180
  ],
  indianred: [
    205,
    92,
    92
  ],
  indigo: [
    75,
    0,
    130
  ],
  ivory: [
    255,
    255,
    240
  ],
  khaki: [
    240,
    230,
    140
  ],
  lavender: [
    230,
    230,
    250
  ],
  lavenderblush: [
    255,
    240,
    245
  ],
  lawngreen: [
    124,
    252,
    0
  ],
  lemonchiffon: [
    255,
    250,
    205
  ],
  lightblue: [
    173,
    216,
    230
  ],
  lightcoral: [
    240,
    128,
    128
  ],
  lightcyan: [
    224,
    255,
    255
  ],
  lightgoldenrodyellow: [
    250,
    250,
    210
  ],
  lightgray: [
    211,
    211,
    211
  ],
  lightgreen: [
    144,
    238,
    144
  ],
  lightgrey: [
    211,
    211,
    211
  ],
  lightpink: [
    255,
    182,
    193
  ],
  lightsalmon: [
    255,
    160,
    122
  ],
  lightseagreen: [
    32,
    178,
    170
  ],
  lightskyblue: [
    135,
    206,
    250
  ],
  lightslategray: [
    119,
    136,
    153
  ],
  lightslategrey: [
    119,
    136,
    153
  ],
  lightsteelblue: [
    176,
    196,
    222
  ],
  lightyellow: [
    255,
    255,
    224
  ],
  lime: [
    0,
    255,
    0
  ],
  limegreen: [
    50,
    205,
    50
  ],
  linen: [
    250,
    240,
    230
  ],
  magenta: [
    255,
    0,
    255
  ],
  maroon: [
    128,
    0,
    0
  ],
  mediumaquamarine: [
    102,
    205,
    170
  ],
  mediumblue: [
    0,
    0,
    205
  ],
  mediumorchid: [
    186,
    85,
    211
  ],
  mediumpurple: [
    147,
    112,
    219
  ],
  mediumseagreen: [
    60,
    179,
    113
  ],
  mediumslateblue: [
    123,
    104,
    238
  ],
  mediumspringgreen: [
    0,
    250,
    154
  ],
  mediumturquoise: [
    72,
    209,
    204
  ],
  mediumvioletred: [
    199,
    21,
    133
  ],
  midnightblue: [
    25,
    25,
    112
  ],
  mintcream: [
    245,
    255,
    250
  ],
  mistyrose: [
    255,
    228,
    225
  ],
  moccasin: [
    255,
    228,
    181
  ],
  navajowhite: [
    255,
    222,
    173
  ],
  navy: [
    0,
    0,
    128
  ],
  oldlace: [
    253,
    245,
    230
  ],
  olive: [
    128,
    128,
    0
  ],
  olivedrab: [
    107,
    142,
    35
  ],
  orange: [
    255,
    165,
    0
  ],
  orangered: [
    255,
    69,
    0
  ],
  orchid: [
    218,
    112,
    214
  ],
  palegoldenrod: [
    238,
    232,
    170
  ],
  palegreen: [
    152,
    251,
    152
  ],
  paleturquoise: [
    175,
    238,
    238
  ],
  palevioletred: [
    219,
    112,
    147
  ],
  papayawhip: [
    255,
    239,
    213
  ],
  peachpuff: [
    255,
    218,
    185
  ],
  peru: [
    205,
    133,
    63
  ],
  pink: [
    255,
    192,
    203
  ],
  plum: [
    221,
    160,
    221
  ],
  powderblue: [
    176,
    224,
    230
  ],
  purple: [
    128,
    0,
    128
  ],
  rebeccapurple: [
    102,
    51,
    153
  ],
  red: [
    255,
    0,
    0
  ],
  rosybrown: [
    188,
    143,
    143
  ],
  royalblue: [
    65,
    105,
    225
  ],
  saddlebrown: [
    139,
    69,
    19
  ],
  salmon: [
    250,
    128,
    114
  ],
  sandybrown: [
    244,
    164,
    96
  ],
  seagreen: [
    46,
    139,
    87
  ],
  seashell: [
    255,
    245,
    238
  ],
  sienna: [
    160,
    82,
    45
  ],
  silver: [
    192,
    192,
    192
  ],
  skyblue: [
    135,
    206,
    235
  ],
  slateblue: [
    106,
    90,
    205
  ],
  slategray: [
    112,
    128,
    144
  ],
  slategrey: [
    112,
    128,
    144
  ],
  snow: [
    255,
    250,
    250
  ],
  springgreen: [
    0,
    255,
    127
  ],
  steelblue: [
    70,
    130,
    180
  ],
  tan: [
    210,
    180,
    140
  ],
  teal: [
    0,
    128,
    128
  ],
  thistle: [
    216,
    191,
    216
  ],
  tomato: [
    255,
    99,
    71
  ],
  turquoise: [
    64,
    224,
    208
  ],
  violet: [
    238,
    130,
    238
  ],
  wheat: [
    245,
    222,
    179
  ],
  white: [
    255,
    255,
    255
  ],
  whitesmoke: [
    245,
    245,
    245
  ],
  yellow: [
    255,
    255,
    0
  ],
  yellowgreen: [
    154,
    205,
    50
  ]
};
var cacheInvalidColorValue = (cacheKey, format, nullable = false) => {
  if (format === "specifiedValue") {
    const res2 = "";
    setCache(cacheKey, res2);
    return res2;
  }
  if (nullable) {
    setCache(cacheKey, null);
    return new NullObject();
  }
  const res = [
    "rgb",
    0,
    0,
    0,
    0
  ];
  setCache(cacheKey, res);
  return res;
};
var resolveInvalidColorValue = (format, nullable = false) => {
  switch (format) {
    case "hsl":
    case "hwb":
    case VAL_MIX:
      return new NullObject();
    case VAL_SPEC:
      return "";
    default:
      if (nullable) return new NullObject();
      return [
        "rgb",
        0,
        0,
        0,
        0
      ];
  }
};
var validateColorComponents = (arr, opt = {}) => {
  if (!Array.isArray(arr)) throw new TypeError(`${arr} is not an array.`);
  const { alpha = false, minLength = TRIA$1, maxLength = QUAD, minRange = 0, maxRange = 1, validateRange = true } = opt;
  if (!Number.isFinite(minLength)) throw new TypeError(`${minLength} is not a number.`);
  if (!Number.isFinite(maxLength)) throw new TypeError(`${maxLength} is not a number.`);
  if (!Number.isFinite(minRange)) throw new TypeError(`${minRange} is not a number.`);
  if (!Number.isFinite(maxRange)) throw new TypeError(`${maxRange} is not a number.`);
  const l = arr.length;
  if (l < minLength || l > maxLength) throw new Error(`Unexpected array length ${l}.`);
  let i = 0;
  while (i < l) {
    const v = arr[i];
    if (!Number.isFinite(v)) throw new TypeError(`${v} is not a number.`);
    else if (i < TRIA$1 && validateRange && (v < minRange || v > maxRange)) throw new RangeError(`${v} is not between ${minRange} and ${maxRange}.`);
    else if (i === TRIA$1 && (v < 0 || v > 1)) throw new RangeError(`${v} is not between 0 and 1.`);
    i++;
  }
  if (alpha && l === TRIA$1) arr.push(1);
  return arr;
};
var transformMatrix = (mtx, vct, skip = false) => {
  if (!Array.isArray(mtx)) throw new TypeError(`${mtx} is not an array.`);
  else if (mtx.length !== TRIA$1) throw new Error(`Unexpected array length ${mtx.length}.`);
  else if (!skip) for (let i of mtx) i = validateColorComponents(i, {
    maxLength: TRIA$1,
    validateRange: false
  });
  const [[r1c1, r1c2, r1c3], [r2c1, r2c2, r2c3], [r3c1, r3c2, r3c3]] = mtx;
  let v1, v2, v3;
  if (skip) [v1, v2, v3] = vct;
  else [v1, v2, v3] = validateColorComponents(vct, {
    maxLength: TRIA$1,
    validateRange: false
  });
  return [
    r1c1 * v1 + r1c2 * v2 + r1c3 * v3,
    r2c1 * v1 + r2c2 * v2 + r2c3 * v3,
    r3c1 * v1 + r3c2 * v2 + r3c3 * v3
  ];
};
var normalizeColorComponents = (colorA, colorB, skip = false) => {
  if (!Array.isArray(colorA)) throw new TypeError(`${colorA} is not an array.`);
  else if (colorA.length !== QUAD) throw new Error(`Unexpected array length ${colorA.length}.`);
  if (!Array.isArray(colorB)) throw new TypeError(`${colorB} is not an array.`);
  else if (colorB.length !== QUAD) throw new Error(`Unexpected array length ${colorB.length}.`);
  let i = 0;
  while (i < QUAD) {
    if (colorA[i] === "none" && colorB[i] === "none") {
      colorA[i] = 0;
      colorB[i] = 0;
    } else if (colorA[i] === "none") colorA[i] = colorB[i];
    else if (colorB[i] === "none") colorB[i] = colorA[i];
    i++;
  }
  if (skip) return [colorA, colorB];
  return [validateColorComponents(colorA, {
    minLength: QUAD,
    validateRange: false
  }), validateColorComponents(colorB, {
    minLength: QUAD,
    validateRange: false
  })];
};
var numberToHexString = (value) => {
  if (!Number.isFinite(value)) throw new TypeError(`${value} is not a number.`);
  else {
    value = Math.round(value);
    if (value < 0 || value > MAX_RGB$1) throw new RangeError(`${value} is not between 0 and ${MAX_RGB$1}.`);
  }
  let hex = value.toString(HEX$2);
  if (hex.length === 1) hex = `0${hex}`;
  return hex;
};
var angleToDeg = (angle) => {
  if (isString(angle)) angle = angle.trim();
  else throw new TypeError(`${angle} is not a string.`);
  const GRAD = DEG / 400;
  const RAD = DEG / (Math.PI * DUO);
  if (!REG_ANGLE_TO_DEG.test(angle)) throw new SyntaxError(`Invalid property value: ${angle}`);
  const [, value, unit] = angle.match(REG_ANGLE_TO_DEG);
  let deg;
  switch (unit) {
    case "grad":
      deg = parseFloat(value) * GRAD;
      break;
    case "rad":
      deg = parseFloat(value) * RAD;
      break;
    case "turn":
      deg = parseFloat(value) * DEG;
      break;
    default:
      deg = parseFloat(value);
  }
  deg %= DEG;
  if (deg < 0) deg += DEG;
  else if (Object.is(deg, -0)) deg = 0;
  return deg;
};
var parseAlpha = (alpha = "") => {
  if (isString(alpha)) {
    alpha = alpha.trim();
    if (!alpha) alpha = "1";
    else if (alpha === "none") alpha = "0";
    else {
      let a;
      if (alpha.endsWith("%")) a = parseFloat(alpha) / MAX_PCT$2;
      else a = parseFloat(alpha);
      if (!Number.isFinite(a)) throw new TypeError(`${a} is not a finite number.`);
      if (a < PPTH) alpha = "0";
      else if (a > 1) alpha = "1";
      else alpha = a.toFixed(TRIA$1);
    }
  } else alpha = "1";
  return parseFloat(alpha);
};
var parseHexAlpha = (value) => {
  if (isString(value)) {
    if (value === "") throw new SyntaxError("Invalid property value: (empty string)");
    value = value.trim();
  } else throw new TypeError(`${value} is not a string.`);
  let alpha = parseInt(value, HEX$2);
  if (alpha <= 0) return 0;
  if (alpha >= MAX_RGB$1) return 1;
  const alphaMap = /* @__PURE__ */ new Map();
  for (let i = 1; i < MAX_PCT$2; i++) alphaMap.set(Math.round(i * MAX_RGB$1 / MAX_PCT$2), i);
  if (alphaMap.has(alpha)) alpha = alphaMap.get(alpha) / MAX_PCT$2;
  else alpha = Math.round(alpha / MAX_RGB$1 / PPTH) * PPTH;
  return parseFloat(alpha.toFixed(TRIA$1));
};
var transformRgbToLinearRgb = (rgb, skip = false) => {
  let rr, gg, bb;
  if (skip) [rr, gg, bb] = rgb;
  else [rr, gg, bb] = validateColorComponents(rgb, {
    maxLength: TRIA$1,
    maxRange: MAX_RGB$1
  });
  let r = rr / MAX_RGB$1;
  let g = gg / MAX_RGB$1;
  let b = bb / MAX_RGB$1;
  const COND_POW = 0.04045;
  if (r > COND_POW) r = Math.pow((r + LINEAR_OFFSET) / (1 + LINEAR_OFFSET), POW_LINEAR);
  else r /= LINEAR_COEF;
  if (g > COND_POW) g = Math.pow((g + LINEAR_OFFSET) / (1 + LINEAR_OFFSET), POW_LINEAR);
  else g /= LINEAR_COEF;
  if (b > COND_POW) b = Math.pow((b + LINEAR_OFFSET) / (1 + LINEAR_OFFSET), POW_LINEAR);
  else b /= LINEAR_COEF;
  return [
    r,
    g,
    b
  ];
};
var transformRgbToXyz = (rgb, skip = false) => {
  if (!skip) rgb = validateColorComponents(rgb, {
    maxLength: TRIA$1,
    maxRange: MAX_RGB$1
  });
  rgb = transformRgbToLinearRgb(rgb, true);
  return transformMatrix(MATRIX_L_RGB_TO_XYZ, rgb, true);
};
var transformLinearRgbToRgb = (rgb, round = false) => {
  let [r, g, b] = validateColorComponents(rgb, { maxLength: TRIA$1 });
  const COND_POW = 809 / 258400;
  if (r > COND_POW) r = Math.pow(r, 1 / POW_LINEAR) * (1 + LINEAR_OFFSET) - LINEAR_OFFSET;
  else r *= LINEAR_COEF;
  r *= MAX_RGB$1;
  if (g > COND_POW) g = Math.pow(g, 1 / POW_LINEAR) * (1 + LINEAR_OFFSET) - LINEAR_OFFSET;
  else g *= LINEAR_COEF;
  g *= MAX_RGB$1;
  if (b > COND_POW) b = Math.pow(b, 1 / POW_LINEAR) * (1 + LINEAR_OFFSET) - LINEAR_OFFSET;
  else b *= LINEAR_COEF;
  b *= MAX_RGB$1;
  return [
    round ? Math.round(r) : r,
    round ? Math.round(g) : g,
    round ? Math.round(b) : b
  ];
};
var transformXyzToRgb = (xyz, skip = false) => {
  if (!skip) xyz = validateColorComponents(xyz, {
    maxLength: TRIA$1,
    validateRange: false
  });
  let [r, g, b] = transformMatrix(MATRIX_XYZ_TO_L_RGB, xyz, true);
  [r, g, b] = transformLinearRgbToRgb([
    Math.min(Math.max(r, 0), 1),
    Math.min(Math.max(g, 0), 1),
    Math.min(Math.max(b, 0), 1)
  ], true);
  return [
    r,
    g,
    b
  ];
};
var transformXyzToHsl = (xyz, skip = false) => {
  const [rr, gg, bb] = transformXyzToRgb(xyz, skip);
  const r = rr / MAX_RGB$1;
  const g = gg / MAX_RGB$1;
  const b = bb / MAX_RGB$1;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) * HALF * MAX_PCT$2;
  let h, s;
  if (Math.round(l) === 0 || Math.round(l) === MAX_PCT$2) {
    h = 0;
    s = 0;
  } else {
    s = d / (1 - Math.abs(max + min - 1)) * MAX_PCT$2;
    if (s === 0) h = 0;
    else {
      switch (max) {
        case r:
          h = (g - b) / d;
          break;
        case g:
          h = (b - r) / d + DUO;
          break;
        case b:
        default:
          h = (r - g) / d + QUAD;
          break;
      }
      h = h * SEXA % DEG;
      if (h < 0) h += DEG;
    }
  }
  return [
    h,
    s,
    l
  ];
};
var transformXyzToHwb = (xyz, skip = false) => {
  const [r, g, b] = transformXyzToRgb(xyz, skip);
  const wh = Math.min(r, g, b) / MAX_RGB$1;
  const bk = 1 - Math.max(r, g, b) / MAX_RGB$1;
  let h;
  if (wh + bk === 1) h = 0;
  else [h] = transformXyzToHsl(xyz);
  return [
    h,
    wh * MAX_PCT$2,
    bk * MAX_PCT$2
  ];
};
var transformXyzToOklab = (xyz, skip = false) => {
  if (!skip) xyz = validateColorComponents(xyz, {
    maxLength: TRIA$1,
    validateRange: false
  });
  let [l, a, b] = transformMatrix(MATRIX_LMS_TO_OKLAB, transformMatrix(MATRIX_XYZ_TO_LMS, xyz, true).map((c2) => Math.cbrt(c2)), true);
  l = Math.min(Math.max(l, 0), 1);
  const lPct = Math.round(parseFloat(l.toFixed(QUAD)) * MAX_PCT$2);
  if (lPct === 0 || lPct === MAX_PCT$2) {
    a = 0;
    b = 0;
  }
  return [
    l,
    a,
    b
  ];
};
var transformXyzToOklch = (xyz, skip = false) => {
  const [l, a, b] = transformXyzToOklab(xyz, skip);
  let c2, h;
  const lPct = Math.round(parseFloat(l.toFixed(QUAD)) * MAX_PCT$2);
  if (lPct === 0 || lPct === MAX_PCT$2) {
    c2 = 0;
    h = 0;
  } else {
    c2 = Math.max(Math.sqrt(Math.pow(a, POW_SQR) + Math.pow(b, POW_SQR)), 0);
    if (parseFloat(c2.toFixed(QUAD)) === 0) h = 0;
    else {
      h = Math.atan2(b, a) * DEG_HALF / Math.PI;
      if (h < 0) h += DEG;
    }
  }
  return [
    l,
    c2,
    h
  ];
};
var transformXyzD50ToRgb = (xyz, skip = false) => {
  if (!skip) xyz = validateColorComponents(xyz, {
    maxLength: TRIA$1,
    validateRange: false
  });
  return transformXyzToRgb(transformMatrix(MATRIX_D50_TO_D65, xyz, true), true);
};
var transformXyzD50ToLab = (xyz, skip = false) => {
  if (!skip) xyz = validateColorComponents(xyz, {
    maxLength: TRIA$1,
    validateRange: false
  });
  const [f0, f1, f2] = xyz.map((val, i) => val / D50[i]).map((val) => val > LAB_EPSILON ? Math.cbrt(val) : (val * LAB_KAPPA + HEX$2) / LAB_L);
  const l = Math.min(Math.max(LAB_L * f1 - HEX$2, 0), MAX_PCT$2);
  let a, b;
  if (l === 0 || l === MAX_PCT$2) {
    a = 0;
    b = 0;
  } else {
    a = (f0 - f1) * LAB_A;
    b = (f1 - f2) * LAB_B;
  }
  return [
    l,
    a,
    b
  ];
};
var transformXyzD50ToLch = (xyz, skip = false) => {
  const [l, a, b] = transformXyzD50ToLab(xyz, skip);
  let c2, h;
  if (l === 0 || l === MAX_PCT$2) {
    c2 = 0;
    h = 0;
  } else {
    c2 = Math.max(Math.sqrt(Math.pow(a, POW_SQR) + Math.pow(b, POW_SQR)), 0);
    h = Math.atan2(b, a) * DEG_HALF / Math.PI;
    if (h < 0) h += DEG;
  }
  return [
    l,
    c2,
    h
  ];
};
var convertRgbToHex = (rgb) => {
  const [r, g, b, alpha] = validateColorComponents(rgb, {
    alpha: true,
    maxRange: MAX_RGB$1
  });
  const rr = numberToHexString(r);
  const gg = numberToHexString(g);
  const bb = numberToHexString(b);
  const aa = numberToHexString(alpha * MAX_RGB$1);
  let hex;
  if (aa === "ff") hex = `#${rr}${gg}${bb}`;
  else hex = `#${rr}${gg}${bb}${aa}`;
  return hex;
};
var convertHexToRgb = (value) => {
  if (isString(value)) value = value.toLowerCase().trim();
  else throw new TypeError(`${value} is not a string.`);
  if (!(/^#[\da-f]{6}$/.test(value) || /^#[\da-f]{3}$/.test(value) || /^#[\da-f]{8}$/.test(value) || /^#[\da-f]{4}$/.test(value))) throw new SyntaxError(`Invalid property value: ${value}`);
  const arr = [];
  if (/^#[\da-f]{3}$/.test(value)) {
    const [, r, g, b] = value.match(/^#([\da-f])([\da-f])([\da-f])$/);
    arr.push(parseInt(`${r}${r}`, HEX$2), parseInt(`${g}${g}`, HEX$2), parseInt(`${b}${b}`, HEX$2), 1);
  } else if (/^#[\da-f]{4}$/.test(value)) {
    const [, r, g, b, alpha] = value.match(/^#([\da-f])([\da-f])([\da-f])([\da-f])$/);
    arr.push(parseInt(`${r}${r}`, HEX$2), parseInt(`${g}${g}`, HEX$2), parseInt(`${b}${b}`, HEX$2), parseHexAlpha(`${alpha}${alpha}`));
  } else if (/^#[\da-f]{8}$/.test(value)) {
    const [, r, g, b, alpha] = value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})$/);
    arr.push(parseInt(r, HEX$2), parseInt(g, HEX$2), parseInt(b, HEX$2), parseHexAlpha(alpha));
  } else {
    const [, r, g, b] = value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/);
    arr.push(parseInt(r, HEX$2), parseInt(g, HEX$2), parseInt(b, HEX$2), 1);
  }
  return arr;
};
var convertHexToLinearRgb = (value) => {
  const [rr, gg, bb, alpha] = convertHexToRgb(value);
  const [r, g, b] = transformRgbToLinearRgb([
    rr,
    gg,
    bb
  ], true);
  return [
    r,
    g,
    b,
    alpha
  ];
};
var convertHexToXyz = (value) => {
  const [r, g, b, alpha] = convertHexToLinearRgb(value);
  const [x, y, z] = transformMatrix(MATRIX_L_RGB_TO_XYZ, [
    r,
    g,
    b
  ], true);
  return [
    x,
    y,
    z,
    alpha
  ];
};
var parseRgb = (value, opt = {}) => {
  if (isString(value)) value = value.toLowerCase().trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_PARSE_RGB.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const [, val] = value.match(REG_PARSE_RGB);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let r, g, b;
  if (v1 === "none") r = 0;
  else {
    if (v1.endsWith("%")) r = parseFloat(v1) * MAX_RGB$1 / MAX_PCT$2;
    else r = parseFloat(v1);
    r = Math.min(Math.max(roundToPrecision(r, OCT$1), 0), MAX_RGB$1);
  }
  if (v2 === "none") g = 0;
  else {
    if (v2.endsWith("%")) g = parseFloat(v2) * MAX_RGB$1 / MAX_PCT$2;
    else g = parseFloat(v2);
    g = Math.min(Math.max(roundToPrecision(g, OCT$1), 0), MAX_RGB$1);
  }
  if (v3 === "none") b = 0;
  else {
    if (v3.endsWith("%")) b = parseFloat(v3) * MAX_RGB$1 / MAX_PCT$2;
    else b = parseFloat(v3);
    b = Math.min(Math.max(roundToPrecision(b, OCT$1), 0), MAX_RGB$1);
  }
  const alpha = parseAlpha(v4);
  return [
    "rgb",
    r,
    g,
    b,
    format === "mixValue" && v4 === "none" ? NONE : alpha
  ];
};
var parseHsl = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_HSL.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const [, val] = value.match(REG_HSL);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let h, s, l;
  if (v1 === "none") h = 0;
  else h = angleToDeg(v1);
  if (v2 === "none") s = 0;
  else s = Math.min(Math.max(parseFloat(v2), 0), MAX_PCT$2);
  if (v3 === "none") l = 0;
  else l = Math.min(Math.max(parseFloat(v3), 0), MAX_PCT$2);
  const alpha = parseAlpha(v4);
  if (format === "hsl") return [
    format,
    v1 === "none" ? v1 : h,
    v2 === "none" ? v2 : s,
    v3 === "none" ? v3 : l,
    v4 === "none" ? v4 : alpha
  ];
  h = h / DEG * DOZ;
  l /= MAX_PCT$2;
  const sa = s / MAX_PCT$2 * Math.min(l, 1 - l);
  const rk = h % DOZ;
  const gk = (8 + h) % DOZ;
  const bk = (4 + h) % DOZ;
  const r = l - sa * Math.max(-1, Math.min(rk - TRIA$1, TRIA$1 ** POW_SQR - rk, 1));
  const g = l - sa * Math.max(-1, Math.min(gk - TRIA$1, TRIA$1 ** POW_SQR - gk, 1));
  const b = l - sa * Math.max(-1, Math.min(bk - TRIA$1, TRIA$1 ** POW_SQR - bk, 1));
  return [
    "rgb",
    Math.min(Math.max(roundToPrecision(r * MAX_RGB$1, OCT$1), 0), MAX_RGB$1),
    Math.min(Math.max(roundToPrecision(g * MAX_RGB$1, OCT$1), 0), MAX_RGB$1),
    Math.min(Math.max(roundToPrecision(b * MAX_RGB$1, OCT$1), 0), MAX_RGB$1),
    alpha
  ];
};
var parseHwb = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_HWB.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const [, val] = value.match(REG_HWB);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let h, wh, bk;
  if (v1 === "none") h = 0;
  else h = angleToDeg(v1);
  if (v2 === "none") wh = 0;
  else wh = Math.min(Math.max(parseFloat(v2), 0), MAX_PCT$2) / MAX_PCT$2;
  if (v3 === "none") bk = 0;
  else bk = Math.min(Math.max(parseFloat(v3), 0), MAX_PCT$2) / MAX_PCT$2;
  const alpha = parseAlpha(v4);
  if (format === "hwb") return [
    format,
    v1 === "none" ? v1 : h,
    v2 === "none" ? v2 : wh * MAX_PCT$2,
    v3 === "none" ? v3 : bk * MAX_PCT$2,
    v4 === "none" ? v4 : alpha
  ];
  if (wh + bk >= 1) {
    const v = roundToPrecision(wh / (wh + bk) * MAX_RGB$1, OCT$1);
    return [
      "rgb",
      v,
      v,
      v,
      alpha
    ];
  }
  const factor = (1 - wh - bk) / MAX_RGB$1;
  let [, r, g, b] = parseHsl(`hsl(${h} 100 50)`);
  r = roundToPrecision((r * factor + wh) * MAX_RGB$1, OCT$1);
  g = roundToPrecision((g * factor + wh) * MAX_RGB$1, OCT$1);
  b = roundToPrecision((b * factor + wh) * MAX_RGB$1, OCT$1);
  return [
    "rgb",
    Math.min(Math.max(r, 0), MAX_RGB$1),
    Math.min(Math.max(g, 0), MAX_RGB$1),
    Math.min(Math.max(b, 0), MAX_RGB$1),
    alpha
  ];
};
var parseLab = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_LAB.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const COEF_PCT = 1.25;
  const COND_POW = 8;
  const [, val] = value.match(REG_LAB);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let l, a, b;
  if (v1 === "none") l = 0;
  else {
    if (v1.endsWith("%")) {
      l = parseFloat(v1);
      if (l > MAX_PCT$2) l = MAX_PCT$2;
    } else l = parseFloat(v1);
    if (l < 0) l = 0;
  }
  if (v2 === "none") a = 0;
  else a = v2.endsWith("%") ? parseFloat(v2) * COEF_PCT : parseFloat(v2);
  if (v3 === "none") b = 0;
  else b = v3.endsWith("%") ? parseFloat(v3) * COEF_PCT : parseFloat(v3);
  const alpha = parseAlpha(v4);
  if (REG_SPEC.test(format)) return [
    "lab",
    v1 === "none" ? v1 : roundToPrecision(l, HEX$2),
    v2 === "none" ? v2 : roundToPrecision(a, HEX$2),
    v3 === "none" ? v3 : roundToPrecision(b, HEX$2),
    v4 === "none" ? v4 : alpha
  ];
  const fl = (l + HEX$2) / LAB_L;
  const fa = a / LAB_A + fl;
  const fb = fl - b / LAB_B;
  const powFl = Math.pow(fl, POW_CUBE);
  const powFa = Math.pow(fa, POW_CUBE);
  const powFb = Math.pow(fb, POW_CUBE);
  const [x, y, z] = [
    powFa > LAB_EPSILON ? powFa : (fa * LAB_L - HEX$2) / LAB_KAPPA,
    l > COND_POW ? powFl : l / LAB_KAPPA,
    powFb > LAB_EPSILON ? powFb : (fb * LAB_L - HEX$2) / LAB_KAPPA
  ].map((val2, i) => val2 * D50[i]);
  return [
    "xyz-d50",
    roundToPrecision(x, HEX$2),
    roundToPrecision(y, HEX$2),
    roundToPrecision(z, HEX$2),
    alpha
  ];
};
var parseLch = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_LCH.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const COEF_PCT = 1.5;
  const [, val] = value.match(REG_LCH);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let l, c2, h;
  if (v1 === "none") l = 0;
  else {
    l = parseFloat(v1);
    if (l < 0) l = 0;
  }
  if (v2 === "none") c2 = 0;
  else c2 = v2.endsWith("%") ? parseFloat(v2) * COEF_PCT : parseFloat(v2);
  if (v3 === "none") h = 0;
  else h = angleToDeg(v3);
  const alpha = parseAlpha(v4);
  if (REG_SPEC.test(format)) return [
    "lch",
    v1 === "none" ? v1 : roundToPrecision(l, HEX$2),
    v2 === "none" ? v2 : roundToPrecision(c2, HEX$2),
    v3 === "none" ? v3 : roundToPrecision(h, HEX$2),
    v4 === "none" ? v4 : alpha
  ];
  const a = c2 * Math.cos(h * Math.PI / DEG_HALF);
  const b = c2 * Math.sin(h * Math.PI / DEG_HALF);
  const [, x, y, z] = parseLab(`lab(${l} ${a} ${b})`);
  return [
    "xyz-d50",
    roundToPrecision(x, HEX$2),
    roundToPrecision(y, HEX$2),
    roundToPrecision(z, HEX$2),
    alpha
  ];
};
var parseOklab = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_OKLAB.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const COEF_PCT = 0.4;
  const [, val] = value.match(REG_OKLAB);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let l, a, b;
  if (v1 === "none") l = 0;
  else {
    l = v1.endsWith("%") ? parseFloat(v1) / MAX_PCT$2 : parseFloat(v1);
    if (l < 0) l = 0;
  }
  if (v2 === "none") a = 0;
  else if (v2.endsWith("%")) a = parseFloat(v2) * COEF_PCT / MAX_PCT$2;
  else a = parseFloat(v2);
  if (v3 === "none") b = 0;
  else if (v3.endsWith("%")) b = parseFloat(v3) * COEF_PCT / MAX_PCT$2;
  else b = parseFloat(v3);
  const alpha = parseAlpha(v4);
  if (REG_SPEC.test(format)) return [
    "oklab",
    v1 === "none" ? v1 : roundToPrecision(l, HEX$2),
    v2 === "none" ? v2 : roundToPrecision(a, HEX$2),
    v3 === "none" ? v3 : roundToPrecision(b, HEX$2),
    v4 === "none" ? v4 : alpha
  ];
  const [x, y, z] = transformMatrix(MATRIX_LMS_TO_XYZ, transformMatrix(MATRIX_OKLAB_TO_LMS, [
    l,
    a,
    b
  ]).map((c2) => Math.pow(c2, POW_CUBE)), true);
  return [
    "xyz-d65",
    roundToPrecision(x, HEX$2),
    roundToPrecision(y, HEX$2),
    roundToPrecision(z, HEX$2),
    alpha
  ];
};
var parseOklch = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  if (!REG_OKLCH.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const COEF_PCT = 0.4;
  const [, val] = value.match(REG_OKLCH);
  const [v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let l, c2, h;
  if (v1 === "none") l = 0;
  else {
    l = v1.endsWith("%") ? parseFloat(v1) / MAX_PCT$2 : parseFloat(v1);
    if (l < 0) l = 0;
  }
  if (v2 === "none") c2 = 0;
  else {
    if (v2.endsWith("%")) c2 = parseFloat(v2) * COEF_PCT / MAX_PCT$2;
    else c2 = parseFloat(v2);
    if (c2 < 0) c2 = 0;
  }
  if (v3 === "none") h = 0;
  else h = angleToDeg(v3);
  const alpha = parseAlpha(v4);
  if (REG_SPEC.test(format)) return [
    "oklch",
    v1 === "none" ? v1 : roundToPrecision(l, HEX$2),
    v2 === "none" ? v2 : roundToPrecision(c2, HEX$2),
    v3 === "none" ? v3 : roundToPrecision(h, HEX$2),
    v4 === "none" ? v4 : alpha
  ];
  const a = c2 * Math.cos(h * Math.PI / DEG_HALF);
  const b = c2 * Math.sin(h * Math.PI / DEG_HALF);
  const [x, y, z] = transformMatrix(MATRIX_LMS_TO_XYZ, transformMatrix(MATRIX_OKLAB_TO_LMS, [
    l,
    a,
    b
  ]).map((cc) => Math.pow(cc, POW_CUBE)), true);
  return [
    "xyz-d65",
    roundToPrecision(x, HEX$2),
    roundToPrecision(y, HEX$2),
    roundToPrecision(z, HEX$2),
    alpha
  ];
};
var parseColorFunc = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { colorSpace = "", d50 = false, format = "", nullable = false } = opt;
  if (!REG_FN_COLOR.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  const [, val] = value.match(REG_FN_COLOR);
  let [cs, v1, v2, v3, v4 = ""] = val.match(/[^\s,/]+/g);
  let r, g, b;
  if (cs === "xyz") cs = "xyz-d65";
  if (v1 === "none") r = 0;
  else r = v1.endsWith("%") ? parseFloat(v1) / MAX_PCT$2 : parseFloat(v1);
  if (v2 === "none") g = 0;
  else g = v2.endsWith("%") ? parseFloat(v2) / MAX_PCT$2 : parseFloat(v2);
  if (v3 === "none") b = 0;
  else b = v3.endsWith("%") ? parseFloat(v3) / MAX_PCT$2 : parseFloat(v3);
  const alpha = parseAlpha(v4);
  if (REG_SPEC.test(format) || format === "mixValue" && cs === colorSpace) return [
    cs,
    v1 === "none" ? v1 : roundToPrecision(r, DEC$1),
    v2 === "none" ? v2 : roundToPrecision(g, DEC$1),
    v3 === "none" ? v3 : roundToPrecision(b, DEC$1),
    v4 === "none" ? v4 : alpha
  ];
  let x = 0;
  let y = 0;
  let z = 0;
  if (cs === "srgb-linear") {
    [x, y, z] = transformMatrix(MATRIX_L_RGB_TO_XYZ, [
      r,
      g,
      b
    ]);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else if (cs === "display-p3") {
    const linearRgb = transformRgbToLinearRgb([
      r * MAX_RGB$1,
      g * MAX_RGB$1,
      b * MAX_RGB$1
    ]);
    [x, y, z] = transformMatrix(MATRIX_P3_TO_XYZ, linearRgb);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else if (cs === "rec2020") {
    const ALPHA = 1.09929682680944;
    const BETA = 0.018053968510807;
    const REC_COEF = 0.45;
    const rgb = [
      r,
      g,
      b
    ].map((c2) => {
      let cl;
      if (c2 < BETA * REC_COEF * DEC$1) cl = c2 / (REC_COEF * DEC$1);
      else cl = Math.pow((c2 + ALPHA - 1) / ALPHA, 1 / REC_COEF);
      return cl;
    });
    [x, y, z] = transformMatrix(MATRIX_REC2020_TO_XYZ, rgb);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else if (cs === "a98-rgb") {
    const POW_A98 = 563 / 256;
    const rgb = [
      r,
      g,
      b
    ].map((c2) => {
      return Math.pow(c2, POW_A98);
    });
    [x, y, z] = transformMatrix(MATRIX_A98_TO_XYZ, rgb);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else if (cs === "prophoto-rgb") {
    const POW_PROPHOTO = 1.8;
    const rgb = [
      r,
      g,
      b
    ].map((c2) => {
      let cl;
      if (c2 > 1 / (HEX$2 * DUO)) cl = Math.pow(c2, POW_PROPHOTO);
      else cl = c2 / HEX$2;
      return cl;
    });
    [x, y, z] = transformMatrix(MATRIX_PROPHOTO_TO_XYZ_D50, rgb);
    if (!d50) [x, y, z] = transformMatrix(MATRIX_D50_TO_D65, [
      x,
      y,
      z
    ], true);
  } else if (/^xyz(?:-d(?:50|65))?$/.test(cs)) {
    [x, y, z] = [
      r,
      g,
      b
    ];
    if (cs === "xyz-d50") {
      if (!d50) [x, y, z] = transformMatrix(MATRIX_D50_TO_D65, [
        x,
        y,
        z
      ]);
    } else if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else {
    [x, y, z] = transformRgbToXyz([
      r * MAX_RGB$1,
      g * MAX_RGB$1,
      b * MAX_RGB$1
    ]);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  }
  return [
    d50 ? "xyz-d50" : "xyz-d65",
    roundToPrecision(x, HEX$2),
    roundToPrecision(y, HEX$2),
    roundToPrecision(z, HEX$2),
    format === "mixValue" && v4 === "none" ? v4 : alpha
  ];
};
var parseColorValue = (value, opt = {}) => {
  if (isString(value)) value = value.toLowerCase().trim();
  else throw new TypeError(`${value} is not a string.`);
  const { d50 = false, format = "", nullable = false } = opt;
  if (!REG_COLOR.test(value)) {
    const res = resolveInvalidColorValue(format, nullable);
    if (res instanceof NullObject) return res;
    if (isString(res)) return res;
    return res;
  }
  let x = 0;
  let y = 0;
  let z = 0;
  let alpha = 0;
  if (REG_CURRENT.test(value)) {
    if (format === "computedValue") return [
      "rgb",
      0,
      0,
      0,
      0
    ];
    if (format === "specifiedValue") return value;
  } else if (/^[a-z]+$/.test(value)) if (Object.hasOwn(NAMED_COLORS, value)) {
    if (format === "specifiedValue") return value;
    const [r, g, b] = NAMED_COLORS[value];
    alpha = 1;
    if (format === "computedValue") return [
      "rgb",
      r,
      g,
      b,
      alpha
    ];
    [x, y, z] = transformRgbToXyz([
      r,
      g,
      b
    ], true);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else switch (format) {
    case VAL_COMP:
      if (nullable && value !== "transparent") return new NullObject();
      return [
        "rgb",
        0,
        0,
        0,
        0
      ];
    case VAL_SPEC:
      if (value === "transparent") return value;
      return "";
    case VAL_MIX:
      if (value === "transparent") return [
        "rgb",
        0,
        0,
        0,
        0
      ];
      return new NullObject();
  }
  else if (value[0] === "#") {
    if (REG_SPEC.test(format)) return ["rgb", ...convertHexToRgb(value)];
    [x, y, z, alpha] = convertHexToXyz(value);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else if (value.startsWith("lab")) {
    if (REG_SPEC.test(format)) return parseLab(value, opt);
    [, x, y, z, alpha] = parseLab(value);
    if (!d50) [x, y, z] = transformMatrix(MATRIX_D50_TO_D65, [
      x,
      y,
      z
    ], true);
  } else if (value.startsWith("lch")) {
    if (REG_SPEC.test(format)) return parseLch(value, opt);
    [, x, y, z, alpha] = parseLch(value);
    if (!d50) [x, y, z] = transformMatrix(MATRIX_D50_TO_D65, [
      x,
      y,
      z
    ], true);
  } else if (value.startsWith("oklab")) {
    if (REG_SPEC.test(format)) return parseOklab(value, opt);
    [, x, y, z, alpha] = parseOklab(value);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else if (value.startsWith("oklch")) {
    if (REG_SPEC.test(format)) return parseOklch(value, opt);
    [, x, y, z, alpha] = parseOklch(value);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  } else {
    let r, g, b;
    if (value.startsWith("hsl")) [, r, g, b, alpha] = parseHsl(value);
    else if (value.startsWith("hwb")) [, r, g, b, alpha] = parseHwb(value);
    else [, r, g, b, alpha] = parseRgb(value, opt);
    if (REG_SPEC.test(format)) return [
      "rgb",
      Math.round(r),
      Math.round(g),
      Math.round(b),
      alpha
    ];
    [x, y, z] = transformRgbToXyz([
      r,
      g,
      b
    ]);
    if (d50) [x, y, z] = transformMatrix(MATRIX_D65_TO_D50, [
      x,
      y,
      z
    ], true);
  }
  return [
    d50 ? "xyz-d50" : "xyz-d65",
    roundToPrecision(x, HEX$2),
    roundToPrecision(y, HEX$2),
    roundToPrecision(z, HEX$2),
    alpha
  ];
};
var resolveColorValue = (value, opt = {}) => {
  if (isString(value)) value = value.toLowerCase().trim();
  else throw new TypeError(`${value} is not a string.`);
  const { colorSpace = "", format = "", nullable = false } = opt;
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$6,
    name: "resolveColorValue",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    const cachedItem = cachedResult.item;
    if (isString(cachedItem)) return cachedItem;
    return cachedItem;
  }
  if (!REG_COLOR.test(value)) {
    const res2 = resolveInvalidColorValue(format, nullable);
    if (res2 instanceof NullObject) {
      setCache(cacheKey, null);
      return res2;
    }
    setCache(cacheKey, res2);
    if (isString(res2)) return res2;
    return res2;
  }
  let cs = "";
  let r = 0;
  let g = 0;
  let b = 0;
  let alpha = 0;
  if (REG_CURRENT.test(value)) {
    if (format === "specifiedValue") {
      setCache(cacheKey, value);
      return value;
    }
  } else if (/^[a-z]+$/.test(value)) if (Object.hasOwn(NAMED_COLORS, value)) {
    if (format === "specifiedValue") {
      setCache(cacheKey, value);
      return value;
    }
    [r, g, b] = NAMED_COLORS[value];
    alpha = 1;
  } else switch (format) {
    case VAL_SPEC: {
      if (value === "transparent") {
        setCache(cacheKey, value);
        return value;
      }
      const res2 = "";
      setCache(cacheKey, res2);
      return res2;
    }
    case VAL_MIX:
      if (value === "transparent") {
        const res2 = [
          "rgb",
          0,
          0,
          0,
          0
        ];
        setCache(cacheKey, res2);
        return res2;
      }
      setCache(cacheKey, null);
      return new NullObject();
    case VAL_COMP:
    default: {
      if (nullable && value !== "transparent") {
        setCache(cacheKey, null);
        return new NullObject();
      }
      const res2 = [
        "rgb",
        0,
        0,
        0,
        0
      ];
      setCache(cacheKey, res2);
      return res2;
    }
  }
  else if (value[0] === "#") [r, g, b, alpha] = convertHexToRgb(value);
  else if (value.startsWith("hsl")) [, r, g, b, alpha] = parseHsl(value, opt);
  else if (value.startsWith("hwb")) [, r, g, b, alpha] = parseHwb(value, opt);
  else if (/^l(?:ab|ch)/.test(value)) {
    let x, y, z;
    if (value.startsWith("lab")) [cs, x, y, z, alpha] = parseLab(value, opt);
    else [cs, x, y, z, alpha] = parseLch(value, opt);
    if (REG_SPEC.test(format)) {
      const res2 = [
        cs,
        x,
        y,
        z,
        alpha
      ];
      setCache(cacheKey, res2);
      return res2;
    }
    [r, g, b] = transformXyzD50ToRgb([
      x,
      y,
      z
    ]);
  } else if (/^okl(?:ab|ch)/.test(value)) {
    let x, y, z;
    if (value.startsWith("oklab")) [cs, x, y, z, alpha] = parseOklab(value, opt);
    else [cs, x, y, z, alpha] = parseOklch(value, opt);
    if (REG_SPEC.test(format)) {
      const res2 = [
        cs,
        x,
        y,
        z,
        alpha
      ];
      setCache(cacheKey, res2);
      return res2;
    }
    [r, g, b] = transformXyzToRgb([
      x,
      y,
      z
    ]);
  } else [, r, g, b, alpha] = parseRgb(value, opt);
  if (format === "mixValue" && colorSpace === "srgb") {
    const res2 = [
      "srgb",
      r / MAX_RGB$1,
      g / MAX_RGB$1,
      b / MAX_RGB$1,
      alpha
    ];
    setCache(cacheKey, res2);
    return res2;
  }
  const res = [
    "rgb",
    Math.round(r),
    Math.round(g),
    Math.round(b),
    alpha
  ];
  setCache(cacheKey, res);
  return res;
};
var resolveColorFunc = (value, opt = {}) => {
  if (isString(value)) value = value.toLowerCase().trim();
  else throw new TypeError(`${value} is not a string.`);
  const { colorSpace = "", format = "", nullable = false } = opt;
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$6,
    name: "resolveColorFunc",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    const cachedItem = cachedResult.item;
    if (isString(cachedItem)) return cachedItem;
    return cachedItem;
  }
  if (!REG_FN_COLOR.test(value)) {
    const res2 = resolveInvalidColorValue(format, nullable);
    if (res2 instanceof NullObject) {
      setCache(cacheKey, null);
      return res2;
    }
    setCache(cacheKey, res2);
    if (isString(res2)) return res2;
    return res2;
  }
  const [cs, v1, v2, v3, v4] = parseColorFunc(value, opt);
  if (REG_SPEC.test(format) || format === "mixValue" && cs === colorSpace) {
    const res2 = [
      cs,
      v1,
      v2,
      v3,
      v4
    ];
    setCache(cacheKey, res2);
    return res2;
  }
  const x = parseFloat(`${v1}`);
  const y = parseFloat(`${v2}`);
  const z = parseFloat(`${v3}`);
  const alpha = parseAlpha(`${v4}`);
  const [r, g, b] = transformXyzToRgb([
    x,
    y,
    z
  ], true);
  const res = [
    "rgb",
    r,
    g,
    b,
    alpha
  ];
  setCache(cacheKey, res);
  return res;
};
var convertColorToLinearRgb = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { colorSpace = "", format = "" } = opt;
  let cs = "";
  let r, g, b, alpha, x, y, z;
  if (format === "mixValue") {
    let xyz;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [cs, x, y, z, alpha] = xyz;
    if (cs === colorSpace) return [
      x,
      y,
      z,
      alpha
    ];
    [r, g, b] = transformMatrix(MATRIX_XYZ_TO_L_RGB, [
      x,
      y,
      z
    ], true);
  } else if (value.startsWith("color(")) {
    const [, val] = value.match(REG_FN_COLOR);
    const [cs2] = val.match(/[^\s,/]+/g);
    if (cs2 === "srgb-linear") [, r, g, b, alpha] = resolveColorFunc(value, { format: VAL_COMP });
    else {
      [, x, y, z, alpha] = parseColorFunc(value);
      [r, g, b] = transformMatrix(MATRIX_XYZ_TO_L_RGB, [
        x,
        y,
        z
      ], true);
    }
  } else {
    [, x, y, z, alpha] = parseColorValue(value);
    [r, g, b] = transformMatrix(MATRIX_XYZ_TO_L_RGB, [
      x,
      y,
      z
    ], true);
  }
  return [
    Math.min(Math.max(r, 0), 1),
    Math.min(Math.max(g, 0), 1),
    Math.min(Math.max(b, 0), 1),
    alpha
  ];
};
var convertColorToRgb = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let r, g, b, alpha;
  if (format === "mixValue") {
    let rgb;
    if (value.startsWith("color(")) rgb = resolveColorFunc(value, opt);
    else rgb = resolveColorValue(value, opt);
    if (rgb instanceof NullObject) return rgb;
    [, r, g, b, alpha] = rgb;
  } else if (value.startsWith("color(")) {
    const [, val] = value.match(REG_FN_COLOR);
    const [cs] = val.match(/[^\s,/]+/g);
    if (cs === "srgb") {
      [, r, g, b, alpha] = resolveColorFunc(value, { format: VAL_COMP });
      r *= MAX_RGB$1;
      g *= MAX_RGB$1;
      b *= MAX_RGB$1;
    } else [, r, g, b, alpha] = resolveColorFunc(value);
  } else if (/^(?:ok)?l(?:ab|ch)/.test(value)) {
    [r, g, b, alpha] = convertColorToLinearRgb(value);
    [r, g, b] = transformLinearRgbToRgb([
      r,
      g,
      b
    ]);
  } else [, r, g, b, alpha] = resolveColorValue(value, { format: VAL_COMP });
  return [
    r,
    g,
    b,
    alpha
  ];
};
var convertColorToXyz = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { d50 = false, format = "" } = opt;
  let x, y, z, alpha;
  if (format === "mixValue") {
    let xyz;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) {
    const [, val] = value.match(REG_FN_COLOR);
    const [cs] = val.match(/[^\s,/]+/g);
    if (d50) if (cs === "xyz-d50") [, x, y, z, alpha] = resolveColorFunc(value, { format: VAL_COMP });
    else [, x, y, z, alpha] = parseColorFunc(value, opt);
    else if (/^xyz(?:-d65)?$/.test(cs)) [, x, y, z, alpha] = resolveColorFunc(value, { format: VAL_COMP });
    else [, x, y, z, alpha] = parseColorFunc(value);
  } else [, x, y, z, alpha] = parseColorValue(value, opt);
  return [
    x,
    y,
    z,
    alpha
  ];
};
var convertColorToHsl = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let h, s, l, alpha;
  if (REG_HSL.test(value)) {
    [, h, s, l, alpha] = parseHsl(value, { format: "hsl" });
    if (format === "hsl") return [
      Math.round(h),
      Math.round(s),
      Math.round(l),
      alpha
    ];
    return [
      h,
      s,
      l,
      alpha
    ];
  }
  let x, y, z;
  if (format === "mixValue") {
    let xyz;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) [, x, y, z, alpha] = parseColorFunc(value);
  else [, x, y, z, alpha] = parseColorValue(value);
  [h, s, l] = transformXyzToHsl([
    x,
    y,
    z
  ], true);
  if (format === "hsl") return [
    Math.round(h),
    Math.round(s),
    Math.round(l),
    alpha
  ];
  return [
    format === "mixValue" && s === 0 ? NONE : h,
    s,
    l,
    alpha
  ];
};
var convertColorToHwb = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let h, w, b, alpha;
  if (REG_HWB.test(value)) {
    [, h, w, b, alpha] = parseHwb(value, { format: "hwb" });
    if (format === "hwb") return [
      Math.round(h),
      Math.round(w),
      Math.round(b),
      alpha
    ];
    return [
      h,
      w,
      b,
      alpha
    ];
  }
  let x, y, z;
  if (format === "mixValue") {
    let xyz;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) [, x, y, z, alpha] = parseColorFunc(value);
  else [, x, y, z, alpha] = parseColorValue(value);
  [h, w, b] = transformXyzToHwb([
    x,
    y,
    z
  ], true);
  if (format === "hwb") return [
    Math.round(h),
    Math.round(w),
    Math.round(b),
    alpha
  ];
  return [
    format === "mixValue" && w + b >= 100 ? NONE : h,
    w,
    b,
    alpha
  ];
};
var convertColorToLab = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let l, a, b, alpha;
  if (REG_LAB.test(value)) {
    [, l, a, b, alpha] = parseLab(value, { format: VAL_COMP });
    return [
      l,
      a,
      b,
      alpha
    ];
  }
  let x, y, z;
  if (format === "mixValue") {
    let xyz;
    opt.d50 = true;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) [, x, y, z, alpha] = parseColorFunc(value, { d50: true });
  else [, x, y, z, alpha] = parseColorValue(value, { d50: true });
  [l, a, b] = transformXyzD50ToLab([
    x,
    y,
    z
  ], true);
  return [
    l,
    a,
    b,
    alpha
  ];
};
var convertColorToLch = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let l, c2, h, alpha;
  if (REG_LCH.test(value)) {
    [, l, c2, h, alpha] = parseLch(value, { format: VAL_COMP });
    return [
      l,
      c2,
      h,
      alpha
    ];
  }
  let x, y, z;
  if (format === "mixValue") {
    let xyz;
    opt.d50 = true;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) [, x, y, z, alpha] = parseColorFunc(value, { d50: true });
  else [, x, y, z, alpha] = parseColorValue(value, { d50: true });
  [l, c2, h] = transformXyzD50ToLch([
    x,
    y,
    z
  ], true);
  return [
    l,
    c2,
    format === "mixValue" && c2 === 0 ? NONE : h,
    alpha
  ];
};
var convertColorToOklab = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let l, a, b, alpha;
  if (REG_OKLAB.test(value)) {
    [, l, a, b, alpha] = parseOklab(value, { format: VAL_COMP });
    return [
      l,
      a,
      b,
      alpha
    ];
  }
  let x, y, z;
  if (format === "mixValue") {
    let xyz;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) [, x, y, z, alpha] = parseColorFunc(value);
  else [, x, y, z, alpha] = parseColorValue(value);
  [l, a, b] = transformXyzToOklab([
    x,
    y,
    z
  ], true);
  return [
    l,
    a,
    b,
    alpha
  ];
};
var convertColorToOklch = (value, opt = {}) => {
  if (isString(value)) value = value.trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "" } = opt;
  let l, c2, h, alpha;
  if (REG_OKLCH.test(value)) {
    [, l, c2, h, alpha] = parseOklch(value, { format: VAL_COMP });
    return [
      l,
      c2,
      h,
      alpha
    ];
  }
  let x, y, z;
  if (format === "mixValue") {
    let xyz;
    if (value.startsWith("color(")) xyz = parseColorFunc(value, opt);
    else xyz = parseColorValue(value, opt);
    if (xyz instanceof NullObject) return xyz;
    [, x, y, z, alpha] = xyz;
  } else if (value.startsWith("color(")) [, x, y, z, alpha] = parseColorFunc(value);
  else [, x, y, z, alpha] = parseColorValue(value);
  [l, c2, h] = transformXyzToOklch([
    x,
    y,
    z
  ], true);
  return [
    l,
    c2,
    format === "mixValue" && c2 === 0 ? NONE : h,
    alpha
  ];
};
var resolveColorMix = (value, opt = {}) => {
  if (isString(value)) value = value.toLowerCase().trim();
  else throw new TypeError(`${value} is not a string.`);
  const { format = "", nullable = false } = opt;
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$6,
    name: "resolveColorMix",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    const cachedItem = cachedResult.item;
    if (isString(cachedItem)) return cachedItem;
    return cachedItem;
  }
  const nestedItems = [];
  let colorSpace = "";
  let hueArc = "";
  let colorA = "";
  let pctA = "";
  let colorB = "";
  let pctB = "";
  let parsed = false;
  if (!REG_MIX.test(value)) if (value.startsWith("color-mix(") && REG_MIX_NEST.test(value)) {
    const items = value.match(REG_MIX_NEST);
    for (const item of items) if (item) {
      let val = resolveColorMix(item, { format: format === "specifiedValue" ? format : VAL_COMP });
      if (Array.isArray(val)) {
        const [cs, v1, v2, v3, v4] = val;
        if (v1 === 0 && v2 === 0 && v3 === 0 && v4 === 0) {
          value = "";
          break;
        }
        if (REG_MIX_CS_RGB_XYZ.test(cs)) if (v4 === 1) val = `color(${cs} ${v1} ${v2} ${v3})`;
        else val = `color(${cs} ${v1} ${v2} ${v3} / ${v4})`;
        else if (v4 === 1) val = `${cs}(${v1} ${v2} ${v3})`;
        else val = `${cs}(${v1} ${v2} ${v3} / ${v4})`;
      } else if (!REG_MIX.test(val)) {
        value = "";
        break;
      }
      nestedItems.push(val);
      value = value.replace(item, val);
    }
    if (!value) return cacheInvalidColorValue(cacheKey, format, nullable);
  } else if (value.startsWith("color-mix(") && value.endsWith(")") && value.includes("light-dark(")) {
    const [csPart = "", partA = "", partB = ""] = splitValue(value.replace(FN_MIX, "").replace(/\)$/, ""), { delimiter: "," });
    const [colorPartA = "", pctPartA = ""] = splitValue(partA);
    const [colorPartB = "", pctPartB = ""] = splitValue(partB);
    const specifiedColorA = resolveColor(colorPartA, { format: VAL_SPEC });
    const specifiedColorB = resolveColor(colorPartB, { format: VAL_SPEC });
    if (REG_MIX_IN_CS.test(csPart) && specifiedColorA && specifiedColorB) if (format === "specifiedValue") {
      const [, cs] = csPart.match(REG_MIX_IN_CS);
      if (REG_CS_HUE.test(cs)) [, colorSpace, hueArc] = cs.match(REG_CS_HUE);
      else colorSpace = cs;
      colorA = specifiedColorA;
      if (pctPartA) pctA = pctPartA;
      colorB = specifiedColorB;
      if (pctPartB) pctB = pctPartB;
      value = value.replace(colorPartA, specifiedColorA).replace(colorPartB, specifiedColorB);
      parsed = true;
    } else {
      const resolvedColorA = resolveColor(colorPartA, opt);
      const resolvedColorB = resolveColor(colorPartB, opt);
      if (isString(resolvedColorA) && isString(resolvedColorB)) value = value.replace(colorPartA, resolvedColorA).replace(colorPartB, resolvedColorB);
    }
    else return cacheInvalidColorValue(cacheKey, format, nullable);
  } else return cacheInvalidColorValue(cacheKey, format, nullable);
  if (nestedItems.length && format === "specifiedValue") {
    const [, cs] = value.match(REG_MIX_START);
    if (REG_CS_HUE.test(cs)) [, colorSpace, hueArc] = cs.match(REG_CS_HUE);
    else colorSpace = cs;
    if (nestedItems.length === 2) {
      let [itemA, itemB] = nestedItems;
      itemA = itemA.replace(/(?=[()])/g, "\\");
      itemB = itemB.replace(/(?=[()])/g, "\\");
      const regA = new RegExp(`(${itemA})(?:\\s+(${PCT$1}))?`);
      const regB = new RegExp(`(${itemB})(?:\\s+(${PCT$1}))?`);
      [, colorA, pctA] = value.match(regA);
      [, colorB, pctB] = value.match(regB);
    } else {
      let [item] = nestedItems;
      item = item.replace(/(?=[()])/g, "\\");
      const itemPart = `${item}(?:\\s+${PCT$1})?`;
      const itemPartCapt = `(${item})(?:\\s+(${PCT$1}))?`;
      const regItemPart = new RegExp(`^${itemPartCapt}$`);
      if (new RegExp(`${itemPartCapt}\\s*\\)$`).test(value)) {
        const reg = new RegExp(`(${SYN_MIX_PART})\\s*,\\s*(${itemPart})\\s*\\)$`);
        const [, colorPartA, colorPartB] = value.match(reg);
        [, colorA, pctA] = colorPartA.match(REG_MIX_COLOR_PART);
        [, colorB, pctB] = colorPartB.match(regItemPart);
      } else {
        const reg = new RegExp(`(${itemPart})\\s*,\\s*(${SYN_MIX_PART})\\s*\\)$`);
        const [, colorPartA, colorPartB] = value.match(reg);
        [, colorA, pctA] = colorPartA.match(regItemPart);
        [, colorB, pctB] = colorPartB.match(REG_MIX_COLOR_PART);
      }
    }
  } else if (!parsed) {
    const [, cs, colorPartA, colorPartB] = value.match(REG_MIX_CAPT);
    [, colorA, pctA] = colorPartA.match(REG_MIX_COLOR_PART);
    [, colorB, pctB] = colorPartB.match(REG_MIX_COLOR_PART);
    if (REG_CS_HUE.test(cs)) [, colorSpace, hueArc] = cs.match(REG_CS_HUE);
    else colorSpace = cs;
  }
  let pA, pB, m;
  if (pctA && pctB) {
    const p1 = parseFloat(pctA) / MAX_PCT$2;
    const p2 = parseFloat(pctB) / MAX_PCT$2;
    if (p1 < 0 || p1 > 1 || p2 < 0 || p2 > 1 || p1 === 0 && p2 === 0) return cacheInvalidColorValue(cacheKey, format, nullable);
    const factor = p1 + p2;
    pA = p1 / factor;
    pB = p2 / factor;
    m = factor < 1 ? factor : 1;
  } else {
    if (pctA) {
      pA = parseFloat(pctA) / MAX_PCT$2;
      if (pA < 0 || pA > 1) return cacheInvalidColorValue(cacheKey, format, nullable);
      pB = 1 - pA;
    } else if (pctB) {
      pB = parseFloat(pctB) / MAX_PCT$2;
      if (pB < 0 || pB > 1) return cacheInvalidColorValue(cacheKey, format, nullable);
      pA = 1 - pB;
    } else {
      pA = HALF;
      pB = HALF;
    }
    m = 1;
  }
  if (colorSpace === "xyz") colorSpace = "xyz-d65";
  if (format === "specifiedValue") {
    let valueA = "";
    let valueB = "";
    if (colorA.startsWith("color-mix(") || colorA.startsWith("light-dark(")) valueA = colorA;
    else if (colorA.startsWith("color(")) {
      const [cs, v1, v2, v3, v4] = parseColorFunc(colorA, opt);
      if (v4 === 1) valueA = `color(${cs} ${v1} ${v2} ${v3})`;
      else valueA = `color(${cs} ${v1} ${v2} ${v3} / ${v4})`;
    } else {
      const val = parseColorValue(colorA, opt);
      if (Array.isArray(val)) {
        const [cs, v1, v2, v3, v4] = val;
        if (v4 === 1) if (cs === "rgb") valueA = `${cs}(${v1}, ${v2}, ${v3})`;
        else valueA = `${cs}(${v1} ${v2} ${v3})`;
        else if (cs === "rgb") valueA = `${cs}a(${v1}, ${v2}, ${v3}, ${v4})`;
        else valueA = `${cs}(${v1} ${v2} ${v3} / ${v4})`;
      } else {
        if (!isString(val) || !val) {
          setCache(cacheKey, "");
          return "";
        }
        valueA = val;
      }
    }
    if (colorB.startsWith("color-mix(") || colorB.startsWith("light-dark(")) valueB = colorB;
    else if (colorB.startsWith("color(")) {
      const [cs, v1, v2, v3, v4] = parseColorFunc(colorB, opt);
      if (v4 === 1) valueB = `color(${cs} ${v1} ${v2} ${v3})`;
      else valueB = `color(${cs} ${v1} ${v2} ${v3} / ${v4})`;
    } else {
      const val = parseColorValue(colorB, opt);
      if (Array.isArray(val)) {
        const [cs, v1, v2, v3, v4] = val;
        if (v4 === 1) if (cs === "rgb") valueB = `${cs}(${v1}, ${v2}, ${v3})`;
        else valueB = `${cs}(${v1} ${v2} ${v3})`;
        else if (cs === "rgb") valueB = `${cs}a(${v1}, ${v2}, ${v3}, ${v4})`;
        else valueB = `${cs}(${v1} ${v2} ${v3} / ${v4})`;
      } else {
        if (!isString(val) || !val) {
          setCache(cacheKey, "");
          return "";
        }
        valueB = val;
      }
    }
    if (pctA && pctB) {
      valueA += ` ${parseFloat(pctA)}%`;
      valueB += ` ${parseFloat(pctB)}%`;
    } else if (pctA) {
      const pA2 = parseFloat(pctA);
      if (pA2 !== MAX_PCT$2 * HALF) valueA += ` ${pA2}%`;
    } else if (pctB) {
      const pA2 = MAX_PCT$2 - parseFloat(pctB);
      if (pA2 !== MAX_PCT$2 * HALF) valueA += ` ${pA2}%`;
    }
    if (hueArc) {
      const res2 = `color-mix(in ${colorSpace} ${hueArc} hue, ${valueA}, ${valueB})`;
      setCache(cacheKey, res2);
      return res2;
    } else {
      const res2 = `color-mix(in ${colorSpace}, ${valueA}, ${valueB})`;
      setCache(cacheKey, res2);
      return res2;
    }
  }
  let r = 0;
  let g = 0;
  let b = 0;
  let alpha = 0;
  if (/^srgb(?:-linear)?$/.test(colorSpace)) {
    let rgbA, rgbB;
    if (colorSpace === "srgb") {
      if (REG_CURRENT.test(colorA)) rgbA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else rgbA = convertColorToRgb(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) rgbB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else rgbB = convertColorToRgb(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    } else {
      if (REG_CURRENT.test(colorA)) rgbA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else rgbA = convertColorToLinearRgb(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) rgbB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else rgbB = convertColorToLinearRgb(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    }
    if (rgbA instanceof NullObject || rgbB instanceof NullObject) return cacheInvalidColorValue(cacheKey, format, nullable);
    const [rrA, ggA, bbA, aaA] = rgbA;
    const [rrB, ggB, bbB, aaB] = rgbB;
    const rNone = rrA === "none" && rrB === "none";
    const gNone = ggA === "none" && ggB === "none";
    const bNone = bbA === "none" && bbB === "none";
    const alphaNone = aaA === "none" && aaB === "none";
    const [[rA, gA, bA, alphaA], [rB, gB, bB, alphaB]] = normalizeColorComponents([
      rrA,
      ggA,
      bbA,
      aaA
    ], [
      rrB,
      ggB,
      bbB,
      aaB
    ], true);
    const factorA = alphaA * pA;
    const factorB = alphaB * pB;
    alpha = factorA + factorB;
    if (alpha === 0) {
      r = rA * pA + rB * pB;
      g = gA * pA + gB * pB;
      b = bA * pA + bB * pB;
    } else {
      r = (rA * factorA + rB * factorB) / alpha;
      g = (gA * factorA + gB * factorB) / alpha;
      b = (bA * factorA + bB * factorB) / alpha;
      alpha = parseFloat(alpha.toFixed(3));
    }
    if (format === "computedValue") {
      const res2 = [
        colorSpace,
        rNone ? NONE : roundToPrecision(r, HEX$2),
        gNone ? NONE : roundToPrecision(g, HEX$2),
        bNone ? NONE : roundToPrecision(b, HEX$2),
        alphaNone ? NONE : alpha * m
      ];
      setCache(cacheKey, res2);
      return res2;
    }
    r *= MAX_RGB$1;
    g *= MAX_RGB$1;
    b *= MAX_RGB$1;
  } else if (REG_CS_XYZ.test(colorSpace)) {
    let xyzA, xyzB;
    if (REG_CURRENT.test(colorA)) xyzA = [
      NONE,
      NONE,
      NONE,
      NONE
    ];
    else xyzA = convertColorToXyz(colorA, {
      colorSpace,
      d50: colorSpace === "xyz-d50",
      format: VAL_MIX
    });
    if (REG_CURRENT.test(colorB)) xyzB = [
      NONE,
      NONE,
      NONE,
      NONE
    ];
    else xyzB = convertColorToXyz(colorB, {
      colorSpace,
      d50: colorSpace === "xyz-d50",
      format: VAL_MIX
    });
    if (xyzA instanceof NullObject || xyzB instanceof NullObject) return cacheInvalidColorValue(cacheKey, format, nullable);
    const [xxA, yyA, zzA, aaA] = xyzA;
    const [xxB, yyB, zzB, aaB] = xyzB;
    const xNone = xxA === "none" && xxB === "none";
    const yNone = yyA === "none" && yyB === "none";
    const zNone = zzA === "none" && zzB === "none";
    const alphaNone = aaA === "none" && aaB === "none";
    const [[xA, yA, zA, alphaA], [xB, yB, zB, alphaB]] = normalizeColorComponents([
      xxA,
      yyA,
      zzA,
      aaA
    ], [
      xxB,
      yyB,
      zzB,
      aaB
    ], true);
    const factorA = alphaA * pA;
    const factorB = alphaB * pB;
    alpha = factorA + factorB;
    let x, y, z;
    if (alpha === 0) {
      x = xA * pA + xB * pB;
      y = yA * pA + yB * pB;
      z = zA * pA + zB * pB;
    } else {
      x = (xA * factorA + xB * factorB) / alpha;
      y = (yA * factorA + yB * factorB) / alpha;
      z = (zA * factorA + zB * factorB) / alpha;
      alpha = parseFloat(alpha.toFixed(3));
    }
    if (format === "computedValue") {
      const res2 = [
        colorSpace,
        xNone ? NONE : roundToPrecision(x, HEX$2),
        yNone ? NONE : roundToPrecision(y, HEX$2),
        zNone ? NONE : roundToPrecision(z, HEX$2),
        alphaNone ? NONE : alpha * m
      ];
      setCache(cacheKey, res2);
      return res2;
    }
    if (colorSpace === "xyz-d50") [r, g, b] = transformXyzD50ToRgb([
      x,
      y,
      z
    ], true);
    else [r, g, b] = transformXyzToRgb([
      x,
      y,
      z
    ], true);
  } else if (/^h(?:sl|wb)$/.test(colorSpace)) {
    let hslA, hslB;
    if (colorSpace === "hsl") {
      if (REG_CURRENT.test(colorA)) hslA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else hslA = convertColorToHsl(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) hslB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else hslB = convertColorToHsl(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    } else {
      if (REG_CURRENT.test(colorA)) hslA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else hslA = convertColorToHwb(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) hslB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else hslB = convertColorToHwb(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    }
    if (hslA instanceof NullObject || hslB instanceof NullObject) return cacheInvalidColorValue(cacheKey, format, nullable);
    const [hhA, ssA, llA, aaA] = hslA;
    const [hhB, ssB, llB, aaB] = hslB;
    const alphaNone = aaA === "none" && aaB === "none";
    let [[hA, sA, lA, alphaA], [hB, sB, lB, alphaB]] = normalizeColorComponents([
      hhA,
      ssA,
      llA,
      aaA
    ], [
      hhB,
      ssB,
      llB,
      aaB
    ], true);
    if (hueArc) [hA, hB] = interpolateHue(hA, hB, hueArc);
    const factorA = alphaA * pA;
    const factorB = alphaB * pB;
    alpha = factorA + factorB;
    const h = (hA * pA + hB * pB) % DEG;
    let s, l;
    if (alpha === 0) {
      s = sA * pA + sB * pB;
      l = lA * pA + lB * pB;
    } else {
      s = (sA * factorA + sB * factorB) / alpha;
      l = (lA * factorA + lB * factorB) / alpha;
      alpha = parseFloat(alpha.toFixed(3));
    }
    [r, g, b] = convertColorToRgb(`${colorSpace}(${h} ${s} ${l})`);
    if (format === "computedValue") {
      const res2 = [
        "srgb",
        roundToPrecision(r / MAX_RGB$1, HEX$2),
        roundToPrecision(g / MAX_RGB$1, HEX$2),
        roundToPrecision(b / MAX_RGB$1, HEX$2),
        alphaNone ? NONE : alpha * m
      ];
      setCache(cacheKey, res2);
      return res2;
    }
  } else if (/^(?:ok)?lch$/.test(colorSpace)) {
    let lchA, lchB;
    if (colorSpace === "lch") {
      if (REG_CURRENT.test(colorA)) lchA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else lchA = convertColorToLch(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) lchB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else lchB = convertColorToLch(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    } else {
      if (REG_CURRENT.test(colorA)) lchA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else lchA = convertColorToOklch(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) lchB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else lchB = convertColorToOklch(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    }
    if (lchA instanceof NullObject || lchB instanceof NullObject) return cacheInvalidColorValue(cacheKey, format, nullable);
    const [llA, ccA, hhA, aaA] = lchA;
    const [llB, ccB, hhB, aaB] = lchB;
    const lNone = llA === "none" && llB === "none";
    const cNone = ccA === "none" && ccB === "none";
    const hNone = hhA === "none" && hhB === "none";
    const alphaNone = aaA === "none" && aaB === "none";
    let [[lA, cA, hA, alphaA], [lB, cB, hB, alphaB]] = normalizeColorComponents([
      llA,
      ccA,
      hhA,
      aaA
    ], [
      llB,
      ccB,
      hhB,
      aaB
    ], true);
    if (hueArc) [hA, hB] = interpolateHue(hA, hB, hueArc);
    const factorA = alphaA * pA;
    const factorB = alphaB * pB;
    alpha = factorA + factorB;
    const h = (hA * pA + hB * pB) % DEG;
    let l, c2;
    if (alpha === 0) {
      l = lA * pA + lB * pB;
      c2 = cA * pA + cB * pB;
    } else {
      l = (lA * factorA + lB * factorB) / alpha;
      c2 = (cA * factorA + cB * factorB) / alpha;
      alpha = parseFloat(alpha.toFixed(3));
    }
    if (format === "computedValue") {
      const res2 = [
        colorSpace,
        lNone ? NONE : roundToPrecision(l, HEX$2),
        cNone ? NONE : roundToPrecision(c2, HEX$2),
        hNone ? NONE : roundToPrecision(h, HEX$2),
        alphaNone ? NONE : alpha * m
      ];
      setCache(cacheKey, res2);
      return res2;
    }
    [, r, g, b] = resolveColorValue(`${colorSpace}(${l} ${c2} ${h})`);
  } else {
    let labA, labB;
    if (colorSpace === "lab") {
      if (REG_CURRENT.test(colorA)) labA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else labA = convertColorToLab(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) labB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else labB = convertColorToLab(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    } else {
      if (REG_CURRENT.test(colorA)) labA = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else labA = convertColorToOklab(colorA, {
        colorSpace,
        format: VAL_MIX
      });
      if (REG_CURRENT.test(colorB)) labB = [
        NONE,
        NONE,
        NONE,
        NONE
      ];
      else labB = convertColorToOklab(colorB, {
        colorSpace,
        format: VAL_MIX
      });
    }
    if (labA instanceof NullObject || labB instanceof NullObject) return cacheInvalidColorValue(cacheKey, format, nullable);
    const [llA, aaA, bbA, alA] = labA;
    const [llB, aaB, bbB, alB] = labB;
    const lNone = llA === "none" && llB === "none";
    const aNone = aaA === "none" && aaB === "none";
    const bNone = bbA === "none" && bbB === "none";
    const alphaNone = alA === "none" && alB === "none";
    const [[lA, aA, bA, alphaA], [lB, aB, bB, alphaB]] = normalizeColorComponents([
      llA,
      aaA,
      bbA,
      alA
    ], [
      llB,
      aaB,
      bbB,
      alB
    ], true);
    const factorA = alphaA * pA;
    const factorB = alphaB * pB;
    alpha = factorA + factorB;
    let l, aO, bO;
    if (alpha === 0) {
      l = lA * pA + lB * pB;
      aO = aA * pA + aB * pB;
      bO = bA * pA + bB * pB;
    } else {
      l = (lA * factorA + lB * factorB) / alpha;
      aO = (aA * factorA + aB * factorB) / alpha;
      bO = (bA * factorA + bB * factorB) / alpha;
      alpha = parseFloat(alpha.toFixed(3));
    }
    if (format === "computedValue") {
      const res2 = [
        colorSpace,
        lNone ? NONE : roundToPrecision(l, HEX$2),
        aNone ? NONE : roundToPrecision(aO, HEX$2),
        bNone ? NONE : roundToPrecision(bO, HEX$2),
        alphaNone ? NONE : alpha * m
      ];
      setCache(cacheKey, res2);
      return res2;
    }
    [, r, g, b] = resolveColorValue(`${colorSpace}(${l} ${aO} ${bO})`);
  }
  const res = [
    "rgb",
    Math.round(r),
    Math.round(g),
    Math.round(b),
    parseFloat((alpha * m).toFixed(3))
  ];
  setCache(cacheKey, res);
  return res;
};
var { CloseParen: PAREN_CLOSE$2, Comment: COMMENT$2, EOF: EOF$2, Ident: IDENT$1, Whitespace: W_SPACE$2 } = c;
var NAMESPACE$5 = "css-var";
var REG_FN_CALC$3 = new RegExp(SYN_FN_CALC);
var REG_FN_VAR$4 = new RegExp(SYN_FN_VAR);
var REG_CSS_WIDE_KEYWORD = /^(?:inherit|initial|revert(?:-layer)?|unset)$/;
function resolveCustomProperty(tokens, opt = {}) {
  if (!Array.isArray(tokens)) throw new TypeError(`${tokens} is not an array.`);
  const { customProperty = {} } = opt;
  const items = [];
  while (tokens.length) {
    const token = tokens.shift();
    if (!token) break;
    if (!Array.isArray(token)) throw new TypeError(`${token} is not an array.`);
    const [type, value] = token;
    if (type === PAREN_CLOSE$2) break;
    if (value === "var(") {
      const [, item] = resolveCustomProperty(tokens, opt);
      if (item) items.push(item);
    } else if (type === IDENT$1) {
      if (value.startsWith("--")) {
        let item;
        if (Object.hasOwn(customProperty, value)) item = customProperty[value];
        else if (typeof customProperty.callback === "function") item = customProperty.callback(value);
        if (item) items.push(item);
      } else if (value) items.push(value);
    }
  }
  let resolveAsColor = false;
  if (items.length > 1) resolveAsColor = isColor(items[items.length - 1]);
  let resolvedValue = "";
  for (let item of items) {
    item = item.trim();
    if (REG_FN_VAR$4.test(item)) {
      const resolvedItem = resolveVar(item, opt);
      if (isString(resolvedItem)) {
        if (!resolveAsColor || isColor(resolvedItem)) resolvedValue = resolvedItem;
      }
    } else if (REG_FN_CALC$3.test(item)) {
      item = cssCalc(item, opt);
      if (!resolveAsColor || isColor(item)) resolvedValue = item;
    } else if (item && !REG_CSS_WIDE_KEYWORD.test(item)) {
      if (!resolveAsColor || isColor(item)) resolvedValue = item;
    }
    if (resolvedValue) break;
  }
  return [tokens, resolvedValue];
}
function parseTokens$1(tokens, opt = {}) {
  const res = [];
  while (tokens.length) {
    const token = tokens.shift();
    if (!token) break;
    const [type = "", value = ""] = token;
    if (value === "var(") {
      const [, resolvedValue] = resolveCustomProperty(tokens, opt);
      if (!resolvedValue) return new NullObject();
      res.push(resolvedValue);
    } else switch (type) {
      case PAREN_CLOSE$2:
        if (res.length) if (res[res.length - 1] === " ") res[res.length - 1] = value;
        else res.push(value);
        else res.push(value);
        break;
      case W_SPACE$2:
        if (res.length) {
          const lastValue = res[res.length - 1];
          if (isString(lastValue) && !lastValue.endsWith("(") && lastValue !== " ") res.push(value);
        }
        break;
      default:
        if (type !== COMMENT$2 && type !== EOF$2) res.push(value);
    }
  }
  return res;
}
function resolveVar(value, opt = {}) {
  const { format = "" } = opt;
  if (isString(value)) {
    if (!REG_FN_VAR$4.test(value) || format === "specifiedValue") return value;
    value = value.trim();
  } else throw new TypeError(`${value} is not a string.`);
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$5,
    name: "resolveVar",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    return cachedResult.item;
  }
  const values = parseTokens$1(tokenize({ css: value }), opt);
  if (Array.isArray(values)) {
    let color2 = values.join("");
    if (REG_FN_CALC$3.test(color2)) color2 = cssCalc(color2, opt);
    setCache(cacheKey, color2);
    return color2;
  } else {
    setCache(cacheKey, null);
    return new NullObject();
  }
}
var cssVar = (value, opt = {}) => {
  const resolvedValue = resolveVar(value, opt);
  if (isString(resolvedValue)) return resolvedValue;
  return "";
};
var { CloseParen: PAREN_CLOSE$1, Comment: COMMENT$1, Dimension: DIM$1, EOF: EOF$1, Function: FUNC$1, OpenParen: PAREN_OPEN$1, Whitespace: W_SPACE$1 } = c;
var NAMESPACE$4 = "css-calc";
var TRIA = 3;
var HEX$1 = 16;
var MAX_PCT$1 = 100;
var REG_FN_CALC$2 = new RegExp(SYN_FN_CALC);
var REG_FN_CALC_NUM = new RegExp(`^calc\\((${NUM$1})\\)$`);
var REG_FN_MATH_START$1 = new RegExp(SYN_FN_MATH_START);
var REG_FN_VAR$3 = new RegExp(SYN_FN_VAR);
var REG_FN_VAR_START = new RegExp(SYN_FN_VAR_START);
var REG_OPERATOR = /\s[*+/-]\s/;
var REG_PAREN_OPEN = /\($/;
var REG_TYPE_DIM = new RegExp(`^(${NUM$1})(${ANGLE}|${LENGTH})$`);
var REG_TYPE_DIM_PCT = new RegExp(`^(${NUM$1})(${ANGLE}|${LENGTH}|%)$`);
var REG_TYPE_PCT = new RegExp(`^(${NUM$1})%$`);
var Calculator = class {
  #hasNum;
  #numSum;
  #numMul;
  #hasPct;
  #pctSum;
  #pctMul;
  #hasDim;
  #dimSum;
  #dimSub;
  #dimMul;
  #dimDiv;
  #hasEtc;
  #etcSum;
  #etcSub;
  #etcMul;
  #etcDiv;
  #calcOpts;
  /**
  * constructor
  */
  constructor() {
    this.#hasNum = false;
    this.#numSum = [];
    this.#numMul = [];
    this.#hasPct = false;
    this.#pctSum = [];
    this.#pctMul = [];
    this.#hasDim = false;
    this.#dimSum = [];
    this.#dimSub = [];
    this.#dimMul = [];
    this.#dimDiv = [];
    this.#hasEtc = false;
    this.#etcSum = [];
    this.#etcSub = [];
    this.#etcMul = [];
    this.#etcDiv = [];
    this.#calcOpts = { toCanonicalUnits: true };
  }
  get hasNum() {
    return this.#hasNum;
  }
  set hasNum(value) {
    this.#hasNum = !!value;
  }
  get numSum() {
    return this.#numSum;
  }
  get numMul() {
    return this.#numMul;
  }
  get hasPct() {
    return this.#hasPct;
  }
  set hasPct(value) {
    this.#hasPct = !!value;
  }
  get pctSum() {
    return this.#pctSum;
  }
  get pctMul() {
    return this.#pctMul;
  }
  get hasDim() {
    return this.#hasDim;
  }
  set hasDim(value) {
    this.#hasDim = !!value;
  }
  get dimSum() {
    return this.#dimSum;
  }
  get dimSub() {
    return this.#dimSub;
  }
  get dimMul() {
    return this.#dimMul;
  }
  get dimDiv() {
    return this.#dimDiv;
  }
  get hasEtc() {
    return this.#hasEtc;
  }
  set hasEtc(value) {
    this.#hasEtc = !!value;
  }
  get etcSum() {
    return this.#etcSum;
  }
  get etcSub() {
    return this.#etcSub;
  }
  get etcMul() {
    return this.#etcMul;
  }
  get etcDiv() {
    return this.#etcDiv;
  }
  /**
  * clear values
  * @returns void
  */
  clear() {
    this.#hasNum = false;
    this.#numSum.length = 0;
    this.#numMul.length = 0;
    this.#hasPct = false;
    this.#pctSum.length = 0;
    this.#pctMul.length = 0;
    this.#hasDim = false;
    this.#dimSum.length = 0;
    this.#dimSub.length = 0;
    this.#dimMul.length = 0;
    this.#dimDiv.length = 0;
    this.#hasEtc = false;
    this.#etcSum.length = 0;
    this.#etcSub.length = 0;
    this.#etcMul.length = 0;
    this.#etcDiv.length = 0;
  }
  /**
  * sort values
  * @param values - values
  * @returns sorted values
  */
  sort(values = []) {
    const arr = [...values];
    if (arr.length > 1) arr.sort((a, b) => {
      let res;
      if (REG_TYPE_DIM_PCT.test(a) && REG_TYPE_DIM_PCT.test(b)) {
        const [, valA, unitA] = a.match(REG_TYPE_DIM_PCT);
        const [, valB, unitB] = b.match(REG_TYPE_DIM_PCT);
        if (unitA === unitB) if (Number(valA) === Number(valB)) res = 0;
        else if (Number(valA) > Number(valB)) res = 1;
        else res = -1;
        else if (unitA > unitB) res = 1;
        else res = -1;
      } else if (a === b) res = 0;
      else if (a > b) res = 1;
      else res = -1;
      return res;
    });
    return arr;
  }
  /**
  * multiply values
  * @returns resolved value
  */
  multiply() {
    const value = [];
    let num;
    if (this.#hasNum) {
      num = 1;
      for (const i of this.#numMul) {
        num *= i;
        if (num === 0 || !Number.isFinite(num) || Number.isNaN(num)) break;
      }
      if (!this.#hasPct && !this.#hasDim && !this.hasEtc) {
        if (Number.isFinite(num)) num = roundToPrecision(num, HEX$1);
        value.push(num);
      }
    }
    if (this.#hasPct) {
      if (typeof num !== "number") num = 1;
      for (const i of this.#pctMul) {
        num *= i;
        if (num === 0 || !Number.isFinite(num) || Number.isNaN(num)) break;
      }
      if (Number.isFinite(num)) num = `${roundToPrecision(num, HEX$1)}%`;
      if (!this.#hasDim && !this.hasEtc) value.push(num);
    }
    if (this.#hasDim) {
      let dim = "";
      let mul = "";
      let div = "";
      if (this.#dimMul.length) if (this.#dimMul.length === 1) [mul] = this.#dimMul;
      else mul = `${this.sort(this.#dimMul).join(" * ")}`;
      if (this.#dimDiv.length) if (this.#dimDiv.length === 1) [div] = this.#dimDiv;
      else div = `${this.sort(this.#dimDiv).join(" * ")}`;
      if (Number.isFinite(num)) {
        if (mul) if (div) if (div.includes("*")) dim = calc(`calc(${num} * ${mul} / (${div}))`, this.#calcOpts);
        else dim = calc(`calc(${num} * ${mul} / ${div})`, this.#calcOpts);
        else dim = calc(`calc(${num} * ${mul})`, this.#calcOpts);
        else if (div.includes("*")) dim = calc(`calc(${num} / (${div}))`, this.#calcOpts);
        else dim = calc(`calc(${num} / ${div})`, this.#calcOpts);
        value.push(dim.replace(/^calc/, ""));
      } else {
        if (!value.length && num !== void 0) value.push(num);
        if (mul) {
          if (div) if (div.includes("*")) dim = calc(`calc(${mul} / (${div}))`, this.#calcOpts);
          else dim = calc(`calc(${mul} / ${div})`, this.#calcOpts);
          else dim = calc(`calc(${mul})`, this.#calcOpts);
          if (value.length) value.push("*", dim.replace(/^calc/, ""));
          else value.push(dim.replace(/^calc/, ""));
        } else {
          dim = calc(`calc(${div})`, this.#calcOpts);
          if (value.length) value.push("/", dim.replace(/^calc/, ""));
          else value.push("1", "/", dim.replace(/^calc/, ""));
        }
      }
    }
    if (this.#hasEtc) {
      if (this.#etcMul.length) {
        if (!value.length && num !== void 0) value.push(num);
        const mul = this.sort(this.#etcMul).join(" * ");
        if (value.length) value.push(`* ${mul}`);
        else value.push(`${mul}`);
      }
      if (this.#etcDiv.length) {
        const div = this.sort(this.#etcDiv).join(" * ");
        if (div.includes("*")) if (value.length) value.push(`/ (${div})`);
        else value.push(`1 / (${div})`);
        else if (value.length) value.push(`/ ${div}`);
        else value.push(`1 / ${div}`);
      }
    }
    if (value.length) return value.join(" ");
    return "";
  }
  /**
  * sum values
  * @returns resolved value
  */
  sum() {
    const value = [];
    if (this.#hasNum) {
      let num = 0;
      for (const i of this.#numSum) {
        num += i;
        if (!Number.isFinite(num) || Number.isNaN(num)) break;
      }
      value.push(num);
    }
    if (this.#hasPct) {
      let num = 0;
      for (const i of this.#pctSum) {
        num += i;
        if (!Number.isFinite(num)) break;
      }
      if (Number.isFinite(num)) num = `${num}%`;
      if (value.length) value.push(`+ ${num}`);
      else value.push(num);
    }
    if (this.#hasDim) {
      let dim, sum, sub;
      if (this.#dimSum.length) sum = this.sort(this.#dimSum).join(" + ");
      if (this.#dimSub.length) sub = this.sort(this.#dimSub).join(" + ");
      if (sum) if (sub) if (sub.includes("-")) dim = calc(`calc(${sum} - (${sub}))`, this.#calcOpts);
      else dim = calc(`calc(${sum} - ${sub})`, this.#calcOpts);
      else dim = calc(`calc(${sum})`, this.#calcOpts);
      else dim = calc(`calc(-1 * (${sub}))`, this.#calcOpts);
      if (value.length) value.push("+", dim.replace(/^calc/, ""));
      else value.push(dim.replace(/^calc/, ""));
    }
    if (this.#hasEtc) {
      if (this.#etcSum.length) {
        const sum = this.sort(this.#etcSum).map((item) => {
          let res;
          if (REG_OPERATOR.test(item) && !item.startsWith("(") && !item.endsWith(")")) res = `(${item})`;
          else res = item;
          return res;
        }).join(" + ");
        if (value.length) if (this.#etcSum.length > 1) value.push(`+ (${sum})`);
        else value.push(`+ ${sum}`);
        else value.push(`${sum}`);
      }
      if (this.#etcSub.length) {
        const sub = this.sort(this.#etcSub).map((item) => {
          let res;
          if (REG_OPERATOR.test(item) && !item.startsWith("(") && !item.endsWith(")")) res = `(${item})`;
          else res = item;
          return res;
        }).join(" + ");
        if (value.length) if (this.#etcSub.length > 1) value.push(`- (${sub})`);
        else value.push(`- ${sub}`);
        else if (this.#etcSub.length > 1) value.push(`-1 * (${sub})`);
        else value.push(`-1 * ${sub}`);
      }
    }
    if (value.length) return value.join(" ");
    return "";
  }
};
var sortCalcValues = (values = [], finalize = false) => {
  if (values.length < TRIA) throw new Error(`Unexpected array length ${values.length}.`);
  const start = values.shift();
  if (!isString(start) || !start.endsWith("(")) throw new Error(`Unexpected token ${start}.`);
  const end = values.pop();
  if (end !== ")") throw new Error(`Unexpected token ${end}.`);
  if (values.length === 1) {
    const [value] = values;
    if (!isStringOrNumber(value)) throw new Error(`Unexpected token ${value}.`);
    return `${start}${value}${end}`;
  }
  const sortedValues = [];
  const cal = new Calculator();
  let operator = "";
  const l = values.length;
  let hasAddSub = false;
  for (let i = 0; i < l; i++) {
    const value = values[i];
    if (!isStringOrNumber(value)) throw new Error(`Unexpected token ${value}.`);
    if (value === "*" || value === "/") operator = value;
    else if (value === "+" || value === "-") {
      const sortedValue = cal.multiply();
      if (sortedValue) sortedValues.push(sortedValue, value);
      hasAddSub = true;
      cal.clear();
      operator = "";
    } else {
      const numValue = Number(value);
      const strValue = `${value}`;
      switch (operator) {
        case "/":
          if (Number.isFinite(numValue)) {
            cal.hasNum = true;
            cal.numMul.push(1 / numValue);
          } else if (REG_TYPE_PCT.test(strValue)) {
            const [, val] = strValue.match(REG_TYPE_PCT);
            cal.hasPct = true;
            cal.pctMul.push(MAX_PCT$1 * MAX_PCT$1 / Number(val));
          } else if (REG_TYPE_DIM.test(strValue)) {
            cal.hasDim = true;
            cal.dimDiv.push(strValue);
          } else {
            cal.hasEtc = true;
            cal.etcDiv.push(strValue);
          }
          break;
        default:
          if (Number.isFinite(numValue)) {
            cal.hasNum = true;
            cal.numMul.push(numValue);
          } else if (REG_TYPE_PCT.test(strValue)) {
            const [, val] = strValue.match(REG_TYPE_PCT);
            cal.hasPct = true;
            cal.pctMul.push(Number(val));
          } else if (REG_TYPE_DIM.test(strValue)) {
            cal.hasDim = true;
            cal.dimMul.push(strValue);
          } else {
            cal.hasEtc = true;
            cal.etcMul.push(strValue);
          }
      }
    }
    if (i === l - 1) {
      const sortedValue = cal.multiply();
      if (sortedValue) sortedValues.push(sortedValue);
      cal.clear();
      operator = "";
    }
  }
  let resolvedValue = "";
  if (finalize && hasAddSub) {
    const finalizedValues = [];
    cal.clear();
    operator = "";
    const l2 = sortedValues.length;
    for (let i = 0; i < l2; i++) {
      const value = sortedValues[i];
      if (isStringOrNumber(value)) if (value === "+" || value === "-") operator = value;
      else {
        const numValue = Number(value);
        const strValue = `${value}`;
        switch (operator) {
          case "-":
            if (Number.isFinite(numValue)) {
              cal.hasNum = true;
              cal.numSum.push(-1 * numValue);
            } else if (REG_TYPE_PCT.test(strValue)) {
              const [, val] = strValue.match(REG_TYPE_PCT);
              cal.hasPct = true;
              cal.pctSum.push(-1 * Number(val));
            } else if (REG_TYPE_DIM.test(strValue)) {
              cal.hasDim = true;
              cal.dimSub.push(strValue);
            } else {
              cal.hasEtc = true;
              cal.etcSub.push(strValue);
            }
            break;
          default:
            if (Number.isFinite(numValue)) {
              cal.hasNum = true;
              cal.numSum.push(numValue);
            } else if (REG_TYPE_PCT.test(strValue)) {
              const [, val] = strValue.match(REG_TYPE_PCT);
              cal.hasPct = true;
              cal.pctSum.push(Number(val));
            } else if (REG_TYPE_DIM.test(strValue)) {
              cal.hasDim = true;
              cal.dimSum.push(strValue);
            } else {
              cal.hasEtc = true;
              cal.etcSum.push(strValue);
            }
        }
      }
      if (i === l2 - 1) {
        const sortedValue = cal.sum();
        if (sortedValue) finalizedValues.push(sortedValue);
        cal.clear();
        operator = "";
      }
    }
    resolvedValue = finalizedValues.join(" ").replace(/\+\s-/g, "- ");
  } else resolvedValue = sortedValues.join(" ").replace(/\+\s-/g, "- ");
  if (resolvedValue.startsWith("(") && resolvedValue.endsWith(")") && resolvedValue.lastIndexOf("(") === 0 && resolvedValue.indexOf(")") === resolvedValue.length - 1) resolvedValue = resolvedValue.substring(1, resolvedValue.length - 1);
  return `${start}${resolvedValue}${end}`;
};
var resolveNode = (node, isRoot) => {
  const flatItems = [];
  for (const item of node) if (Array.isArray(item)) flatItems.push(resolveNode(item, false));
  else flatItems.push(item);
  if (isRoot) {
    if (flatItems.length >= TRIA) return sortCalcValues(flatItems, true);
    const joined = flatItems.join("");
    return joined.startsWith("calc(") ? joined : `calc(${joined})`;
  }
  if (flatItems.length >= TRIA) {
    let serialized = sortCalcValues(flatItems, false);
    if (REG_FN_VAR_START.test(serialized)) serialized = calc(serialized, { toCanonicalUnits: true });
    return serialized;
  }
  return flatItems.join("");
};
var serializeCalc = (value, opt = {}) => {
  const { format = "" } = opt;
  if (isString(value)) {
    if (!REG_FN_VAR_START.test(value) || format !== "specifiedValue") return value;
    value = value.toLowerCase().trim();
  } else throw new TypeError(`${value} is not a string.`);
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$4,
    name: "serializeCalc",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) return cachedResult.item;
  const items = tokenize({ css: value }).map((token) => {
    const [type, val] = token;
    let res = "";
    if (type !== W_SPACE$1 && type !== COMMENT$1) res = val;
    return res;
  }).filter((v) => v);
  const stack = [[]];
  for (const item of items) if (REG_PAREN_OPEN.test(item)) {
    const newNode = [item];
    const parent = stack[stack.length - 1];
    if (parent) parent.push(newNode);
    stack.push(newNode);
  } else if (item === ")") if (stack.length > 1) {
    const currentLevel = stack.pop();
    if (currentLevel) currentLevel.push(item);
  } else {
    const root = stack[0];
    if (root) root.push(item);
  }
  else {
    const parent = stack[stack.length - 1];
    if (parent) parent.push(item);
  }
  let serializedCalc = "";
  const rootItems = stack[0];
  if (rootItems) if (rootItems.length === 1 && Array.isArray(rootItems[0])) serializedCalc = resolveNode(rootItems[0], true);
  else {
    const flatItems = [];
    for (const item of rootItems) if (Array.isArray(item)) flatItems.push(resolveNode(item, false));
    else flatItems.push(item);
    if (flatItems.length >= TRIA) serializedCalc = sortCalcValues(flatItems, true);
    else {
      const firstItem = flatItems[0] || "";
      serializedCalc = isString(firstItem) && firstItem.startsWith("calc(") ? firstItem : `calc(${firstItem})`;
    }
  }
  setCache(cacheKey, serializedCalc);
  return serializedCalc;
};
var resolveDimension = (token, opt = {}) => {
  if (!Array.isArray(token)) throw new TypeError(`${token} is not an array.`);
  const [, , , , detail = {}] = token;
  const { unit, value } = detail;
  if (unit === "px") return `${value}${unit}`;
  const pixelValue = resolveLengthInPixels(Number(value), unit, opt);
  if (Number.isFinite(pixelValue)) return `${roundToPrecision(pixelValue, HEX$1)}px`;
  return new NullObject();
};
var parseTokens = (tokens, opt = {}) => {
  if (!Array.isArray(tokens)) throw new TypeError(`${tokens} is not an array.`);
  const { format = "" } = opt;
  const mathFunc = /* @__PURE__ */ new Set();
  let nest = 0;
  const res = [];
  for (const token of tokens) {
    if (!Array.isArray(token)) throw new TypeError(`${token} is not an array.`);
    const [type = "", value = ""] = token;
    switch (type) {
      case DIM$1:
        if (format === "specifiedValue" && !mathFunc.has(nest)) res.push(value);
        else {
          const resolvedValue = resolveDimension(token, opt);
          if (isString(resolvedValue)) res.push(resolvedValue);
          else res.push(value);
        }
        break;
      case FUNC$1:
      case PAREN_OPEN$1:
        res.push(value);
        nest++;
        if (REG_FN_MATH_START$1.test(value)) mathFunc.add(nest);
        break;
      case PAREN_CLOSE$1:
        if (res.length) if (res[res.length - 1] === " ") res.splice(-1, 1, value);
        else res.push(value);
        else res.push(value);
        if (mathFunc.has(nest)) mathFunc.delete(nest);
        nest--;
        break;
      case W_SPACE$1:
        if (res.length) {
          const lastValue = res[res.length - 1];
          if (isString(lastValue) && !lastValue.endsWith("(") && lastValue !== " ") res.push(value);
        }
        break;
      default:
        if (type !== COMMENT$1 && type !== EOF$1) res.push(value);
    }
  }
  return res;
};
var cssCalc = (value, opt = {}) => {
  const { format = "" } = opt;
  if (isString(value)) {
    if (REG_FN_VAR$3.test(value)) if (format === "specifiedValue") return value;
    else {
      const resolvedValue2 = resolveVar(value, opt);
      if (isString(resolvedValue2)) return resolvedValue2;
      else return "";
    }
    else if (!REG_FN_CALC$2.test(value)) return value;
    value = value.toLowerCase().trim();
  } else throw new TypeError(`${value} is not a string.`);
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$4,
    name: "cssCalc",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) return cachedResult.item;
  let resolvedValue = calc(parseTokens(tokenize({ css: value }), opt).join(""), { toCanonicalUnits: true });
  if (REG_FN_VAR_START.test(value)) {
    if (REG_TYPE_DIM_PCT.test(resolvedValue)) {
      const [, val, unit] = resolvedValue.match(REG_TYPE_DIM_PCT);
      resolvedValue = `${roundToPrecision(Number(val), HEX$1)}${unit}`;
    }
    if (resolvedValue && !REG_FN_VAR_START.test(resolvedValue) && format === "specifiedValue") resolvedValue = `calc(${resolvedValue})`;
  }
  if (format === "specifiedValue") {
    if (/\s[-+*/]\s/.test(resolvedValue) && !resolvedValue.includes("NaN")) resolvedValue = serializeCalc(resolvedValue, opt);
    else if (REG_FN_CALC_NUM.test(resolvedValue)) {
      const [, val] = resolvedValue.match(REG_FN_CALC_NUM);
      resolvedValue = `calc(${roundToPrecision(Number(val), HEX$1)})`;
    }
  }
  setCache(cacheKey, resolvedValue);
  return resolvedValue;
};
var { CloseParen: PAREN_CLOSE, Comment: COMMENT, Delim: DELIM, Dimension: DIM, EOF, Function: FUNC, Ident: IDENT, Number: NUM, OpenParen: PAREN_OPEN, Percentage: PCT, Whitespace: W_SPACE } = c;
var { HasNoneKeywords: KEY_NONE } = me;
var NAMESPACE$3 = "relative-color";
var OCT = 8;
var DEC = 10;
var HEX = 16;
var MAX_PCT = 100;
var MAX_RGB = 255;
var COLOR_CHANNELS = /* @__PURE__ */ new Map([
  ["color", [
    "r",
    "g",
    "b",
    "alpha"
  ]],
  ["hsl", [
    "h",
    "s",
    "l",
    "alpha"
  ]],
  ["hsla", [
    "h",
    "s",
    "l",
    "alpha"
  ]],
  ["hwb", [
    "h",
    "w",
    "b",
    "alpha"
  ]],
  ["lab", [
    "l",
    "a",
    "b",
    "alpha"
  ]],
  ["lch", [
    "l",
    "c",
    "h",
    "alpha"
  ]],
  ["oklab", [
    "l",
    "a",
    "b",
    "alpha"
  ]],
  ["oklch", [
    "l",
    "c",
    "h",
    "alpha"
  ]],
  ["rgb", [
    "r",
    "g",
    "b",
    "alpha"
  ]],
  ["rgba", [
    "r",
    "g",
    "b",
    "alpha"
  ]]
]);
var REG_COLOR_CAPT = new RegExp(`^${FN_REL}(${SYN_COLOR_TYPE}|${SYN_MIX})\\s+`);
var REG_CS_HSL = /(?:hsla?|hwb)$/;
var REG_CS_CIE = new RegExp(`^(?:${CS_LAB}|${CS_LCH})$`);
var REG_FN_CALC_SUM = /^(?:abs|sig?n|cos|tan)\(/;
var REG_FN_MATH_START = new RegExp(SYN_FN_MATH_START);
var REG_FN_REL$2 = new RegExp(FN_REL);
var REG_FN_REL_CAPT = new RegExp(`^${FN_REL_CAPT}`);
var REG_FN_REL_START = new RegExp(`^${FN_REL}`);
var REG_FN_VAR$2 = new RegExp(SYN_FN_VAR);
function resolveColorChannels(tokens, opt = {}) {
  if (!Array.isArray(tokens)) throw new TypeError(`${tokens} is not an array.`);
  const { colorSpace = "", format = "" } = opt;
  const colorChannel = COLOR_CHANNELS.get(colorSpace);
  if (!colorChannel) return new NullObject();
  const mathFunc = /* @__PURE__ */ new Set();
  const channels = [
    [],
    [],
    [],
    []
  ];
  let i = 0;
  let nest = 0;
  let func = "";
  let precededPct = false;
  for (const token of tokens) {
    if (!Array.isArray(token)) throw new TypeError(`${token} is not an array.`);
    const [type, value, , , detail] = token;
    const channel = channels[i];
    if (Array.isArray(channel)) switch (type) {
      case DELIM:
        if (func) {
          if ((value === "+" || value === "-") && precededPct && !REG_FN_CALC_SUM.test(func)) return new NullObject();
          precededPct = false;
          channel.push(value);
        }
        break;
      case DIM: {
        if (!func || !REG_FN_CALC_SUM.test(func)) return new NullObject();
        const resolvedValue = resolveDimension(token, opt);
        if (isString(resolvedValue)) channel.push(resolvedValue);
        else channel.push(value);
        break;
      }
      case FUNC:
        channel.push(value);
        func = value;
        nest++;
        if (REG_FN_MATH_START.test(value)) mathFunc.add(nest);
        break;
      case IDENT:
        if (!colorChannel.includes(value)) return new NullObject();
        channel.push(value);
        if (!func) i++;
        break;
      case NUM:
        channel.push(Number(detail?.value));
        if (!func) i++;
        break;
      case PAREN_OPEN:
        channel.push(value);
        nest++;
        break;
      case PAREN_CLOSE:
        if (func) {
          if (channel[channel.length - 1] === " ") channel[channel.length - 1] = value;
          else channel.push(value);
          if (mathFunc.has(nest)) mathFunc.delete(nest);
          nest--;
          if (nest === 0) {
            func = "";
            i++;
          }
        }
        break;
      case PCT:
        if (!func) return new NullObject();
        else if (!REG_FN_CALC_SUM.test(func)) {
          let lastValue;
          for (let j = channel.length - 1; j >= 0; j--) if (channel[j] !== " ") {
            lastValue = channel[j];
            break;
          }
          if (lastValue === "+" || lastValue === "-") return new NullObject();
          else if (lastValue === "*" || lastValue === "/") precededPct = false;
          else precededPct = true;
        }
        channel.push(Number(detail?.value) / MAX_PCT);
        break;
      case W_SPACE:
        if (channel.length && func) {
          const lastValue = channel[channel.length - 1];
          if (typeof lastValue === "number") channel.push(value);
          else if (isString(lastValue) && !lastValue.endsWith("(") && lastValue !== " ") channel.push(value);
        }
        break;
      default:
        if (type !== COMMENT && type !== EOF && func) channel.push(value);
    }
  }
  const channelValues = [];
  for (const channel of channels) if (channel.length === 1) {
    const [resolvedValue] = channel;
    if (isStringOrNumber(resolvedValue)) channelValues.push(resolvedValue);
  } else if (channel.length) {
    const resolvedValue = serializeCalc(channel.join(""), { format });
    channelValues.push(resolvedValue);
  }
  return channelValues;
}
function extractOriginColor(value, opt = {}) {
  const { colorScheme = "normal", currentColor = "", format = "" } = opt;
  if (isString(value)) {
    value = value.toLowerCase().trim();
    if (!value) return new NullObject();
    if (!REG_FN_REL_START.test(value)) return value;
  } else return new NullObject();
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$3,
    name: "extractOriginColor",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    return cachedResult.item;
  }
  if (/currentcolor/.test(value)) if (currentColor) value = value.replace(/currentcolor/g, currentColor);
  else {
    setCache(cacheKey, null);
    return new NullObject();
  }
  let colorSpace = "";
  if (REG_FN_REL_CAPT.test(value)) [, colorSpace] = value.match(REG_FN_REL_CAPT);
  opt.colorSpace = colorSpace;
  if (value.includes("light-dark(")) {
    const [, originColor = ""] = splitValue(value.replace(new RegExp(`^${colorSpace}\\(`), "").replace(/\)$/, ""));
    const specifiedOriginColor = resolveColor(originColor, {
      colorScheme,
      format: VAL_SPEC
    });
    if (specifiedOriginColor === "") {
      setCache(cacheKey, null);
      return new NullObject();
    }
    if (format === "specifiedValue") value = value.replace(originColor, specifiedOriginColor);
    else {
      const resolvedOriginColor = resolveColor(specifiedOriginColor, opt);
      if (isString(resolvedOriginColor)) value = value.replace(originColor, resolvedOriginColor);
    }
  }
  if (REG_COLOR_CAPT.test(value)) {
    const [, originColor] = value.match(REG_COLOR_CAPT);
    const [, restValue] = value.split(originColor);
    if (/^[a-z]+$/.test(originColor)) {
      if (!/^transparent$/.test(originColor) && !Object.hasOwn(NAMED_COLORS, originColor)) {
        setCache(cacheKey, null);
        return new NullObject();
      }
    } else if (format === "specifiedValue") {
      const resolvedOriginColor = resolveColor(originColor, opt);
      if (isString(resolvedOriginColor)) value = value.replace(originColor, resolvedOriginColor);
    }
    if (format === "specifiedValue") {
      const channelValues = resolveColorChannels(tokenize({ css: restValue }), opt);
      if (channelValues instanceof NullObject) {
        setCache(cacheKey, null);
        return channelValues;
      }
      const [v1, v2, v3, v4] = channelValues;
      let channelValue = "";
      if (isStringOrNumber(v4)) channelValue = ` ${v1} ${v2} ${v3} / ${v4})`;
      else channelValue = ` ${channelValues.join(" ")})`;
      if (restValue !== channelValue) value = value.replace(restValue, channelValue);
    }
  } else {
    const [, restValue] = value.split(REG_FN_REL_START);
    const tokens = tokenize({ css: restValue });
    const originColor = [];
    let nest = 0;
    let tokenIndex = 0;
    for (const [type, tokenValue] of tokens) {
      tokenIndex++;
      switch (type) {
        case FUNC:
        case PAREN_OPEN:
          originColor.push(tokenValue);
          nest++;
          break;
        case PAREN_CLOSE: {
          const lastValue = originColor[originColor.length - 1];
          if (lastValue === " ") originColor[originColor.length - 1] = tokenValue;
          else if (isString(lastValue)) originColor.push(tokenValue);
          nest--;
          break;
        }
        case W_SPACE: {
          const lastValue = originColor[originColor.length - 1];
          if (isString(lastValue) && !lastValue.endsWith("(") && lastValue !== " ") originColor.push(tokenValue);
          break;
        }
        default:
          if (type !== COMMENT && type !== EOF) originColor.push(tokenValue);
      }
      if (nest === 0) break;
    }
    const resolvedOriginColor = resolveRelativeColor(originColor.join("").trim(), opt);
    if (resolvedOriginColor instanceof NullObject) {
      setCache(cacheKey, null);
      return resolvedOriginColor;
    }
    const channelValues = resolveColorChannels(tokens.slice(tokenIndex), opt);
    if (channelValues instanceof NullObject) {
      setCache(cacheKey, null);
      return channelValues;
    }
    const [v1, v2, v3, v4] = channelValues;
    let channelValue = "";
    if (isStringOrNumber(v4)) channelValue = ` ${v1} ${v2} ${v3} / ${v4})`;
    else channelValue = ` ${channelValues.join(" ")})`;
    value = value.replace(restValue, `${resolvedOriginColor}${channelValue}`);
  }
  setCache(cacheKey, value);
  return value;
}
function resolveRelativeColor(value, opt = {}) {
  const { format = "" } = opt;
  if (isString(value)) {
    if (REG_FN_VAR$2.test(value)) {
      if (format !== "specifiedValue") throw new SyntaxError(`Unexpected token ${FN_VAR} found.`);
      return value;
    } else if (!REG_FN_REL$2.test(value)) return value;
    value = value.toLowerCase().trim();
  } else throw new TypeError(`${value} is not a string.`);
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$3,
    name: "resolveRelativeColor",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    return cachedResult.item;
  }
  const originColor = extractOriginColor(value, opt);
  if (originColor instanceof NullObject) {
    setCache(cacheKey, null);
    return originColor;
  }
  value = originColor;
  if (format === "specifiedValue") {
    if (value.startsWith("rgba(")) value = value.replace("rgba(", "rgb(");
    else if (value.startsWith("hsla(")) value = value.replace("hsla(", "hsl(");
    return value;
  }
  const parsedComponents = color(parseComponentValue(tokenize({ css: value })));
  if (!parsedComponents) {
    setCache(cacheKey, null);
    return new NullObject();
  }
  const { alpha: alphaComponent, channels: channelsComponent, colorNotation, syntaxFlags } = parsedComponents;
  let alpha;
  if (Number.isNaN(Number(alphaComponent))) if (syntaxFlags instanceof Set && syntaxFlags.has(KEY_NONE)) alpha = NONE;
  else alpha = 0;
  else alpha = roundToPrecision(Number(alphaComponent), OCT);
  let v1;
  let v2;
  let v3;
  [v1, v2, v3] = channelsComponent;
  let resolvedValue;
  if (REG_CS_CIE.test(colorNotation)) {
    const hasNone = syntaxFlags instanceof Set && syntaxFlags.has(KEY_NONE);
    if (Number.isNaN(v1)) if (hasNone) v1 = NONE;
    else v1 = 0;
    else v1 = roundToPrecision(v1, HEX);
    if (Number.isNaN(v2)) if (hasNone) v2 = NONE;
    else v2 = 0;
    else v2 = roundToPrecision(v2, HEX);
    if (Number.isNaN(v3)) if (hasNone) v3 = NONE;
    else v3 = 0;
    else v3 = roundToPrecision(v3, HEX);
    if (alpha === 1) resolvedValue = `${colorNotation}(${v1} ${v2} ${v3})`;
    else resolvedValue = `${colorNotation}(${v1} ${v2} ${v3} / ${alpha})`;
  } else if (REG_CS_HSL.test(colorNotation)) {
    if (Number.isNaN(v1)) v1 = 0;
    if (Number.isNaN(v2)) v2 = 0;
    if (Number.isNaN(v3)) v3 = 0;
    let [r, g, b] = convertColorToRgb(`${colorNotation}(${v1} ${v2} ${v3} / ${alpha})`);
    r = roundToPrecision(r / MAX_RGB, DEC);
    g = roundToPrecision(g / MAX_RGB, DEC);
    b = roundToPrecision(b / MAX_RGB, DEC);
    if (alpha === 1) resolvedValue = `color(srgb ${r} ${g} ${b})`;
    else resolvedValue = `color(srgb ${r} ${g} ${b} / ${alpha})`;
  } else {
    const cs = colorNotation === "rgb" ? "srgb" : colorNotation;
    const hasNone = syntaxFlags instanceof Set && syntaxFlags.has(KEY_NONE);
    if (Number.isNaN(v1)) if (hasNone) v1 = NONE;
    else v1 = 0;
    else v1 = roundToPrecision(v1, DEC);
    if (Number.isNaN(v2)) if (hasNone) v2 = NONE;
    else v2 = 0;
    else v2 = roundToPrecision(v2, DEC);
    if (Number.isNaN(v3)) if (hasNone) v3 = NONE;
    else v3 = 0;
    else v3 = roundToPrecision(v3, DEC);
    if (alpha === 1) resolvedValue = `color(${cs} ${v1} ${v2} ${v3})`;
    else resolvedValue = `color(${cs} ${v1} ${v2} ${v3} / ${alpha})`;
  }
  setCache(cacheKey, resolvedValue);
  return resolvedValue;
}
var NAMESPACE$2 = "resolve";
var RGB_TRANSPARENT = "rgba(0, 0, 0, 0)";
var REG_FN_CALC$1 = new RegExp(SYN_FN_CALC);
var REG_FN_LIGHT_DARK = new RegExp(SYN_FN_LIGHT_DARK);
var REG_FN_REL$1 = new RegExp(SYN_FN_REL);
var REG_FN_VAR$1 = new RegExp(SYN_FN_VAR);
var resolveColor = (value, opt = {}) => {
  if (!isString(value)) throw new TypeError(`${value} is not a string.`);
  value = value.trim();
  const { colorScheme = "normal", currentColor = "", format = VAL_COMP, nullable = false } = opt;
  const cacheKey = createCacheKey({
    namespace: NAMESPACE$2,
    name: "resolve",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    return cachedResult.item;
  }
  if (REG_FN_VAR$1.test(value)) {
    if (format === "specifiedValue") {
      setCache(cacheKey, value);
      return value;
    }
    const resolvedVar = resolveVar(value, opt);
    if (resolvedVar instanceof NullObject) {
      const res = format === "hex" || format === "hexAlpha" || nullable ? resolvedVar : RGB_TRANSPARENT;
      setCache(cacheKey, res);
      return res;
    }
    value = resolvedVar;
  }
  if (opt.format !== format) opt.format = format;
  value = value.toLowerCase();
  if (REG_FN_LIGHT_DARK.test(value) && value.endsWith(")")) {
    const [light = "", dark = ""] = splitValue(value.replace(REG_FN_LIGHT_DARK, "").replace(/\)$/, ""), { delimiter: "," });
    if (light && dark) {
      if (format === "specifiedValue") {
        const lightColor = resolveColor(light, opt);
        const darkColor = resolveColor(dark, opt);
        const res2 = lightColor && darkColor ? `light-dark(${lightColor}, ${darkColor})` : "";
        setCache(cacheKey, res2);
        return res2;
      }
      const resolved = resolveColor(colorScheme === "dark" ? dark : light, opt);
      const res = resolved instanceof NullObject && !nullable ? RGB_TRANSPARENT : resolved;
      setCache(cacheKey, res);
      return res;
    }
    const invalidRes = format === "specifiedValue" ? "" : format === "hex" || format === "hexAlpha" ? new NullObject() : RGB_TRANSPARENT;
    setCache(cacheKey, invalidRes);
    return invalidRes;
  }
  if (REG_FN_REL$1.test(value)) {
    const resolvedRel = resolveRelativeColor(value, opt);
    if (format === "computedValue") {
      const res = resolvedRel instanceof NullObject && !nullable ? RGB_TRANSPARENT : resolvedRel;
      setCache(cacheKey, res);
      return res;
    }
    if (format === "specifiedValue") {
      const res = resolvedRel instanceof NullObject ? "" : resolvedRel;
      setCache(cacheKey, res);
      return res;
    }
    value = resolvedRel instanceof NullObject ? "" : resolvedRel;
  }
  if (REG_FN_CALC$1.test(value)) value = cssCalc(value, opt);
  let cs = "";
  let r = NaN;
  let g = NaN;
  let b = NaN;
  let alpha = NaN;
  if (value === "transparent") {
    let res;
    switch (format) {
      case VAL_SPEC:
        res = value;
        break;
      case "hex":
        res = new NullObject();
        break;
      case "hexAlpha":
        res = "#00000000";
        break;
      default:
        res = RGB_TRANSPARENT;
    }
    setCache(cacheKey, res);
    return res;
  }
  if (value === "currentcolor") {
    if (format === "specifiedValue") {
      setCache(cacheKey, value);
      return value;
    }
    if (currentColor) {
      let resolvedCurrent;
      if (currentColor.startsWith("color-mix(")) resolvedCurrent = resolveColorMix(currentColor, opt);
      else if (currentColor.startsWith("color(")) resolvedCurrent = resolveColorFunc(currentColor, opt);
      else resolvedCurrent = resolveColorValue(currentColor, opt);
      if (resolvedCurrent instanceof NullObject) {
        setCache(cacheKey, resolvedCurrent);
        return resolvedCurrent;
      }
      [cs, r, g, b, alpha] = resolvedCurrent;
    } else {
      const res = format === "computedValue" ? RGB_TRANSPARENT : value;
      if (format === "computedValue") {
        setCache(cacheKey, res);
        return res;
      }
    }
  } else if (format === "specifiedValue") {
    let res = "";
    if (value.startsWith("color-mix(")) res = resolveColorMix(value, opt);
    else if (value.startsWith("color(")) {
      const [scs, rr, gg, bb, aa] = resolveColorFunc(value, opt);
      res = aa === 1 ? `color(${scs} ${rr} ${gg} ${bb})` : `color(${scs} ${rr} ${gg} ${bb} / ${aa})`;
    } else {
      const rgb = resolveColorValue(value, opt);
      if (isString(rgb)) res = rgb;
      else {
        const [scs, rr, gg, bb, aa] = rgb;
        if (scs === "rgb") res = aa === 1 ? `${scs}(${rr}, ${gg}, ${bb})` : `${scs}a(${rr}, ${gg}, ${bb}, ${aa})`;
        else res = aa === 1 ? `${scs}(${rr} ${gg} ${bb})` : `${scs}(${rr} ${gg} ${bb} / ${aa})`;
      }
    }
    setCache(cacheKey, res);
    return res;
  } else if (value.startsWith("color-mix(")) {
    if (currentColor) value = value.replace(/currentcolor/g, currentColor);
    value = value.replace(/transparent/g, RGB_TRANSPARENT);
    const resolvedMix = resolveColorMix(value, opt);
    if (resolvedMix instanceof NullObject) {
      setCache(cacheKey, resolvedMix);
      return resolvedMix;
    }
    [cs, r, g, b, alpha] = resolvedMix;
  } else if (value.startsWith("color(")) {
    const resolvedFunc = resolveColorFunc(value, opt);
    if (resolvedFunc instanceof NullObject) {
      setCache(cacheKey, resolvedFunc);
      return resolvedFunc;
    }
    [cs, r, g, b, alpha] = resolvedFunc;
  } else if (value) {
    const resolvedVal = resolveColorValue(value, opt);
    if (resolvedVal instanceof NullObject) {
      setCache(cacheKey, resolvedVal);
      return resolvedVal;
    }
    [cs, r, g, b, alpha] = resolvedVal;
  }
  let finalRes = "";
  switch (format) {
    case "hex":
    case "hexAlpha":
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(alpha) || format === "hex" && alpha === 0) finalRes = new NullObject();
      else finalRes = convertRgbToHex([
        r,
        g,
        b,
        format === "hex" ? 1 : alpha
      ]);
      break;
    default:
      if (cs === "rgb") finalRes = alpha === 1 ? `${cs}(${r}, ${g}, ${b})` : `${cs}a(${r}, ${g}, ${b}, ${alpha})`;
      else if ([
        "lab",
        "lch",
        "oklab",
        "oklch"
      ].includes(cs)) finalRes = alpha === 1 ? `${cs}(${r} ${g} ${b})` : `${cs}(${r} ${g} ${b} / ${alpha})`;
      else finalRes = alpha === 1 ? `color(${cs} ${r} ${g} ${b})` : `color(${cs} ${r} ${g} ${b} / ${alpha})`;
  }
  setCache(cacheKey, finalRes);
  return finalRes;
};
var resolve = (value, opt = {}) => {
  opt.nullable = false;
  const resolvedValue = resolveColor(value, opt);
  return resolvedValue instanceof NullObject ? null : resolvedValue;
};
var NAMESPACE$1 = "css-gradient";
var DIM_ANGLE = `${NUM$1}(?:${ANGLE})`;
var DIM_ANGLE_PCT = `${DIM_ANGLE}|${PCT$1}`;
var DIM_LEN_PCT = `${`${NUM$1}(?:${LENGTH})|0`}|${PCT$1}`;
var DIM_LEN_PCT_POSI = `${NUM_POSITIVE}(?:${LENGTH}|%)|0`;
var DIM_LEN_POSI = `${NUM_POSITIVE}(?:${LENGTH})|0`;
var CTR = "center";
var L_R = "left|right";
var T_B = "top|bottom";
var S_E = "start|end";
var AXIS_X = `${L_R}|x-(?:${S_E})`;
var AXIS_Y = `${T_B}|y-(?:${S_E})`;
var BLOCK = `block-(?:${S_E})`;
var INLINE = `inline-(?:${S_E})`;
var POS_1 = `${CTR}|${AXIS_X}|${AXIS_Y}|${BLOCK}|${INLINE}|${DIM_LEN_PCT}`;
var POS_2 = [
  `(?:${CTR}|${AXIS_X})\\s+(?:${CTR}|${AXIS_Y})`,
  `(?:${CTR}|${AXIS_Y})\\s+(?:${CTR}|${AXIS_X})`,
  `(?:${CTR}|${AXIS_X}|${DIM_LEN_PCT})\\s+(?:${CTR}|${AXIS_Y}|${DIM_LEN_PCT})`,
  `(?:${CTR}|${BLOCK})\\s+(?:${CTR}|${INLINE})`,
  `(?:${CTR}|${INLINE})\\s+(?:${CTR}|${BLOCK})`,
  `(?:${CTR}|${S_E})\\s+(?:${CTR}|${S_E})`
].join("|");
var POS_4 = [
  `(?:${AXIS_X})\\s+(?:${DIM_LEN_PCT})\\s+(?:${AXIS_Y})\\s+(?:${DIM_LEN_PCT})`,
  `(?:${AXIS_Y})\\s+(?:${DIM_LEN_PCT})\\s+(?:${AXIS_X})\\s+(?:${DIM_LEN_PCT})`,
  `(?:${BLOCK})\\s+(?:${DIM_LEN_PCT})\\s+(?:${INLINE})\\s+(?:${DIM_LEN_PCT})`,
  `(?:${INLINE})\\s+(?:${DIM_LEN_PCT})\\s+(?:${BLOCK})\\s+(?:${DIM_LEN_PCT})`,
  `(?:${S_E})\\s+(?:${DIM_LEN_PCT})\\s+(?:${S_E})\\s+(?:${DIM_LEN_PCT})`
].join("|");
var RAD_EXTENT = "(?:clos|farth)est-(?:corner|side)";
var RAD_SIZE = [
  `${RAD_EXTENT}(?:\\s+${RAD_EXTENT})?`,
  `${DIM_LEN_POSI}`,
  `(?:${DIM_LEN_PCT_POSI})\\s+(?:${DIM_LEN_PCT_POSI})`
].join("|");
var RAD_SHAPE = "circle|ellipse";
var FROM_ANGLE = `from\\s+${DIM_ANGLE}`;
var AT_POSITION = `at\\s+(?:${POS_1}|${POS_2}|${POS_4})`;
var TO_SIDE_CORNER = `to\\s+(?:(?:${L_R})(?:\\s(?:${T_B}))?|(?:${T_B})(?:\\s(?:${L_R}))?)`;
var IN_COLOR_SPACE = `in\\s+(?:${CS_RECT}|${CS_HUE})`;
var LINE_SYNTAX_LINEAR = [`(?:${DIM_ANGLE}|${TO_SIDE_CORNER})(?:\\s+${IN_COLOR_SPACE})?`, `${IN_COLOR_SPACE}(?:\\s+(?:${DIM_ANGLE}|${TO_SIDE_CORNER}))?`].join("|");
var LINE_SYNTAX_RADIAL = [
  `(?:${RAD_SHAPE})(?:\\s+(?:${RAD_SIZE}))?(?:\\s+${AT_POSITION})?(?:\\s+${IN_COLOR_SPACE})?`,
  `(?:${RAD_SIZE})(?:\\s+(?:${RAD_SHAPE}))?(?:\\s+${AT_POSITION})?(?:\\s+${IN_COLOR_SPACE})?`,
  `${AT_POSITION}(?:\\s+${IN_COLOR_SPACE})?`,
  `${IN_COLOR_SPACE}(?:\\s+${RAD_SHAPE})(?:\\s+(?:${RAD_SIZE}))?(?:\\s+${AT_POSITION})?`,
  `${IN_COLOR_SPACE}(?:\\s+${RAD_SIZE})(?:\\s+(?:${RAD_SHAPE}))?(?:\\s+${AT_POSITION})?`,
  `${IN_COLOR_SPACE}(?:\\s+${AT_POSITION})?`
].join("|");
var LINE_SYNTAX_CONIC = [
  `${FROM_ANGLE}(?:\\s+${AT_POSITION})?(?:\\s+${IN_COLOR_SPACE})?`,
  `${AT_POSITION}(?:\\s+${IN_COLOR_SPACE})?`,
  `${IN_COLOR_SPACE}(?:\\s+${FROM_ANGLE})?(?:\\s+${AT_POSITION})?`
].join("|");
var DEFAULT_LINEAR = [/to\s+bottom/];
var DEFAULT_RADIAL = [
  /ellipse/,
  /farthest-corner/,
  /at\s+center/
];
var DEFAULT_CONIC = [/at\s+center/];
var IS_CONIC = /^(?:repeating-)?conic-gradient$/;
var IS_LINEAR = /^(?:repeating-)?linear-gradient$/;
var IS_RADIAL = /^(?:repeating-)?radial-gradient$/;
var REG_COLOR_HINT_CONIC = new RegExp(`^(?:${DIM_ANGLE_PCT})$`);
var REG_COLOR_HINT_NON_CONIC = new RegExp(`^(?:${DIM_LEN_PCT})$`);
var REG_DIM_CONIC = new RegExp(`(?:\\s+(?:${DIM_ANGLE_PCT})){1,2}$`);
var REG_DIM_NON_CONIC = new RegExp(`(?:\\s+(?:${DIM_LEN_PCT})){1,2}$`);
var REG_GRAD = /^(?:repeating-)?(?:conic|linear|radial)-gradient\(/;
var REG_GRAD_CAPT = /^((?:repeating-)?(?:conic|linear|radial)-gradient)\(/;
var REG_LINE_CONIC = new RegExp(`^(?:${LINE_SYNTAX_CONIC})$`);
var REG_LINE_LINEAR = new RegExp(`^(?:${LINE_SYNTAX_LINEAR})$`);
var REG_LINE_RADIAL = new RegExp(`^(?:${LINE_SYNTAX_RADIAL})$`);
var getGradientType = (value) => {
  if (isString(value)) {
    value = value.trim();
    if (REG_GRAD.test(value)) {
      const [, type] = value.match(REG_GRAD_CAPT);
      return type;
    }
  }
  return "";
};
var validateGradientLine = (value, type) => {
  if (isString(value) && isString(type)) {
    value = value.trim();
    type = type.trim();
    let reg = null;
    let defaultValues = [];
    if (IS_LINEAR.test(type)) {
      reg = REG_LINE_LINEAR;
      defaultValues = DEFAULT_LINEAR;
    } else if (IS_RADIAL.test(type)) {
      reg = REG_LINE_RADIAL;
      defaultValues = DEFAULT_RADIAL;
    } else if (IS_CONIC.test(type)) {
      reg = REG_LINE_CONIC;
      defaultValues = DEFAULT_CONIC;
    }
    if (reg) {
      const valid = reg.test(value);
      if (valid) {
        let line = value;
        for (const defaultValue of defaultValues) line = line.replace(defaultValue, "");
        line = line.replace(/\s{2,}/g, " ").trim();
        return {
          line,
          valid
        };
      }
      return {
        valid,
        line: value
      };
    }
  }
  return {
    line: value,
    valid: false
  };
};
var validateColorStopList = (list, type, opt = {}) => {
  if (Array.isArray(list) && list.length > 1) {
    const isConic = IS_CONIC.test(type);
    const regColorHint = isConic ? REG_COLOR_HINT_CONIC : REG_COLOR_HINT_NON_CONIC;
    const regDimension = isConic ? REG_DIM_CONIC : REG_DIM_NON_CONIC;
    const valueList = [];
    let prevType = "";
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (isString(item)) if (regColorHint.test(item)) {
        if (i === 0 || prevType === "hint") return {
          colorStops: list,
          valid: false
        };
        prevType = "hint";
        valueList.push(item);
      } else {
        const itemColor = item.replace(regDimension, "");
        if (isColor(itemColor, { format: "specifiedValue" })) {
          const resolvedColor = resolveColor(itemColor, opt);
          prevType = "color";
          valueList.push(item.replace(itemColor, resolvedColor));
        } else return {
          colorStops: list,
          valid: false
        };
      }
      else return {
        colorStops: list,
        valid: false
      };
    }
    if (prevType !== "color") return {
      colorStops: list,
      valid: false
    };
    return {
      valid: true,
      colorStops: valueList
    };
  }
  return {
    colorStops: list,
    valid: false
  };
};
var parseGradient = (value, opt = {}) => {
  if (isString(value)) {
    value = value.trim();
    const cacheKey = createCacheKey({
      namespace: NAMESPACE$1,
      name: "parseGradient",
      value
    }, opt);
    const cachedResult = getCache(cacheKey);
    if (cachedResult instanceof CacheItem) {
      if (cachedResult.isNull) return null;
      return cachedResult.item;
    }
    const type = getGradientType(value);
    const gradValue = value.replace(REG_GRAD, "").replace(/\)$/, "");
    if (type && gradValue) {
      const [lineOrColorStop = "", ...itemList] = splitValue(gradValue, { delimiter: "," });
      const regDimension = IS_CONIC.test(type) ? REG_DIM_CONIC : REG_DIM_NON_CONIC;
      let colorStop = "";
      if (regDimension.test(lineOrColorStop)) {
        const itemColor = lineOrColorStop.replace(regDimension, "");
        if (isColor(itemColor, { format: "specifiedValue" })) {
          const resolvedColor = resolveColor(itemColor, opt);
          colorStop = lineOrColorStop.replace(itemColor, resolvedColor);
        }
      } else if (isColor(lineOrColorStop, { format: "specifiedValue" })) colorStop = resolveColor(lineOrColorStop, opt);
      if (colorStop) {
        itemList.unshift(colorStop);
        const { colorStops, valid } = validateColorStopList(itemList, type, opt);
        if (valid) {
          const res = {
            value,
            type,
            colorStopList: colorStops
          };
          setCache(cacheKey, res);
          return res;
        }
      } else if (itemList.length > 1) {
        const { line: gradientLine, valid: validLine } = validateGradientLine(lineOrColorStop, type);
        const { colorStops, valid: validColorStops } = validateColorStopList(itemList, type, opt);
        if (validLine && validColorStops) {
          const res = {
            value,
            type,
            gradientLine,
            colorStopList: colorStops
          };
          setCache(cacheKey, res);
          return res;
        }
      }
    }
    setCache(cacheKey, null);
    return null;
  }
  return null;
};
var resolveGradient = (value, opt = {}) => {
  const { format = VAL_COMP } = opt;
  const gradient = parseGradient(value, opt);
  if (gradient) {
    const { type = "", gradientLine = "", colorStopList = [] } = gradient;
    if (type && Array.isArray(colorStopList) && colorStopList.length > 1) {
      if (gradientLine) return `${type}(${gradientLine}, ${colorStopList.join(", ")})`;
      return `${type}(${colorStopList.join(", ")})`;
    }
  }
  if (format === "specifiedValue") return "";
  return "none";
};
var isGradient = (value, opt = {}) => {
  return parseGradient(value, opt) !== null;
};
var NAMESPACE = "convert";
var REG_FN_CALC = new RegExp(SYN_FN_CALC);
var REG_FN_REL = new RegExp(SYN_FN_REL);
var REG_FN_VAR = new RegExp(SYN_FN_VAR);
var preProcess = (value, opt = {}) => {
  if (!isString(value)) return new NullObject();
  value = value.trim();
  if (!value) return new NullObject();
  const cacheKey = createCacheKey({
    namespace: NAMESPACE,
    name: "preProcess",
    value
  }, opt);
  const cachedResult = getCache(cacheKey);
  if (cachedResult instanceof CacheItem) {
    if (cachedResult.isNull) return cachedResult;
    return cachedResult.item;
  }
  let res = value;
  if (REG_FN_VAR.test(value)) {
    const resolved = resolveVar(value, opt);
    if (isString(resolved)) res = resolved;
    else {
      setCache(cacheKey, null);
      return new NullObject();
    }
  }
  if (isString(res)) {
    if (REG_FN_REL.test(res)) {
      const resolved = resolveRelativeColor(res, opt);
      if (isString(resolved)) res = resolved;
      else {
        setCache(cacheKey, null);
        return new NullObject();
      }
    } else if (REG_FN_CALC.test(res)) res = cssCalc(res, opt);
  }
  if (isString(res)) {
    if (res.startsWith("color-mix")) res = resolveColor(res, {
      ...opt,
      format: VAL_COMP,
      nullable: true
    });
  }
  setCache(cacheKey, res);
  return res;
};
var createColorConverter = (name, format, convertFn) => {
  const colorConverterFn = (value, opt = {}) => {
    if (!isString(value)) throw new TypeError(`${value} is not a string.`);
    const resolved = preProcess(value, opt);
    if (resolved instanceof NullObject) return [
      0,
      0,
      0,
      0
    ];
    const val = resolved.toLowerCase();
    const cacheKey = createCacheKey({
      namespace: NAMESPACE,
      name,
      value: val
    }, opt);
    const cached = getCache(cacheKey);
    if (cached instanceof CacheItem) return cached.item;
    const result = convertFn(val, {
      ...opt,
      format
    });
    setCache(cacheKey, result);
    return result;
  };
  return colorConverterFn;
};
var numberToHex = (value) => numberToHexString(value);
var colorToHex = (value, opt = {}) => {
  if (!isString(value)) throw new TypeError(`${value} is not a string.`);
  const resolved = preProcess(value, opt);
  if (resolved instanceof NullObject) return null;
  const val = resolved.toLowerCase();
  const cacheKey = createCacheKey({
    namespace: NAMESPACE,
    name: "colorToHex",
    value: val
  }, opt);
  const cached = getCache(cacheKey);
  if (cached instanceof CacheItem) {
    if (cached.isNull) return null;
    return cached.item;
  }
  const hex = resolveColor(val, {
    ...opt,
    nullable: true,
    format: opt.alpha ? "hexAlpha" : "hex"
  });
  if (isString(hex)) {
    setCache(cacheKey, hex);
    return hex;
  }
  setCache(cacheKey, null);
  return null;
};
var colorToHsl = createColorConverter("colorToHsl", "hsl", convertColorToHsl);
var colorToHwb = createColorConverter("colorToHwb", "hwb", convertColorToHwb);
var colorToLab = createColorConverter("colorToLab", "lab", convertColorToLab);
var colorToLch = createColorConverter("colorToLch", "lch", convertColorToLch);
var colorToOklab = createColorConverter("colorToOklab", "oklab", convertColorToOklab);
var colorToOklch = createColorConverter("colorToOklch", "oklch", convertColorToOklch);
var colorToRgb = createColorConverter("colorToRgb", "rgb", convertColorToRgb);
var colorToXyz = (value, opt = {}) => {
  if (!isString(value)) throw new TypeError(`${value} is not a string.`);
  const resolved = preProcess(value, opt);
  if (resolved instanceof NullObject) return [
    0,
    0,
    0,
    0
  ];
  const val = resolved.toLowerCase();
  const cacheKey = createCacheKey({
    namespace: NAMESPACE,
    name: "colorToXyz",
    value: val
  }, opt);
  const cached = getCache(cacheKey);
  if (cached instanceof CacheItem) return cached.item;
  let parsed;
  if (val.startsWith("color(")) parsed = parseColorFunc(val, opt);
  else parsed = parseColorValue(val, opt);
  const [, ...xyz] = parsed;
  setCache(cacheKey, xyz);
  return xyz;
};
var colorToXyzD50 = (value, opt = {}) => {
  opt.d50 = true;
  return colorToXyz(value, opt);
};
var convert = {
  colorToHex,
  colorToHsl,
  colorToHwb,
  colorToLab,
  colorToLch,
  colorToOklab,
  colorToOklch,
  colorToRgb,
  colorToXyz,
  colorToXyzD50,
  numberToHex
};
var utils = {
  cssCalc,
  cssVar,
  extractDashedIdent,
  isAbsoluteFontSize,
  isAbsoluteSizeOrLength,
  isColor,
  isGradient,
  resolveGradient,
  resolveLengthInPixels,
  splitValue
};
const esm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  convert,
  resolve,
  utils
});
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(esm);
export {
  require$$0 as r
};

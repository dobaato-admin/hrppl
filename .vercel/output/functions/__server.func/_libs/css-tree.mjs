import { r as requireSourceMapGenerator, s as sourceMapGeneratorExports } from "./source-map-js.mjs";
import { r as require$$2, a as require$$3, b as require$$1 } from "./mdn-data.mjs";
import { createRequire } from "module";
var cjs = {};
var tokenizer = {};
var types$1 = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types$1;
  hasRequiredTypes = 1;
  const EOF2 = 0;
  const Ident2 = 1;
  const Function = 2;
  const AtKeyword2 = 3;
  const Hash2 = 4;
  const String2 = 5;
  const BadString2 = 6;
  const Url2 = 7;
  const BadUrl2 = 8;
  const Delim2 = 9;
  const Number2 = 10;
  const Percentage2 = 11;
  const Dimension2 = 12;
  const WhiteSpace2 = 13;
  const CDO2 = 14;
  const CDC2 = 15;
  const Colon2 = 16;
  const Semicolon2 = 17;
  const Comma2 = 18;
  const LeftSquareBracket2 = 19;
  const RightSquareBracket2 = 20;
  const LeftParenthesis2 = 21;
  const RightParenthesis2 = 22;
  const LeftCurlyBracket2 = 23;
  const RightCurlyBracket2 = 24;
  const Comment2 = 25;
  types$1.AtKeyword = AtKeyword2;
  types$1.BadString = BadString2;
  types$1.BadUrl = BadUrl2;
  types$1.CDC = CDC2;
  types$1.CDO = CDO2;
  types$1.Colon = Colon2;
  types$1.Comma = Comma2;
  types$1.Comment = Comment2;
  types$1.Delim = Delim2;
  types$1.Dimension = Dimension2;
  types$1.EOF = EOF2;
  types$1.Function = Function;
  types$1.Hash = Hash2;
  types$1.Ident = Ident2;
  types$1.LeftCurlyBracket = LeftCurlyBracket2;
  types$1.LeftParenthesis = LeftParenthesis2;
  types$1.LeftSquareBracket = LeftSquareBracket2;
  types$1.Number = Number2;
  types$1.Percentage = Percentage2;
  types$1.RightCurlyBracket = RightCurlyBracket2;
  types$1.RightParenthesis = RightParenthesis2;
  types$1.RightSquareBracket = RightSquareBracket2;
  types$1.Semicolon = Semicolon2;
  types$1.String = String2;
  types$1.Url = Url2;
  types$1.WhiteSpace = WhiteSpace2;
  return types$1;
}
var charCodeDefinitions = {};
var hasRequiredCharCodeDefinitions;
function requireCharCodeDefinitions() {
  if (hasRequiredCharCodeDefinitions) return charCodeDefinitions;
  hasRequiredCharCodeDefinitions = 1;
  const EOF2 = 0;
  function isDigit2(code2) {
    return code2 >= 48 && code2 <= 57;
  }
  function isHexDigit2(code2) {
    return isDigit2(code2) || // 0 .. 9
    code2 >= 65 && code2 <= 70 || // A .. F
    code2 >= 97 && code2 <= 102;
  }
  function isUppercaseLetter2(code2) {
    return code2 >= 65 && code2 <= 90;
  }
  function isLowercaseLetter2(code2) {
    return code2 >= 97 && code2 <= 122;
  }
  function isLetter2(code2) {
    return isUppercaseLetter2(code2) || isLowercaseLetter2(code2);
  }
  function isNonAscii2(code2) {
    return code2 >= 128;
  }
  function isNameStart2(code2) {
    return isLetter2(code2) || isNonAscii2(code2) || code2 === 95;
  }
  function isName2(code2) {
    return isNameStart2(code2) || isDigit2(code2) || code2 === 45;
  }
  function isNonPrintable2(code2) {
    return code2 >= 0 && code2 <= 8 || code2 === 11 || code2 >= 14 && code2 <= 31 || code2 === 127;
  }
  function isNewline2(code2) {
    return code2 === 10 || code2 === 13 || code2 === 12;
  }
  function isWhiteSpace2(code2) {
    return isNewline2(code2) || code2 === 32 || code2 === 9;
  }
  function isValidEscape2(first, second) {
    if (first !== 92) {
      return false;
    }
    if (isNewline2(second) || second === EOF2) {
      return false;
    }
    return true;
  }
  function isIdentifierStart2(first, second, third) {
    if (first === 45) {
      return isNameStart2(second) || second === 45 || isValidEscape2(second, third);
    }
    if (isNameStart2(first)) {
      return true;
    }
    if (first === 92) {
      return isValidEscape2(first, second);
    }
    return false;
  }
  function isNumberStart2(first, second, third) {
    if (first === 43 || first === 45) {
      if (isDigit2(second)) {
        return 2;
      }
      return second === 46 && isDigit2(third) ? 3 : 0;
    }
    if (first === 46) {
      return isDigit2(second) ? 2 : 0;
    }
    if (isDigit2(first)) {
      return 1;
    }
    return 0;
  }
  function isBOM2(code2) {
    if (code2 === 65279) {
      return 1;
    }
    if (code2 === 65534) {
      return 1;
    }
    return 0;
  }
  const CATEGORY2 = new Array(128);
  const EofCategory2 = 128;
  const WhiteSpaceCategory2 = 130;
  const DigitCategory2 = 131;
  const NameStartCategory2 = 132;
  const NonPrintableCategory2 = 133;
  for (let i = 0; i < CATEGORY2.length; i++) {
    CATEGORY2[i] = isWhiteSpace2(i) && WhiteSpaceCategory2 || isDigit2(i) && DigitCategory2 || isNameStart2(i) && NameStartCategory2 || isNonPrintable2(i) && NonPrintableCategory2 || i || EofCategory2;
  }
  function charCodeCategory2(code2) {
    return code2 < 128 ? CATEGORY2[code2] : NameStartCategory2;
  }
  charCodeDefinitions.DigitCategory = DigitCategory2;
  charCodeDefinitions.EofCategory = EofCategory2;
  charCodeDefinitions.NameStartCategory = NameStartCategory2;
  charCodeDefinitions.NonPrintableCategory = NonPrintableCategory2;
  charCodeDefinitions.WhiteSpaceCategory = WhiteSpaceCategory2;
  charCodeDefinitions.charCodeCategory = charCodeCategory2;
  charCodeDefinitions.isBOM = isBOM2;
  charCodeDefinitions.isDigit = isDigit2;
  charCodeDefinitions.isHexDigit = isHexDigit2;
  charCodeDefinitions.isIdentifierStart = isIdentifierStart2;
  charCodeDefinitions.isLetter = isLetter2;
  charCodeDefinitions.isLowercaseLetter = isLowercaseLetter2;
  charCodeDefinitions.isName = isName2;
  charCodeDefinitions.isNameStart = isNameStart2;
  charCodeDefinitions.isNewline = isNewline2;
  charCodeDefinitions.isNonAscii = isNonAscii2;
  charCodeDefinitions.isNonPrintable = isNonPrintable2;
  charCodeDefinitions.isNumberStart = isNumberStart2;
  charCodeDefinitions.isUppercaseLetter = isUppercaseLetter2;
  charCodeDefinitions.isValidEscape = isValidEscape2;
  charCodeDefinitions.isWhiteSpace = isWhiteSpace2;
  return charCodeDefinitions;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  function getCharCode2(source, offset) {
    return offset < source.length ? source.charCodeAt(offset) : 0;
  }
  function getNewlineLength2(source, offset, code2) {
    if (code2 === 13 && getCharCode2(source, offset + 1) === 10) {
      return 2;
    }
    return 1;
  }
  function cmpChar2(testStr, offset, referenceCode) {
    let code2 = testStr.charCodeAt(offset);
    if (charCodeDefinitions2.isUppercaseLetter(code2)) {
      code2 = code2 | 32;
    }
    return code2 === referenceCode;
  }
  function cmpStr2(testStr, start, end, referenceStr) {
    if (end - start !== referenceStr.length) {
      return false;
    }
    if (start < 0 || end > testStr.length) {
      return false;
    }
    for (let i = start; i < end; i++) {
      const referenceCode = referenceStr.charCodeAt(i - start);
      let testCode = testStr.charCodeAt(i);
      if (charCodeDefinitions2.isUppercaseLetter(testCode)) {
        testCode = testCode | 32;
      }
      if (testCode !== referenceCode) {
        return false;
      }
    }
    return true;
  }
  function findWhiteSpaceStart2(source, offset) {
    for (; offset >= 0; offset--) {
      if (!charCodeDefinitions2.isWhiteSpace(source.charCodeAt(offset))) {
        break;
      }
    }
    return offset + 1;
  }
  function findWhiteSpaceEnd2(source, offset) {
    for (; offset < source.length; offset++) {
      if (!charCodeDefinitions2.isWhiteSpace(source.charCodeAt(offset))) {
        break;
      }
    }
    return offset;
  }
  function findDecimalNumberEnd2(source, offset) {
    for (; offset < source.length; offset++) {
      if (!charCodeDefinitions2.isDigit(source.charCodeAt(offset))) {
        break;
      }
    }
    return offset;
  }
  function consumeEscaped2(source, offset) {
    offset += 2;
    if (charCodeDefinitions2.isHexDigit(getCharCode2(source, offset - 1))) {
      for (const maxOffset = Math.min(source.length, offset + 5); offset < maxOffset; offset++) {
        if (!charCodeDefinitions2.isHexDigit(getCharCode2(source, offset))) {
          break;
        }
      }
      const code2 = getCharCode2(source, offset);
      if (charCodeDefinitions2.isWhiteSpace(code2)) {
        offset += getNewlineLength2(source, offset, code2);
      }
    }
    return offset;
  }
  function consumeName2(source, offset) {
    for (; offset < source.length; offset++) {
      const code2 = source.charCodeAt(offset);
      if (charCodeDefinitions2.isName(code2)) {
        continue;
      }
      if (charCodeDefinitions2.isValidEscape(code2, getCharCode2(source, offset + 1))) {
        offset = consumeEscaped2(source, offset) - 1;
        continue;
      }
      break;
    }
    return offset;
  }
  function consumeNumber2(source, offset) {
    let code2 = source.charCodeAt(offset);
    if (code2 === 43 || code2 === 45) {
      code2 = source.charCodeAt(offset += 1);
    }
    if (charCodeDefinitions2.isDigit(code2)) {
      offset = findDecimalNumberEnd2(source, offset + 1);
      code2 = source.charCodeAt(offset);
    }
    if (code2 === 46 && charCodeDefinitions2.isDigit(source.charCodeAt(offset + 1))) {
      offset += 2;
      offset = findDecimalNumberEnd2(source, offset);
    }
    if (cmpChar2(
      source,
      offset,
      101
      /* e */
    )) {
      let sign = 0;
      code2 = source.charCodeAt(offset + 1);
      if (code2 === 45 || code2 === 43) {
        sign = 1;
        code2 = source.charCodeAt(offset + 2);
      }
      if (charCodeDefinitions2.isDigit(code2)) {
        offset = findDecimalNumberEnd2(source, offset + 1 + sign + 1);
      }
    }
    return offset;
  }
  function consumeBadUrlRemnants2(source, offset) {
    for (; offset < source.length; offset++) {
      const code2 = source.charCodeAt(offset);
      if (code2 === 41) {
        offset++;
        break;
      }
      if (charCodeDefinitions2.isValidEscape(code2, getCharCode2(source, offset + 1))) {
        offset = consumeEscaped2(source, offset);
      }
    }
    return offset;
  }
  function decodeEscaped2(escaped) {
    if (escaped.length === 1 && !charCodeDefinitions2.isHexDigit(escaped.charCodeAt(0))) {
      return escaped[0];
    }
    let code2 = parseInt(escaped, 16);
    if (code2 === 0 || // If this number is zero,
    code2 >= 55296 && code2 <= 57343 || // or is for a surrogate,
    code2 > 1114111) {
      code2 = 65533;
    }
    return String.fromCodePoint(code2);
  }
  utils.cmpChar = cmpChar2;
  utils.cmpStr = cmpStr2;
  utils.consumeBadUrlRemnants = consumeBadUrlRemnants2;
  utils.consumeEscaped = consumeEscaped2;
  utils.consumeName = consumeName2;
  utils.consumeNumber = consumeNumber2;
  utils.decodeEscaped = decodeEscaped2;
  utils.findDecimalNumberEnd = findDecimalNumberEnd2;
  utils.findWhiteSpaceEnd = findWhiteSpaceEnd2;
  utils.findWhiteSpaceStart = findWhiteSpaceStart2;
  utils.getNewlineLength = getNewlineLength2;
  return utils;
}
var names$1;
var hasRequiredNames$1;
function requireNames$1() {
  if (hasRequiredNames$1) return names$1;
  hasRequiredNames$1 = 1;
  const tokenNames2 = [
    "EOF-token",
    "ident-token",
    "function-token",
    "at-keyword-token",
    "hash-token",
    "string-token",
    "bad-string-token",
    "url-token",
    "bad-url-token",
    "delim-token",
    "number-token",
    "percentage-token",
    "dimension-token",
    "whitespace-token",
    "CDO-token",
    "CDC-token",
    "colon-token",
    "semicolon-token",
    "comma-token",
    "[-token",
    "]-token",
    "(-token",
    ")-token",
    "{-token",
    "}-token",
    "comment-token"
  ];
  names$1 = tokenNames2;
  return names$1;
}
var OffsetToLocation$1 = {};
var adoptBuffer$1 = {};
var hasRequiredAdoptBuffer;
function requireAdoptBuffer() {
  if (hasRequiredAdoptBuffer) return adoptBuffer$1;
  hasRequiredAdoptBuffer = 1;
  const MIN_SIZE2 = 16 * 1024;
  function adoptBuffer2(buffer = null, size) {
    if (buffer === null || buffer.length < size) {
      return new Uint32Array(Math.max(size + 1024, MIN_SIZE2));
    }
    return buffer;
  }
  adoptBuffer$1.adoptBuffer = adoptBuffer2;
  return adoptBuffer$1;
}
var hasRequiredOffsetToLocation;
function requireOffsetToLocation() {
  if (hasRequiredOffsetToLocation) return OffsetToLocation$1;
  hasRequiredOffsetToLocation = 1;
  const adoptBuffer2 = /* @__PURE__ */ requireAdoptBuffer();
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const N2 = 10;
  const F2 = 12;
  const R2 = 13;
  function computeLinesAndColumns2(host) {
    const source = host.source;
    const sourceLength = source.length;
    const startOffset = source.length > 0 ? charCodeDefinitions2.isBOM(source.charCodeAt(0)) : 0;
    const lines = adoptBuffer2.adoptBuffer(host.lines, sourceLength);
    const columns = adoptBuffer2.adoptBuffer(host.columns, sourceLength);
    let line = host.startLine;
    let column = host.startColumn;
    for (let i = startOffset; i < sourceLength; i++) {
      const code2 = source.charCodeAt(i);
      lines[i] = line;
      columns[i] = column++;
      if (code2 === N2 || code2 === R2 || code2 === F2) {
        if (code2 === R2 && i + 1 < sourceLength && source.charCodeAt(i + 1) === N2) {
          i++;
          lines[i] = line;
          columns[i] = column;
        }
        line++;
        column = 1;
      }
    }
    lines[sourceLength] = line;
    columns[sourceLength] = column;
    host.lines = lines;
    host.columns = columns;
    host.computed = true;
  }
  class OffsetToLocation2 {
    constructor(source, startOffset, startLine, startColumn) {
      this.setSource(source, startOffset, startLine, startColumn);
      this.lines = null;
      this.columns = null;
    }
    setSource(source = "", startOffset = 0, startLine = 1, startColumn = 1) {
      this.source = source;
      this.startOffset = startOffset;
      this.startLine = startLine;
      this.startColumn = startColumn;
      this.computed = false;
    }
    getLocation(offset, filename) {
      if (!this.computed) {
        computeLinesAndColumns2(this);
      }
      return {
        source: filename,
        offset: this.startOffset + offset,
        line: this.lines[offset],
        column: this.columns[offset]
      };
    }
    getLocationRange(start, end, filename) {
      if (!this.computed) {
        computeLinesAndColumns2(this);
      }
      return {
        source: filename,
        start: {
          offset: this.startOffset + start,
          line: this.lines[start],
          column: this.columns[start]
        },
        end: {
          offset: this.startOffset + end,
          line: this.lines[end],
          column: this.columns[end]
        }
      };
    }
  }
  OffsetToLocation$1.OffsetToLocation = OffsetToLocation2;
  return OffsetToLocation$1;
}
var TokenStream$1 = {};
var hasRequiredTokenStream;
function requireTokenStream() {
  if (hasRequiredTokenStream) return TokenStream$1;
  hasRequiredTokenStream = 1;
  const adoptBuffer2 = /* @__PURE__ */ requireAdoptBuffer();
  const utils2 = /* @__PURE__ */ requireUtils();
  const names2 = /* @__PURE__ */ requireNames$1();
  const types2 = /* @__PURE__ */ requireTypes();
  const OFFSET_MASK2 = 16777215;
  const TYPE_SHIFT2 = 24;
  const BLOCK_OPEN_TOKEN2 = 1;
  const BLOCK_CLOSE_TOKEN2 = 2;
  const balancePair2 = new Uint8Array(32);
  balancePair2[types2.Function] = types2.RightParenthesis;
  balancePair2[types2.LeftParenthesis] = types2.RightParenthesis;
  balancePair2[types2.LeftSquareBracket] = types2.RightSquareBracket;
  balancePair2[types2.LeftCurlyBracket] = types2.RightCurlyBracket;
  const blockTokens2 = new Uint8Array(32);
  blockTokens2[types2.Function] = BLOCK_OPEN_TOKEN2;
  blockTokens2[types2.LeftParenthesis] = BLOCK_OPEN_TOKEN2;
  blockTokens2[types2.LeftSquareBracket] = BLOCK_OPEN_TOKEN2;
  blockTokens2[types2.LeftCurlyBracket] = BLOCK_OPEN_TOKEN2;
  blockTokens2[types2.RightParenthesis] = BLOCK_CLOSE_TOKEN2;
  blockTokens2[types2.RightSquareBracket] = BLOCK_CLOSE_TOKEN2;
  blockTokens2[types2.RightCurlyBracket] = BLOCK_CLOSE_TOKEN2;
  function boundIndex2(index, min, max) {
    return index < min ? min : index > max ? max : index;
  }
  class TokenStream2 {
    constructor(source, tokenize2) {
      this.setSource(source, tokenize2);
    }
    reset() {
      this.eof = false;
      this.tokenIndex = -1;
      this.tokenType = 0;
      this.tokenStart = this.firstCharOffset;
      this.tokenEnd = this.firstCharOffset;
    }
    setSource(source = "", tokenize2 = () => {
    }) {
      source = String(source || "");
      const sourceLength = source.length;
      const offsetAndType = adoptBuffer2.adoptBuffer(this.offsetAndType, source.length + 1);
      const balance = adoptBuffer2.adoptBuffer(this.balance, source.length + 1);
      let tokenCount = 0;
      let firstCharOffset = -1;
      let balanceCloseType = 0;
      let balanceStart = source.length;
      this.offsetAndType = null;
      this.balance = null;
      balance.fill(0);
      tokenize2(source, (type, start, end) => {
        const index = tokenCount++;
        offsetAndType[index] = type << TYPE_SHIFT2 | end;
        if (firstCharOffset === -1) {
          firstCharOffset = start;
        }
        balance[index] = balanceStart;
        if (type === balanceCloseType) {
          const prevBalanceStart = balance[balanceStart];
          balance[balanceStart] = index;
          balanceStart = prevBalanceStart;
          balanceCloseType = balancePair2[offsetAndType[prevBalanceStart] >> TYPE_SHIFT2];
        } else if (this.isBlockOpenerTokenType(type)) {
          balanceStart = index;
          balanceCloseType = balancePair2[type];
        }
      });
      offsetAndType[tokenCount] = types2.EOF << TYPE_SHIFT2 | sourceLength;
      balance[tokenCount] = tokenCount;
      for (let i = 0; i < tokenCount; i++) {
        const balanceStart2 = balance[i];
        if (balanceStart2 <= i) {
          const balanceEnd = balance[balanceStart2];
          if (balanceEnd !== i) {
            balance[i] = balanceEnd;
          }
        } else if (balanceStart2 > tokenCount) {
          balance[i] = tokenCount;
        }
      }
      this.source = source;
      this.firstCharOffset = firstCharOffset === -1 ? 0 : firstCharOffset;
      this.tokenCount = tokenCount;
      this.offsetAndType = offsetAndType;
      this.balance = balance;
      this.reset();
      this.next();
    }
    lookupType(offset) {
      offset += this.tokenIndex;
      if (offset < this.tokenCount) {
        return this.offsetAndType[offset] >> TYPE_SHIFT2;
      }
      return types2.EOF;
    }
    lookupTypeNonSC(idx) {
      for (let offset = this.tokenIndex; offset < this.tokenCount; offset++) {
        const tokenType2 = this.offsetAndType[offset] >> TYPE_SHIFT2;
        if (tokenType2 !== types2.WhiteSpace && tokenType2 !== types2.Comment) {
          if (idx-- === 0) {
            return tokenType2;
          }
        }
      }
      return types2.EOF;
    }
    lookupOffset(offset) {
      offset += this.tokenIndex;
      if (offset < this.tokenCount) {
        return this.offsetAndType[offset - 1] & OFFSET_MASK2;
      }
      return this.source.length;
    }
    lookupOffsetNonSC(idx) {
      for (let offset = this.tokenIndex; offset < this.tokenCount; offset++) {
        const tokenType2 = this.offsetAndType[offset] >> TYPE_SHIFT2;
        if (tokenType2 !== types2.WhiteSpace && tokenType2 !== types2.Comment) {
          if (idx-- === 0) {
            return offset - this.tokenIndex;
          }
        }
      }
      return types2.EOF;
    }
    lookupValue(offset, referenceStr) {
      offset += this.tokenIndex;
      if (offset < this.tokenCount) {
        return utils2.cmpStr(
          this.source,
          this.offsetAndType[offset - 1] & OFFSET_MASK2,
          this.offsetAndType[offset] & OFFSET_MASK2,
          referenceStr
        );
      }
      return false;
    }
    getTokenStart(tokenIndex) {
      if (tokenIndex === this.tokenIndex) {
        return this.tokenStart;
      }
      if (tokenIndex > 0) {
        return tokenIndex < this.tokenCount ? this.offsetAndType[tokenIndex - 1] & OFFSET_MASK2 : this.offsetAndType[this.tokenCount] & OFFSET_MASK2;
      }
      return this.firstCharOffset;
    }
    getTokenEnd(tokenIndex) {
      if (tokenIndex === this.tokenIndex) {
        return this.tokenEnd;
      }
      return this.offsetAndType[boundIndex2(tokenIndex, 0, this.tokenCount)] & OFFSET_MASK2;
    }
    getTokenType(tokenIndex) {
      if (tokenIndex === this.tokenIndex) {
        return this.tokenType;
      }
      return this.offsetAndType[boundIndex2(tokenIndex, 0, this.tokenCount)] >> TYPE_SHIFT2;
    }
    substrToCursor(start) {
      return this.source.substring(start, this.tokenStart);
    }
    isBlockOpenerTokenType(tokenType2) {
      return blockTokens2[tokenType2] === BLOCK_OPEN_TOKEN2;
    }
    isBlockCloserTokenType(tokenType2) {
      return blockTokens2[tokenType2] === BLOCK_CLOSE_TOKEN2;
    }
    getBlockTokenPairIndex(tokenIndex) {
      const type = this.getTokenType(tokenIndex);
      if (blockTokens2[type] === 1) {
        const pairIndex = this.balance[tokenIndex];
        const closeType = this.getTokenType(pairIndex);
        return balancePair2[type] === closeType ? pairIndex : -1;
      } else if (blockTokens2[type] === 2) {
        const pairIndex = this.balance[tokenIndex];
        const openType = this.getTokenType(pairIndex);
        return balancePair2[openType] === type ? pairIndex : -1;
      }
      return -1;
    }
    isBalanceEdge(tokenIndex) {
      return this.balance[this.tokenIndex] < tokenIndex;
    }
    isDelim(code2, offset) {
      if (offset) {
        return this.lookupType(offset) === types2.Delim && this.source.charCodeAt(this.lookupOffset(offset)) === code2;
      }
      return this.tokenType === types2.Delim && this.source.charCodeAt(this.tokenStart) === code2;
    }
    skip(tokenCount) {
      let next = this.tokenIndex + tokenCount;
      if (next < this.tokenCount) {
        this.tokenIndex = next;
        this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK2;
        next = this.offsetAndType[next];
        this.tokenType = next >> TYPE_SHIFT2;
        this.tokenEnd = next & OFFSET_MASK2;
      } else {
        this.tokenIndex = this.tokenCount;
        this.next();
      }
    }
    next() {
      let next = this.tokenIndex + 1;
      if (next < this.tokenCount) {
        this.tokenIndex = next;
        this.tokenStart = this.tokenEnd;
        next = this.offsetAndType[next];
        this.tokenType = next >> TYPE_SHIFT2;
        this.tokenEnd = next & OFFSET_MASK2;
      } else {
        this.eof = true;
        this.tokenIndex = this.tokenCount;
        this.tokenType = types2.EOF;
        this.tokenStart = this.tokenEnd = this.source.length;
      }
    }
    skipSC() {
      while (this.tokenType === types2.WhiteSpace || this.tokenType === types2.Comment) {
        this.next();
      }
    }
    skipUntilBalanced(startToken, stopConsume) {
      let cursor = startToken;
      let balanceEnd = 0;
      let offset = 0;
      loop:
        for (; cursor < this.tokenCount; cursor++) {
          balanceEnd = this.balance[cursor];
          if (balanceEnd < startToken) {
            break loop;
          }
          offset = cursor > 0 ? this.offsetAndType[cursor - 1] & OFFSET_MASK2 : this.firstCharOffset;
          switch (stopConsume(this.source.charCodeAt(offset))) {
            case 1:
              break loop;
            case 2:
              cursor++;
              break loop;
            default:
              if (this.isBlockOpenerTokenType(this.offsetAndType[cursor] >> TYPE_SHIFT2)) {
                cursor = balanceEnd;
              }
          }
        }
      this.skip(cursor - this.tokenIndex);
    }
    forEachToken(fn) {
      for (let i = 0, offset = this.firstCharOffset; i < this.tokenCount; i++) {
        const start = offset;
        const item = this.offsetAndType[i];
        const end = item & OFFSET_MASK2;
        const type = item >> TYPE_SHIFT2;
        offset = end;
        fn(type, start, end, i);
      }
    }
    dump() {
      const tokens = new Array(this.tokenCount);
      this.forEachToken((type, start, end, index) => {
        tokens[index] = {
          idx: index,
          type: names2[type],
          chunk: this.source.substring(start, end),
          balance: this.balance[index]
        };
      });
      return tokens;
    }
  }
  TokenStream$1.TokenStream = TokenStream2;
  return TokenStream$1;
}
var hasRequiredTokenizer;
function requireTokenizer() {
  if (hasRequiredTokenizer) return tokenizer;
  hasRequiredTokenizer = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const utils2 = /* @__PURE__ */ requireUtils();
  const names2 = /* @__PURE__ */ requireNames$1();
  const OffsetToLocation2 = /* @__PURE__ */ requireOffsetToLocation();
  const TokenStream2 = /* @__PURE__ */ requireTokenStream();
  function tokenize2(source, onToken) {
    function getCharCode2(offset2) {
      return offset2 < sourceLength ? source.charCodeAt(offset2) : 0;
    }
    function consumeNumericToken() {
      offset = utils2.consumeNumber(source, offset);
      if (charCodeDefinitions2.isIdentifierStart(getCharCode2(offset), getCharCode2(offset + 1), getCharCode2(offset + 2))) {
        type = types2.Dimension;
        offset = utils2.consumeName(source, offset);
        return;
      }
      if (getCharCode2(offset) === 37) {
        type = types2.Percentage;
        offset++;
        return;
      }
      type = types2.Number;
    }
    function consumeIdentLikeToken() {
      const nameStartOffset = offset;
      offset = utils2.consumeName(source, offset);
      if (utils2.cmpStr(source, nameStartOffset, offset, "url") && getCharCode2(offset) === 40) {
        offset = utils2.findWhiteSpaceEnd(source, offset + 1);
        if (getCharCode2(offset) === 34 || getCharCode2(offset) === 39) {
          type = types2.Function;
          offset = nameStartOffset + 4;
          return;
        }
        consumeUrlToken();
        return;
      }
      if (getCharCode2(offset) === 40) {
        type = types2.Function;
        offset++;
        return;
      }
      type = types2.Ident;
    }
    function consumeStringToken(endingCodePoint) {
      if (!endingCodePoint) {
        endingCodePoint = getCharCode2(offset++);
      }
      type = types2.String;
      for (; offset < source.length; offset++) {
        const code2 = source.charCodeAt(offset);
        switch (charCodeDefinitions2.charCodeCategory(code2)) {
          // ending code point
          case endingCodePoint:
            offset++;
            return;
          // EOF
          // case EofCategory:
          // This is a parse error. Return the <string-token>.
          // return;
          // newline
          case charCodeDefinitions2.WhiteSpaceCategory:
            if (charCodeDefinitions2.isNewline(code2)) {
              offset += utils2.getNewlineLength(source, offset, code2);
              type = types2.BadString;
              return;
            }
            break;
          // U+005C REVERSE SOLIDUS (\)
          case 92:
            if (offset === source.length - 1) {
              break;
            }
            const nextCode = getCharCode2(offset + 1);
            if (charCodeDefinitions2.isNewline(nextCode)) {
              offset += utils2.getNewlineLength(source, offset + 1, nextCode);
            } else if (charCodeDefinitions2.isValidEscape(code2, nextCode)) {
              offset = utils2.consumeEscaped(source, offset) - 1;
            }
            break;
        }
      }
    }
    function consumeUrlToken() {
      type = types2.Url;
      offset = utils2.findWhiteSpaceEnd(source, offset);
      for (; offset < source.length; offset++) {
        const code2 = source.charCodeAt(offset);
        switch (charCodeDefinitions2.charCodeCategory(code2)) {
          // U+0029 RIGHT PARENTHESIS ())
          case 41:
            offset++;
            return;
          // EOF
          // case EofCategory:
          // This is a parse error. Return the <url-token>.
          // return;
          // whitespace
          case charCodeDefinitions2.WhiteSpaceCategory:
            offset = utils2.findWhiteSpaceEnd(source, offset);
            if (getCharCode2(offset) === 41 || offset >= source.length) {
              if (offset < source.length) {
                offset++;
              }
              return;
            }
            offset = utils2.consumeBadUrlRemnants(source, offset);
            type = types2.BadUrl;
            return;
          // U+0022 QUOTATION MARK (")
          // U+0027 APOSTROPHE (')
          // U+0028 LEFT PARENTHESIS (()
          // non-printable code point
          case 34:
          case 39:
          case 40:
          case charCodeDefinitions2.NonPrintableCategory:
            offset = utils2.consumeBadUrlRemnants(source, offset);
            type = types2.BadUrl;
            return;
          // U+005C REVERSE SOLIDUS (\)
          case 92:
            if (charCodeDefinitions2.isValidEscape(code2, getCharCode2(offset + 1))) {
              offset = utils2.consumeEscaped(source, offset) - 1;
              break;
            }
            offset = utils2.consumeBadUrlRemnants(source, offset);
            type = types2.BadUrl;
            return;
        }
      }
    }
    source = String(source || "");
    const sourceLength = source.length;
    let start = charCodeDefinitions2.isBOM(getCharCode2(0));
    let offset = start;
    let type;
    while (offset < sourceLength) {
      const code2 = source.charCodeAt(offset);
      switch (charCodeDefinitions2.charCodeCategory(code2)) {
        // whitespace
        case charCodeDefinitions2.WhiteSpaceCategory:
          type = types2.WhiteSpace;
          offset = utils2.findWhiteSpaceEnd(source, offset + 1);
          break;
        // U+0022 QUOTATION MARK (")
        case 34:
          consumeStringToken();
          break;
        // U+0023 NUMBER SIGN (#)
        case 35:
          if (charCodeDefinitions2.isName(getCharCode2(offset + 1)) || charCodeDefinitions2.isValidEscape(getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            type = types2.Hash;
            offset = utils2.consumeName(source, offset + 1);
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+0027 APOSTROPHE (')
        case 39:
          consumeStringToken();
          break;
        // U+0028 LEFT PARENTHESIS (()
        case 40:
          type = types2.LeftParenthesis;
          offset++;
          break;
        // U+0029 RIGHT PARENTHESIS ())
        case 41:
          type = types2.RightParenthesis;
          offset++;
          break;
        // U+002B PLUS SIGN (+)
        case 43:
          if (charCodeDefinitions2.isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            consumeNumericToken();
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+002C COMMA (,)
        case 44:
          type = types2.Comma;
          offset++;
          break;
        // U+002D HYPHEN-MINUS (-)
        case 45:
          if (charCodeDefinitions2.isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            consumeNumericToken();
          } else {
            if (getCharCode2(offset + 1) === 45 && getCharCode2(offset + 2) === 62) {
              type = types2.CDC;
              offset = offset + 3;
            } else {
              if (charCodeDefinitions2.isIdentifierStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
                consumeIdentLikeToken();
              } else {
                type = types2.Delim;
                offset++;
              }
            }
          }
          break;
        // U+002E FULL STOP (.)
        case 46:
          if (charCodeDefinitions2.isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            consumeNumericToken();
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+002F SOLIDUS (/)
        case 47:
          if (getCharCode2(offset + 1) === 42) {
            type = types2.Comment;
            offset = source.indexOf("*/", offset + 2);
            offset = offset === -1 ? source.length : offset + 2;
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+003A COLON (:)
        case 58:
          type = types2.Colon;
          offset++;
          break;
        // U+003B SEMICOLON (;)
        case 59:
          type = types2.Semicolon;
          offset++;
          break;
        // U+003C LESS-THAN SIGN (<)
        case 60:
          if (getCharCode2(offset + 1) === 33 && getCharCode2(offset + 2) === 45 && getCharCode2(offset + 3) === 45) {
            type = types2.CDO;
            offset = offset + 4;
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+0040 COMMERCIAL AT (@)
        case 64:
          if (charCodeDefinitions2.isIdentifierStart(getCharCode2(offset + 1), getCharCode2(offset + 2), getCharCode2(offset + 3))) {
            type = types2.AtKeyword;
            offset = utils2.consumeName(source, offset + 1);
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+005B LEFT SQUARE BRACKET ([)
        case 91:
          type = types2.LeftSquareBracket;
          offset++;
          break;
        // U+005C REVERSE SOLIDUS (\)
        case 92:
          if (charCodeDefinitions2.isValidEscape(code2, getCharCode2(offset + 1))) {
            consumeIdentLikeToken();
          } else {
            type = types2.Delim;
            offset++;
          }
          break;
        // U+005D RIGHT SQUARE BRACKET (])
        case 93:
          type = types2.RightSquareBracket;
          offset++;
          break;
        // U+007B LEFT CURLY BRACKET ({)
        case 123:
          type = types2.LeftCurlyBracket;
          offset++;
          break;
        // U+007D RIGHT CURLY BRACKET (})
        case 125:
          type = types2.RightCurlyBracket;
          offset++;
          break;
        // digit
        case charCodeDefinitions2.DigitCategory:
          consumeNumericToken();
          break;
        // name-start code point
        case charCodeDefinitions2.NameStartCategory:
          consumeIdentLikeToken();
          break;
        // EOF
        // case EofCategory:
        // Return an <EOF-token>.
        // break;
        // anything else
        default:
          type = types2.Delim;
          offset++;
      }
      onToken(type, start, start = offset);
    }
  }
  tokenizer.AtKeyword = types2.AtKeyword;
  tokenizer.BadString = types2.BadString;
  tokenizer.BadUrl = types2.BadUrl;
  tokenizer.CDC = types2.CDC;
  tokenizer.CDO = types2.CDO;
  tokenizer.Colon = types2.Colon;
  tokenizer.Comma = types2.Comma;
  tokenizer.Comment = types2.Comment;
  tokenizer.Delim = types2.Delim;
  tokenizer.Dimension = types2.Dimension;
  tokenizer.EOF = types2.EOF;
  tokenizer.Function = types2.Function;
  tokenizer.Hash = types2.Hash;
  tokenizer.Ident = types2.Ident;
  tokenizer.LeftCurlyBracket = types2.LeftCurlyBracket;
  tokenizer.LeftParenthesis = types2.LeftParenthesis;
  tokenizer.LeftSquareBracket = types2.LeftSquareBracket;
  tokenizer.Number = types2.Number;
  tokenizer.Percentage = types2.Percentage;
  tokenizer.RightCurlyBracket = types2.RightCurlyBracket;
  tokenizer.RightParenthesis = types2.RightParenthesis;
  tokenizer.RightSquareBracket = types2.RightSquareBracket;
  tokenizer.Semicolon = types2.Semicolon;
  tokenizer.String = types2.String;
  tokenizer.Url = types2.Url;
  tokenizer.WhiteSpace = types2.WhiteSpace;
  tokenizer.tokenTypes = types2;
  tokenizer.DigitCategory = charCodeDefinitions2.DigitCategory;
  tokenizer.EofCategory = charCodeDefinitions2.EofCategory;
  tokenizer.NameStartCategory = charCodeDefinitions2.NameStartCategory;
  tokenizer.NonPrintableCategory = charCodeDefinitions2.NonPrintableCategory;
  tokenizer.WhiteSpaceCategory = charCodeDefinitions2.WhiteSpaceCategory;
  tokenizer.charCodeCategory = charCodeDefinitions2.charCodeCategory;
  tokenizer.isBOM = charCodeDefinitions2.isBOM;
  tokenizer.isDigit = charCodeDefinitions2.isDigit;
  tokenizer.isHexDigit = charCodeDefinitions2.isHexDigit;
  tokenizer.isIdentifierStart = charCodeDefinitions2.isIdentifierStart;
  tokenizer.isLetter = charCodeDefinitions2.isLetter;
  tokenizer.isLowercaseLetter = charCodeDefinitions2.isLowercaseLetter;
  tokenizer.isName = charCodeDefinitions2.isName;
  tokenizer.isNameStart = charCodeDefinitions2.isNameStart;
  tokenizer.isNewline = charCodeDefinitions2.isNewline;
  tokenizer.isNonAscii = charCodeDefinitions2.isNonAscii;
  tokenizer.isNonPrintable = charCodeDefinitions2.isNonPrintable;
  tokenizer.isNumberStart = charCodeDefinitions2.isNumberStart;
  tokenizer.isUppercaseLetter = charCodeDefinitions2.isUppercaseLetter;
  tokenizer.isValidEscape = charCodeDefinitions2.isValidEscape;
  tokenizer.isWhiteSpace = charCodeDefinitions2.isWhiteSpace;
  tokenizer.cmpChar = utils2.cmpChar;
  tokenizer.cmpStr = utils2.cmpStr;
  tokenizer.consumeBadUrlRemnants = utils2.consumeBadUrlRemnants;
  tokenizer.consumeEscaped = utils2.consumeEscaped;
  tokenizer.consumeName = utils2.consumeName;
  tokenizer.consumeNumber = utils2.consumeNumber;
  tokenizer.decodeEscaped = utils2.decodeEscaped;
  tokenizer.findDecimalNumberEnd = utils2.findDecimalNumberEnd;
  tokenizer.findWhiteSpaceEnd = utils2.findWhiteSpaceEnd;
  tokenizer.findWhiteSpaceStart = utils2.findWhiteSpaceStart;
  tokenizer.getNewlineLength = utils2.getNewlineLength;
  tokenizer.tokenNames = names2;
  tokenizer.OffsetToLocation = OffsetToLocation2.OffsetToLocation;
  tokenizer.TokenStream = TokenStream2.TokenStream;
  tokenizer.tokenize = tokenize2;
  return tokenizer;
}
var create$3 = {};
var List$1 = {};
var hasRequiredList;
function requireList() {
  if (hasRequiredList) return List$1;
  hasRequiredList = 1;
  let releasedCursors2 = null;
  class List2 {
    static createItem(data2) {
      return {
        prev: null,
        next: null,
        data: data2
      };
    }
    constructor() {
      this.head = null;
      this.tail = null;
      this.cursor = null;
    }
    createItem(data2) {
      return List2.createItem(data2);
    }
    // cursor helpers
    allocateCursor(prev, next) {
      let cursor;
      if (releasedCursors2 !== null) {
        cursor = releasedCursors2;
        releasedCursors2 = releasedCursors2.cursor;
        cursor.prev = prev;
        cursor.next = next;
        cursor.cursor = this.cursor;
      } else {
        cursor = {
          prev,
          next,
          cursor: this.cursor
        };
      }
      this.cursor = cursor;
      return cursor;
    }
    releaseCursor() {
      const { cursor } = this;
      this.cursor = cursor.cursor;
      cursor.prev = null;
      cursor.next = null;
      cursor.cursor = releasedCursors2;
      releasedCursors2 = cursor;
    }
    updateCursors(prevOld, prevNew, nextOld, nextNew) {
      let { cursor } = this;
      while (cursor !== null) {
        if (cursor.prev === prevOld) {
          cursor.prev = prevNew;
        }
        if (cursor.next === nextOld) {
          cursor.next = nextNew;
        }
        cursor = cursor.cursor;
      }
    }
    *[Symbol.iterator]() {
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        yield cursor.data;
      }
    }
    // getters
    get size() {
      let size = 0;
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        size++;
      }
      return size;
    }
    get isEmpty() {
      return this.head === null;
    }
    get first() {
      return this.head && this.head.data;
    }
    get last() {
      return this.tail && this.tail.data;
    }
    // convertors
    fromArray(array) {
      let cursor = null;
      this.head = null;
      for (let data2 of array) {
        const item = List2.createItem(data2);
        if (cursor !== null) {
          cursor.next = item;
        } else {
          this.head = item;
        }
        item.prev = cursor;
        cursor = item;
      }
      this.tail = cursor;
      return this;
    }
    toArray() {
      return [...this];
    }
    toJSON() {
      return [...this];
    }
    // array-like methods
    forEach(fn, thisArg = this) {
      const cursor = this.allocateCursor(null, this.head);
      while (cursor.next !== null) {
        const item = cursor.next;
        cursor.next = item.next;
        fn.call(thisArg, item.data, item, this);
      }
      this.releaseCursor();
    }
    forEachRight(fn, thisArg = this) {
      const cursor = this.allocateCursor(this.tail, null);
      while (cursor.prev !== null) {
        const item = cursor.prev;
        cursor.prev = item.prev;
        fn.call(thisArg, item.data, item, this);
      }
      this.releaseCursor();
    }
    reduce(fn, initialValue, thisArg = this) {
      let cursor = this.allocateCursor(null, this.head);
      let acc = initialValue;
      let item;
      while (cursor.next !== null) {
        item = cursor.next;
        cursor.next = item.next;
        acc = fn.call(thisArg, acc, item.data, item, this);
      }
      this.releaseCursor();
      return acc;
    }
    reduceRight(fn, initialValue, thisArg = this) {
      let cursor = this.allocateCursor(this.tail, null);
      let acc = initialValue;
      let item;
      while (cursor.prev !== null) {
        item = cursor.prev;
        cursor.prev = item.prev;
        acc = fn.call(thisArg, acc, item.data, item, this);
      }
      this.releaseCursor();
      return acc;
    }
    some(fn, thisArg = this) {
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        if (fn.call(thisArg, cursor.data, cursor, this)) {
          return true;
        }
      }
      return false;
    }
    map(fn, thisArg = this) {
      const result = new List2();
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        result.appendData(fn.call(thisArg, cursor.data, cursor, this));
      }
      return result;
    }
    filter(fn, thisArg = this) {
      const result = new List2();
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        if (fn.call(thisArg, cursor.data, cursor, this)) {
          result.appendData(cursor.data);
        }
      }
      return result;
    }
    nextUntil(start, fn, thisArg = this) {
      if (start === null) {
        return;
      }
      const cursor = this.allocateCursor(null, start);
      while (cursor.next !== null) {
        const item = cursor.next;
        cursor.next = item.next;
        if (fn.call(thisArg, item.data, item, this)) {
          break;
        }
      }
      this.releaseCursor();
    }
    prevUntil(start, fn, thisArg = this) {
      if (start === null) {
        return;
      }
      const cursor = this.allocateCursor(start, null);
      while (cursor.prev !== null) {
        const item = cursor.prev;
        cursor.prev = item.prev;
        if (fn.call(thisArg, item.data, item, this)) {
          break;
        }
      }
      this.releaseCursor();
    }
    // mutation
    clear() {
      this.head = null;
      this.tail = null;
    }
    copy() {
      const result = new List2();
      for (let data2 of this) {
        result.appendData(data2);
      }
      return result;
    }
    prepend(item) {
      this.updateCursors(null, item, this.head, item);
      if (this.head !== null) {
        this.head.prev = item;
        item.next = this.head;
      } else {
        this.tail = item;
      }
      this.head = item;
      return this;
    }
    prependData(data2) {
      return this.prepend(List2.createItem(data2));
    }
    append(item) {
      return this.insert(item);
    }
    appendData(data2) {
      return this.insert(List2.createItem(data2));
    }
    insert(item, before = null) {
      if (before !== null) {
        this.updateCursors(before.prev, item, before, item);
        if (before.prev === null) {
          if (this.head !== before) {
            throw new Error("before doesn't belong to list");
          }
          this.head = item;
          before.prev = item;
          item.next = before;
          this.updateCursors(null, item);
        } else {
          before.prev.next = item;
          item.prev = before.prev;
          before.prev = item;
          item.next = before;
        }
      } else {
        this.updateCursors(this.tail, item, null, item);
        if (this.tail !== null) {
          this.tail.next = item;
          item.prev = this.tail;
        } else {
          this.head = item;
        }
        this.tail = item;
      }
      return this;
    }
    insertData(data2, before) {
      return this.insert(List2.createItem(data2), before);
    }
    remove(item) {
      this.updateCursors(item, item.prev, item, item.next);
      if (item.prev !== null) {
        item.prev.next = item.next;
      } else {
        if (this.head !== item) {
          throw new Error("item doesn't belong to list");
        }
        this.head = item.next;
      }
      if (item.next !== null) {
        item.next.prev = item.prev;
      } else {
        if (this.tail !== item) {
          throw new Error("item doesn't belong to list");
        }
        this.tail = item.prev;
      }
      item.prev = null;
      item.next = null;
      return item;
    }
    push(data2) {
      this.insert(List2.createItem(data2));
    }
    pop() {
      return this.tail !== null ? this.remove(this.tail) : null;
    }
    unshift(data2) {
      this.prepend(List2.createItem(data2));
    }
    shift() {
      return this.head !== null ? this.remove(this.head) : null;
    }
    prependList(list) {
      return this.insertList(list, this.head);
    }
    appendList(list) {
      return this.insertList(list);
    }
    insertList(list, before) {
      if (list.head === null) {
        return this;
      }
      if (before !== void 0 && before !== null) {
        this.updateCursors(before.prev, list.tail, before, list.head);
        if (before.prev !== null) {
          before.prev.next = list.head;
          list.head.prev = before.prev;
        } else {
          this.head = list.head;
        }
        before.prev = list.tail;
        list.tail.next = before;
      } else {
        this.updateCursors(this.tail, list.tail, null, list.head);
        if (this.tail !== null) {
          this.tail.next = list.head;
          list.head.prev = this.tail;
        } else {
          this.head = list.head;
        }
        this.tail = list.tail;
      }
      list.head = null;
      list.tail = null;
      return this;
    }
    replace(oldItem, newItemOrList) {
      if ("head" in newItemOrList) {
        this.insertList(newItemOrList, oldItem);
      } else {
        this.insert(newItemOrList, oldItem);
      }
      this.remove(oldItem);
    }
  }
  List$1.List = List2;
  return List$1;
}
var _SyntaxError$1 = {};
var createCustomError$1 = {};
var hasRequiredCreateCustomError;
function requireCreateCustomError() {
  if (hasRequiredCreateCustomError) return createCustomError$1;
  hasRequiredCreateCustomError = 1;
  function createCustomError2(name2, message) {
    const error2 = Object.create(SyntaxError.prototype);
    const errorStack = new Error();
    return Object.assign(error2, {
      name: name2,
      message,
      get stack() {
        return (errorStack.stack || "").replace(/^(.+\n){1,3}/, `${name2}: ${message}
`);
      }
    });
  }
  createCustomError$1.createCustomError = createCustomError2;
  return createCustomError$1;
}
var hasRequired_SyntaxError$1;
function require_SyntaxError$1() {
  if (hasRequired_SyntaxError$1) return _SyntaxError$1;
  hasRequired_SyntaxError$1 = 1;
  const createCustomError2 = /* @__PURE__ */ requireCreateCustomError();
  const MAX_LINE_LENGTH2 = 100;
  const OFFSET_CORRECTION2 = 60;
  const TAB_REPLACEMENT2 = "    ";
  function sourceFragment2({ source, line, column, baseLine, baseColumn }, extraLines) {
    function processLines(start, end) {
      return lines.slice(start, end).map(
        (line2, idx) => String(start + idx + 1).padStart(maxNumLength) + " |" + line2
      ).join("\n");
    }
    const prelines = "\n".repeat(Math.max(baseLine - 1, 0));
    const precolumns = " ".repeat(Math.max(baseColumn - 1, 0));
    const lines = (prelines + precolumns + source).split(/\r\n?|\n|\f/);
    const startLine = Math.max(1, line - extraLines) - 1;
    const endLine = Math.min(line + extraLines, lines.length + 1);
    const maxNumLength = Math.max(4, String(endLine).length) + 1;
    let cutLeft = 0;
    column += (TAB_REPLACEMENT2.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;
    if (column > MAX_LINE_LENGTH2) {
      cutLeft = column - OFFSET_CORRECTION2 + 3;
      column = OFFSET_CORRECTION2 - 2;
    }
    for (let i = startLine; i <= endLine; i++) {
      if (i >= 0 && i < lines.length) {
        lines[i] = lines[i].replace(/\t/g, TAB_REPLACEMENT2);
        lines[i] = (cutLeft > 0 && lines[i].length > cutLeft ? "…" : "") + lines[i].substr(cutLeft, MAX_LINE_LENGTH2 - 2) + (lines[i].length > cutLeft + MAX_LINE_LENGTH2 - 1 ? "…" : "");
      }
    }
    return [
      processLines(startLine, line),
      new Array(column + maxNumLength + 2).join("-") + "^",
      processLines(line, endLine)
    ].filter(Boolean).join("\n").replace(/^(\s+\d+\s+\|\n)+/, "").replace(/\n(\s+\d+\s+\|)+$/, "");
  }
  function SyntaxError2(message, source, offset, line, column, baseLine = 1, baseColumn = 1) {
    const error2 = Object.assign(createCustomError2.createCustomError("SyntaxError", message), {
      source,
      offset,
      line,
      column,
      sourceFragment(extraLines) {
        return sourceFragment2({ source, line, column, baseLine, baseColumn }, isNaN(extraLines) ? 0 : extraLines);
      },
      get formattedMessage() {
        return `Parse error: ${message}
` + sourceFragment2({ source, line, column, baseLine, baseColumn }, 2);
      }
    });
    return error2;
  }
  _SyntaxError$1.SyntaxError = SyntaxError2;
  return _SyntaxError$1;
}
var sequence = {};
var hasRequiredSequence;
function requireSequence() {
  if (hasRequiredSequence) return sequence;
  hasRequiredSequence = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function readSequence2(recognizer) {
    const children = this.createList();
    let space = false;
    const context = {
      recognizer
    };
    while (!this.eof) {
      switch (this.tokenType) {
        case types2.Comment:
          this.next();
          continue;
        case types2.WhiteSpace:
          space = true;
          this.next();
          continue;
      }
      let child = recognizer.getNode.call(this, context);
      if (child === void 0) {
        break;
      }
      if (space) {
        if (recognizer.onWhiteSpace) {
          recognizer.onWhiteSpace.call(this, child, children, context);
        }
        space = false;
      }
      children.push(child);
    }
    if (space && recognizer.onWhiteSpace) {
      recognizer.onWhiteSpace.call(this, null, children, context);
    }
    return children;
  }
  sequence.readSequence = readSequence2;
  return sequence;
}
var hasRequiredCreate$4;
function requireCreate$4() {
  if (hasRequiredCreate$4) return create$3;
  hasRequiredCreate$4 = 1;
  const List2 = /* @__PURE__ */ requireList();
  const SyntaxError2 = /* @__PURE__ */ require_SyntaxError$1();
  const index = /* @__PURE__ */ requireTokenizer();
  const sequence2 = /* @__PURE__ */ requireSequence();
  const OffsetToLocation2 = /* @__PURE__ */ requireOffsetToLocation();
  const TokenStream2 = /* @__PURE__ */ requireTokenStream();
  const utils2 = /* @__PURE__ */ requireUtils();
  const types2 = /* @__PURE__ */ requireTypes();
  const names2 = /* @__PURE__ */ requireNames$1();
  const NOOP2 = () => {
  };
  const EXCLAMATIONMARK2 = 33;
  const NUMBERSIGN2 = 35;
  const SEMICOLON2 = 59;
  const LEFTCURLYBRACKET2 = 123;
  const NULL2 = 0;
  const arrayMethods2 = {
    createList() {
      return [];
    },
    createSingleNodeList(node2) {
      return [node2];
    },
    getFirstListNode(list) {
      return list && list[0] || null;
    },
    getLastListNode(list) {
      return list && list.length > 0 ? list[list.length - 1] : null;
    }
  };
  const listMethods2 = {
    createList() {
      return new List2.List();
    },
    createSingleNodeList(node2) {
      return new List2.List().appendData(node2);
    },
    getFirstListNode(list) {
      return list && list.first;
    },
    getLastListNode(list) {
      return list && list.last;
    }
  };
  function createParseContext2(name2) {
    return function() {
      return this[name2]();
    };
  }
  function fetchParseValues2(dict) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const name2 of Object.keys(dict)) {
      const item = dict[name2];
      const fn = item.parse || item;
      if (fn) {
        result[name2] = fn;
      }
    }
    return result;
  }
  function processConfig2(config) {
    const parseConfig = {
      context: /* @__PURE__ */ Object.create(null),
      features: Object.assign(/* @__PURE__ */ Object.create(null), config.features),
      scope: Object.assign(/* @__PURE__ */ Object.create(null), config.scope),
      atrule: fetchParseValues2(config.atrule),
      pseudo: fetchParseValues2(config.pseudo),
      node: fetchParseValues2(config.node)
    };
    for (const [name2, context] of Object.entries(config.parseContext)) {
      switch (typeof context) {
        case "function":
          parseConfig.context[name2] = context;
          break;
        case "string":
          parseConfig.context[name2] = createParseContext2(context);
          break;
      }
    }
    return {
      config: parseConfig,
      ...parseConfig,
      ...parseConfig.node
    };
  }
  function createParser2(config) {
    let source = "";
    let filename = "<unknown>";
    let needPositions = false;
    let onParseError = NOOP2;
    let onParseErrorThrow = false;
    const locationMap = new OffsetToLocation2.OffsetToLocation();
    const parser2 = Object.assign(new TokenStream2.TokenStream(), processConfig2(config || {}), {
      parseAtrulePrelude: true,
      parseRulePrelude: true,
      parseValue: true,
      parseCustomProperty: false,
      readSequence: sequence2.readSequence,
      consumeUntilBalanceEnd: () => 0,
      consumeUntilLeftCurlyBracket(code2) {
        return code2 === LEFTCURLYBRACKET2 ? 1 : 0;
      },
      consumeUntilLeftCurlyBracketOrSemicolon(code2) {
        return code2 === LEFTCURLYBRACKET2 || code2 === SEMICOLON2 ? 1 : 0;
      },
      consumeUntilExclamationMarkOrSemicolon(code2) {
        return code2 === EXCLAMATIONMARK2 || code2 === SEMICOLON2 ? 1 : 0;
      },
      consumeUntilSemicolonIncluded(code2) {
        return code2 === SEMICOLON2 ? 2 : 0;
      },
      createList: NOOP2,
      createSingleNodeList: NOOP2,
      getFirstListNode: NOOP2,
      getLastListNode: NOOP2,
      parseWithFallback(consumer, fallback) {
        const startIndex = this.tokenIndex;
        try {
          return consumer.call(this);
        } catch (e) {
          if (onParseErrorThrow) {
            throw e;
          }
          this.skip(startIndex - this.tokenIndex);
          const fallbackNode = fallback.call(this);
          onParseErrorThrow = true;
          onParseError(e, fallbackNode);
          onParseErrorThrow = false;
          return fallbackNode;
        }
      },
      lookupNonWSType(offset) {
        let type;
        do {
          type = this.lookupType(offset++);
          if (type !== types2.WhiteSpace && type !== types2.Comment) {
            return type;
          }
        } while (type !== NULL2);
        return NULL2;
      },
      charCodeAt(offset) {
        return offset >= 0 && offset < source.length ? source.charCodeAt(offset) : 0;
      },
      substring(offsetStart, offsetEnd) {
        return source.substring(offsetStart, offsetEnd);
      },
      substrToCursor(start) {
        return this.source.substring(start, this.tokenStart);
      },
      cmpChar(offset, charCode) {
        return utils2.cmpChar(source, offset, charCode);
      },
      cmpStr(offsetStart, offsetEnd, str) {
        return utils2.cmpStr(source, offsetStart, offsetEnd, str);
      },
      consume(tokenType2) {
        const start = this.tokenStart;
        this.eat(tokenType2);
        return this.substrToCursor(start);
      },
      consumeFunctionName() {
        const name2 = source.substring(this.tokenStart, this.tokenEnd - 1);
        this.eat(types2.Function);
        return name2;
      },
      consumeNumber(type) {
        const number2 = source.substring(this.tokenStart, utils2.consumeNumber(source, this.tokenStart));
        this.eat(type);
        return number2;
      },
      eat(tokenType2) {
        if (this.tokenType !== tokenType2) {
          const tokenName = names2[tokenType2].slice(0, -6).replace(/-/g, " ").replace(/^./, (m) => m.toUpperCase());
          let message = `${/[[\](){}]/.test(tokenName) ? `"${tokenName}"` : tokenName} is expected`;
          let offset = this.tokenStart;
          switch (tokenType2) {
            case types2.Ident:
              if (this.tokenType === types2.Function || this.tokenType === types2.Url) {
                offset = this.tokenEnd - 1;
                message = "Identifier is expected but function found";
              } else {
                message = "Identifier is expected";
              }
              break;
            case types2.Hash:
              if (this.isDelim(NUMBERSIGN2)) {
                this.next();
                offset++;
                message = "Name is expected";
              }
              break;
            case types2.Percentage:
              if (this.tokenType === types2.Number) {
                offset = this.tokenEnd;
                message = "Percent sign is expected";
              }
              break;
          }
          this.error(message, offset);
        }
        this.next();
      },
      eatIdent(name2) {
        if (this.tokenType !== types2.Ident || this.lookupValue(0, name2) === false) {
          this.error(`Identifier "${name2}" is expected`);
        }
        this.next();
      },
      eatDelim(code2) {
        if (!this.isDelim(code2)) {
          this.error(`Delim "${String.fromCharCode(code2)}" is expected`);
        }
        this.next();
      },
      getLocation(start, end) {
        if (needPositions) {
          return locationMap.getLocationRange(
            start,
            end,
            filename
          );
        }
        return null;
      },
      getLocationFromList(list) {
        if (needPositions) {
          const head = this.getFirstListNode(list);
          const tail = this.getLastListNode(list);
          return locationMap.getLocationRange(
            head !== null ? head.loc.start.offset - locationMap.startOffset : this.tokenStart,
            tail !== null ? tail.loc.end.offset - locationMap.startOffset : this.tokenStart,
            filename
          );
        }
        return null;
      },
      error(message, offset) {
        const location = typeof offset !== "undefined" && offset < source.length ? locationMap.getLocation(offset) : this.eof ? locationMap.getLocation(utils2.findWhiteSpaceStart(source, source.length - 1)) : locationMap.getLocation(this.tokenStart);
        throw new SyntaxError2.SyntaxError(
          message || "Unexpected input",
          source,
          location.offset,
          location.line,
          location.column,
          locationMap.startLine,
          locationMap.startColumn
        );
      }
    });
    const createTokenIterateAPI = () => ({
      filename,
      source,
      tokenCount: parser2.tokenCount,
      getTokenType: (index2) => parser2.getTokenType(index2),
      getTokenTypeName: (index2) => names2[parser2.getTokenType(index2)],
      getTokenStart: (index2) => parser2.getTokenStart(index2),
      getTokenEnd: (index2) => parser2.getTokenEnd(index2),
      getTokenValue: (index2) => parser2.source.substring(parser2.getTokenStart(index2), parser2.getTokenEnd(index2)),
      substring: (start, end) => parser2.source.substring(start, end),
      balance: parser2.balance.subarray(0, parser2.tokenCount + 1),
      isBlockOpenerTokenType: parser2.isBlockOpenerTokenType,
      isBlockCloserTokenType: parser2.isBlockCloserTokenType,
      getBlockTokenPairIndex: (index2) => parser2.getBlockTokenPairIndex(index2),
      getLocation: (offset) => locationMap.getLocation(offset, filename),
      getRangeLocation: (start, end) => locationMap.getLocationRange(start, end, filename)
    });
    const parse2 = function(source_, options) {
      source = source_;
      options = options || {};
      parser2.setSource(source, index.tokenize);
      locationMap.setSource(
        source,
        options.offset,
        options.line,
        options.column
      );
      filename = options.filename || "<unknown>";
      needPositions = Boolean(options.positions);
      onParseError = typeof options.onParseError === "function" ? options.onParseError : NOOP2;
      onParseErrorThrow = false;
      parser2.parseAtrulePrelude = "parseAtrulePrelude" in options ? Boolean(options.parseAtrulePrelude) : true;
      parser2.parseRulePrelude = "parseRulePrelude" in options ? Boolean(options.parseRulePrelude) : true;
      parser2.parseValue = "parseValue" in options ? Boolean(options.parseValue) : true;
      parser2.parseCustomProperty = "parseCustomProperty" in options ? Boolean(options.parseCustomProperty) : false;
      const { context = "default", list = true, onComment, onToken } = options;
      if (context in parser2.context === false) {
        throw new Error("Unknown context `" + context + "`");
      }
      Object.assign(parser2, list ? listMethods2 : arrayMethods2);
      if (Array.isArray(onToken)) {
        parser2.forEachToken((type, start, end) => {
          onToken.push({ type, start, end });
        });
      } else if (typeof onToken === "function") {
        parser2.forEachToken(onToken.bind(createTokenIterateAPI()));
      }
      if (typeof onComment === "function") {
        parser2.forEachToken((type, start, end) => {
          if (type === types2.Comment) {
            const loc = parser2.getLocation(start, end);
            const value2 = utils2.cmpStr(source, end - 2, end, "*/") ? source.slice(start + 2, end - 2) : source.slice(start + 2, end);
            onComment(value2, loc);
          }
        });
      }
      const ast = parser2.context[context].call(parser2, options);
      if (!parser2.eof) {
        parser2.error();
      }
      return ast;
    };
    return Object.assign(parse2, {
      SyntaxError: SyntaxError2.SyntaxError,
      config: parser2.config
    });
  }
  create$3.createParser = createParser2;
  return create$3;
}
var create$2 = {};
var sourceMap = {};
var hasRequiredSourceMap;
function requireSourceMap() {
  if (hasRequiredSourceMap) return sourceMap;
  hasRequiredSourceMap = 1;
  const sourceMapGenerator_js = requireSourceMapGenerator();
  const trackNodes2 = /* @__PURE__ */ new Set(["Atrule", "Selector", "Declaration"]);
  function generateSourceMap2(handlers) {
    const map = new sourceMapGenerator_js.SourceMapGenerator();
    const generated = {
      line: 1,
      column: 0
    };
    const original = {
      line: 0,
      // should be zero to add first mapping
      column: 0
    };
    const activatedGenerated = {
      line: 1,
      column: 0
    };
    const activatedMapping = {
      generated: activatedGenerated
    };
    let line = 1;
    let column = 0;
    let sourceMappingActive = false;
    const origHandlersNode = handlers.node;
    handlers.node = function(node2) {
      if (node2.loc && node2.loc.start && trackNodes2.has(node2.type)) {
        const nodeLine = node2.loc.start.line;
        const nodeColumn = node2.loc.start.column - 1;
        if (original.line !== nodeLine || original.column !== nodeColumn) {
          original.line = nodeLine;
          original.column = nodeColumn;
          generated.line = line;
          generated.column = column;
          if (sourceMappingActive) {
            sourceMappingActive = false;
            if (generated.line !== activatedGenerated.line || generated.column !== activatedGenerated.column) {
              map.addMapping(activatedMapping);
            }
          }
          sourceMappingActive = true;
          map.addMapping({
            source: node2.loc.source,
            original,
            generated
          });
        }
      }
      origHandlersNode.call(this, node2);
      if (sourceMappingActive && trackNodes2.has(node2.type)) {
        activatedGenerated.line = line;
        activatedGenerated.column = column;
      }
    };
    const origHandlersEmit = handlers.emit;
    handlers.emit = function(value2, type, auto) {
      for (let i = 0; i < value2.length; i++) {
        if (value2.charCodeAt(i) === 10) {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      origHandlersEmit(value2, type, auto);
    };
    const origHandlersResult = handlers.result;
    handlers.result = function() {
      if (sourceMappingActive) {
        map.addMapping(activatedMapping);
      }
      return {
        css: origHandlersResult(),
        map
      };
    };
    return handlers;
  }
  sourceMap.generateSourceMap = generateSourceMap2;
  return sourceMap;
}
var tokenBefore$1 = {};
var hasRequiredTokenBefore;
function requireTokenBefore() {
  if (hasRequiredTokenBefore) return tokenBefore$1;
  hasRequiredTokenBefore = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const PLUSSIGN2 = 43;
  const HYPHENMINUS2 = 45;
  const code2 = (type, value2) => {
    if (type === types2.Delim) {
      type = value2;
    }
    if (typeof type === "string") {
      type = Math.min(type.charCodeAt(0), 128) << 6;
    }
    return type << 1;
  };
  const specPairs2 = [
    [types2.Ident, types2.Ident],
    [types2.Ident, types2.Function],
    [types2.Ident, types2.Url],
    [types2.Ident, types2.BadUrl],
    [types2.Ident, "-"],
    [types2.Ident, types2.Number],
    [types2.Ident, types2.Percentage],
    [types2.Ident, types2.Dimension],
    [types2.Ident, types2.CDC],
    [types2.Ident, types2.LeftParenthesis],
    [types2.AtKeyword, types2.Ident],
    [types2.AtKeyword, types2.Function],
    [types2.AtKeyword, types2.Url],
    [types2.AtKeyword, types2.BadUrl],
    [types2.AtKeyword, "-"],
    [types2.AtKeyword, types2.Number],
    [types2.AtKeyword, types2.Percentage],
    [types2.AtKeyword, types2.Dimension],
    [types2.AtKeyword, types2.CDC],
    [types2.Hash, types2.Ident],
    [types2.Hash, types2.Function],
    [types2.Hash, types2.Url],
    [types2.Hash, types2.BadUrl],
    [types2.Hash, "-"],
    [types2.Hash, types2.Number],
    [types2.Hash, types2.Percentage],
    [types2.Hash, types2.Dimension],
    [types2.Hash, types2.CDC],
    [types2.Dimension, types2.Ident],
    [types2.Dimension, types2.Function],
    [types2.Dimension, types2.Url],
    [types2.Dimension, types2.BadUrl],
    [types2.Dimension, "-"],
    [types2.Dimension, types2.Number],
    [types2.Dimension, types2.Percentage],
    [types2.Dimension, types2.Dimension],
    [types2.Dimension, types2.CDC],
    ["#", types2.Ident],
    ["#", types2.Function],
    ["#", types2.Url],
    ["#", types2.BadUrl],
    ["#", "-"],
    ["#", types2.Number],
    ["#", types2.Percentage],
    ["#", types2.Dimension],
    ["#", types2.CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    ["-", types2.Ident],
    ["-", types2.Function],
    ["-", types2.Url],
    ["-", types2.BadUrl],
    ["-", "-"],
    ["-", types2.Number],
    ["-", types2.Percentage],
    ["-", types2.Dimension],
    ["-", types2.CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    [types2.Number, types2.Ident],
    [types2.Number, types2.Function],
    [types2.Number, types2.Url],
    [types2.Number, types2.BadUrl],
    [types2.Number, types2.Number],
    [types2.Number, types2.Percentage],
    [types2.Number, types2.Dimension],
    [types2.Number, "%"],
    [types2.Number, types2.CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    ["@", types2.Ident],
    ["@", types2.Function],
    ["@", types2.Url],
    ["@", types2.BadUrl],
    ["@", "-"],
    ["@", types2.CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    [".", types2.Number],
    [".", types2.Percentage],
    [".", types2.Dimension],
    ["+", types2.Number],
    ["+", types2.Percentage],
    ["+", types2.Dimension],
    ["/", "*"]
  ];
  const safePairs2 = specPairs2.concat([
    [types2.Ident, types2.Hash],
    [types2.Dimension, types2.Hash],
    [types2.Hash, types2.Hash],
    [types2.AtKeyword, types2.LeftParenthesis],
    [types2.AtKeyword, types2.String],
    [types2.AtKeyword, types2.Colon],
    [types2.Percentage, types2.Percentage],
    [types2.Percentage, types2.Dimension],
    [types2.Percentage, types2.Function],
    [types2.Percentage, "-"],
    [types2.RightParenthesis, types2.Ident],
    [types2.RightParenthesis, types2.Function],
    [types2.RightParenthesis, types2.Percentage],
    [types2.RightParenthesis, types2.Dimension],
    [types2.RightParenthesis, types2.Hash],
    [types2.RightParenthesis, "-"]
  ]);
  function createMap2(pairs) {
    const isWhiteSpaceRequired = new Set(
      pairs.map(([prev, next]) => code2(prev) << 16 | code2(next))
    );
    return function(prevCode, type, value2) {
      const nextCode = code2(type, value2);
      const nextCharCode = value2.charCodeAt(0);
      const emitWs = nextCharCode === HYPHENMINUS2 && type !== types2.Ident && type !== types2.Function && type !== types2.CDC || nextCharCode === PLUSSIGN2 ? isWhiteSpaceRequired.has((prevCode & 65534) << 16 | nextCharCode << 7) : isWhiteSpaceRequired.has((prevCode & 65534) << 16 | nextCode);
      return nextCode | emitWs;
    };
  }
  const spec2 = createMap2(specPairs2);
  const safe2 = createMap2(safePairs2);
  tokenBefore$1.safe = safe2;
  tokenBefore$1.spec = spec2;
  return tokenBefore$1;
}
var hasRequiredCreate$3;
function requireCreate$3() {
  if (hasRequiredCreate$3) return create$2;
  hasRequiredCreate$3 = 1;
  const index = /* @__PURE__ */ requireTokenizer();
  const sourceMap2 = /* @__PURE__ */ requireSourceMap();
  const tokenBefore2 = /* @__PURE__ */ requireTokenBefore();
  const types2 = /* @__PURE__ */ requireTypes();
  const REVERSESOLIDUS2 = 92;
  function processChildren2(node2, delimeter) {
    if (typeof delimeter === "function") {
      let prev = null;
      node2.children.forEach((node3) => {
        if (prev !== null) {
          delimeter.call(this, prev);
        }
        this.node(node3);
        prev = node3;
      });
      return;
    }
    node2.children.forEach(this.node, this);
  }
  function createGenerator2(config) {
    const types$12 = /* @__PURE__ */ new Map();
    for (let [name2, item] of Object.entries(config.node)) {
      const fn = item.generate || item;
      if (typeof fn === "function") {
        types$12.set(name2, item.generate || item);
      }
    }
    return function(node2, options) {
      let buffer = "";
      let prevCode = 0;
      let handlers = {
        node(node3) {
          if (types$12.has(node3.type)) {
            types$12.get(node3.type).call(publicApi, node3);
          } else {
            throw new Error("Unknown node type: " + node3.type);
          }
        },
        tokenBefore: tokenBefore2.safe,
        token(type, value2, suppressAutoWhiteSpace) {
          prevCode = this.tokenBefore(prevCode, type, value2);
          if (!suppressAutoWhiteSpace && prevCode & 1) {
            this.emit(" ", types2.WhiteSpace, true);
          }
          this.emit(value2, type, false);
          if (type === types2.Delim && value2.charCodeAt(0) === REVERSESOLIDUS2) {
            this.emit("\n", types2.WhiteSpace, true);
          }
        },
        emit(value2) {
          buffer += value2;
        },
        result() {
          return buffer;
        }
      };
      if (options) {
        if (typeof options.decorator === "function") {
          handlers = options.decorator(handlers);
        }
        if (options.sourceMap) {
          handlers = sourceMap2.generateSourceMap(handlers);
        }
        if (options.mode in tokenBefore2) {
          handlers.tokenBefore = tokenBefore2[options.mode];
        }
      }
      const publicApi = {
        node: (node3) => handlers.node(node3),
        children: processChildren2,
        token: (type, value2) => handlers.token(type, value2),
        tokenize: (raw) => index.tokenize(raw, (type, start, end) => {
          handlers.token(
            type,
            raw.slice(start, end),
            start !== 0
            // suppress auto whitespace for internal value tokens
          );
        })
      };
      handlers.node(node2);
      return handlers.result();
    };
  }
  create$2.createGenerator = createGenerator2;
  return create$2;
}
var create$1 = {};
var hasRequiredCreate$2;
function requireCreate$2() {
  if (hasRequiredCreate$2) return create$1;
  hasRequiredCreate$2 = 1;
  const List2 = /* @__PURE__ */ requireList();
  function createConvertor2(walk2) {
    return {
      fromPlainObject(ast) {
        walk2(ast, {
          enter(node2) {
            if (node2.children && node2.children instanceof List2.List === false) {
              node2.children = new List2.List().fromArray(node2.children);
            }
          }
        });
        return ast;
      },
      toPlainObject(ast) {
        walk2(ast, {
          leave(node2) {
            if (node2.children && node2.children instanceof List2.List) {
              node2.children = node2.children.toArray();
            }
          }
        });
        return ast;
      }
    };
  }
  create$1.createConvertor = createConvertor2;
  return create$1;
}
var create = {};
var hasRequiredCreate$1;
function requireCreate$1() {
  if (hasRequiredCreate$1) return create;
  hasRequiredCreate$1 = 1;
  const { hasOwnProperty: hasOwnProperty2 } = Object.prototype;
  const noop2 = function() {
  };
  function ensureFunction2(value2) {
    return typeof value2 === "function" ? value2 : noop2;
  }
  function invokeForType2(fn, type) {
    return function(node2, item, list) {
      if (node2.type === type) {
        fn.call(this, node2, item, list);
      }
    };
  }
  function getWalkersFromStructure2(name2, nodeType) {
    const structure2 = nodeType.structure;
    const walkers = [];
    for (const key in structure2) {
      if (hasOwnProperty2.call(structure2, key) === false) {
        continue;
      }
      let fieldTypes = structure2[key];
      const walker2 = {
        name: key,
        type: false,
        nullable: false
      };
      if (!Array.isArray(fieldTypes)) {
        fieldTypes = [fieldTypes];
      }
      for (const fieldType of fieldTypes) {
        if (fieldType === null) {
          walker2.nullable = true;
        } else if (typeof fieldType === "string") {
          walker2.type = "node";
        } else if (Array.isArray(fieldType)) {
          walker2.type = "list";
        }
      }
      if (walker2.type) {
        walkers.push(walker2);
      }
    }
    if (walkers.length) {
      return {
        context: nodeType.walkContext,
        fields: walkers
      };
    }
    return null;
  }
  function getTypesFromConfig2(config) {
    const types2 = {};
    for (const name2 in config.node) {
      if (hasOwnProperty2.call(config.node, name2)) {
        const nodeType = config.node[name2];
        if (!nodeType.structure) {
          throw new Error("Missed `structure` field in `" + name2 + "` node type definition");
        }
        types2[name2] = getWalkersFromStructure2(name2, nodeType);
      }
    }
    return types2;
  }
  function createTypeIterator2(config, reverse) {
    const fields = config.fields.slice();
    const contextName = config.context;
    const useContext = typeof contextName === "string";
    if (reverse) {
      fields.reverse();
    }
    return function(node2, context, walk2, walkReducer) {
      let prevContextValue;
      if (useContext) {
        prevContextValue = context[contextName];
        context[contextName] = node2;
      }
      for (const field of fields) {
        const ref = node2[field.name];
        if (!field.nullable || ref) {
          if (field.type === "list") {
            const breakWalk = reverse ? ref.reduceRight(walkReducer, false) : ref.reduce(walkReducer, false);
            if (breakWalk) {
              return true;
            }
          } else if (walk2(ref)) {
            return true;
          }
        }
      }
      if (useContext) {
        context[contextName] = prevContextValue;
      }
    };
  }
  function createFastTraveralMap2({
    StyleSheet: StyleSheet2,
    Atrule: Atrule2,
    Rule: Rule2,
    Block: Block2,
    DeclarationList: DeclarationList2
  }) {
    return {
      Atrule: {
        StyleSheet: StyleSheet2,
        Atrule: Atrule2,
        Rule: Rule2,
        Block: Block2
      },
      Rule: {
        StyleSheet: StyleSheet2,
        Atrule: Atrule2,
        Rule: Rule2,
        Block: Block2
      },
      Declaration: {
        StyleSheet: StyleSheet2,
        Atrule: Atrule2,
        Rule: Rule2,
        Block: Block2,
        DeclarationList: DeclarationList2
      }
    };
  }
  function createWalker2(config) {
    const types2 = getTypesFromConfig2(config);
    const iteratorsNatural = {};
    const iteratorsReverse = {};
    const breakWalk = /* @__PURE__ */ Symbol("break-walk");
    const skipNode = /* @__PURE__ */ Symbol("skip-node");
    for (const name2 in types2) {
      if (hasOwnProperty2.call(types2, name2) && types2[name2] !== null) {
        iteratorsNatural[name2] = createTypeIterator2(types2[name2], false);
        iteratorsReverse[name2] = createTypeIterator2(types2[name2], true);
      }
    }
    const fastTraversalIteratorsNatural = createFastTraveralMap2(iteratorsNatural);
    const fastTraversalIteratorsReverse = createFastTraveralMap2(iteratorsReverse);
    const walk2 = function(root, options) {
      function walkNode(node2, item, list) {
        const enterRet = enter.call(context, node2, item, list);
        if (enterRet === breakWalk) {
          return true;
        }
        if (enterRet === skipNode) {
          return false;
        }
        if (iterators.hasOwnProperty(node2.type)) {
          if (iterators[node2.type](node2, context, walkNode, walkReducer)) {
            return true;
          }
        }
        if (leave.call(context, node2, item, list) === breakWalk) {
          return true;
        }
        return false;
      }
      let enter = noop2;
      let leave = noop2;
      let iterators = iteratorsNatural;
      let walkReducer = (ret, data2, item, list) => ret || walkNode(data2, item, list);
      const context = {
        break: breakWalk,
        skip: skipNode,
        root,
        stylesheet: null,
        atrule: null,
        atrulePrelude: null,
        rule: null,
        selector: null,
        block: null,
        declaration: null,
        function: null
      };
      if (typeof options === "function") {
        enter = options;
      } else if (options) {
        enter = ensureFunction2(options.enter);
        leave = ensureFunction2(options.leave);
        if (options.reverse) {
          iterators = iteratorsReverse;
        }
        if (options.visit) {
          if (fastTraversalIteratorsNatural.hasOwnProperty(options.visit)) {
            iterators = options.reverse ? fastTraversalIteratorsReverse[options.visit] : fastTraversalIteratorsNatural[options.visit];
          } else if (!types2.hasOwnProperty(options.visit)) {
            throw new Error("Bad value `" + options.visit + "` for `visit` option (should be: " + Object.keys(types2).sort().join(", ") + ")");
          }
          enter = invokeForType2(enter, options.visit);
          leave = invokeForType2(leave, options.visit);
        }
      }
      if (enter === noop2 && leave === noop2) {
        throw new Error("Neither `enter` nor `leave` walker handler is set or both aren't a function");
      }
      walkNode(root);
    };
    walk2.break = breakWalk;
    walk2.skip = skipNode;
    walk2.find = function(ast, fn) {
      let found = null;
      walk2(ast, function(node2, item, list) {
        if (fn.call(this, node2, item, list)) {
          found = node2;
          return breakWalk;
        }
      });
      return found;
    };
    walk2.findLast = function(ast, fn) {
      let found = null;
      walk2(ast, {
        reverse: true,
        enter(node2, item, list) {
          if (fn.call(this, node2, item, list)) {
            found = node2;
            return breakWalk;
          }
        }
      });
      return found;
    };
    walk2.findAll = function(ast, fn) {
      const found = [];
      walk2(ast, function(node2, item, list) {
        if (fn.call(this, node2, item, list)) {
          found.push(node2);
        }
      });
      return found;
    };
    return walk2;
  }
  create.createWalker = createWalker2;
  return create;
}
var Lexer$1 = {};
var error = {};
var generate$P = {};
var hasRequiredGenerate;
function requireGenerate() {
  if (hasRequiredGenerate) return generate$P;
  hasRequiredGenerate = 1;
  function noop2(value2) {
    return value2;
  }
  function generateMultiplier2(multiplier) {
    const { min, max, comma } = multiplier;
    if (min === 0 && max === 0) {
      return comma ? "#?" : "*";
    }
    if (min === 0 && max === 1) {
      return "?";
    }
    if (min === 1 && max === 0) {
      return comma ? "#" : "+";
    }
    if (min === 1 && max === 1) {
      return "";
    }
    return (comma ? "#" : "") + (min === max ? "{" + min + "}" : "{" + min + "," + (max !== 0 ? max : "") + "}");
  }
  function generateTypeOpts2(node2) {
    switch (node2.type) {
      case "Range":
        return " [" + (node2.min === null ? "-∞" : node2.min) + "," + (node2.max === null ? "∞" : node2.max) + "]";
      default:
        throw new Error("Unknown node type `" + node2.type + "`");
    }
  }
  function generateSequence2(node2, decorate, forceBraces, compact) {
    const combinator = node2.combinator === " " || compact ? node2.combinator : " " + node2.combinator + " ";
    const result = node2.terms.map((term) => internalGenerate2(term, decorate, forceBraces, compact)).join(combinator);
    if (node2.explicit || forceBraces) {
      return (compact || result[0] === "," ? "[" : "[ ") + result + (compact ? "]" : " ]");
    }
    return result;
  }
  function internalGenerate2(node2, decorate, forceBraces, compact) {
    let result;
    switch (node2.type) {
      case "Group":
        result = generateSequence2(node2, decorate, forceBraces, compact) + (node2.disallowEmpty ? "!" : "");
        break;
      case "Multiplier":
        return internalGenerate2(node2.term, decorate, forceBraces, compact) + decorate(generateMultiplier2(node2), node2);
      case "Boolean":
        result = "<boolean-expr[" + internalGenerate2(node2.term, decorate, forceBraces, compact) + "]>";
        break;
      case "Type":
        result = "<" + node2.name + (node2.opts ? decorate(generateTypeOpts2(node2.opts), node2.opts) : "") + ">";
        break;
      case "Property":
        result = "<'" + node2.name + "'>";
        break;
      case "Keyword":
        result = node2.name;
        break;
      case "AtKeyword":
        result = "@" + node2.name;
        break;
      case "Function":
        result = node2.name + "(";
        break;
      case "String":
      case "Token":
        result = node2.value;
        break;
      case "Comma":
        result = ",";
        break;
      default:
        throw new Error("Unknown node type `" + node2.type + "`");
    }
    return decorate(result, node2);
  }
  function generate2(node2, options) {
    let decorate = noop2;
    let forceBraces = false;
    let compact = false;
    if (typeof options === "function") {
      decorate = options;
    } else if (options) {
      forceBraces = Boolean(options.forceBraces);
      compact = Boolean(options.compact);
      if (typeof options.decorate === "function") {
        decorate = options.decorate;
      }
    }
    return internalGenerate2(node2, decorate, forceBraces, compact);
  }
  generate$P.generate = generate2;
  return generate$P;
}
var hasRequiredError;
function requireError() {
  if (hasRequiredError) return error;
  hasRequiredError = 1;
  const createCustomError2 = /* @__PURE__ */ requireCreateCustomError();
  const generate2 = /* @__PURE__ */ requireGenerate();
  const defaultLoc2 = { offset: 0, line: 1, column: 1 };
  function locateMismatch2(matchResult, node2) {
    const tokens = matchResult.tokens;
    const longestMatch = matchResult.longestMatch;
    const mismatchNode = longestMatch < tokens.length ? tokens[longestMatch].node || null : null;
    const badNode = mismatchNode !== node2 ? mismatchNode : null;
    let mismatchOffset = 0;
    let mismatchLength = 0;
    let entries = 0;
    let css = "";
    let start;
    let end;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].value;
      if (i === longestMatch) {
        mismatchLength = token.length;
        mismatchOffset = css.length;
      }
      if (badNode !== null && tokens[i].node === badNode) {
        if (i <= longestMatch) {
          entries++;
        } else {
          entries = 0;
        }
      }
      css += token;
    }
    if (longestMatch === tokens.length || entries > 1) {
      start = fromLoc2(badNode || node2, "end") || buildLoc2(defaultLoc2, css);
      end = buildLoc2(start);
    } else {
      start = fromLoc2(badNode, "start") || buildLoc2(fromLoc2(node2, "start") || defaultLoc2, css.slice(0, mismatchOffset));
      end = fromLoc2(badNode, "end") || buildLoc2(start, css.substr(mismatchOffset, mismatchLength));
    }
    return {
      css,
      mismatchOffset,
      mismatchLength,
      start,
      end
    };
  }
  function fromLoc2(node2, point) {
    const value2 = node2 && node2.loc && node2.loc[point];
    if (value2) {
      return "line" in value2 ? buildLoc2(value2) : value2;
    }
    return null;
  }
  function buildLoc2({ offset, line, column }, extra) {
    const loc = {
      offset,
      line,
      column
    };
    if (extra) {
      const lines = extra.split(/\n|\r\n?|\f/);
      loc.offset += extra.length;
      loc.line += lines.length - 1;
      loc.column = lines.length === 1 ? loc.column + extra.length : lines.pop().length + 1;
    }
    return loc;
  }
  const SyntaxReferenceError2 = function(type, referenceName) {
    const error2 = createCustomError2.createCustomError(
      "SyntaxReferenceError",
      type + (referenceName ? " `" + referenceName + "`" : "")
    );
    error2.reference = referenceName;
    return error2;
  };
  const SyntaxMatchError2 = function(message, syntax2, node2, matchResult) {
    const error2 = createCustomError2.createCustomError("SyntaxMatchError", message);
    const {
      css,
      mismatchOffset,
      mismatchLength,
      start,
      end
    } = locateMismatch2(matchResult, node2);
    error2.rawMessage = message;
    error2.syntax = syntax2 ? generate2.generate(syntax2) : "<generic>";
    error2.css = css;
    error2.mismatchOffset = mismatchOffset;
    error2.mismatchLength = mismatchLength;
    error2.message = message + "\n  syntax: " + error2.syntax + "\n   value: " + (css || "<empty string>") + "\n  --------" + new Array(error2.mismatchOffset + 1).join("-") + "^";
    Object.assign(error2, start);
    error2.loc = {
      source: node2 && node2.loc && node2.loc.source || "<unknown>",
      start,
      end
    };
    return error2;
  };
  error.SyntaxMatchError = SyntaxMatchError2;
  error.SyntaxReferenceError = SyntaxReferenceError2;
  return error;
}
var names = {};
var hasRequiredNames;
function requireNames() {
  if (hasRequiredNames) return names;
  hasRequiredNames = 1;
  const keywords2 = /* @__PURE__ */ new Map();
  const properties2 = /* @__PURE__ */ new Map();
  const HYPHENMINUS2 = 45;
  const keyword2 = getKeywordDescriptor2;
  const property2 = getPropertyDescriptor2;
  const vendorPrefix = getVendorPrefix2;
  function isCustomProperty2(str, offset) {
    offset = offset || 0;
    return str.length - offset >= 2 && str.charCodeAt(offset) === HYPHENMINUS2 && str.charCodeAt(offset + 1) === HYPHENMINUS2;
  }
  function getVendorPrefix2(str, offset) {
    offset = offset || 0;
    if (str.length - offset >= 3) {
      if (str.charCodeAt(offset) === HYPHENMINUS2 && str.charCodeAt(offset + 1) !== HYPHENMINUS2) {
        const secondDashIndex = str.indexOf("-", offset + 2);
        if (secondDashIndex !== -1) {
          return str.substring(offset, secondDashIndex + 1);
        }
      }
    }
    return "";
  }
  function getKeywordDescriptor2(keyword3) {
    if (keywords2.has(keyword3)) {
      return keywords2.get(keyword3);
    }
    const name2 = keyword3.toLowerCase();
    let descriptor = keywords2.get(name2);
    if (descriptor === void 0) {
      const custom = isCustomProperty2(name2, 0);
      const vendor = !custom ? getVendorPrefix2(name2, 0) : "";
      descriptor = Object.freeze({
        basename: name2.substr(vendor.length),
        name: name2,
        prefix: vendor,
        vendor,
        custom
      });
    }
    keywords2.set(keyword3, descriptor);
    return descriptor;
  }
  function getPropertyDescriptor2(property3) {
    if (properties2.has(property3)) {
      return properties2.get(property3);
    }
    let name2 = property3;
    let hack = property3[0];
    if (hack === "/") {
      hack = property3[1] === "/" ? "//" : "/";
    } else if (hack !== "_" && hack !== "*" && hack !== "$" && hack !== "#" && hack !== "+" && hack !== "&") {
      hack = "";
    }
    const custom = isCustomProperty2(name2, hack.length);
    if (!custom) {
      name2 = name2.toLowerCase();
      if (properties2.has(name2)) {
        const descriptor2 = properties2.get(name2);
        properties2.set(property3, descriptor2);
        return descriptor2;
      }
    }
    const vendor = !custom ? getVendorPrefix2(name2, hack.length) : "";
    const prefix = name2.substr(0, hack.length + vendor.length);
    const descriptor = Object.freeze({
      basename: name2.substr(prefix.length),
      name: name2.substr(hack.length),
      hack,
      vendor,
      prefix,
      custom
    });
    properties2.set(property3, descriptor);
    return descriptor;
  }
  names.isCustomProperty = isCustomProperty2;
  names.keyword = keyword2;
  names.property = property2;
  names.vendorPrefix = vendorPrefix;
  return names;
}
var genericConst = {};
var hasRequiredGenericConst;
function requireGenericConst() {
  if (hasRequiredGenericConst) return genericConst;
  hasRequiredGenericConst = 1;
  const cssWideKeywords2 = [
    "initial",
    "inherit",
    "unset",
    "revert",
    "revert-layer"
  ];
  genericConst.cssWideKeywords = cssWideKeywords2;
  return genericConst;
}
var generic = {};
var genericAnPlusB;
var hasRequiredGenericAnPlusB;
function requireGenericAnPlusB() {
  if (hasRequiredGenericAnPlusB) return genericAnPlusB;
  hasRequiredGenericAnPlusB = 1;
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const types2 = /* @__PURE__ */ requireTypes();
  const utils2 = /* @__PURE__ */ requireUtils();
  const PLUSSIGN2 = 43;
  const HYPHENMINUS2 = 45;
  const N2 = 110;
  const DISALLOW_SIGN2 = true;
  const ALLOW_SIGN2 = false;
  function isDelim2(token, code2) {
    return token !== null && token.type === types2.Delim && token.value.charCodeAt(0) === code2;
  }
  function skipSC2(token, offset, getNextToken) {
    while (token !== null && (token.type === types2.WhiteSpace || token.type === types2.Comment)) {
      token = getNextToken(++offset);
    }
    return offset;
  }
  function checkInteger2(token, valueOffset, disallowSign, offset) {
    if (!token) {
      return 0;
    }
    const code2 = token.value.charCodeAt(valueOffset);
    if (code2 === PLUSSIGN2 || code2 === HYPHENMINUS2) {
      if (disallowSign) {
        return 0;
      }
      valueOffset++;
    }
    for (; valueOffset < token.value.length; valueOffset++) {
      if (!charCodeDefinitions2.isDigit(token.value.charCodeAt(valueOffset))) {
        return 0;
      }
    }
    return offset + 1;
  }
  function consumeB2(token, offset_, getNextToken) {
    let sign = false;
    let offset = skipSC2(token, offset_, getNextToken);
    token = getNextToken(offset);
    if (token === null) {
      return offset_;
    }
    if (token.type !== types2.Number) {
      if (isDelim2(token, PLUSSIGN2) || isDelim2(token, HYPHENMINUS2)) {
        sign = true;
        offset = skipSC2(getNextToken(++offset), offset, getNextToken);
        token = getNextToken(offset);
        if (token === null || token.type !== types2.Number) {
          return 0;
        }
      } else {
        return offset_;
      }
    }
    if (!sign) {
      const code2 = token.value.charCodeAt(0);
      if (code2 !== PLUSSIGN2 && code2 !== HYPHENMINUS2) {
        return 0;
      }
    }
    return checkInteger2(token, sign ? 0 : 1, sign, offset);
  }
  function anPlusB2(token, getNextToken) {
    let offset = 0;
    if (!token) {
      return 0;
    }
    if (token.type === types2.Number) {
      return checkInteger2(token, 0, ALLOW_SIGN2, offset);
    } else if (token.type === types2.Ident && token.value.charCodeAt(0) === HYPHENMINUS2) {
      if (!utils2.cmpChar(token.value, 1, N2)) {
        return 0;
      }
      switch (token.value.length) {
        // -n
        // -n <signed-integer>
        // -n ['+' | '-'] <signless-integer>
        case 2:
          return consumeB2(getNextToken(++offset), offset, getNextToken);
        // -n- <signless-integer>
        case 3:
          if (token.value.charCodeAt(2) !== HYPHENMINUS2) {
            return 0;
          }
          offset = skipSC2(getNextToken(++offset), offset, getNextToken);
          token = getNextToken(offset);
          return checkInteger2(token, 0, DISALLOW_SIGN2, offset);
        // <dashndashdigit-ident>
        default:
          if (token.value.charCodeAt(2) !== HYPHENMINUS2) {
            return 0;
          }
          return checkInteger2(token, 3, DISALLOW_SIGN2, offset);
      }
    } else if (token.type === types2.Ident || isDelim2(token, PLUSSIGN2) && getNextToken(offset + 1).type === types2.Ident) {
      if (token.type !== types2.Ident) {
        token = getNextToken(++offset);
      }
      if (token === null || !utils2.cmpChar(token.value, 0, N2)) {
        return 0;
      }
      switch (token.value.length) {
        // '+'? n
        // '+'? n <signed-integer>
        // '+'? n ['+' | '-'] <signless-integer>
        case 1:
          return consumeB2(getNextToken(++offset), offset, getNextToken);
        // '+'? n- <signless-integer>
        case 2:
          if (token.value.charCodeAt(1) !== HYPHENMINUS2) {
            return 0;
          }
          offset = skipSC2(getNextToken(++offset), offset, getNextToken);
          token = getNextToken(offset);
          return checkInteger2(token, 0, DISALLOW_SIGN2, offset);
        // '+'? <ndashdigit-ident>
        default:
          if (token.value.charCodeAt(1) !== HYPHENMINUS2) {
            return 0;
          }
          return checkInteger2(token, 2, DISALLOW_SIGN2, offset);
      }
    } else if (token.type === types2.Dimension) {
      let code2 = token.value.charCodeAt(0);
      let sign = code2 === PLUSSIGN2 || code2 === HYPHENMINUS2 ? 1 : 0;
      let i = sign;
      for (; i < token.value.length; i++) {
        if (!charCodeDefinitions2.isDigit(token.value.charCodeAt(i))) {
          break;
        }
      }
      if (i === sign) {
        return 0;
      }
      if (!utils2.cmpChar(token.value, i, N2)) {
        return 0;
      }
      if (i + 1 === token.value.length) {
        return consumeB2(getNextToken(++offset), offset, getNextToken);
      } else {
        if (token.value.charCodeAt(i + 1) !== HYPHENMINUS2) {
          return 0;
        }
        if (i + 2 === token.value.length) {
          offset = skipSC2(getNextToken(++offset), offset, getNextToken);
          token = getNextToken(offset);
          return checkInteger2(token, 0, DISALLOW_SIGN2, offset);
        } else {
          return checkInteger2(token, i + 2, DISALLOW_SIGN2, offset);
        }
      }
    }
    return 0;
  }
  genericAnPlusB = anPlusB2;
  return genericAnPlusB;
}
var genericUrange;
var hasRequiredGenericUrange;
function requireGenericUrange() {
  if (hasRequiredGenericUrange) return genericUrange;
  hasRequiredGenericUrange = 1;
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const types2 = /* @__PURE__ */ requireTypes();
  const utils2 = /* @__PURE__ */ requireUtils();
  const PLUSSIGN2 = 43;
  const HYPHENMINUS2 = 45;
  const QUESTIONMARK2 = 63;
  const U2 = 117;
  function isDelim2(token, code2) {
    return token !== null && token.type === types2.Delim && token.value.charCodeAt(0) === code2;
  }
  function startsWith2(token, code2) {
    return token.value.charCodeAt(0) === code2;
  }
  function hexSequence2(token, offset, allowDash) {
    let hexlen = 0;
    for (let pos = offset; pos < token.value.length; pos++) {
      const code2 = token.value.charCodeAt(pos);
      if (code2 === HYPHENMINUS2 && allowDash && hexlen !== 0) {
        hexSequence2(token, offset + hexlen + 1, false);
        return 6;
      }
      if (!charCodeDefinitions2.isHexDigit(code2)) {
        return 0;
      }
      if (++hexlen > 6) {
        return 0;
      }
    }
    return hexlen;
  }
  function withQuestionMarkSequence2(consumed, length2, getNextToken) {
    if (!consumed) {
      return 0;
    }
    while (isDelim2(getNextToken(length2), QUESTIONMARK2)) {
      if (++consumed > 6) {
        return 0;
      }
      length2++;
    }
    return length2;
  }
  function urange2(token, getNextToken) {
    let length2 = 0;
    if (token === null || token.type !== types2.Ident || !utils2.cmpChar(token.value, 0, U2)) {
      return 0;
    }
    token = getNextToken(++length2);
    if (token === null) {
      return 0;
    }
    if (isDelim2(token, PLUSSIGN2)) {
      token = getNextToken(++length2);
      if (token === null) {
        return 0;
      }
      if (token.type === types2.Ident) {
        return withQuestionMarkSequence2(hexSequence2(token, 0, true), ++length2, getNextToken);
      }
      if (isDelim2(token, QUESTIONMARK2)) {
        return withQuestionMarkSequence2(1, ++length2, getNextToken);
      }
      return 0;
    }
    if (token.type === types2.Number) {
      const consumedHexLength = hexSequence2(token, 1, true);
      if (consumedHexLength === 0) {
        return 0;
      }
      token = getNextToken(++length2);
      if (token === null) {
        return length2;
      }
      if (token.type === types2.Dimension || token.type === types2.Number) {
        if (!startsWith2(token, HYPHENMINUS2) || !hexSequence2(token, 1, false)) {
          return 0;
        }
        return length2 + 1;
      }
      return withQuestionMarkSequence2(consumedHexLength, length2, getNextToken);
    }
    if (token.type === types2.Dimension) {
      return withQuestionMarkSequence2(hexSequence2(token, 1, true), ++length2, getNextToken);
    }
    return 0;
  }
  genericUrange = urange2;
  return genericUrange;
}
var hasRequiredGeneric;
function requireGeneric() {
  if (hasRequiredGeneric) return generic;
  hasRequiredGeneric = 1;
  const genericConst2 = /* @__PURE__ */ requireGenericConst();
  const genericAnPlusB2 = /* @__PURE__ */ requireGenericAnPlusB();
  const genericUrange2 = /* @__PURE__ */ requireGenericUrange();
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const types2 = /* @__PURE__ */ requireTypes();
  const utils2 = /* @__PURE__ */ requireUtils();
  const calcFunctionNames2 = [
    "calc(",
    "-moz-calc(",
    "-webkit-calc("
  ];
  const comparisonFunctionNames2 = [
    "min(",
    "max(",
    "clamp("
  ];
  const steppedValueFunctionNames2 = [
    "round(",
    "mod(",
    "rem("
  ];
  const trigNumberFunctionNames2 = [
    "sin(",
    "cos(",
    "tan("
  ];
  const trigAngleFunctionNames2 = [
    "asin(",
    "acos(",
    "atan(",
    "atan2("
  ];
  const otherNumberFunctionNames2 = [
    "pow(",
    "sqrt(",
    "log(",
    "exp(",
    "sign("
  ];
  const expNumberDimensionPercentageFunctionNames2 = [
    "hypot("
  ];
  const signFunctionNames2 = [
    "abs("
  ];
  const numberFunctionNames2 = [
    ...calcFunctionNames2,
    ...comparisonFunctionNames2,
    ...steppedValueFunctionNames2,
    ...trigNumberFunctionNames2,
    ...otherNumberFunctionNames2,
    ...expNumberDimensionPercentageFunctionNames2,
    ...signFunctionNames2
  ];
  const percentageFunctionNames2 = [
    ...calcFunctionNames2,
    ...comparisonFunctionNames2,
    ...steppedValueFunctionNames2,
    ...expNumberDimensionPercentageFunctionNames2,
    ...signFunctionNames2
  ];
  const dimensionFunctionNames2 = [
    ...calcFunctionNames2,
    ...comparisonFunctionNames2,
    ...steppedValueFunctionNames2,
    ...trigAngleFunctionNames2,
    ...expNumberDimensionPercentageFunctionNames2,
    ...signFunctionNames2
  ];
  const balancePair2 = /* @__PURE__ */ new Map([
    [types2.Function, types2.RightParenthesis],
    [types2.LeftParenthesis, types2.RightParenthesis],
    [types2.LeftSquareBracket, types2.RightSquareBracket],
    [types2.LeftCurlyBracket, types2.RightCurlyBracket]
  ]);
  function charCodeAt2(str, index) {
    return index < str.length ? str.charCodeAt(index) : 0;
  }
  function eqStr2(actual, expected) {
    return utils2.cmpStr(actual, 0, actual.length, expected);
  }
  function eqStrAny2(actual, expected) {
    for (let i = 0; i < expected.length; i++) {
      if (eqStr2(actual, expected[i])) {
        return true;
      }
    }
    return false;
  }
  function isPostfixIeHack2(str, offset) {
    if (offset !== str.length - 2) {
      return false;
    }
    return charCodeAt2(str, offset) === 92 && // U+005C REVERSE SOLIDUS (\)
    charCodeDefinitions2.isDigit(charCodeAt2(str, offset + 1));
  }
  function outOfRange2(opts, value2, numEnd) {
    if (opts && opts.type === "Range") {
      const num = Number(
        numEnd !== void 0 && numEnd !== value2.length ? value2.substr(0, numEnd) : value2
      );
      if (isNaN(num)) {
        return true;
      }
      if (opts.min !== null && num < opts.min && typeof opts.min !== "string") {
        return true;
      }
      if (opts.max !== null && num > opts.max && typeof opts.max !== "string") {
        return true;
      }
    }
    return false;
  }
  function consumeFunction2(token, getNextToken) {
    let balanceCloseType = 0;
    let balanceStash = [];
    let length2 = 0;
    scan:
      do {
        switch (token.type) {
          case types2.RightCurlyBracket:
          case types2.RightParenthesis:
          case types2.RightSquareBracket:
            if (token.type !== balanceCloseType) {
              break scan;
            }
            balanceCloseType = balanceStash.pop();
            if (balanceStash.length === 0) {
              length2++;
              break scan;
            }
            break;
          case types2.Function:
          case types2.LeftParenthesis:
          case types2.LeftSquareBracket:
          case types2.LeftCurlyBracket:
            balanceStash.push(balanceCloseType);
            balanceCloseType = balancePair2.get(token.type);
            break;
        }
        length2++;
      } while (token = getNextToken(length2));
    return length2;
  }
  function math2(next, functionNames) {
    return function(token, getNextToken, opts) {
      if (token === null) {
        return 0;
      }
      if (token.type === types2.Function && eqStrAny2(token.value, functionNames)) {
        return consumeFunction2(token, getNextToken);
      }
      return next(token, getNextToken, opts);
    };
  }
  function tokenType2(expectedTokenType) {
    return function(token) {
      if (token === null || token.type !== expectedTokenType) {
        return 0;
      }
      return 1;
    };
  }
  function customIdent2(token) {
    if (token === null || token.type !== types2.Ident) {
      return 0;
    }
    const name2 = token.value.toLowerCase();
    if (eqStrAny2(name2, genericConst2.cssWideKeywords)) {
      return 0;
    }
    if (eqStr2(name2, "default")) {
      return 0;
    }
    return 1;
  }
  function dashedIdent2(token) {
    if (token === null || token.type !== types2.Ident) {
      return 0;
    }
    if (charCodeAt2(token.value, 0) !== 45 || charCodeAt2(token.value, 1) !== 45) {
      return 0;
    }
    return 1;
  }
  function customPropertyName2(token) {
    if (!dashedIdent2(token)) {
      return 0;
    }
    if (token.value === "--") {
      return 0;
    }
    return 1;
  }
  function hexColor2(token) {
    if (token === null || token.type !== types2.Hash) {
      return 0;
    }
    const length2 = token.value.length;
    if (length2 !== 4 && length2 !== 5 && length2 !== 7 && length2 !== 9) {
      return 0;
    }
    for (let i = 1; i < length2; i++) {
      if (!charCodeDefinitions2.isHexDigit(charCodeAt2(token.value, i))) {
        return 0;
      }
    }
    return 1;
  }
  function idSelector2(token) {
    if (token === null || token.type !== types2.Hash) {
      return 0;
    }
    if (!charCodeDefinitions2.isIdentifierStart(charCodeAt2(token.value, 1), charCodeAt2(token.value, 2), charCodeAt2(token.value, 3))) {
      return 0;
    }
    return 1;
  }
  function declarationValue2(token, getNextToken) {
    if (!token) {
      return 0;
    }
    let balanceCloseType = 0;
    let balanceStash = [];
    let length2 = 0;
    scan:
      do {
        switch (token.type) {
          // ... <bad-string-token>, <bad-url-token>,
          case types2.BadString:
          case types2.BadUrl:
            break scan;
          // ... unmatched <)-token>, <]-token>, or <}-token>,
          case types2.RightCurlyBracket:
          case types2.RightParenthesis:
          case types2.RightSquareBracket:
            if (token.type !== balanceCloseType) {
              break scan;
            }
            balanceCloseType = balanceStash.pop();
            break;
          // ... or top-level <semicolon-token> tokens
          case types2.Semicolon:
            if (balanceCloseType === 0) {
              break scan;
            }
            break;
          // ... or <delim-token> tokens with a value of "!"
          case types2.Delim:
            if (balanceCloseType === 0 && token.value === "!") {
              break scan;
            }
            break;
          case types2.Function:
          case types2.LeftParenthesis:
          case types2.LeftSquareBracket:
          case types2.LeftCurlyBracket:
            balanceStash.push(balanceCloseType);
            balanceCloseType = balancePair2.get(token.type);
            break;
        }
        length2++;
      } while (token = getNextToken(length2));
    return length2;
  }
  function anyValue2(token, getNextToken) {
    if (!token) {
      return 0;
    }
    let balanceCloseType = 0;
    let balanceStash = [];
    let length2 = 0;
    scan:
      do {
        switch (token.type) {
          // ... does not contain <bad-string-token>, <bad-url-token>,
          case types2.BadString:
          case types2.BadUrl:
            break scan;
          // ... unmatched <)-token>, <]-token>, or <}-token>,
          case types2.RightCurlyBracket:
          case types2.RightParenthesis:
          case types2.RightSquareBracket:
            if (token.type !== balanceCloseType) {
              break scan;
            }
            balanceCloseType = balanceStash.pop();
            break;
          case types2.Function:
          case types2.LeftParenthesis:
          case types2.LeftSquareBracket:
          case types2.LeftCurlyBracket:
            balanceStash.push(balanceCloseType);
            balanceCloseType = balancePair2.get(token.type);
            break;
        }
        length2++;
      } while (token = getNextToken(length2));
    return length2;
  }
  function dimension2(type) {
    if (type) {
      type = new Set(type);
    }
    return function(token, getNextToken, opts) {
      if (token === null || token.type !== types2.Dimension) {
        return 0;
      }
      const numberEnd = utils2.consumeNumber(token.value, 0);
      if (type !== null) {
        const reverseSolidusOffset = token.value.indexOf("\\", numberEnd);
        const unit = reverseSolidusOffset === -1 || !isPostfixIeHack2(token.value, reverseSolidusOffset) ? token.value.substr(numberEnd) : token.value.substring(numberEnd, reverseSolidusOffset);
        if (type.has(unit.toLowerCase()) === false) {
          return 0;
        }
      }
      if (outOfRange2(opts, token.value, numberEnd)) {
        return 0;
      }
      return 1;
    };
  }
  function percentage2(token, getNextToken, opts) {
    if (token === null || token.type !== types2.Percentage) {
      return 0;
    }
    if (outOfRange2(opts, token.value, token.value.length - 1)) {
      return 0;
    }
    return 1;
  }
  function zero2(next) {
    if (typeof next !== "function") {
      next = function() {
        return 0;
      };
    }
    return function(token, getNextToken, opts) {
      if (token !== null && token.type === types2.Number) {
        if (Number(token.value) === 0) {
          return 1;
        }
      }
      return next(token, getNextToken, opts);
    };
  }
  function number2(token, getNextToken, opts) {
    if (token === null) {
      return 0;
    }
    const numberEnd = utils2.consumeNumber(token.value, 0);
    const isNumber = numberEnd === token.value.length;
    if (!isNumber && !isPostfixIeHack2(token.value, numberEnd)) {
      return 0;
    }
    if (outOfRange2(opts, token.value, numberEnd)) {
      return 0;
    }
    return 1;
  }
  function integer2(token, getNextToken, opts) {
    if (token === null || token.type !== types2.Number) {
      return 0;
    }
    let i = charCodeAt2(token.value, 0) === 43 || // U+002B PLUS SIGN (+)
    charCodeAt2(token.value, 0) === 45 ? 1 : 0;
    for (; i < token.value.length; i++) {
      if (!charCodeDefinitions2.isDigit(charCodeAt2(token.value, i))) {
        return 0;
      }
    }
    if (outOfRange2(opts, token.value, i)) {
      return 0;
    }
    return 1;
  }
  const tokenTypes2 = {
    "ident-token": tokenType2(types2.Ident),
    "function-token": tokenType2(types2.Function),
    "at-keyword-token": tokenType2(types2.AtKeyword),
    "hash-token": tokenType2(types2.Hash),
    "string-token": tokenType2(types2.String),
    "bad-string-token": tokenType2(types2.BadString),
    "url-token": tokenType2(types2.Url),
    "bad-url-token": tokenType2(types2.BadUrl),
    "delim-token": tokenType2(types2.Delim),
    "number-token": tokenType2(types2.Number),
    "percentage-token": tokenType2(types2.Percentage),
    "dimension-token": tokenType2(types2.Dimension),
    "whitespace-token": tokenType2(types2.WhiteSpace),
    "CDO-token": tokenType2(types2.CDO),
    "CDC-token": tokenType2(types2.CDC),
    "colon-token": tokenType2(types2.Colon),
    "semicolon-token": tokenType2(types2.Semicolon),
    "comma-token": tokenType2(types2.Comma),
    "[-token": tokenType2(types2.LeftSquareBracket),
    "]-token": tokenType2(types2.RightSquareBracket),
    "(-token": tokenType2(types2.LeftParenthesis),
    ")-token": tokenType2(types2.RightParenthesis),
    "{-token": tokenType2(types2.LeftCurlyBracket),
    "}-token": tokenType2(types2.RightCurlyBracket)
  };
  const productionTypes2 = {
    // token type aliases
    "string": tokenType2(types2.String),
    "ident": tokenType2(types2.Ident),
    // percentage
    "percentage": math2(percentage2, percentageFunctionNames2),
    // numeric
    "zero": zero2(),
    "number": math2(number2, numberFunctionNames2),
    "integer": math2(integer2, numberFunctionNames2),
    // complex types
    "custom-ident": customIdent2,
    "dashed-ident": dashedIdent2,
    "custom-property-name": customPropertyName2,
    "hex-color": hexColor2,
    "id-selector": idSelector2,
    // element( <id-selector> )
    "an-plus-b": genericAnPlusB2,
    "urange": genericUrange2,
    "declaration-value": declarationValue2,
    "any-value": anyValue2
  };
  const unitGroups2 = [
    "length",
    "angle",
    "time",
    "frequency",
    "resolution",
    "flex",
    "decibel",
    "semitones"
  ];
  function createDemensionTypes2(units2) {
    const {
      angle: angle2,
      decibel: decibel2,
      frequency: frequency2,
      flex: flex2,
      length: length2,
      resolution: resolution2,
      semitones: semitones2,
      time: time2
    } = units2 || {};
    return {
      "dimension": math2(dimension2(null), dimensionFunctionNames2),
      "angle": math2(dimension2(angle2), dimensionFunctionNames2),
      "decibel": math2(dimension2(decibel2), dimensionFunctionNames2),
      "frequency": math2(dimension2(frequency2), dimensionFunctionNames2),
      "flex": math2(dimension2(flex2), dimensionFunctionNames2),
      "length": math2(zero2(dimension2(length2)), dimensionFunctionNames2),
      "resolution": math2(dimension2(resolution2), dimensionFunctionNames2),
      "semitones": math2(dimension2(semitones2), dimensionFunctionNames2),
      "time": math2(dimension2(time2), dimensionFunctionNames2)
    };
  }
  function createAttrUnit2(units2) {
    const unitSet = /* @__PURE__ */ new Set();
    for (const group of unitGroups2) {
      if (Array.isArray(units2[group])) {
        for (const unit of units2[group]) {
          unitSet.add(unit.toLowerCase());
        }
      }
    }
    return function attrUnit(token) {
      if (token === null) {
        return 0;
      }
      if (token.type === types2.Delim && token.value === "%") {
        return 1;
      }
      if (token.type === types2.Ident && unitSet.has(token.value.toLowerCase())) {
        return 1;
      }
      return 0;
    };
  }
  function createGenericTypes2(units2) {
    return {
      ...tokenTypes2,
      ...productionTypes2,
      ...createDemensionTypes2(units2),
      "attr-unit": createAttrUnit2(units2)
    };
  }
  generic.createDemensionTypes = createDemensionTypes2;
  generic.createGenericTypes = createGenericTypes2;
  generic.productionTypes = productionTypes2;
  generic.tokenTypes = tokenTypes2;
  generic.unitGroups = unitGroups2;
  return generic;
}
var units$1 = {};
var hasRequiredUnits;
function requireUnits() {
  if (hasRequiredUnits) return units$1;
  hasRequiredUnits = 1;
  const length2 = [
    // absolute length units https://www.w3.org/TR/css-values-3/#lengths
    "cm",
    "mm",
    "q",
    "in",
    "pt",
    "pc",
    "px",
    // font-relative length units https://drafts.csswg.org/css-values-4/#font-relative-lengths
    "em",
    "rem",
    "ex",
    "rex",
    "cap",
    "rcap",
    "ch",
    "rch",
    "ic",
    "ric",
    "lh",
    "rlh",
    // viewport-percentage lengths https://drafts.csswg.org/css-values-4/#viewport-relative-lengths
    "vw",
    "svw",
    "lvw",
    "dvw",
    "vh",
    "svh",
    "lvh",
    "dvh",
    "vi",
    "svi",
    "lvi",
    "dvi",
    "vb",
    "svb",
    "lvb",
    "dvb",
    "vmin",
    "svmin",
    "lvmin",
    "dvmin",
    "vmax",
    "svmax",
    "lvmax",
    "dvmax",
    // container relative lengths https://drafts.csswg.org/css-contain-3/#container-lengths
    "cqw",
    "cqh",
    "cqi",
    "cqb",
    "cqmin",
    "cqmax"
  ];
  const angle2 = ["deg", "grad", "rad", "turn"];
  const time2 = ["s", "ms"];
  const frequency2 = ["hz", "khz"];
  const resolution2 = ["dpi", "dpcm", "dppx", "x"];
  const flex2 = ["fr"];
  const decibel2 = ["db"];
  const semitones2 = ["st"];
  units$1.angle = angle2;
  units$1.decibel = decibel2;
  units$1.flex = flex2;
  units$1.frequency = frequency2;
  units$1.length = length2;
  units$1.resolution = resolution2;
  units$1.semitones = semitones2;
  units$1.time = time2;
  return units$1;
}
var prepareTokens_1;
var hasRequiredPrepareTokens;
function requirePrepareTokens() {
  if (hasRequiredPrepareTokens) return prepareTokens_1;
  hasRequiredPrepareTokens = 1;
  const index = /* @__PURE__ */ requireTokenizer();
  const astToTokens2 = {
    decorator(handlers) {
      const tokens = [];
      let curNode = null;
      return {
        ...handlers,
        node(node2) {
          const tmp = curNode;
          curNode = node2;
          handlers.node.call(this, node2);
          curNode = tmp;
        },
        emit(value2, type, auto) {
          tokens.push({
            type,
            value: value2,
            node: auto ? null : curNode
          });
        },
        result() {
          return tokens;
        }
      };
    }
  };
  function stringToTokens2(str) {
    const tokens = [];
    index.tokenize(
      str,
      (type, start, end) => tokens.push({
        type,
        value: str.slice(start, end),
        node: null
      })
    );
    return tokens;
  }
  function prepareTokens2(value2, syntax2) {
    if (typeof value2 === "string") {
      return stringToTokens2(value2);
    }
    return syntax2.generate(value2, astToTokens2);
  }
  prepareTokens_1 = prepareTokens2;
  return prepareTokens_1;
}
var matchGraph = {};
var parse$P = {};
var scanner = {};
var _SyntaxError = {};
var hasRequired_SyntaxError;
function require_SyntaxError() {
  if (hasRequired_SyntaxError) return _SyntaxError;
  hasRequired_SyntaxError = 1;
  const createCustomError2 = /* @__PURE__ */ requireCreateCustomError();
  function SyntaxError2(message, input, offset) {
    return Object.assign(createCustomError2.createCustomError("SyntaxError", message), {
      input,
      offset,
      rawMessage: message,
      message: message + "\n  " + input + "\n--" + new Array((offset || input.length) + 1).join("-") + "^"
    });
  }
  _SyntaxError.SyntaxError = SyntaxError2;
  return _SyntaxError;
}
var hasRequiredScanner;
function requireScanner() {
  if (hasRequiredScanner) return scanner;
  hasRequiredScanner = 1;
  const SyntaxError2 = /* @__PURE__ */ require_SyntaxError();
  const TAB2 = 9;
  const N2 = 10;
  const F2 = 12;
  const R2 = 13;
  const SPACE2 = 32;
  const NAME_CHAR2 = new Uint8Array(128).map(
    (_, idx) => /[a-zA-Z0-9\-]/.test(String.fromCharCode(idx)) ? 1 : 0
  );
  class Scanner2 {
    constructor(str) {
      this.str = str;
      this.pos = 0;
    }
    charCodeAt(pos) {
      return pos < this.str.length ? this.str.charCodeAt(pos) : 0;
    }
    charCode() {
      return this.charCodeAt(this.pos);
    }
    isNameCharCode(code2 = this.charCode()) {
      return code2 < 128 && NAME_CHAR2[code2] === 1;
    }
    nextCharCode() {
      return this.charCodeAt(this.pos + 1);
    }
    nextNonWsCode(pos) {
      return this.charCodeAt(this.findWsEnd(pos));
    }
    skipWs() {
      this.pos = this.findWsEnd(this.pos);
    }
    findWsEnd(pos) {
      for (; pos < this.str.length; pos++) {
        const code2 = this.str.charCodeAt(pos);
        if (code2 !== R2 && code2 !== N2 && code2 !== F2 && code2 !== SPACE2 && code2 !== TAB2) {
          break;
        }
      }
      return pos;
    }
    substringToPos(end) {
      return this.str.substring(this.pos, this.pos = end);
    }
    eat(code2) {
      if (this.charCode() !== code2) {
        this.error("Expect `" + String.fromCharCode(code2) + "`");
      }
      this.pos++;
    }
    peek() {
      return this.pos < this.str.length ? this.str.charAt(this.pos++) : "";
    }
    error(message) {
      throw new SyntaxError2.SyntaxError(message, this.str, this.pos);
    }
    scanSpaces() {
      return this.substringToPos(this.findWsEnd(this.pos));
    }
    scanWord() {
      let end = this.pos;
      for (; end < this.str.length; end++) {
        const code2 = this.str.charCodeAt(end);
        if (code2 >= 128 || NAME_CHAR2[code2] === 0) {
          break;
        }
      }
      if (this.pos === end) {
        this.error("Expect a keyword");
      }
      return this.substringToPos(end);
    }
    scanNumber() {
      let end = this.pos;
      for (; end < this.str.length; end++) {
        const code2 = this.str.charCodeAt(end);
        if (code2 < 48 || code2 > 57) {
          break;
        }
      }
      if (this.pos === end) {
        this.error("Expect a number");
      }
      return this.substringToPos(end);
    }
    scanString() {
      const end = this.str.indexOf("'", this.pos + 1);
      if (end === -1) {
        this.pos = this.str.length;
        this.error("Expect an apostrophe");
      }
      return this.substringToPos(end + 1);
    }
  }
  scanner.Scanner = Scanner2;
  return scanner;
}
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse$P;
  hasRequiredParse = 1;
  const scanner2 = /* @__PURE__ */ requireScanner();
  const TAB2 = 9;
  const N2 = 10;
  const F2 = 12;
  const R2 = 13;
  const SPACE2 = 32;
  const EXCLAMATIONMARK2 = 33;
  const NUMBERSIGN2 = 35;
  const AMPERSAND2 = 38;
  const APOSTROPHE2 = 39;
  const LEFTPARENTHESIS2 = 40;
  const RIGHTPARENTHESIS2 = 41;
  const ASTERISK2 = 42;
  const PLUSSIGN2 = 43;
  const COMMA2 = 44;
  const HYPERMINUS2 = 45;
  const LESSTHANSIGN2 = 60;
  const GREATERTHANSIGN2 = 62;
  const QUESTIONMARK2 = 63;
  const COMMERCIALAT2 = 64;
  const LEFTSQUAREBRACKET2 = 91;
  const RIGHTSQUAREBRACKET2 = 93;
  const LEFTCURLYBRACKET2 = 123;
  const VERTICALLINE2 = 124;
  const RIGHTCURLYBRACKET2 = 125;
  const INFINITY2 = 8734;
  const COMBINATOR_PRECEDENCE2 = {
    " ": 1,
    "&&": 2,
    "||": 3,
    "|": 4
  };
  function readMultiplierRange2(scanner3) {
    let min = null;
    let max = null;
    scanner3.eat(LEFTCURLYBRACKET2);
    scanner3.skipWs();
    min = scanner3.scanNumber(scanner3);
    scanner3.skipWs();
    if (scanner3.charCode() === COMMA2) {
      scanner3.pos++;
      scanner3.skipWs();
      if (scanner3.charCode() !== RIGHTCURLYBRACKET2) {
        max = scanner3.scanNumber(scanner3);
        scanner3.skipWs();
      }
    } else {
      max = min;
    }
    scanner3.eat(RIGHTCURLYBRACKET2);
    return {
      min: Number(min),
      max: max ? Number(max) : 0
    };
  }
  function readMultiplier2(scanner3) {
    let range = null;
    let comma = false;
    switch (scanner3.charCode()) {
      case ASTERISK2:
        scanner3.pos++;
        range = {
          min: 0,
          max: 0
        };
        break;
      case PLUSSIGN2:
        scanner3.pos++;
        range = {
          min: 1,
          max: 0
        };
        break;
      case QUESTIONMARK2:
        scanner3.pos++;
        range = {
          min: 0,
          max: 1
        };
        break;
      case NUMBERSIGN2:
        scanner3.pos++;
        comma = true;
        if (scanner3.charCode() === LEFTCURLYBRACKET2) {
          range = readMultiplierRange2(scanner3);
        } else if (scanner3.charCode() === QUESTIONMARK2) {
          scanner3.pos++;
          range = {
            min: 0,
            max: 0
          };
        } else {
          range = {
            min: 1,
            max: 0
          };
        }
        break;
      case LEFTCURLYBRACKET2:
        range = readMultiplierRange2(scanner3);
        break;
      default:
        return null;
    }
    return {
      type: "Multiplier",
      comma,
      min: range.min,
      max: range.max,
      term: null
    };
  }
  function maybeMultiplied2(scanner3, node2) {
    const multiplier = readMultiplier2(scanner3);
    if (multiplier !== null) {
      multiplier.term = node2;
      if (scanner3.charCode() === NUMBERSIGN2 && scanner3.charCodeAt(scanner3.pos - 1) === PLUSSIGN2) {
        return maybeMultiplied2(scanner3, multiplier);
      }
      if (scanner3.charCode() === QUESTIONMARK2 && scanner3.charCodeAt(scanner3.pos - 1) === RIGHTCURLYBRACKET2) {
        return maybeMultiplied2(scanner3, multiplier);
      }
      return multiplier;
    }
    return node2;
  }
  function maybeToken2(scanner3) {
    const ch = scanner3.peek();
    if (ch === "") {
      return null;
    }
    return maybeMultiplied2(scanner3, {
      type: "Token",
      value: ch
    });
  }
  function readProperty2(scanner3) {
    let name2;
    scanner3.eat(LESSTHANSIGN2);
    scanner3.eat(APOSTROPHE2);
    name2 = scanner3.scanWord();
    scanner3.eat(APOSTROPHE2);
    scanner3.eat(GREATERTHANSIGN2);
    return maybeMultiplied2(scanner3, {
      type: "Property",
      name: name2
    });
  }
  function readTypeRange2(scanner3) {
    let min = null;
    let max = null;
    let sign = 1;
    scanner3.eat(LEFTSQUAREBRACKET2);
    if (scanner3.charCode() === HYPERMINUS2) {
      scanner3.peek();
      sign = -1;
    }
    if (sign == -1 && scanner3.charCode() === INFINITY2) {
      scanner3.peek();
    } else {
      min = sign * Number(scanner3.scanNumber(scanner3));
      if (scanner3.isNameCharCode()) {
        min += scanner3.scanWord();
      }
    }
    scanner3.skipWs();
    scanner3.eat(COMMA2);
    scanner3.skipWs();
    if (scanner3.charCode() === INFINITY2) {
      scanner3.peek();
    } else {
      sign = 1;
      if (scanner3.charCode() === HYPERMINUS2) {
        scanner3.peek();
        sign = -1;
      }
      max = sign * Number(scanner3.scanNumber(scanner3));
      if (scanner3.isNameCharCode()) {
        max += scanner3.scanWord();
      }
    }
    scanner3.eat(RIGHTSQUAREBRACKET2);
    return {
      type: "Range",
      min,
      max
    };
  }
  function readType2(scanner3) {
    let name2;
    let opts = null;
    scanner3.eat(LESSTHANSIGN2);
    name2 = scanner3.scanWord();
    if (name2 === "boolean-expr") {
      scanner3.eat(LEFTSQUAREBRACKET2);
      const implicitGroup = readImplicitGroup2(scanner3, RIGHTSQUAREBRACKET2);
      scanner3.eat(RIGHTSQUAREBRACKET2);
      scanner3.eat(GREATERTHANSIGN2);
      return maybeMultiplied2(scanner3, {
        type: "Boolean",
        term: implicitGroup.terms.length === 1 ? implicitGroup.terms[0] : implicitGroup
      });
    }
    if (scanner3.charCode() === LEFTPARENTHESIS2 && scanner3.nextCharCode() === RIGHTPARENTHESIS2) {
      scanner3.pos += 2;
      name2 += "()";
    }
    if (scanner3.charCodeAt(scanner3.findWsEnd(scanner3.pos)) === LEFTSQUAREBRACKET2) {
      scanner3.skipWs();
      opts = readTypeRange2(scanner3);
    }
    scanner3.eat(GREATERTHANSIGN2);
    return maybeMultiplied2(scanner3, {
      type: "Type",
      name: name2,
      opts
    });
  }
  function readKeywordOrFunction2(scanner3) {
    const name2 = scanner3.scanWord();
    if (scanner3.charCode() === LEFTPARENTHESIS2) {
      scanner3.pos++;
      return {
        type: "Function",
        name: name2
      };
    }
    return maybeMultiplied2(scanner3, {
      type: "Keyword",
      name: name2
    });
  }
  function regroupTerms2(terms, combinators) {
    function createGroup(terms2, combinator2) {
      return {
        type: "Group",
        terms: terms2,
        combinator: combinator2,
        disallowEmpty: false,
        explicit: false
      };
    }
    let combinator;
    combinators = Object.keys(combinators).sort((a, b) => COMBINATOR_PRECEDENCE2[a] - COMBINATOR_PRECEDENCE2[b]);
    while (combinators.length > 0) {
      combinator = combinators.shift();
      let i = 0;
      let subgroupStart = 0;
      for (; i < terms.length; i++) {
        const term = terms[i];
        if (term.type === "Combinator") {
          if (term.value === combinator) {
            if (subgroupStart === -1) {
              subgroupStart = i - 1;
            }
            terms.splice(i, 1);
            i--;
          } else {
            if (subgroupStart !== -1 && i - subgroupStart > 1) {
              terms.splice(
                subgroupStart,
                i - subgroupStart,
                createGroup(terms.slice(subgroupStart, i), combinator)
              );
              i = subgroupStart + 1;
            }
            subgroupStart = -1;
          }
        }
      }
      if (subgroupStart !== -1 && combinators.length) {
        terms.splice(
          subgroupStart,
          i - subgroupStart,
          createGroup(terms.slice(subgroupStart, i), combinator)
        );
      }
    }
    return combinator;
  }
  function readImplicitGroup2(scanner3, stopCharCode = -1) {
    const combinators = /* @__PURE__ */ Object.create(null);
    const terms = [];
    let prevToken = null;
    let prevTokenPos = scanner3.pos;
    let prevTokenIsFunction = false;
    while (scanner3.charCode() !== stopCharCode) {
      let token = prevTokenIsFunction ? readImplicitGroup2(scanner3, RIGHTPARENTHESIS2) : peek2(scanner3);
      if (!token) {
        break;
      }
      if (token.type === "Spaces") {
        continue;
      }
      if (prevTokenIsFunction) {
        if (token.terms.length === 0) {
          prevTokenIsFunction = false;
          continue;
        }
        if (token.combinator === " ") {
          while (token.terms.length > 1) {
            combinators[" "] = true;
            terms.push({
              type: "Combinator",
              value: " "
            }, token.terms.shift());
          }
          token = token.terms[0];
        }
      }
      if (token.type === "Combinator") {
        if (prevToken === null || prevToken.type === "Combinator") {
          scanner3.pos = prevTokenPos;
          scanner3.error("Unexpected combinator");
        }
        combinators[token.value] = true;
      } else if (prevToken !== null && prevToken.type !== "Combinator") {
        combinators[" "] = true;
        terms.push({
          type: "Combinator",
          value: " "
        });
      }
      terms.push(token);
      prevToken = token;
      prevTokenPos = scanner3.pos;
      prevTokenIsFunction = token.type === "Function";
    }
    if (prevToken !== null && prevToken.type === "Combinator") {
      scanner3.pos -= prevTokenPos;
      scanner3.error("Unexpected combinator");
    }
    return {
      type: "Group",
      terms,
      combinator: regroupTerms2(terms, combinators) || " ",
      disallowEmpty: false,
      explicit: false
    };
  }
  function readGroup2(scanner3) {
    let result;
    scanner3.eat(LEFTSQUAREBRACKET2);
    result = readImplicitGroup2(scanner3, RIGHTSQUAREBRACKET2);
    scanner3.eat(RIGHTSQUAREBRACKET2);
    result.explicit = true;
    if (scanner3.charCode() === EXCLAMATIONMARK2) {
      scanner3.pos++;
      result.disallowEmpty = true;
    }
    return result;
  }
  function peek2(scanner3) {
    let code2 = scanner3.charCode();
    switch (code2) {
      case RIGHTSQUAREBRACKET2:
        break;
      case LEFTSQUAREBRACKET2:
        return maybeMultiplied2(scanner3, readGroup2(scanner3));
      case LESSTHANSIGN2:
        return scanner3.nextCharCode() === APOSTROPHE2 ? readProperty2(scanner3) : readType2(scanner3);
      case VERTICALLINE2:
        return {
          type: "Combinator",
          value: scanner3.substringToPos(
            scanner3.pos + (scanner3.nextCharCode() === VERTICALLINE2 ? 2 : 1)
          )
        };
      case AMPERSAND2:
        scanner3.pos++;
        scanner3.eat(AMPERSAND2);
        return {
          type: "Combinator",
          value: "&&"
        };
      case COMMA2:
        scanner3.pos++;
        return {
          type: "Comma"
        };
      case APOSTROPHE2:
        return maybeMultiplied2(scanner3, {
          type: "String",
          value: scanner3.scanString()
        });
      case SPACE2:
      case TAB2:
      case N2:
      case R2:
      case F2:
        return {
          type: "Spaces",
          value: scanner3.scanSpaces()
        };
      case COMMERCIALAT2:
        code2 = scanner3.nextCharCode();
        if (scanner3.isNameCharCode(code2)) {
          scanner3.pos++;
          return {
            type: "AtKeyword",
            name: scanner3.scanWord()
          };
        }
        return maybeToken2(scanner3);
      case ASTERISK2:
      case PLUSSIGN2:
      case QUESTIONMARK2:
      case NUMBERSIGN2:
      case EXCLAMATIONMARK2:
        break;
      case LEFTCURLYBRACKET2:
        code2 = scanner3.nextCharCode();
        if (code2 < 48 || code2 > 57) {
          return maybeToken2(scanner3);
        }
        break;
      default:
        if (scanner3.isNameCharCode(code2)) {
          return readKeywordOrFunction2(scanner3);
        }
        return maybeToken2(scanner3);
    }
  }
  function parse2(source) {
    const scanner$1 = new scanner2.Scanner(source);
    const result = readImplicitGroup2(scanner$1);
    if (scanner$1.pos !== source.length) {
      scanner$1.error("Unexpected input");
    }
    if (result.terms.length === 1 && result.terms[0].type === "Group") {
      return result.terms[0];
    }
    return result;
  }
  parse$P.parse = parse2;
  return parse$P;
}
var hasRequiredMatchGraph;
function requireMatchGraph() {
  if (hasRequiredMatchGraph) return matchGraph;
  hasRequiredMatchGraph = 1;
  const parse2 = /* @__PURE__ */ requireParse();
  const MATCH2 = { type: "Match" };
  const MISMATCH2 = { type: "Mismatch" };
  const DISALLOW_EMPTY2 = { type: "DisallowEmpty" };
  const LEFTPARENTHESIS2 = 40;
  const RIGHTPARENTHESIS2 = 41;
  function createCondition2(match2, thenBranch, elseBranch) {
    if (thenBranch === MATCH2 && elseBranch === MISMATCH2) {
      return match2;
    }
    if (match2 === MATCH2 && thenBranch === MATCH2 && elseBranch === MATCH2) {
      return match2;
    }
    if (match2.type === "If" && match2.else === MISMATCH2 && thenBranch === MATCH2) {
      thenBranch = match2.then;
      match2 = match2.match;
    }
    return {
      type: "If",
      match: match2,
      then: thenBranch,
      else: elseBranch
    };
  }
  function isFunctionType2(name2) {
    return name2.length > 2 && name2.charCodeAt(name2.length - 2) === LEFTPARENTHESIS2 && name2.charCodeAt(name2.length - 1) === RIGHTPARENTHESIS2;
  }
  function isEnumCapatible2(term) {
    return term.type === "Keyword" || term.type === "AtKeyword" || term.type === "Function" || term.type === "Type" && isFunctionType2(term.name);
  }
  function groupNode2(terms, combinator = " ", explicit = false) {
    return {
      type: "Group",
      terms,
      combinator,
      disallowEmpty: false,
      explicit
    };
  }
  function replaceTypeInGraph2(node2, replacements, visited = /* @__PURE__ */ new Set()) {
    if (!visited.has(node2)) {
      visited.add(node2);
      switch (node2.type) {
        case "If":
          node2.match = replaceTypeInGraph2(node2.match, replacements, visited);
          node2.then = replaceTypeInGraph2(node2.then, replacements, visited);
          node2.else = replaceTypeInGraph2(node2.else, replacements, visited);
          break;
        case "Type":
          return replacements[node2.name] || node2;
      }
    }
    return node2;
  }
  function buildGroupMatchGraph2(combinator, terms, atLeastOneTermMatched) {
    switch (combinator) {
      case " ": {
        let result = MATCH2;
        for (let i = terms.length - 1; i >= 0; i--) {
          const term = terms[i];
          result = createCondition2(
            term,
            result,
            MISMATCH2
          );
        }
        return result;
      }
      case "|": {
        let result = MISMATCH2;
        let map = null;
        for (let i = terms.length - 1; i >= 0; i--) {
          let term = terms[i];
          if (isEnumCapatible2(term)) {
            if (map === null && i > 0 && isEnumCapatible2(terms[i - 1])) {
              map = /* @__PURE__ */ Object.create(null);
              result = createCondition2(
                {
                  type: "Enum",
                  map
                },
                MATCH2,
                result
              );
            }
            if (map !== null) {
              const key = (isFunctionType2(term.name) ? term.name.slice(0, -1) : term.name).toLowerCase();
              if (key in map === false) {
                map[key] = term;
                continue;
              }
            }
          }
          map = null;
          result = createCondition2(
            term,
            MATCH2,
            result
          );
        }
        return result;
      }
      case "&&": {
        if (terms.length > 5) {
          return {
            type: "MatchOnce",
            terms,
            all: true
          };
        }
        let result = MISMATCH2;
        for (let i = terms.length - 1; i >= 0; i--) {
          const term = terms[i];
          let thenClause;
          if (terms.length > 1) {
            thenClause = buildGroupMatchGraph2(
              combinator,
              terms.filter(function(newGroupTerm) {
                return newGroupTerm !== term;
              }),
              false
            );
          } else {
            thenClause = MATCH2;
          }
          result = createCondition2(
            term,
            thenClause,
            result
          );
        }
        return result;
      }
      case "||": {
        if (terms.length > 5) {
          return {
            type: "MatchOnce",
            terms,
            all: false
          };
        }
        let result = atLeastOneTermMatched ? MATCH2 : MISMATCH2;
        for (let i = terms.length - 1; i >= 0; i--) {
          const term = terms[i];
          let thenClause;
          if (terms.length > 1) {
            thenClause = buildGroupMatchGraph2(
              combinator,
              terms.filter(function(newGroupTerm) {
                return newGroupTerm !== term;
              }),
              true
            );
          } else {
            thenClause = MATCH2;
          }
          result = createCondition2(
            term,
            thenClause,
            result
          );
        }
        return result;
      }
    }
  }
  function buildMultiplierMatchGraph2(node2) {
    let result = MATCH2;
    let matchTerm = buildMatchGraphInternal2(node2.term);
    if (node2.max === 0) {
      matchTerm = createCondition2(
        matchTerm,
        DISALLOW_EMPTY2,
        MISMATCH2
      );
      result = createCondition2(
        matchTerm,
        null,
        // will be a loop
        MISMATCH2
      );
      result.then = createCondition2(
        MATCH2,
        MATCH2,
        result
        // make a loop
      );
      if (node2.comma) {
        result.then.else = createCondition2(
          { type: "Comma", syntax: node2 },
          result,
          MISMATCH2
        );
      }
    } else {
      for (let i = node2.min || 1; i <= node2.max; i++) {
        if (node2.comma && result !== MATCH2) {
          result = createCondition2(
            { type: "Comma", syntax: node2 },
            result,
            MISMATCH2
          );
        }
        result = createCondition2(
          matchTerm,
          createCondition2(
            MATCH2,
            MATCH2,
            result
          ),
          MISMATCH2
        );
      }
    }
    if (node2.min === 0) {
      result = createCondition2(
        MATCH2,
        MATCH2,
        result
      );
    } else {
      for (let i = 0; i < node2.min - 1; i++) {
        if (node2.comma && result !== MATCH2) {
          result = createCondition2(
            { type: "Comma", syntax: node2 },
            result,
            MISMATCH2
          );
        }
        result = createCondition2(
          matchTerm,
          result,
          MISMATCH2
        );
      }
    }
    return result;
  }
  function buildMatchGraphInternal2(node2) {
    if (typeof node2 === "function") {
      return {
        type: "Generic",
        fn: node2
      };
    }
    switch (node2.type) {
      case "Group": {
        let result = buildGroupMatchGraph2(
          node2.combinator,
          node2.terms.map(buildMatchGraphInternal2),
          false
        );
        if (node2.disallowEmpty) {
          result = createCondition2(
            result,
            DISALLOW_EMPTY2,
            MISMATCH2
          );
        }
        return result;
      }
      case "Multiplier":
        return buildMultiplierMatchGraph2(node2);
      // https://drafts.csswg.org/css-values-5/#boolean
      case "Boolean": {
        const term = buildMatchGraphInternal2(node2.term);
        const matchNode = buildMatchGraphInternal2(groupNode2([
          groupNode2([
            { type: "Keyword", name: "not" },
            { type: "Type", name: "!boolean-group" }
          ]),
          groupNode2([
            { type: "Type", name: "!boolean-group" },
            groupNode2([
              { type: "Multiplier", comma: false, min: 0, max: 0, term: groupNode2([
                { type: "Keyword", name: "and" },
                { type: "Type", name: "!boolean-group" }
              ]) },
              { type: "Multiplier", comma: false, min: 0, max: 0, term: groupNode2([
                { type: "Keyword", name: "or" },
                { type: "Type", name: "!boolean-group" }
              ]) }
            ], "|")
          ])
        ], "|"));
        const booleanGroup = buildMatchGraphInternal2(
          groupNode2([
            { type: "Type", name: "!term" },
            groupNode2([
              { type: "Token", value: "(" },
              { type: "Type", name: "!self" },
              { type: "Token", value: ")" }
            ]),
            { type: "Type", name: "general-enclosed" }
          ], "|")
        );
        replaceTypeInGraph2(booleanGroup, { "!term": term, "!self": matchNode });
        replaceTypeInGraph2(matchNode, { "!boolean-group": booleanGroup });
        return matchNode;
      }
      case "Type":
      case "Property":
        return {
          type: node2.type,
          name: node2.name,
          syntax: node2
        };
      case "Keyword":
        return {
          type: node2.type,
          name: node2.name.toLowerCase(),
          syntax: node2
        };
      case "AtKeyword":
        return {
          type: node2.type,
          name: "@" + node2.name.toLowerCase(),
          syntax: node2
        };
      case "Function":
        return {
          type: node2.type,
          name: node2.name.toLowerCase() + "(",
          syntax: node2
        };
      case "String":
        if (node2.value.length === 3) {
          return {
            type: "Token",
            value: node2.value.charAt(1),
            syntax: node2
          };
        }
        return {
          type: node2.type,
          value: node2.value.substr(1, node2.value.length - 2).replace(/\\'/g, "'"),
          syntax: node2
        };
      case "Token":
        return {
          type: node2.type,
          value: node2.value,
          syntax: node2
        };
      case "Comma":
        return {
          type: node2.type,
          syntax: node2
        };
      default:
        throw new Error("Unknown node type:", node2.type);
    }
  }
  function buildMatchGraph2(syntaxTree, ref) {
    if (typeof syntaxTree === "string") {
      syntaxTree = parse2.parse(syntaxTree);
    }
    return {
      type: "MatchGraph",
      match: buildMatchGraphInternal2(syntaxTree),
      syntax: ref || null,
      source: syntaxTree
    };
  }
  matchGraph.DISALLOW_EMPTY = DISALLOW_EMPTY2;
  matchGraph.MATCH = MATCH2;
  matchGraph.MISMATCH = MISMATCH2;
  matchGraph.buildMatchGraph = buildMatchGraph2;
  return matchGraph;
}
var match = {};
var hasRequiredMatch;
function requireMatch() {
  if (hasRequiredMatch) return match;
  hasRequiredMatch = 1;
  const matchGraph2 = /* @__PURE__ */ requireMatchGraph();
  const types2 = /* @__PURE__ */ requireTypes();
  const { hasOwnProperty: hasOwnProperty2 } = Object.prototype;
  const STUB2 = 0;
  const TOKEN2 = 1;
  const OPEN_SYNTAX2 = 2;
  const CLOSE_SYNTAX2 = 3;
  const EXIT_REASON_MATCH2 = "Match";
  const EXIT_REASON_MISMATCH2 = "Mismatch";
  const EXIT_REASON_ITERATION_LIMIT2 = "Maximum iteration number exceeded (please fill an issue on https://github.com/csstree/csstree/issues)";
  const ITERATION_LIMIT2 = 15e3;
  function reverseList2(list) {
    let prev = null;
    let next = null;
    let item = list;
    while (item !== null) {
      next = item.prev;
      item.prev = prev;
      prev = item;
      item = next;
    }
    return prev;
  }
  function areStringsEqualCaseInsensitive2(testStr, referenceStr) {
    if (testStr.length !== referenceStr.length) {
      return false;
    }
    for (let i = 0; i < testStr.length; i++) {
      const referenceCode = referenceStr.charCodeAt(i);
      let testCode = testStr.charCodeAt(i);
      if (testCode >= 65 && testCode <= 90) {
        testCode = testCode | 32;
      }
      if (testCode !== referenceCode) {
        return false;
      }
    }
    return true;
  }
  function isContextEdgeDelim2(token) {
    if (token.type !== types2.Delim) {
      return false;
    }
    return token.value !== "?";
  }
  function isCommaContextStart2(token) {
    if (token === null) {
      return true;
    }
    return token.type === types2.Comma || token.type === types2.Function || token.type === types2.LeftParenthesis || token.type === types2.LeftSquareBracket || token.type === types2.LeftCurlyBracket || isContextEdgeDelim2(token);
  }
  function isCommaContextEnd2(token) {
    if (token === null) {
      return true;
    }
    return token.type === types2.RightParenthesis || token.type === types2.RightSquareBracket || token.type === types2.RightCurlyBracket || token.type === types2.Delim && token.value === "/";
  }
  function internalMatch2(tokens, state, syntaxes) {
    function moveToNextToken() {
      do {
        tokenIndex++;
        token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
      } while (token !== null && (token.type === types2.WhiteSpace || token.type === types2.Comment));
    }
    function getNextToken(offset) {
      const nextIndex = tokenIndex + offset;
      return nextIndex < tokens.length ? tokens[nextIndex] : null;
    }
    function stateSnapshotFromSyntax(nextState, prev) {
      return {
        nextState,
        matchStack,
        syntaxStack,
        thenStack,
        tokenIndex,
        prev
      };
    }
    function pushThenStack(nextState) {
      thenStack = {
        nextState,
        matchStack,
        syntaxStack,
        prev: thenStack
      };
    }
    function pushElseStack(nextState) {
      elseStack = stateSnapshotFromSyntax(nextState, elseStack);
    }
    function addTokenToMatch() {
      matchStack = {
        type: TOKEN2,
        syntax: state.syntax,
        token,
        prev: matchStack
      };
      moveToNextToken();
      syntaxStash = null;
      if (tokenIndex > longestMatch) {
        longestMatch = tokenIndex;
      }
    }
    function openSyntax() {
      syntaxStack = {
        syntax: state.syntax,
        opts: state.syntax.opts || syntaxStack !== null && syntaxStack.opts || null,
        prev: syntaxStack
      };
      matchStack = {
        type: OPEN_SYNTAX2,
        syntax: state.syntax,
        token: matchStack.token,
        prev: matchStack
      };
    }
    function closeSyntax() {
      if (matchStack.type === OPEN_SYNTAX2) {
        matchStack = matchStack.prev;
      } else {
        matchStack = {
          type: CLOSE_SYNTAX2,
          syntax: syntaxStack.syntax,
          token: matchStack.token,
          prev: matchStack
        };
      }
      syntaxStack = syntaxStack.prev;
    }
    let syntaxStack = null;
    let thenStack = null;
    let elseStack = null;
    let syntaxStash = null;
    let iterationCount = 0;
    let exitReason = null;
    let token = null;
    let tokenIndex = -1;
    let longestMatch = 0;
    let matchStack = {
      type: STUB2,
      syntax: null,
      token: null,
      prev: null
    };
    moveToNextToken();
    while (exitReason === null && ++iterationCount < ITERATION_LIMIT2) {
      switch (state.type) {
        case "Match":
          if (thenStack === null) {
            if (token !== null) {
              if (tokenIndex !== tokens.length - 1 || token.value !== "\\0" && token.value !== "\\9") {
                state = matchGraph2.MISMATCH;
                break;
              }
            }
            exitReason = EXIT_REASON_MATCH2;
            break;
          }
          state = thenStack.nextState;
          if (state === matchGraph2.DISALLOW_EMPTY) {
            if (thenStack.matchStack === matchStack) {
              state = matchGraph2.MISMATCH;
              break;
            } else {
              state = matchGraph2.MATCH;
            }
          }
          while (thenStack.syntaxStack !== syntaxStack) {
            closeSyntax();
          }
          thenStack = thenStack.prev;
          break;
        case "Mismatch":
          if (syntaxStash !== null && syntaxStash !== false) {
            if (elseStack === null || tokenIndex > elseStack.tokenIndex) {
              elseStack = syntaxStash;
              syntaxStash = false;
            }
          } else if (elseStack === null) {
            exitReason = EXIT_REASON_MISMATCH2;
            break;
          }
          state = elseStack.nextState;
          thenStack = elseStack.thenStack;
          syntaxStack = elseStack.syntaxStack;
          matchStack = elseStack.matchStack;
          tokenIndex = elseStack.tokenIndex;
          token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
          elseStack = elseStack.prev;
          break;
        case "MatchGraph":
          state = state.match;
          break;
        case "If":
          if (state.else !== matchGraph2.MISMATCH) {
            pushElseStack(state.else);
          }
          if (state.then !== matchGraph2.MATCH) {
            pushThenStack(state.then);
          }
          state = state.match;
          break;
        case "MatchOnce":
          state = {
            type: "MatchOnceBuffer",
            syntax: state,
            index: 0,
            mask: 0
          };
          break;
        case "MatchOnceBuffer": {
          const terms = state.syntax.terms;
          if (state.index === terms.length) {
            if (state.mask === 0 || state.syntax.all) {
              state = matchGraph2.MISMATCH;
              break;
            }
            state = matchGraph2.MATCH;
            break;
          }
          if (state.mask === (1 << terms.length) - 1) {
            state = matchGraph2.MATCH;
            break;
          }
          for (; state.index < terms.length; state.index++) {
            const matchFlag = 1 << state.index;
            if ((state.mask & matchFlag) === 0) {
              pushElseStack(state);
              pushThenStack({
                type: "AddMatchOnce",
                syntax: state.syntax,
                mask: state.mask | matchFlag
              });
              state = terms[state.index++];
              break;
            }
          }
          break;
        }
        case "AddMatchOnce":
          state = {
            type: "MatchOnceBuffer",
            syntax: state.syntax,
            index: 0,
            mask: state.mask
          };
          break;
        case "Enum":
          if (token !== null) {
            let name2 = token.value.toLowerCase();
            if (name2.indexOf("\\") !== -1) {
              name2 = name2.replace(/\\[09].*$/, "");
            }
            if (hasOwnProperty2.call(state.map, name2)) {
              state = state.map[name2];
              break;
            }
          }
          state = matchGraph2.MISMATCH;
          break;
        case "Generic": {
          const opts = syntaxStack !== null ? syntaxStack.opts : null;
          const lastTokenIndex2 = tokenIndex + Math.floor(state.fn(token, getNextToken, opts));
          if (!isNaN(lastTokenIndex2) && lastTokenIndex2 > tokenIndex) {
            while (tokenIndex < lastTokenIndex2) {
              addTokenToMatch();
            }
            state = matchGraph2.MATCH;
          } else {
            state = matchGraph2.MISMATCH;
          }
          break;
        }
        case "Type":
        case "Property": {
          const syntaxDict = state.type === "Type" ? "types" : "properties";
          const dictSyntax = hasOwnProperty2.call(syntaxes, syntaxDict) ? syntaxes[syntaxDict][state.name] : null;
          if (!dictSyntax || !dictSyntax.match) {
            throw new Error(
              "Bad syntax reference: " + (state.type === "Type" ? "<" + state.name + ">" : "<'" + state.name + "'>")
            );
          }
          if (syntaxStash !== false && token !== null && state.type === "Type") {
            const lowPriorityMatching = (
              // https://drafts.csswg.org/css-values-4/#custom-idents
              // When parsing positionally-ambiguous keywords in a property value, a <custom-ident> production
              // can only claim the keyword if no other unfulfilled production can claim it.
              state.name === "custom-ident" && token.type === types2.Ident || // https://drafts.csswg.org/css-values-4/#lengths
              // ... if a `0` could be parsed as either a <number> or a <length> in a property (such as line-height),
              // it must parse as a <number>
              state.name === "length" && token.value === "0"
            );
            if (lowPriorityMatching) {
              if (syntaxStash === null) {
                syntaxStash = stateSnapshotFromSyntax(state, elseStack);
              }
              state = matchGraph2.MISMATCH;
              break;
            }
          }
          openSyntax();
          state = dictSyntax.matchRef || dictSyntax.match;
          break;
        }
        case "Keyword": {
          const name2 = state.name;
          if (token !== null) {
            let keywordName = token.value;
            if (keywordName.indexOf("\\") !== -1) {
              keywordName = keywordName.replace(/\\[09].*$/, "");
            }
            if (areStringsEqualCaseInsensitive2(keywordName, name2)) {
              addTokenToMatch();
              state = matchGraph2.MATCH;
              break;
            }
          }
          state = matchGraph2.MISMATCH;
          break;
        }
        case "AtKeyword":
        case "Function":
          if (token !== null && areStringsEqualCaseInsensitive2(token.value, state.name)) {
            addTokenToMatch();
            state = matchGraph2.MATCH;
            break;
          }
          state = matchGraph2.MISMATCH;
          break;
        case "Token":
          if (token !== null && token.value === state.value) {
            addTokenToMatch();
            state = matchGraph2.MATCH;
            break;
          }
          state = matchGraph2.MISMATCH;
          break;
        case "Comma":
          if (token !== null && token.type === types2.Comma) {
            if (isCommaContextStart2(matchStack.token)) {
              state = matchGraph2.MISMATCH;
            } else {
              addTokenToMatch();
              state = isCommaContextEnd2(token) ? matchGraph2.MISMATCH : matchGraph2.MATCH;
            }
          } else {
            state = isCommaContextStart2(matchStack.token) || isCommaContextEnd2(token) ? matchGraph2.MATCH : matchGraph2.MISMATCH;
          }
          break;
        case "String":
          let string2 = "";
          let lastTokenIndex = tokenIndex;
          for (; lastTokenIndex < tokens.length && string2.length < state.value.length; lastTokenIndex++) {
            string2 += tokens[lastTokenIndex].value;
          }
          if (areStringsEqualCaseInsensitive2(string2, state.value)) {
            while (tokenIndex < lastTokenIndex) {
              addTokenToMatch();
            }
            state = matchGraph2.MATCH;
          } else {
            state = matchGraph2.MISMATCH;
          }
          break;
        default:
          throw new Error("Unknown node type: " + state.type);
      }
    }
    switch (exitReason) {
      case null:
        console.warn("[csstree-match] BREAK after " + ITERATION_LIMIT2 + " iterations");
        exitReason = EXIT_REASON_ITERATION_LIMIT2;
        matchStack = null;
        break;
      case EXIT_REASON_MATCH2:
        while (syntaxStack !== null) {
          closeSyntax();
        }
        break;
      default:
        matchStack = null;
    }
    return {
      tokens,
      reason: exitReason,
      iterations: iterationCount,
      match: matchStack,
      longestMatch
    };
  }
  function matchAsList(tokens, matchGraph3, syntaxes) {
    const matchResult = internalMatch2(tokens, matchGraph3, syntaxes || {});
    if (matchResult.match !== null) {
      let item = reverseList2(matchResult.match).prev;
      matchResult.match = [];
      while (item !== null) {
        switch (item.type) {
          case OPEN_SYNTAX2:
          case CLOSE_SYNTAX2:
            matchResult.match.push({
              type: item.type,
              syntax: item.syntax
            });
            break;
          default:
            matchResult.match.push({
              token: item.token.value,
              node: item.token.node
            });
            break;
        }
        item = item.prev;
      }
    }
    return matchResult;
  }
  function matchAsTree2(tokens, matchGraph3, syntaxes) {
    const matchResult = internalMatch2(tokens, matchGraph3, syntaxes || {});
    if (matchResult.match === null) {
      return matchResult;
    }
    let item = matchResult.match;
    let host = matchResult.match = {
      syntax: matchGraph3.syntax || null,
      match: []
    };
    const hostStack = [host];
    item = reverseList2(item).prev;
    while (item !== null) {
      switch (item.type) {
        case OPEN_SYNTAX2:
          host.match.push(host = {
            syntax: item.syntax,
            match: []
          });
          hostStack.push(host);
          break;
        case CLOSE_SYNTAX2:
          hostStack.pop();
          host = hostStack[hostStack.length - 1];
          break;
        default:
          host.match.push({
            syntax: item.syntax || null,
            token: item.token.value,
            node: item.token.node
          });
      }
      item = item.prev;
    }
    return matchResult;
  }
  match.matchAsList = matchAsList;
  match.matchAsTree = matchAsTree2;
  return match;
}
var trace$1 = {};
var hasRequiredTrace;
function requireTrace() {
  if (hasRequiredTrace) return trace$1;
  hasRequiredTrace = 1;
  function getTrace2(node2) {
    function shouldPutToTrace(syntax2) {
      if (syntax2 === null) {
        return false;
      }
      return syntax2.type === "Type" || syntax2.type === "Property" || syntax2.type === "Keyword";
    }
    function hasMatch(matchNode) {
      if (Array.isArray(matchNode.match)) {
        for (let i = 0; i < matchNode.match.length; i++) {
          if (hasMatch(matchNode.match[i])) {
            if (shouldPutToTrace(matchNode.syntax)) {
              result.unshift(matchNode.syntax);
            }
            return true;
          }
        }
      } else if (matchNode.node === node2) {
        result = shouldPutToTrace(matchNode.syntax) ? [matchNode.syntax] : [];
        return true;
      }
      return false;
    }
    let result = null;
    if (this.matched !== null) {
      hasMatch(this.matched);
    }
    return result;
  }
  function isType2(node2, type) {
    return testNode2(this, node2, (match2) => match2.type === "Type" && match2.name === type);
  }
  function isProperty2(node2, property2) {
    return testNode2(this, node2, (match2) => match2.type === "Property" && match2.name === property2);
  }
  function isKeyword2(node2) {
    return testNode2(this, node2, (match2) => match2.type === "Keyword");
  }
  function testNode2(match2, node2, fn) {
    const trace2 = getTrace2.call(match2, node2);
    if (trace2 === null) {
      return false;
    }
    return trace2.some(fn);
  }
  trace$1.getTrace = getTrace2;
  trace$1.isKeyword = isKeyword2;
  trace$1.isProperty = isProperty2;
  trace$1.isType = isType2;
  return trace$1;
}
var search = {};
var hasRequiredSearch;
function requireSearch() {
  if (hasRequiredSearch) return search;
  hasRequiredSearch = 1;
  const List2 = /* @__PURE__ */ requireList();
  function getFirstMatchNode2(matchNode) {
    if ("node" in matchNode) {
      return matchNode.node;
    }
    return getFirstMatchNode2(matchNode.match[0]);
  }
  function getLastMatchNode2(matchNode) {
    if ("node" in matchNode) {
      return matchNode.node;
    }
    return getLastMatchNode2(matchNode.match[matchNode.match.length - 1]);
  }
  function matchFragments2(lexer2, ast, match2, type, name2) {
    function findFragments(matchNode) {
      if (matchNode.syntax !== null && matchNode.syntax.type === type && matchNode.syntax.name === name2) {
        const start = getFirstMatchNode2(matchNode);
        const end = getLastMatchNode2(matchNode);
        lexer2.syntax.walk(ast, function(node2, item, list) {
          if (node2 === start) {
            const nodes = new List2.List();
            do {
              nodes.appendData(item.data);
              if (item.data === end) {
                break;
              }
              item = item.next;
            } while (item !== null);
            fragments.push({
              parent: list,
              nodes
            });
          }
        });
      }
      if (Array.isArray(matchNode.match)) {
        matchNode.match.forEach(findFragments);
      }
    }
    const fragments = [];
    if (match2.matched !== null) {
      findFragments(match2.matched);
    }
    return fragments;
  }
  search.matchFragments = matchFragments2;
  return search;
}
var structure$N = {};
var hasRequiredStructure;
function requireStructure() {
  if (hasRequiredStructure) return structure$N;
  hasRequiredStructure = 1;
  const List2 = /* @__PURE__ */ requireList();
  const { hasOwnProperty: hasOwnProperty2 } = Object.prototype;
  function isValidNumber2(value2) {
    return typeof value2 === "number" && isFinite(value2) && Math.floor(value2) === value2 && value2 >= 0;
  }
  function isValidLocation2(loc) {
    return Boolean(loc) && isValidNumber2(loc.offset) && isValidNumber2(loc.line) && isValidNumber2(loc.column);
  }
  function createNodeStructureChecker2(type, fields) {
    return function checkNode(node2, warn) {
      if (!node2 || node2.constructor !== Object) {
        return warn(node2, "Type of node should be an Object");
      }
      for (let key in node2) {
        let valid = true;
        if (hasOwnProperty2.call(node2, key) === false) {
          continue;
        }
        if (key === "type") {
          if (node2.type !== type) {
            warn(node2, "Wrong node type `" + node2.type + "`, expected `" + type + "`");
          }
        } else if (key === "loc") {
          if (node2.loc === null) {
            continue;
          } else if (node2.loc && node2.loc.constructor === Object) {
            if (typeof node2.loc.source !== "string") {
              key += ".source";
            } else if (!isValidLocation2(node2.loc.start)) {
              key += ".start";
            } else if (!isValidLocation2(node2.loc.end)) {
              key += ".end";
            } else {
              continue;
            }
          }
          valid = false;
        } else if (fields.hasOwnProperty(key)) {
          valid = false;
          for (let i = 0; !valid && i < fields[key].length; i++) {
            const fieldType = fields[key][i];
            switch (fieldType) {
              case String:
                valid = typeof node2[key] === "string";
                break;
              case Boolean:
                valid = typeof node2[key] === "boolean";
                break;
              case null:
                valid = node2[key] === null;
                break;
              default:
                if (typeof fieldType === "string") {
                  valid = node2[key] && node2[key].type === fieldType;
                } else if (Array.isArray(fieldType)) {
                  valid = node2[key] instanceof List2.List;
                }
            }
          }
        } else {
          warn(node2, "Unknown field `" + key + "` for " + type + " node type");
        }
        if (!valid) {
          warn(node2, "Bad value for `" + type + "." + key + "`");
        }
      }
      for (const key in fields) {
        if (hasOwnProperty2.call(fields, key) && hasOwnProperty2.call(node2, key) === false) {
          warn(node2, "Field `" + type + "." + key + "` is missed");
        }
      }
    };
  }
  function genTypesList2(fieldTypes, path) {
    const docsTypes = [];
    for (let i = 0; i < fieldTypes.length; i++) {
      const fieldType = fieldTypes[i];
      if (fieldType === String || fieldType === Boolean) {
        docsTypes.push(fieldType.name.toLowerCase());
      } else if (fieldType === null) {
        docsTypes.push("null");
      } else if (typeof fieldType === "string") {
        docsTypes.push(fieldType);
      } else if (Array.isArray(fieldType)) {
        docsTypes.push("List<" + (genTypesList2(fieldType, path) || "any") + ">");
      } else {
        throw new Error("Wrong value `" + fieldType + "` in `" + path + "` structure definition");
      }
    }
    return docsTypes.join(" | ");
  }
  function processStructure2(name2, nodeType) {
    const structure2 = nodeType.structure;
    const fields = {
      type: String,
      loc: true
    };
    const docs = {
      type: '"' + name2 + '"'
    };
    for (const key in structure2) {
      if (hasOwnProperty2.call(structure2, key) === false) {
        continue;
      }
      const fieldTypes = fields[key] = Array.isArray(structure2[key]) ? structure2[key].slice() : [structure2[key]];
      docs[key] = genTypesList2(fieldTypes, name2 + "." + key);
    }
    return {
      docs,
      check: createNodeStructureChecker2(name2, fields)
    };
  }
  function getStructureFromConfig2(config) {
    const structure2 = {};
    if (config.node) {
      for (const name2 in config.node) {
        if (hasOwnProperty2.call(config.node, name2)) {
          const nodeType = config.node[name2];
          if (nodeType.structure) {
            structure2[name2] = processStructure2(name2, nodeType);
          } else {
            throw new Error("Missed `structure` field in `" + name2 + "` node type definition");
          }
        }
      }
    }
    return structure2;
  }
  structure$N.getStructureFromConfig = getStructureFromConfig2;
  return structure$N;
}
var walk$2 = {};
var hasRequiredWalk;
function requireWalk() {
  if (hasRequiredWalk) return walk$2;
  hasRequiredWalk = 1;
  const noop2 = function() {
  };
  function ensureFunction2(value2) {
    return typeof value2 === "function" ? value2 : noop2;
  }
  function walk2(node2, options, context) {
    function walk3(node3) {
      enter.call(context, node3);
      switch (node3.type) {
        case "Group":
          node3.terms.forEach(walk3);
          break;
        case "Multiplier":
        case "Boolean":
          walk3(node3.term);
          break;
        case "Type":
        case "Property":
        case "Keyword":
        case "AtKeyword":
        case "Function":
        case "String":
        case "Token":
        case "Comma":
          break;
        default:
          throw new Error("Unknown type: " + node3.type);
      }
      leave.call(context, node3);
    }
    let enter = noop2;
    let leave = noop2;
    if (typeof options === "function") {
      enter = options;
    } else if (options) {
      enter = ensureFunction2(options.enter);
      leave = ensureFunction2(options.leave);
    }
    if (enter === noop2 && leave === noop2) {
      throw new Error("Neither `enter` nor `leave` walker handler is set or both aren't a function");
    }
    walk3(node2);
  }
  walk$2.walk = walk2;
  return walk$2;
}
var hasRequiredLexer$1;
function requireLexer$1() {
  if (hasRequiredLexer$1) return Lexer$1;
  hasRequiredLexer$1 = 1;
  const error2 = /* @__PURE__ */ requireError();
  const names2 = /* @__PURE__ */ requireNames();
  const genericConst2 = /* @__PURE__ */ requireGenericConst();
  const generic2 = /* @__PURE__ */ requireGeneric();
  const units2 = /* @__PURE__ */ requireUnits();
  const prepareTokens2 = /* @__PURE__ */ requirePrepareTokens();
  const matchGraph2 = /* @__PURE__ */ requireMatchGraph();
  const match2 = /* @__PURE__ */ requireMatch();
  const trace2 = /* @__PURE__ */ requireTrace();
  const search2 = /* @__PURE__ */ requireSearch();
  const structure2 = /* @__PURE__ */ requireStructure();
  const parse2 = /* @__PURE__ */ requireParse();
  const generate2 = /* @__PURE__ */ requireGenerate();
  const walk2 = /* @__PURE__ */ requireWalk();
  function dumpMapSyntax2(map, compact, syntaxAsAst) {
    const result = {};
    for (const name2 in map) {
      if (map[name2].syntax) {
        result[name2] = syntaxAsAst ? map[name2].syntax : generate2.generate(map[name2].syntax, { compact });
      }
    }
    return result;
  }
  function dumpAtruleMapSyntax2(map, compact, syntaxAsAst) {
    const result = {};
    for (const [name2, atrule2] of Object.entries(map)) {
      result[name2] = {
        prelude: atrule2.prelude && (syntaxAsAst ? atrule2.prelude.syntax : generate2.generate(atrule2.prelude.syntax, { compact })),
        descriptors: atrule2.descriptors && dumpMapSyntax2(atrule2.descriptors, compact, syntaxAsAst)
      };
    }
    return result;
  }
  function valueHasVar2(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].value.toLowerCase() === "var(") {
        return true;
      }
    }
    return false;
  }
  function syntaxHasTopLevelCommaMultiplier2(syntax2) {
    const singleTerm = syntax2.terms[0];
    return syntax2.explicit === false && syntax2.terms.length === 1 && singleTerm.type === "Multiplier" && singleTerm.comma === true;
  }
  function buildMatchResult2(matched, error3, iterations) {
    return {
      matched,
      iterations,
      error: error3,
      ...trace2
    };
  }
  function matchSyntax2(lexer2, syntax2, value2, useCssWideKeywords) {
    const tokens = prepareTokens2(value2, lexer2.syntax);
    let result;
    if (valueHasVar2(tokens)) {
      return buildMatchResult2(null, new Error("Matching for a tree with var() is not supported"));
    }
    if (useCssWideKeywords) {
      result = match2.matchAsTree(tokens, lexer2.cssWideKeywordsSyntax, lexer2);
    }
    if (!useCssWideKeywords || !result.match) {
      result = match2.matchAsTree(tokens, syntax2.match, lexer2);
      if (!result.match) {
        return buildMatchResult2(
          null,
          new error2.SyntaxMatchError(result.reason, syntax2.syntax, value2, result),
          result.iterations
        );
      }
    }
    return buildMatchResult2(result.match, null, result.iterations);
  }
  class Lexer2 {
    constructor(config, syntax2, structure$12) {
      this.cssWideKeywords = genericConst2.cssWideKeywords;
      this.syntax = syntax2;
      this.generic = false;
      this.units = { ...units2 };
      this.atrules = /* @__PURE__ */ Object.create(null);
      this.properties = /* @__PURE__ */ Object.create(null);
      this.types = /* @__PURE__ */ Object.create(null);
      this.structure = structure$12 || structure2.getStructureFromConfig(config);
      if (config) {
        if (config.cssWideKeywords) {
          this.cssWideKeywords = config.cssWideKeywords;
        }
        if (config.units) {
          for (const group of Object.keys(units2)) {
            if (Array.isArray(config.units[group])) {
              this.units[group] = config.units[group];
            }
          }
        }
        if (config.types) {
          for (const [name2, type] of Object.entries(config.types)) {
            this.addType_(name2, type);
          }
        }
        if (config.generic) {
          this.generic = true;
          for (const [name2, value2] of Object.entries(generic2.createGenericTypes(this.units))) {
            this.addType_(name2, value2);
          }
        }
        if (config.atrules) {
          for (const [name2, atrule2] of Object.entries(config.atrules)) {
            this.addAtrule_(name2, atrule2);
          }
        }
        if (config.properties) {
          for (const [name2, property2] of Object.entries(config.properties)) {
            this.addProperty_(name2, property2);
          }
        }
      }
      this.cssWideKeywordsSyntax = matchGraph2.buildMatchGraph(this.cssWideKeywords.join(" |  "));
    }
    checkStructure(ast) {
      function collectWarning(node2, message) {
        warns.push({ node: node2, message });
      }
      const structure3 = this.structure;
      const warns = [];
      this.syntax.walk(ast, function(node2) {
        if (structure3.hasOwnProperty(node2.type)) {
          structure3[node2.type].check(node2, collectWarning);
        } else {
          collectWarning(node2, "Unknown node type `" + node2.type + "`");
        }
      });
      return warns.length ? warns : false;
    }
    createDescriptor(syntax2, type, name2, parent = null) {
      const ref = {
        type,
        name: name2
      };
      const descriptor = {
        type,
        name: name2,
        parent,
        serializable: typeof syntax2 === "string" || syntax2 && typeof syntax2.type === "string",
        syntax: null,
        match: null,
        matchRef: null
        // used for properties when a syntax referenced as <'property'> in other syntax definitions
      };
      if (typeof syntax2 === "function") {
        descriptor.match = matchGraph2.buildMatchGraph(syntax2, ref);
      } else {
        if (typeof syntax2 === "string") {
          Object.defineProperty(descriptor, "syntax", {
            get() {
              Object.defineProperty(descriptor, "syntax", {
                value: parse2.parse(syntax2)
              });
              return descriptor.syntax;
            }
          });
        } else {
          descriptor.syntax = syntax2;
        }
        Object.defineProperty(descriptor, "match", {
          get() {
            Object.defineProperty(descriptor, "match", {
              value: matchGraph2.buildMatchGraph(descriptor.syntax, ref)
            });
            return descriptor.match;
          }
        });
        if (type === "Property") {
          Object.defineProperty(descriptor, "matchRef", {
            get() {
              const syntax3 = descriptor.syntax;
              const value2 = syntaxHasTopLevelCommaMultiplier2(syntax3) ? matchGraph2.buildMatchGraph({
                ...syntax3,
                terms: [syntax3.terms[0].term]
              }, ref) : null;
              Object.defineProperty(descriptor, "matchRef", {
                value: value2
              });
              return value2;
            }
          });
        }
      }
      return descriptor;
    }
    addAtrule_(name2, syntax2) {
      if (!syntax2) {
        return;
      }
      this.atrules[name2] = {
        type: "Atrule",
        name: name2,
        prelude: syntax2.prelude ? this.createDescriptor(syntax2.prelude, "AtrulePrelude", name2) : null,
        descriptors: syntax2.descriptors ? Object.keys(syntax2.descriptors).reduce(
          (map, descName) => {
            map[descName] = this.createDescriptor(syntax2.descriptors[descName], "AtruleDescriptor", descName, name2);
            return map;
          },
          /* @__PURE__ */ Object.create(null)
        ) : null
      };
    }
    addProperty_(name2, syntax2) {
      if (!syntax2) {
        return;
      }
      this.properties[name2] = this.createDescriptor(syntax2, "Property", name2);
    }
    addType_(name2, syntax2) {
      if (!syntax2) {
        return;
      }
      this.types[name2] = this.createDescriptor(syntax2, "Type", name2);
    }
    checkAtruleName(atruleName) {
      if (!this.getAtrule(atruleName)) {
        return new error2.SyntaxReferenceError("Unknown at-rule", "@" + atruleName);
      }
    }
    checkAtrulePrelude(atruleName, prelude) {
      const error3 = this.checkAtruleName(atruleName);
      if (error3) {
        return error3;
      }
      const atrule2 = this.getAtrule(atruleName);
      if (!atrule2.prelude && prelude) {
        return new SyntaxError("At-rule `@" + atruleName + "` should not contain a prelude");
      }
      if (atrule2.prelude && !prelude) {
        if (!matchSyntax2(this, atrule2.prelude, "", false).matched) {
          return new SyntaxError("At-rule `@" + atruleName + "` should contain a prelude");
        }
      }
    }
    checkAtruleDescriptorName(atruleName, descriptorName) {
      const error$1 = this.checkAtruleName(atruleName);
      if (error$1) {
        return error$1;
      }
      const atrule2 = this.getAtrule(atruleName);
      const descriptor = names2.keyword(descriptorName);
      if (!atrule2.descriptors) {
        return new SyntaxError("At-rule `@" + atruleName + "` has no known descriptors");
      }
      if (!atrule2.descriptors[descriptor.name] && !atrule2.descriptors[descriptor.basename]) {
        return new error2.SyntaxReferenceError("Unknown at-rule descriptor", descriptorName);
      }
    }
    checkPropertyName(propertyName) {
      if (!this.getProperty(propertyName)) {
        return new error2.SyntaxReferenceError("Unknown property", propertyName);
      }
    }
    matchAtrulePrelude(atruleName, prelude) {
      const error3 = this.checkAtrulePrelude(atruleName, prelude);
      if (error3) {
        return buildMatchResult2(null, error3);
      }
      const atrule2 = this.getAtrule(atruleName);
      if (!atrule2.prelude) {
        return buildMatchResult2(null, null);
      }
      return matchSyntax2(this, atrule2.prelude, prelude || "", false);
    }
    matchAtruleDescriptor(atruleName, descriptorName, value2) {
      const error3 = this.checkAtruleDescriptorName(atruleName, descriptorName);
      if (error3) {
        return buildMatchResult2(null, error3);
      }
      const atrule2 = this.getAtrule(atruleName);
      const descriptor = names2.keyword(descriptorName);
      return matchSyntax2(this, atrule2.descriptors[descriptor.name] || atrule2.descriptors[descriptor.basename], value2, false);
    }
    matchDeclaration(node2) {
      if (node2.type !== "Declaration") {
        return buildMatchResult2(null, new Error("Not a Declaration node"));
      }
      return this.matchProperty(node2.property, node2.value);
    }
    matchProperty(propertyName, value2) {
      if (names2.property(propertyName).custom) {
        return buildMatchResult2(null, new Error("Lexer matching doesn't applicable for custom properties"));
      }
      const error3 = this.checkPropertyName(propertyName);
      if (error3) {
        return buildMatchResult2(null, error3);
      }
      return matchSyntax2(this, this.getProperty(propertyName), value2, true);
    }
    matchType(typeName, value2) {
      const typeSyntax = this.getType(typeName);
      if (!typeSyntax) {
        return buildMatchResult2(null, new error2.SyntaxReferenceError("Unknown type", typeName));
      }
      return matchSyntax2(this, typeSyntax, value2, false);
    }
    match(syntax2, value2) {
      if (typeof syntax2 !== "string" && (!syntax2 || !syntax2.type)) {
        return buildMatchResult2(null, new error2.SyntaxReferenceError("Bad syntax"));
      }
      if (typeof syntax2 === "string" || !syntax2.match) {
        syntax2 = this.createDescriptor(syntax2, "Type", "anonymous");
      }
      return matchSyntax2(this, syntax2, value2, false);
    }
    findValueFragments(propertyName, value2, type, name2) {
      return search2.matchFragments(this, value2, this.matchProperty(propertyName, value2), type, name2);
    }
    findDeclarationValueFragments(declaration, type, name2) {
      return search2.matchFragments(this, declaration.value, this.matchDeclaration(declaration), type, name2);
    }
    findAllFragments(ast, type, name2) {
      const result = [];
      this.syntax.walk(ast, {
        visit: "Declaration",
        enter: (declaration) => {
          result.push.apply(result, this.findDeclarationValueFragments(declaration, type, name2));
        }
      });
      return result;
    }
    getAtrule(atruleName, fallbackBasename = true) {
      const atrule2 = names2.keyword(atruleName);
      const atruleEntry = atrule2.vendor && fallbackBasename ? this.atrules[atrule2.name] || this.atrules[atrule2.basename] : this.atrules[atrule2.name];
      return atruleEntry || null;
    }
    getAtrulePrelude(atruleName, fallbackBasename = true) {
      const atrule2 = this.getAtrule(atruleName, fallbackBasename);
      return atrule2 && atrule2.prelude || null;
    }
    getAtruleDescriptor(atruleName, name2) {
      return this.atrules.hasOwnProperty(atruleName) && this.atrules.declarators ? this.atrules[atruleName].declarators[name2] || null : null;
    }
    getProperty(propertyName, fallbackBasename = true) {
      const property2 = names2.property(propertyName);
      const propertyEntry = property2.vendor && fallbackBasename ? this.properties[property2.name] || this.properties[property2.basename] : this.properties[property2.name];
      return propertyEntry || null;
    }
    getType(name2) {
      return hasOwnProperty.call(this.types, name2) ? this.types[name2] : null;
    }
    validate() {
      function syntaxRef(name2, isType2) {
        return isType2 ? `<${name2}>` : `<'${name2}'>`;
      }
      function validate(syntax2, name2, broken, descriptor) {
        if (broken.has(name2)) {
          return broken.get(name2);
        }
        broken.set(name2, false);
        if (descriptor.syntax !== null) {
          walk2.walk(descriptor.syntax, function(node2) {
            if (node2.type !== "Type" && node2.type !== "Property") {
              return;
            }
            const map = node2.type === "Type" ? syntax2.types : syntax2.properties;
            const brokenMap = node2.type === "Type" ? brokenTypes : brokenProperties;
            if (!hasOwnProperty.call(map, node2.name)) {
              errors.push(`${syntaxRef(name2, broken === brokenTypes)} used missed syntax definition ${syntaxRef(node2.name, node2.type === "Type")}`);
              broken.set(name2, true);
            } else if (validate(syntax2, node2.name, brokenMap, map[node2.name])) {
              errors.push(`${syntaxRef(name2, broken === brokenTypes)} used broken syntax definition ${syntaxRef(node2.name, node2.type === "Type")}`);
              broken.set(name2, true);
            }
          }, this);
        }
      }
      const errors = [];
      let brokenTypes = /* @__PURE__ */ new Map();
      let brokenProperties = /* @__PURE__ */ new Map();
      for (const key in this.types) {
        validate(this, key, brokenTypes, this.types[key]);
      }
      for (const key in this.properties) {
        validate(this, key, brokenProperties, this.properties[key]);
      }
      const brokenTypesArray = [...brokenTypes.keys()].filter((name2) => brokenTypes.get(name2));
      const brokenPropertiesArray = [...brokenProperties.keys()].filter((name2) => brokenProperties.get(name2));
      if (brokenTypesArray.length || brokenPropertiesArray.length) {
        return {
          errors,
          types: brokenTypesArray,
          properties: brokenPropertiesArray
        };
      }
      return null;
    }
    dump(syntaxAsAst, pretty) {
      return {
        generic: this.generic,
        cssWideKeywords: this.cssWideKeywords,
        units: this.units,
        types: dumpMapSyntax2(this.types, !pretty, syntaxAsAst),
        properties: dumpMapSyntax2(this.properties, !pretty, syntaxAsAst),
        atrules: dumpAtruleMapSyntax2(this.atrules, !pretty, syntaxAsAst)
      };
    }
    toString() {
      return JSON.stringify(this.dump());
    }
  }
  Lexer$1.Lexer = Lexer2;
  return Lexer$1;
}
var mix_1;
var hasRequiredMix;
function requireMix() {
  if (hasRequiredMix) return mix_1;
  hasRequiredMix = 1;
  function appendOrSet2(a, b) {
    if (typeof b === "string" && /^\s*\|/.test(b)) {
      return typeof a === "string" ? a + b : b.replace(/^\s*\|\s*/, "");
    }
    return b || null;
  }
  function extractProps2(obj, props) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const prop of Object.keys(obj)) {
      if (props.includes(prop)) {
        result[prop] = obj[prop];
      }
    }
    return result;
  }
  function mergeDicts2(base, ext, fields) {
    const result = { ...base };
    for (const [key, props] of Object.entries(ext)) {
      result[key] = {
        ...result[key],
        ...fields ? extractProps2(props, fields) : props
      };
    }
    return result;
  }
  function mix2(dest, src) {
    const result = { ...dest };
    for (const [prop, value2] of Object.entries(src)) {
      switch (prop) {
        case "generic":
          result[prop] = Boolean(value2);
          break;
        case "cssWideKeywords":
          result[prop] = dest[prop] ? [...dest[prop], ...value2] : value2 || [];
          break;
        case "units":
          result[prop] = { ...dest[prop] };
          for (const [name2, patch2] of Object.entries(value2)) {
            result[prop][name2] = Array.isArray(patch2) ? patch2 : [];
          }
          break;
        case "atrules":
          result[prop] = { ...dest[prop] };
          for (const [name2, atrule2] of Object.entries(value2)) {
            const exists = result[prop][name2] || {};
            const current = result[prop][name2] = {
              prelude: exists.prelude || null,
              descriptors: {
                ...exists.descriptors
              }
            };
            if (!atrule2) {
              continue;
            }
            current.prelude = atrule2.prelude ? appendOrSet2(current.prelude, atrule2.prelude) : current.prelude || null;
            for (const [descriptorName, descriptorValue] of Object.entries(atrule2.descriptors || {})) {
              current.descriptors[descriptorName] = descriptorValue ? appendOrSet2(current.descriptors[descriptorName], descriptorValue) : null;
            }
            if (!Object.keys(current.descriptors).length) {
              current.descriptors = null;
            }
          }
          break;
        case "types":
        case "properties":
          result[prop] = { ...dest[prop] };
          for (const [name2, syntax2] of Object.entries(value2)) {
            result[prop][name2] = appendOrSet2(result[prop][name2], syntax2);
          }
          break;
        case "parseContext":
          result[prop] = {
            ...dest[prop],
            ...value2
          };
          break;
        case "scope":
        case "features":
          result[prop] = mergeDicts2(dest[prop], value2);
          break;
        case "atrule":
        case "pseudo":
          result[prop] = mergeDicts2(dest[prop], value2, ["parse"]);
          break;
        case "node":
          result[prop] = mergeDicts2(dest[prop], value2, ["name", "structure", "parse", "generate", "walkContext"]);
          break;
      }
    }
    return result;
  }
  mix_1 = mix2;
  return mix_1;
}
var create_1;
var hasRequiredCreate;
function requireCreate() {
  if (hasRequiredCreate) return create_1;
  hasRequiredCreate = 1;
  const index = /* @__PURE__ */ requireTokenizer();
  const create2 = /* @__PURE__ */ requireCreate$4();
  const create$22 = /* @__PURE__ */ requireCreate$3();
  const create$32 = /* @__PURE__ */ requireCreate$2();
  const create$12 = /* @__PURE__ */ requireCreate$1();
  const Lexer2 = /* @__PURE__ */ requireLexer$1();
  const mix2 = /* @__PURE__ */ requireMix();
  function createSyntax2(config) {
    const parse2 = create2.createParser(config);
    const walk2 = create$12.createWalker(config);
    const generate2 = create$22.createGenerator(config);
    const { fromPlainObject: fromPlainObject2, toPlainObject: toPlainObject2 } = create$32.createConvertor(walk2);
    const syntax2 = {
      lexer: null,
      createLexer: (config2) => new Lexer2.Lexer(config2, syntax2, syntax2.lexer.structure),
      tokenize: index.tokenize,
      parse: parse2,
      generate: generate2,
      walk: walk2,
      find: walk2.find,
      findLast: walk2.findLast,
      findAll: walk2.findAll,
      fromPlainObject: fromPlainObject2,
      toPlainObject: toPlainObject2,
      fork(extension) {
        const base = mix2({}, config);
        return createSyntax2(
          typeof extension === "function" ? extension(base) : mix2(base, extension)
        );
      }
    };
    syntax2.lexer = new Lexer2.Lexer({
      generic: config.generic,
      cssWideKeywords: config.cssWideKeywords,
      units: config.units,
      types: config.types,
      atrules: config.atrules,
      properties: config.properties,
      node: config.node
    }, syntax2);
    return syntax2;
  }
  const createSyntax$12 = (config) => createSyntax2(mix2({}, config));
  create_1 = createSyntax$12;
  return create_1;
}
const atrules = { "charset": { "prelude": "<string>" }, "container": { "prelude": "[ <container-name> ]? <container-condition>" }, "font-face": { "descriptors": { "unicode-range": { "comment": "replaces <unicode-range>, an old production name", "syntax": "<urange>#" } } }, "font-features-values": { "comment": "The features values syntax is defined in https://www.w3.org/TR/css-fonts-4/#at-ruledef-font-feature-values", "prelude": "[<string> | <custom-ident>]+", "descriptors": { "font-display": "auto | block | swap | fallback | optional" } }, "scope": { "prelude": "[ ( <scope-start> ) ]? [ to ( <scope-end> ) ]?" }, "position-try": { "comment": "The list of descriptors: https://developer.mozilla.org/en-US/docs/Web/CSS/@position-try", "descriptors": { "top": "<'top'>", "left": "<'left'>", "bottom": "<'bottom'>", "right": "<'right'>", "inset-block-start": "<'inset-block-start'>", "inset-block-end": "<'inset-block-end'>", "inset-inline-start": "<'inset-inline-start'>", "inset-inline-end": "<'inset-inline-end'>", "inset-block": "<'inset-block'>", "inset-inline": "<'inset-inline'>", "inset": "<'inset'>", "margin-top": "<'margin-top'>", "margin-left": "<'margin-left'>", "margin-bottom": "<'margin-bottom'>", "margin-right": "<'margin-right'>", "margin-block-start": "<'margin-block-start'>", "margin-block-end": "<'margin-block-end'>", "margin-inline-start": "<'margin-inline-start'>", "margin-inline-end": "<'margin-inline-end'>", "margin": "<'margin'>", "margin-block": "<'margin-block'>", "margin-inline": "<'margin-inline'>", "width": "<'width'>", "height": "<'height'>", "min-width": "<'min-width'>", "min-height": "<'min-height'>", "max-width": "<'max-width'>", "max-height": "<'max-height'>", "block-size": "<'block-size'>", "inline-size": "<'inline-size'>", "min-block-size": "<'min-block-size'>", "min-inline-size": "<'min-inline-size'>", "max-block-size": "<'max-block-size'>", "max-inline-size": "<'max-inline-size'>", "align-self": "<'align-self'> | anchor-center", "justify-self": "<'justify-self'> | anchor-center" } } };
const properties$1 = /* @__PURE__ */ JSON.parse(`{"-moz-background-clip":{"comment":"deprecated syntax in old Firefox, https://developer.mozilla.org/en/docs/Web/CSS/background-clip","syntax":"padding | border"},"-moz-border-radius-bottomleft":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius","syntax":"<'border-bottom-left-radius'>"},"-moz-border-radius-bottomright":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius","syntax":"<'border-bottom-right-radius'>"},"-moz-border-radius-topleft":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius","syntax":"<'border-top-left-radius'>"},"-moz-border-radius-topright":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius","syntax":"<'border-bottom-right-radius'>"},"-moz-control-character-visibility":{"comment":"firefox specific keywords, https://bugzilla.mozilla.org/show_bug.cgi?id=947588","syntax":"visible | hidden"},"-moz-osx-font-smoothing":{"comment":"misssed old syntax https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth","syntax":"auto | grayscale"},"-moz-user-select":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/user-select","syntax":"none | text | all | -moz-none"},"-ms-flex-align":{"comment":"misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-align","syntax":"start | end | center | baseline | stretch"},"-ms-flex-item-align":{"comment":"misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-align","syntax":"auto | start | end | center | baseline | stretch"},"-ms-flex-line-pack":{"comment":"misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-line-pack","syntax":"start | end | center | justify | distribute | stretch"},"-ms-flex-negative":{"comment":"misssed old syntax implemented in IE; TODO: find references for comfirmation","syntax":"<'flex-shrink'>"},"-ms-flex-pack":{"comment":"misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-pack","syntax":"start | end | center | justify | distribute"},"-ms-flex-order":{"comment":"misssed old syntax implemented in IE; https://msdn.microsoft.com/en-us/library/jj127303(v=vs.85).aspx","syntax":"<integer>"},"-ms-flex-positive":{"comment":"misssed old syntax implemented in IE; TODO: find references for comfirmation","syntax":"<'flex-grow'>"},"-ms-flex-preferred-size":{"comment":"misssed old syntax implemented in IE; TODO: find references for comfirmation","syntax":"<'flex-basis'>"},"-ms-interpolation-mode":{"comment":"https://msdn.microsoft.com/en-us/library/ff521095(v=vs.85).aspx","syntax":"nearest-neighbor | bicubic"},"-ms-grid-column-align":{"comment":"add this property first since it uses as fallback for flexbox, https://msdn.microsoft.com/en-us/library/windows/apps/hh466338.aspx","syntax":"start | end | center | stretch"},"-ms-grid-row-align":{"comment":"add this property first since it uses as fallback for flexbox, https://msdn.microsoft.com/en-us/library/windows/apps/hh466348.aspx","syntax":"start | end | center | stretch"},"-ms-hyphenate-limit-last":{"comment":"misssed old syntax implemented in IE; https://www.w3.org/TR/css-text-4/#hyphenate-line-limits","syntax":"none | always | column | page | spread"},"-webkit-appearance":{"comment":"webkit specific keywords","references":["http://css-infos.net/property/-webkit-appearance"],"syntax":"none | button | button-bevel | caps-lock-indicator | caret | checkbox | default-button | inner-spin-button | listbox | listitem | media-controls-background | media-controls-fullscreen-background | media-current-time-display | media-enter-fullscreen-button | media-exit-fullscreen-button | media-fullscreen-button | media-mute-button | media-overlay-play-button | media-play-button | media-seek-back-button | media-seek-forward-button | media-slider | media-sliderthumb | media-time-remaining-display | media-toggle-closed-captions-button | media-volume-slider | media-volume-slider-container | media-volume-sliderthumb | menulist | menulist-button | menulist-text | menulist-textfield | meter | progress-bar | progress-bar-value | push-button | radio | scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbargripper-horizontal | scrollbargripper-vertical | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical | searchfield | searchfield-cancel-button | searchfield-decoration | searchfield-results-button | searchfield-results-decoration | slider-horizontal | slider-vertical | sliderthumb-horizontal | sliderthumb-vertical | square-button | textarea | textfield | -apple-pay-button"},"-webkit-background-clip":{"comment":"https://developer.mozilla.org/en/docs/Web/CSS/background-clip","syntax":"[ <visual-box> | border | padding | content | text ]#"},"-webkit-column-break-after":{"comment":"added, http://help.dottoro.com/lcrthhhv.php","syntax":"always | auto | avoid"},"-webkit-column-break-before":{"comment":"added, http://help.dottoro.com/lcxquvkf.php","syntax":"always | auto | avoid"},"-webkit-column-break-inside":{"comment":"added, http://help.dottoro.com/lclhnthl.php","syntax":"always | auto | avoid"},"-webkit-font-smoothing":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth","syntax":"auto | none | antialiased | subpixel-antialiased"},"-webkit-mask-box-image":{"comment":"missed; https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-box-image","syntax":"[ <url> | <gradient> | none ] [ <length-percentage>{4} <-webkit-mask-box-repeat>{2} ]?"},"-webkit-print-color-adjust":{"comment":"missed","references":["https://developer.mozilla.org/en/docs/Web/CSS/-webkit-print-color-adjust"],"syntax":"economy | exact"},"-webkit-text-security":{"comment":"missed; http://help.dottoro.com/lcbkewgt.php","syntax":"none | circle | disc | square"},"-webkit-user-drag":{"comment":"missed; http://help.dottoro.com/lcbixvwm.php","syntax":"none | element | auto"},"-webkit-user-select":{"comment":"auto is supported by old webkit, https://developer.mozilla.org/en-US/docs/Web/CSS/user-select","syntax":"auto | none | text | all"},"alignment-baseline":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/text.html#AlignmentBaselineProperty"],"syntax":"auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical"},"baseline-shift":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/text.html#BaselineShiftProperty"],"syntax":"baseline | sub | super | <svg-length>"},"behavior":{"comment":"added old IE property https://msdn.microsoft.com/en-us/library/ms530723(v=vs.85).aspx","syntax":"<url>+"},"container-type":{"comment":"https://www.w3.org/TR/css-contain-3/#propdef-container-type","syntax":"normal || [ size | inline-size ]"},"cue":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<'cue-before'> <'cue-after'>?"},"cue-after":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<url> <decibel>? | none"},"cue-before":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<url> <decibel>? | none"},"cursor":{"comment":"added legacy keywords: hand, -webkit-grab. -webkit-grabbing, -webkit-zoom-in, -webkit-zoom-out, -moz-grab, -moz-grabbing, -moz-zoom-in, -moz-zoom-out","references":["https://www.sitepoint.com/css3-cursor-styles/"],"syntax":"[ [ <url> [ <x> <y> ]? , ]* [ auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out | grab | grabbing | hand | -webkit-grab | -webkit-grabbing | -webkit-zoom-in | -webkit-zoom-out | -moz-grab | -moz-grabbing | -moz-zoom-in | -moz-zoom-out ] ]"},"display":{"comment":"extended with -ms-flexbox","syntax":"| <-non-standard-display>"},"position":{"comment":"extended with -webkit-sticky","syntax":"| -webkit-sticky"},"dominant-baseline":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/text.html#DominantBaselineProperty"],"syntax":"auto | use-script | no-change | reset-size | ideographic | alphabetic | hanging | mathematical | central | middle | text-after-edge | text-before-edge"},"image-rendering":{"comment":"extended with <-non-standard-image-rendering>, added SVG keywords optimizeSpeed and optimizeQuality","references":["https://developer.mozilla.org/en/docs/Web/CSS/image-rendering","https://www.w3.org/TR/SVG/painting.html#ImageRenderingProperty"],"syntax":"| optimizeSpeed | optimizeQuality | <-non-standard-image-rendering>"},"fill-opacity":{"comment":"added SVG property","references":["https://developer.mozilla.org/en-US/docs/Web/CSS/fill-opacity","https://www.w3.org/TR/SVG/painting.html#FillProperty"],"syntax":"<number-zero-one> | <percentage>"},"filter":{"comment":"extend with IE legacy syntaxes","syntax":"| <-ms-filter-function-list>"},"font":{"comment":"align with font-4, fix <'font-family'>#, add non standard fonts","references":["https://drafts.csswg.org/css-fonts-4/#font-prop","https://github.com/w3c/csswg-drafts/pull/10832","https://webkit.org/blog/3709/using-the-system-font-in-web-content/"],"syntax":"[ [ <'font-style'> || <font-variant-css2> || <'font-weight'> || <font-width-css3> ]? <'font-size'> [ / <'line-height'> ]? <'font-family'># ] | <system-family-name> | <-non-standard-font>"},"glyph-orientation-horizontal":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/text.html#GlyphOrientationHorizontalProperty"],"syntax":"<angle>"},"glyph-orientation-vertical":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/text.html#GlyphOrientationVerticalProperty"],"syntax":"<angle>"},"kerning":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/text.html#KerningProperty"],"syntax":"auto | <svg-length>"},"letter-spacing":{"comment":"fix syntax <length> -> <length-percentage>","references":["https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/letter-spacing"],"syntax":"normal | <length-percentage>"},"max-width":{"comment":"extend by non-standard size keywords https://developer.mozilla.org/en-US/docs/Web/CSS/width","syntax":"| stretch | <-non-standard-size>"},"max-height":{"comment":"extend by non-standard size keywords https://developer.mozilla.org/en-US/docs/Web/CSS/width","syntax":"| stretch | <-non-standard-size>"},"width":{"references":["https://developer.mozilla.org/en-US/docs/Web/CSS/width","https://github.com/csstree/stylelint-validator/issues/29"],"syntax":"| stretch | <-non-standard-size>"},"height":{"syntax":"| stretch | <-non-standard-size>"},"min-width":{"comment":"extend by non-standard width keywords https://developer.mozilla.org/en-US/docs/Web/CSS/width","syntax":"| stretch | <-non-standard-size>"},"min-height":{"syntax":"| stretch | <-non-standard-size>"},"overflow":{"comment":"extend by vendor keywords https://developer.mozilla.org/en-US/docs/Web/CSS/overflow","syntax":"| <-non-standard-overflow>"},"overflow-x":{"comment":"extend by vendor keywords https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x","syntax":"| <-non-standard-overflow>"},"overflow-y":{"comment":"extend by vendor keywords https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y","syntax":"| <-non-standard-overflow>"},"overflow-block":{"comment":"extend by vendor keywords https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y","syntax":"| <-non-standard-overflow>"},"overflow-inline":{"comment":"extend by vendor keywords https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x","syntax":"| <-non-standard-overflow>"},"pause":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<'pause-before'> <'pause-after'>?"},"pause-after":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<time> | none | x-weak | weak | medium | strong | x-strong"},"pause-before":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<time> | none | x-weak | weak | medium | strong | x-strong"},"position-try-options":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks","syntax":"<'position-try-fallbacks'>"},"rest":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<'rest-before'> <'rest-after'>?"},"rest-after":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<time> | none | x-weak | weak | medium | strong | x-strong"},"rest-before":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<time> | none | x-weak | weak | medium | strong | x-strong"},"speak":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"auto | never | always"},"stroke-dasharray":{"comment":"added SVG property; a list of comma and/or white space separated <length>s and <percentage>s","references":["https://www.w3.org/TR/SVG/painting.html#StrokeProperties"],"syntax":"none | [ <svg-length>+ ]#"},"stroke-dashoffset":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/painting.html#StrokeProperties"],"syntax":"<svg-length>"},"stroke-linejoin":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/painting.html#StrokeProperties"],"syntax":"miter | round | bevel"},"stroke-miterlimit":{"comment":"added SVG property (<miterlimit> = <number-one-or-greater>) ","references":["https://www.w3.org/TR/SVG/painting.html#StrokeProperties"],"syntax":"<number-one-or-greater>"},"stroke-width":{"comment":"added SVG property","references":["https://www.w3.org/TR/SVG/painting.html#StrokeProperties"],"syntax":"<svg-length>"},"unicode-bidi":{"comment":"added prefixed keywords https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-bidi","syntax":"| -moz-isolate | -moz-isolate-override | -moz-plaintext | -webkit-isolate | -webkit-isolate-override | -webkit-plaintext"},"voice-balance":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<number> | left | center | right | leftwards | rightwards"},"voice-duration":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"auto | <time>"},"voice-family":{"comment":"<name> -> <family-name>, https://www.w3.org/TR/css3-speech/#property-index","syntax":"[ [ <family-name> | <generic-voice> ] , ]* [ <family-name> | <generic-voice> ] | preserve"},"voice-pitch":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<frequency> && absolute | [ [ x-low | low | medium | high | x-high ] || [ <frequency> | <semitones> | <percentage> ] ]"},"voice-range":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"<frequency> && absolute | [ [ x-low | low | medium | high | x-high ] || [ <frequency> | <semitones> | <percentage> ] ]"},"voice-rate":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"[ normal | x-slow | slow | medium | fast | x-fast ] || <percentage>"},"voice-stress":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"normal | strong | moderate | none | reduced"},"voice-volume":{"comment":"https://www.w3.org/TR/css3-speech/#property-index","syntax":"silent | [ [ x-soft | soft | medium | loud | x-loud ] || <decibel> ]"},"writing-mode":{"comment":"extend with SVG keywords","syntax":"| <svg-writing-mode>"},"white-space-trim":{"syntax":"none | discard-before || discard-after || discard-inner","comment":"missed, https://www.w3.org/TR/css-text-4/#white-space-trim"}}`);
const types = /* @__PURE__ */ JSON.parse(`{"-legacy-gradient":{"comment":"added collection of legacy gradient syntaxes","syntax":"<-webkit-gradient()> | <-legacy-linear-gradient> | <-legacy-repeating-linear-gradient> | <-legacy-radial-gradient> | <-legacy-repeating-radial-gradient>"},"-legacy-linear-gradient":{"comment":"like standard syntax but w/o \`to\` keyword https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient","syntax":"-moz-linear-gradient( <-legacy-linear-gradient-arguments> ) | -webkit-linear-gradient( <-legacy-linear-gradient-arguments> ) | -o-linear-gradient( <-legacy-linear-gradient-arguments> )"},"-legacy-repeating-linear-gradient":{"comment":"like standard syntax but w/o \`to\` keyword https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient","syntax":"-moz-repeating-linear-gradient( <-legacy-linear-gradient-arguments> ) | -webkit-repeating-linear-gradient( <-legacy-linear-gradient-arguments> ) | -o-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )"},"-legacy-linear-gradient-arguments":{"comment":"like standard syntax but w/o \`to\` keyword https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient","syntax":"[ <angle> | <side-or-corner> ]? , <color-stop-list>"},"-legacy-radial-gradient":{"comment":"deprecated syntax that implemented by some browsers https://www.w3.org/TR/2011/WD-css3-images-20110908/#radial-gradients","syntax":"-moz-radial-gradient( <-legacy-radial-gradient-arguments> ) | -webkit-radial-gradient( <-legacy-radial-gradient-arguments> ) | -o-radial-gradient( <-legacy-radial-gradient-arguments> )"},"-legacy-repeating-radial-gradient":{"comment":"deprecated syntax that implemented by some browsers https://www.w3.org/TR/2011/WD-css3-images-20110908/#radial-gradients","syntax":"-moz-repeating-radial-gradient( <-legacy-radial-gradient-arguments> ) | -webkit-repeating-radial-gradient( <-legacy-radial-gradient-arguments> ) | -o-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )"},"-legacy-radial-gradient-arguments":{"comment":"deprecated syntax that implemented by some browsers https://www.w3.org/TR/2011/WD-css3-images-20110908/#radial-gradients","syntax":"[ <position> , ]? [ [ [ <-legacy-radial-gradient-shape> || <-legacy-radial-gradient-size> ] | [ <length> | <percentage> ]{2} ] , ]? <color-stop-list>"},"-legacy-radial-gradient-size":{"comment":"before a standard it contains 2 extra keywords (\`contain\` and \`cover\`) https://www.w3.org/TR/2011/WD-css3-images-20110908/#ltsize","syntax":"closest-side | closest-corner | farthest-side | farthest-corner | contain | cover"},"-legacy-radial-gradient-shape":{"comment":"define to double sure it doesn't extends in future https://www.w3.org/TR/2011/WD-css3-images-20110908/#ltshape","syntax":"circle | ellipse"},"-non-standard-font":{"comment":"non standard fonts","references":["https://webkit.org/blog/3709/using-the-system-font-in-web-content/"],"syntax":"-apple-system-body | -apple-system-headline | -apple-system-subheadline | -apple-system-caption1 | -apple-system-caption2 | -apple-system-footnote | -apple-system-short-body | -apple-system-short-headline | -apple-system-short-subheadline | -apple-system-short-caption1 | -apple-system-short-footnote | -apple-system-tall-body"},"-non-standard-color":{"comment":"non standard colors","references":["http://cssdot.ru/%D0%A1%D0%BF%D1%80%D0%B0%D0%B2%D0%BE%D1%87%D0%BD%D0%B8%D0%BA_CSS/color-i305.html","https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Mozilla_Color_Preference_Extensions"],"syntax":"-moz-ButtonDefault | -moz-ButtonHoverFace | -moz-ButtonHoverText | -moz-CellHighlight | -moz-CellHighlightText | -moz-Combobox | -moz-ComboboxText | -moz-Dialog | -moz-DialogText | -moz-dragtargetzone | -moz-EvenTreeRow | -moz-Field | -moz-FieldText | -moz-html-CellHighlight | -moz-html-CellHighlightText | -moz-mac-accentdarkestshadow | -moz-mac-accentdarkshadow | -moz-mac-accentface | -moz-mac-accentlightesthighlight | -moz-mac-accentlightshadow | -moz-mac-accentregularhighlight | -moz-mac-accentregularshadow | -moz-mac-chrome-active | -moz-mac-chrome-inactive | -moz-mac-focusring | -moz-mac-menuselect | -moz-mac-menushadow | -moz-mac-menutextselect | -moz-MenuHover | -moz-MenuHoverText | -moz-MenuBarText | -moz-MenuBarHoverText | -moz-nativehyperlinktext | -moz-OddTreeRow | -moz-win-communicationstext | -moz-win-mediatext | -moz-activehyperlinktext | -moz-default-background-color | -moz-default-color | -moz-hyperlinktext | -moz-visitedhyperlinktext | -webkit-activelink | -webkit-focus-ring-color | -webkit-link | -webkit-text"},"-non-standard-image-rendering":{"comment":"non-standard keywords http://phrogz.net/tmp/canvas_image_zoom.html","syntax":"optimize-contrast | -moz-crisp-edges | -o-crisp-edges | -webkit-optimize-contrast"},"-non-standard-overflow":{"comment":"non-standard keywords https://developer.mozilla.org/en-US/docs/Web/CSS/overflow","syntax":"overlay | -moz-scrollbars-none | -moz-scrollbars-horizontal | -moz-scrollbars-vertical | -moz-hidden-unscrollable"},"-non-standard-size":{"comment":"non-standard keywords https://developer.mozilla.org/en-US/docs/Web/CSS/width","syntax":"intrinsic | min-intrinsic | -webkit-fill-available | -webkit-fit-content | -webkit-min-content | -webkit-max-content  | -moz-available | -moz-fit-content | -moz-min-content | -moz-max-content"},"-webkit-gradient()":{"comment":"first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/ - TODO: simplify when after match algorithm improvement ( [, point, radius | , point] -> [, radius]? , point )","syntax":"-webkit-gradient( <-webkit-gradient-type>, <-webkit-gradient-point> [, <-webkit-gradient-point> | , <-webkit-gradient-radius>, <-webkit-gradient-point> ] [, <-webkit-gradient-radius>]? [, <-webkit-gradient-color-stop>]* )"},"-webkit-gradient-color-stop":{"comment":"first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/","syntax":"from( <color> ) | color-stop( [ <number-zero-one> | <percentage> ] , <color> ) | to( <color> )"},"-webkit-gradient-point":{"comment":"first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/","syntax":"[ left | center | right | <length-percentage> ] [ top | center | bottom | <length-percentage> ]"},"-webkit-gradient-radius":{"comment":"first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/","syntax":"<length> | <percentage>"},"-webkit-gradient-type":{"comment":"first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/","syntax":"linear | radial"},"-webkit-mask-box-repeat":{"comment":"missed; https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-box-image","syntax":"repeat | stretch | round"},"-ms-filter-function-list":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/-ms-filter","syntax":"<-ms-filter-function>+"},"-ms-filter-function":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/-ms-filter","syntax":"<-ms-filter-function-progid> | <-ms-filter-function-legacy>"},"-ms-filter-function-progid":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/-ms-filter","syntax":"'progid:' [ <ident-token> '.' ]* [ <ident-token> | <function-token> <any-value>? ) ]"},"-ms-filter-function-legacy":{"comment":"https://developer.mozilla.org/en-US/docs/Web/CSS/-ms-filter","syntax":"<ident-token> | <function-token> <any-value>? )"},"age":{"comment":"https://www.w3.org/TR/css3-speech/#voice-family","syntax":"child | young | old"},"attr-name":{"syntax":"<wq-name>"},"attr-fallback":{"syntax":"<any-value>"},"autospace":{"syntax":"no-autospace | [ ideograph-alpha || ideograph-numeric || punctuation ] || [ insert | replace ]"},"bottom":{"comment":"missed; not sure we should add it, but no others except \`shape\` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect","syntax":"<length> | auto"},"content-list":{"comment":"added attr(), see https://github.com/csstree/csstree/issues/201","syntax":"[ <string> | contents | <image> | <counter> | <quote> | <target> | <leader()> | <attr()> ]+"},"container-condition":{"comment":"missed, https://drafts.csswg.org/css-contain-3/#container-rule","syntax":"not <query-in-parens> | <query-in-parens> [ [ and <query-in-parens> ]* | [ or <query-in-parens> ]* ]"},"coord-box":{"syntax":"content-box | padding-box | border-box | fill-box | stroke-box | view-box"},"cubic-bezier-easing-function":{"comment":"missed, https://drafts.csswg.org/css-easing-1/#cubic-bezier-easing-function","syntax":"ease | ease-in | ease-out | ease-in-out | cubic-bezier( <number [0,1]> , <number> , <number [0,1]> , <number> )"},"element()":{"comment":"https://drafts.csswg.org/css-gcpm/#element-syntax & https://drafts.csswg.org/css-images-4/#element-notation","syntax":"element( <custom-ident> , [ first | start | last | first-except ]? ) | element( <id-selector> )"},"generic-voice":{"comment":"https://www.w3.org/TR/css3-speech/#voice-family","syntax":"[ <age>? <gender> <integer>? ]"},"gender":{"comment":"https://www.w3.org/TR/css3-speech/#voice-family","syntax":"male | female | neutral"},"general-enclosed":{"comment":"remove ident-token, optional any-value, brackets (see https://drafts.csswg.org/mediaqueries-5/#typedef-general-enclosed)","syntax":"[ <function-token> <any-value>? ) ] | [ ( <any-value>? ) ]"},"generic-family":{"comment":"new definition on font-4, https://drafts.csswg.org/css-fonts-4/#typedef-generic-family","syntax":"<generic-script-specific>| <generic-complete> | <generic-incomplete> | <-non-standard-generic-family>"},"generic-script-specific":{"syntax":"generic(kai) | generic(fangsong) | generic(nastaliq)"},"-non-standard-generic-family":{"syntax":"-apple-system | BlinkMacSystemFont","references":["https://css-tricks.com/snippets/css/system-font-stack/","https://webkit.org/blog/3709/using-the-system-font-in-web-content/"]},"gradient":{"comment":"added legacy syntaxes support","syntax":"| <-legacy-gradient>"},"intrinsic-size-keyword":{"comment":"Missing from mdn-data. 4.3. Intrinsic Size Keywords https://www.w3.org/TR/css-sizing-4/#intrinsic-size-keywords","syntax":"min-content | max-content | fit-content"},"left":{"comment":"missed; not sure we should add it, but no others except \`shape\` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect","syntax":"<length> | auto"},"color":{"comment":"css-color-5, added non standard color names","syntax":"<color-base> | currentColor | <system-color> | <device-cmyk()>  | <light-dark()> | <-non-standard-color>"},"device-cmyk()":{"syntax":"<legacy-device-cmyk-syntax> | <modern-device-cmyk-syntax>"},"legacy-device-cmyk-syntax":{"syntax":"device-cmyk( <number>#{4} )"},"modern-device-cmyk-syntax":{"syntax":"device-cmyk( <cmyk-component>{4} [ / [ <alpha-value> | none ] ]? )"},"cmyk-component":{"syntax":"<number> | <percentage> | none"},"color-mix()":{"syntax":"color-mix( <color-interpolation-method> , [ <color> && <percentage [0,100]>? ]#{2} )"},"color-space":{"syntax":"<rectangular-color-space> | <polar-color-space> | <custom-color-space>"},"paint":{"comment":"used by SVG https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint","syntax":"none | <color> | <url> [ none | <color> ]? | context-fill | context-stroke"},"right":{"comment":"missed; not sure we should add it, but no others except \`shape\` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect","syntax":"<length> | auto"},"shape":{"comment":"missed spaces in function body and add backwards compatible syntax","syntax":"rect( <top>, <right>, <bottom>, <left> ) | rect( <top> <right> <bottom> <left> )"},"scope-start":{"syntax":"<forgiving-selector-list>"},"scope-end":{"syntax":"<forgiving-selector-list>"},"forgiving-selector-list":{"syntax":"<complex-real-selector-list>"},"forgiving-relative-selector-list":{"syntax":"<relative-real-selector-list>"},"complex-real-selector-list":{"syntax":"<complex-real-selector>#"},"simple-selector-list":{"syntax":"<simple-selector>#"},"relative-real-selector-list":{"syntax":"<relative-real-selector>#"},"complex-selector":{"syntax":"<complex-selector-unit> [ <combinator>? <complex-selector-unit> ]*"},"complex-selector-unit":{"syntax":"[ <compound-selector>? <pseudo-compound-selector>* ]!"},"complex-real-selector":{"syntax":"<compound-selector> [ <combinator>? <compound-selector> ]*"},"relative-real-selector":{"syntax":"<combinator>? <complex-real-selector>"},"compound-selector":{"syntax":"[ <type-selector>? <subclass-selector>* ]!"},"pseudo-compound-selector":{"syntax":" <pseudo-element-selector> <pseudo-class-selector>*"},"simple-selector":{"syntax":"<type-selector> | <subclass-selector>"},"combinator":{"syntax":"'>' | '+' | '~' | [ '|' '|' ]"},"pseudo-element-selector":{"syntax":"':' <pseudo-class-selector> | <legacy-pseudo-element-selector>"},"legacy-pseudo-element-selector":{"syntax":" ':' [before | after | first-line | first-letter]"},"svg-length":{"comment":"All coordinates and lengths in SVG can be specified with or without a unit identifier","references":["https://www.w3.org/TR/SVG11/coords.html#Units"],"syntax":"<percentage> | <length> | <number>"},"svg-writing-mode":{"comment":"SVG specific keywords (deprecated for CSS)","references":["https://developer.mozilla.org/en/docs/Web/CSS/writing-mode","https://www.w3.org/TR/SVG/text.html#WritingModeProperty"],"syntax":"lr-tb | rl-tb | tb-rl | lr | rl | tb"},"top":{"comment":"missed; not sure we should add it, but no others except \`shape\` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect","syntax":"<length> | auto"},"x":{"comment":"missed; not sure we should add it, but no others except \`cursor\` is using it so it's ok for now; https://drafts.csswg.org/css-ui-3/#cursor","syntax":"<number>"},"y":{"comment":"missed; not sure we should add it, but no others except \`cursor\` is using so it's ok for now; https://drafts.csswg.org/css-ui-3/#cursor","syntax":"<number>"},"declaration":{"comment":"missed, restored by https://drafts.csswg.org/css-syntax","syntax":"<ident-token> : <declaration-value>? [ '!' important ]?"},"declaration-list":{"comment":"missed, restored by https://drafts.csswg.org/css-syntax","syntax":"[ <declaration>? ';' ]* <declaration>?"},"url":{"comment":"https://drafts.csswg.org/css-values-4/#urls","syntax":"url( <string> <url-modifier>* ) | <url-token>"},"url-modifier":{"comment":"https://drafts.csswg.org/css-values-4/#typedef-url-modifier","syntax":"<ident> | <function-token> <any-value> )"},"number-zero-one":{"syntax":"<number [0,1]>"},"number-one-or-greater":{"syntax":"<number [1,∞]>"},"color()":{"syntax":"color( <colorspace-params> [ / [ <alpha-value> | none ] ]? )"},"colorspace-params":{"syntax":"[ <predefined-rgb-params> | <xyz-params>]"},"xyz-params":{"syntax":"<xyz-space> [ <number> | <percentage> | none ]{3}"},"xyz-space":{"syntax":"xyz | xyz-d50 | xyz-d65"},"query-in-parens":{"comment":"missed, https://drafts.csswg.org/css-contain-3/#container-rule","syntax":"( <container-condition> ) | ( <size-feature> ) | style( <style-query> ) | <general-enclosed>"},"size-feature":{"comment":"missed, https://drafts.csswg.org/css-contain-3/#typedef-size-feature","syntax":"<mf-plain> | <mf-boolean> | <mf-range>"},"style-query":{"comment":"missed, https://drafts.csswg.org/css-contain-3/#container-rule","syntax":"<style-condition> | <style-feature>"},"style-condition":{"comment":"missed, https://drafts.csswg.org/css-contain-3/#container-rule","syntax":"not <style-in-parens> | <style-in-parens> [ [ and <style-in-parens> ]* | [ or <style-in-parens> ]* ]"},"style-in-parens":{"comment":"missed, https://drafts.csswg.org/css-contain-3/#container-rule","syntax":"( <style-condition> ) | ( <style-feature> ) | <general-enclosed>"},"-non-standard-display":{"syntax":"-ms-inline-flexbox | -ms-grid | -ms-inline-grid | -webkit-flex | -webkit-inline-flex | -webkit-box | -webkit-inline-box | -moz-inline-stack | -moz-box | -moz-inline-box"},"inset-area":{"syntax":"[ [ left | center | right | span-left | span-right | x-start | x-end | span-x-start | span-x-end | x-self-start | x-self-end | span-x-self-start | span-x-self-end | span-all ] || [ top | center | bottom | span-top | span-bottom | y-start | y-end | span-y-start | span-y-end | y-self-start | y-self-end | span-y-self-start | span-y-self-end | span-all ] | [ block-start | center | block-end | span-block-start | span-block-end | span-all ] || [ inline-start | center | inline-end | span-inline-start | span-inline-end | span-all ] | [ self-block-start | self-block-end | span-self-block-start | span-self-block-end | span-all ] || [ self-inline-start | self-inline-end | span-self-inline-start | span-self-inline-end | span-all ] | [ start | center | end | span-start | span-end | span-all ]{1,2} | [ self-start | center | self-end | span-self-start | span-self-end | span-all ]{1,2} ]","comment":"initial name for <position-area> before renamed","references":["https://www.w3.org/TR/css-anchor-position-1/#inset-area"]},"position-area":{"syntax":"[ [ left | center | right | span-left | span-right | x-start | x-end | span-x-start | span-x-end | x-self-start | x-self-end | span-x-self-start | span-x-self-end | span-all ] || [ top | center | bottom | span-top | span-bottom | y-start | y-end | span-y-start | span-y-end | y-self-start | y-self-end | span-y-self-start | span-y-self-end | span-all ] | [ block-start | center | block-end | span-block-start | span-block-end | span-all ] || [ inline-start | center | inline-end | span-inline-start | span-inline-end | span-all ] | [ self-block-start | center | self-block-end | span-self-block-start | span-self-block-end | span-all ] || [ self-inline-start | center | self-inline-end | span-self-inline-start | span-self-inline-end | span-all ] | [ start | center | end | span-start | span-end | span-all ]{1,2} | [ self-start | center | self-end | span-self-start | span-self-end | span-all ]{1,2} ]","comment":"replaced <inset-area>","references":["https://drafts.csswg.org/css-anchor-position-1/#typedef-position-area"]},"syntax":{"syntax":"'*' | <syntax-component> [ <syntax-combinator> <syntax-component> ]* | <syntax-string>"},"syntax-component":{"syntax":"<syntax-single-component> <syntax-multiplier>? | '<' transform-list '>'"},"syntax-single-component":{"syntax":"'<' <syntax-type-name> '>' | <ident>"},"syntax-type-name":{"syntax":"angle | color | custom-ident | image | integer | length | length-percentage | number | percentage | resolution | string | time | url | transform-function"},"syntax-combinator":{"syntax":"'|'"},"syntax-multiplier":{"syntax":"'#' | '+'"},"syntax-string":{"syntax":"<string>"}}`);
const require$$0$1 = {
  atrules,
  properties: properties$1,
  types
};
var dataPatch;
var hasRequiredDataPatch;
function requireDataPatch() {
  if (hasRequiredDataPatch) return dataPatch;
  hasRequiredDataPatch = 1;
  const patch2 = require$$0$1;
  const patch$1 = patch2;
  dataPatch = patch$1;
  return dataPatch;
}
var data;
var hasRequiredData;
function requireData() {
  if (hasRequiredData) return data;
  hasRequiredData = 1;
  const dataPatch2 = /* @__PURE__ */ requireDataPatch();
  const mdnAtrules2 = require$$1;
  const mdnProperties2 = require$$2;
  const mdnSyntaxes2 = require$$3;
  const hasOwn2 = Object.hasOwn || ((object, property2) => Object.prototype.hasOwnProperty.call(object, property2));
  const extendSyntax2 = /^\s*\|\s*/;
  function preprocessAtrules2(dict) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [atruleName, atrule2] of Object.entries(dict)) {
      let descriptors = null;
      if (atrule2.descriptors) {
        descriptors = /* @__PURE__ */ Object.create(null);
        for (const [name2, descriptor] of Object.entries(atrule2.descriptors)) {
          descriptors[name2] = descriptor.syntax;
        }
      }
      result[atruleName.substr(1)] = {
        prelude: atrule2.syntax.trim().replace(/\{(.|\s)+\}/, "").match(/^@\S+\s+([^;\{]*)/)[1].trim() || null,
        descriptors
      };
    }
    return result;
  }
  function patchDictionary2(dict, patchDict) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [key, value2] of Object.entries(dict)) {
      if (value2) {
        result[key] = value2.syntax || value2;
      }
    }
    for (const key of Object.keys(patchDict)) {
      if (hasOwn2(dict, key)) {
        if (patchDict[key].syntax) {
          result[key] = extendSyntax2.test(patchDict[key].syntax) ? result[key] + " " + patchDict[key].syntax.trim() : patchDict[key].syntax;
        } else {
          delete result[key];
        }
      } else {
        if (patchDict[key].syntax) {
          result[key] = patchDict[key].syntax.replace(extendSyntax2, "");
        }
      }
    }
    return result;
  }
  function preprocessPatchAtrulesDescritors2(declarations) {
    const result = {};
    for (const [key, value2] of Object.entries(declarations || {})) {
      result[key] = typeof value2 === "string" ? { syntax: value2 } : value2;
    }
    return result;
  }
  function patchAtrules2(dict, patchDict) {
    const result = {};
    for (const key in dict) {
      if (patchDict[key] === null) {
        continue;
      }
      const atrulePatch = patchDict[key] || {};
      result[key] = {
        prelude: key in patchDict && "prelude" in atrulePatch ? atrulePatch.prelude : dict[key].prelude || null,
        descriptors: patchDictionary2(
          dict[key].descriptors || {},
          preprocessPatchAtrulesDescritors2(atrulePatch.descriptors)
        )
      };
    }
    for (const [key, atrulePatch] of Object.entries(patchDict)) {
      if (atrulePatch && !hasOwn2(dict, key)) {
        result[key] = {
          prelude: atrulePatch.prelude || null,
          descriptors: atrulePatch.descriptors ? patchDictionary2({}, preprocessPatchAtrulesDescritors2(atrulePatch.descriptors)) : null
        };
      }
    }
    return result;
  }
  const definitions2 = {
    types: patchDictionary2(mdnSyntaxes2, dataPatch2.types),
    atrules: patchAtrules2(preprocessAtrules2(mdnAtrules2), dataPatch2.atrules),
    properties: patchDictionary2(mdnProperties2, dataPatch2.properties)
  };
  data = definitions2;
  return data;
}
var node$2 = {};
var AnPlusB$1 = {};
var hasRequiredAnPlusB;
function requireAnPlusB() {
  if (hasRequiredAnPlusB) return AnPlusB$1;
  hasRequiredAnPlusB = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const PLUSSIGN2 = 43;
  const HYPHENMINUS2 = 45;
  const N2 = 110;
  const DISALLOW_SIGN2 = true;
  const ALLOW_SIGN2 = false;
  function checkInteger2(offset, disallowSign) {
    let pos = this.tokenStart + offset;
    const code2 = this.charCodeAt(pos);
    if (code2 === PLUSSIGN2 || code2 === HYPHENMINUS2) {
      if (disallowSign) {
        this.error("Number sign is not allowed");
      }
      pos++;
    }
    for (; pos < this.tokenEnd; pos++) {
      if (!charCodeDefinitions2.isDigit(this.charCodeAt(pos))) {
        this.error("Integer is expected", pos);
      }
    }
  }
  function checkTokenIsInteger2(disallowSign) {
    return checkInteger2.call(this, 0, disallowSign);
  }
  function expectCharCode2(offset, code2) {
    if (!this.cmpChar(this.tokenStart + offset, code2)) {
      let msg = "";
      switch (code2) {
        case N2:
          msg = "N is expected";
          break;
        case HYPHENMINUS2:
          msg = "HyphenMinus is expected";
          break;
      }
      this.error(msg, this.tokenStart + offset);
    }
  }
  function consumeB2() {
    let offset = 0;
    let sign = 0;
    let type = this.tokenType;
    while (type === types2.WhiteSpace || type === types2.Comment) {
      type = this.lookupType(++offset);
    }
    if (type !== types2.Number) {
      if (this.isDelim(PLUSSIGN2, offset) || this.isDelim(HYPHENMINUS2, offset)) {
        sign = this.isDelim(PLUSSIGN2, offset) ? PLUSSIGN2 : HYPHENMINUS2;
        do {
          type = this.lookupType(++offset);
        } while (type === types2.WhiteSpace || type === types2.Comment);
        if (type !== types2.Number) {
          this.skip(offset);
          checkTokenIsInteger2.call(this, DISALLOW_SIGN2);
        }
      } else {
        return null;
      }
    }
    if (offset > 0) {
      this.skip(offset);
    }
    if (sign === 0) {
      type = this.charCodeAt(this.tokenStart);
      if (type !== PLUSSIGN2 && type !== HYPHENMINUS2) {
        this.error("Number sign is expected");
      }
    }
    checkTokenIsInteger2.call(this, sign !== 0);
    return sign === HYPHENMINUS2 ? "-" + this.consume(types2.Number) : this.consume(types2.Number);
  }
  const name2 = "AnPlusB";
  const structure2 = {
    a: [String, null],
    b: [String, null]
  };
  function parse2() {
    const start = this.tokenStart;
    let a = null;
    let b = null;
    if (this.tokenType === types2.Number) {
      checkTokenIsInteger2.call(this, ALLOW_SIGN2);
      b = this.consume(types2.Number);
    } else if (this.tokenType === types2.Ident && this.cmpChar(this.tokenStart, HYPHENMINUS2)) {
      a = "-1";
      expectCharCode2.call(this, 1, N2);
      switch (this.tokenEnd - this.tokenStart) {
        // -n
        // -n <signed-integer>
        // -n ['+' | '-'] <signless-integer>
        case 2:
          this.next();
          b = consumeB2.call(this);
          break;
        // -n- <signless-integer>
        case 3:
          expectCharCode2.call(this, 2, HYPHENMINUS2);
          this.next();
          this.skipSC();
          checkTokenIsInteger2.call(this, DISALLOW_SIGN2);
          b = "-" + this.consume(types2.Number);
          break;
        // <dashndashdigit-ident>
        default:
          expectCharCode2.call(this, 2, HYPHENMINUS2);
          checkInteger2.call(this, 3, DISALLOW_SIGN2);
          this.next();
          b = this.substrToCursor(start + 2);
      }
    } else if (this.tokenType === types2.Ident || this.isDelim(PLUSSIGN2) && this.lookupType(1) === types2.Ident) {
      let sign = 0;
      a = "1";
      if (this.isDelim(PLUSSIGN2)) {
        sign = 1;
        this.next();
      }
      expectCharCode2.call(this, 0, N2);
      switch (this.tokenEnd - this.tokenStart) {
        // '+'? n
        // '+'? n <signed-integer>
        // '+'? n ['+' | '-'] <signless-integer>
        case 1:
          this.next();
          b = consumeB2.call(this);
          break;
        // '+'? n- <signless-integer>
        case 2:
          expectCharCode2.call(this, 1, HYPHENMINUS2);
          this.next();
          this.skipSC();
          checkTokenIsInteger2.call(this, DISALLOW_SIGN2);
          b = "-" + this.consume(types2.Number);
          break;
        // '+'? <ndashdigit-ident>
        default:
          expectCharCode2.call(this, 1, HYPHENMINUS2);
          checkInteger2.call(this, 2, DISALLOW_SIGN2);
          this.next();
          b = this.substrToCursor(start + sign + 1);
      }
    } else if (this.tokenType === types2.Dimension) {
      const code2 = this.charCodeAt(this.tokenStart);
      const sign = code2 === PLUSSIGN2 || code2 === HYPHENMINUS2;
      let i = this.tokenStart + sign;
      for (; i < this.tokenEnd; i++) {
        if (!charCodeDefinitions2.isDigit(this.charCodeAt(i))) {
          break;
        }
      }
      if (i === this.tokenStart + sign) {
        this.error("Integer is expected", this.tokenStart + sign);
      }
      expectCharCode2.call(this, i - this.tokenStart, N2);
      a = this.substring(start, i);
      if (i + 1 === this.tokenEnd) {
        this.next();
        b = consumeB2.call(this);
      } else {
        expectCharCode2.call(this, i - this.tokenStart + 1, HYPHENMINUS2);
        if (i + 2 === this.tokenEnd) {
          this.next();
          this.skipSC();
          checkTokenIsInteger2.call(this, DISALLOW_SIGN2);
          b = "-" + this.consume(types2.Number);
        } else {
          checkInteger2.call(this, i - this.tokenStart + 2, DISALLOW_SIGN2);
          this.next();
          b = this.substrToCursor(i + 1);
        }
      }
    } else {
      this.error();
    }
    if (a !== null && a.charCodeAt(0) === PLUSSIGN2) {
      a = a.substr(1);
    }
    if (b !== null && b.charCodeAt(0) === PLUSSIGN2) {
      b = b.substr(1);
    }
    return {
      type: "AnPlusB",
      loc: this.getLocation(start, this.tokenStart),
      a,
      b
    };
  }
  function generate2(node2) {
    if (node2.a) {
      const a = node2.a === "+1" && "n" || node2.a === "1" && "n" || node2.a === "-1" && "-n" || node2.a + "n";
      if (node2.b) {
        const b = node2.b[0] === "-" || node2.b[0] === "+" ? node2.b : "+" + node2.b;
        this.tokenize(a + b);
      } else {
        this.tokenize(a);
      }
    } else {
      this.tokenize(node2.b);
    }
  }
  AnPlusB$1.generate = generate2;
  AnPlusB$1.name = name2;
  AnPlusB$1.parse = parse2;
  AnPlusB$1.structure = structure2;
  return AnPlusB$1;
}
var Atrule$1 = {};
var hasRequiredAtrule$1;
function requireAtrule$1() {
  if (hasRequiredAtrule$1) return Atrule$1;
  hasRequiredAtrule$1 = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function consumeRaw2() {
    return this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true);
  }
  function isDeclarationBlockAtrule2() {
    for (let offset = 1, type; type = this.lookupType(offset); offset++) {
      if (type === types2.RightCurlyBracket) {
        return true;
      }
      if (type === types2.LeftCurlyBracket || type === types2.AtKeyword) {
        return false;
      }
    }
    return false;
  }
  const name2 = "Atrule";
  const walkContext2 = "atrule";
  const structure2 = {
    name: String,
    prelude: ["AtrulePrelude", "Raw", null],
    block: ["Block", null]
  };
  function parse2(isDeclaration = false) {
    const start = this.tokenStart;
    let name3;
    let nameLowerCase;
    let prelude = null;
    let block = null;
    this.eat(types2.AtKeyword);
    name3 = this.substrToCursor(start + 1);
    nameLowerCase = name3.toLowerCase();
    this.skipSC();
    if (this.eof === false && this.tokenType !== types2.LeftCurlyBracket && this.tokenType !== types2.Semicolon) {
      if (this.parseAtrulePrelude) {
        prelude = this.parseWithFallback(this.AtrulePrelude.bind(this, name3, isDeclaration), consumeRaw2);
      } else {
        prelude = consumeRaw2.call(this, this.tokenIndex);
      }
      this.skipSC();
    }
    switch (this.tokenType) {
      case types2.Semicolon:
        this.next();
        break;
      case types2.LeftCurlyBracket:
        if (hasOwnProperty.call(this.atrule, nameLowerCase) && typeof this.atrule[nameLowerCase].block === "function") {
          block = this.atrule[nameLowerCase].block.call(this, isDeclaration);
        } else {
          block = this.Block(isDeclarationBlockAtrule2.call(this));
        }
        break;
    }
    return {
      type: "Atrule",
      loc: this.getLocation(start, this.tokenStart),
      name: name3,
      prelude,
      block
    };
  }
  function generate2(node2) {
    this.token(types2.AtKeyword, "@" + node2.name);
    if (node2.prelude !== null) {
      this.node(node2.prelude);
    }
    if (node2.block) {
      this.node(node2.block);
    } else {
      this.token(types2.Semicolon, ";");
    }
  }
  Atrule$1.generate = generate2;
  Atrule$1.name = name2;
  Atrule$1.parse = parse2;
  Atrule$1.structure = structure2;
  Atrule$1.walkContext = walkContext2;
  return Atrule$1;
}
var AtrulePrelude$1 = {};
var hasRequiredAtrulePrelude$1;
function requireAtrulePrelude$1() {
  if (hasRequiredAtrulePrelude$1) return AtrulePrelude$1;
  hasRequiredAtrulePrelude$1 = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "AtrulePrelude";
  const walkContext2 = "atrulePrelude";
  const structure2 = {
    children: [[]]
  };
  function parse2(name3) {
    let children = null;
    if (name3 !== null) {
      name3 = name3.toLowerCase();
    }
    this.skipSC();
    if (hasOwnProperty.call(this.atrule, name3) && typeof this.atrule[name3].prelude === "function") {
      children = this.atrule[name3].prelude.call(this);
    } else {
      children = this.readSequence(this.scope.AtrulePrelude);
    }
    this.skipSC();
    if (this.eof !== true && this.tokenType !== types2.LeftCurlyBracket && this.tokenType !== types2.Semicolon) {
      this.error("Semicolon or block is expected");
    }
    return {
      type: "AtrulePrelude",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate2(node2) {
    this.children(node2);
  }
  AtrulePrelude$1.generate = generate2;
  AtrulePrelude$1.name = name2;
  AtrulePrelude$1.parse = parse2;
  AtrulePrelude$1.structure = structure2;
  AtrulePrelude$1.walkContext = walkContext2;
  return AtrulePrelude$1;
}
var AttributeSelector$1 = {};
var hasRequiredAttributeSelector;
function requireAttributeSelector() {
  if (hasRequiredAttributeSelector) return AttributeSelector$1;
  hasRequiredAttributeSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const DOLLARSIGN2 = 36;
  const ASTERISK2 = 42;
  const EQUALSSIGN2 = 61;
  const CIRCUMFLEXACCENT2 = 94;
  const VERTICALLINE2 = 124;
  const TILDE2 = 126;
  function getAttributeName2() {
    if (this.eof) {
      this.error("Unexpected end of input");
    }
    const start = this.tokenStart;
    let expectIdent = false;
    if (this.isDelim(ASTERISK2)) {
      expectIdent = true;
      this.next();
    } else if (!this.isDelim(VERTICALLINE2)) {
      this.eat(types2.Ident);
    }
    if (this.isDelim(VERTICALLINE2)) {
      if (this.charCodeAt(this.tokenStart + 1) !== EQUALSSIGN2) {
        this.next();
        this.eat(types2.Ident);
      } else if (expectIdent) {
        this.error("Identifier is expected", this.tokenEnd);
      }
    } else if (expectIdent) {
      this.error("Vertical line is expected");
    }
    return {
      type: "Identifier",
      loc: this.getLocation(start, this.tokenStart),
      name: this.substrToCursor(start)
    };
  }
  function getOperator2() {
    const start = this.tokenStart;
    const code2 = this.charCodeAt(start);
    if (code2 !== EQUALSSIGN2 && // =
    code2 !== TILDE2 && // ~=
    code2 !== CIRCUMFLEXACCENT2 && // ^=
    code2 !== DOLLARSIGN2 && // $=
    code2 !== ASTERISK2 && // *=
    code2 !== VERTICALLINE2) {
      this.error("Attribute selector (=, ~=, ^=, $=, *=, |=) is expected");
    }
    this.next();
    if (code2 !== EQUALSSIGN2) {
      if (!this.isDelim(EQUALSSIGN2)) {
        this.error("Equal sign is expected");
      }
      this.next();
    }
    return this.substrToCursor(start);
  }
  const name2 = "AttributeSelector";
  const structure2 = {
    name: "Identifier",
    matcher: [String, null],
    value: ["String", "Identifier", null],
    flags: [String, null]
  };
  function parse2() {
    const start = this.tokenStart;
    let name3;
    let matcher = null;
    let value2 = null;
    let flags = null;
    this.eat(types2.LeftSquareBracket);
    this.skipSC();
    name3 = getAttributeName2.call(this);
    this.skipSC();
    if (this.tokenType !== types2.RightSquareBracket) {
      if (this.tokenType !== types2.Ident) {
        matcher = getOperator2.call(this);
        this.skipSC();
        value2 = this.tokenType === types2.String ? this.String() : this.Identifier();
        this.skipSC();
      }
      if (this.tokenType === types2.Ident) {
        flags = this.consume(types2.Ident);
        this.skipSC();
      }
    }
    this.eat(types2.RightSquareBracket);
    return {
      type: "AttributeSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: name3,
      matcher,
      value: value2,
      flags
    };
  }
  function generate2(node2) {
    this.token(types2.Delim, "[");
    this.node(node2.name);
    if (node2.matcher !== null) {
      this.tokenize(node2.matcher);
      this.node(node2.value);
    }
    if (node2.flags !== null) {
      this.token(types2.Ident, node2.flags);
    }
    this.token(types2.Delim, "]");
  }
  AttributeSelector$1.generate = generate2;
  AttributeSelector$1.name = name2;
  AttributeSelector$1.parse = parse2;
  AttributeSelector$1.structure = structure2;
  return AttributeSelector$1;
}
var Block$1 = {};
var hasRequiredBlock;
function requireBlock() {
  if (hasRequiredBlock) return Block$1;
  hasRequiredBlock = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const AMPERSAND2 = 38;
  function consumeRaw2() {
    return this.Raw(null, true);
  }
  function consumeRule2() {
    return this.parseWithFallback(this.Rule, consumeRaw2);
  }
  function consumeRawDeclaration2() {
    return this.Raw(this.consumeUntilSemicolonIncluded, true);
  }
  function consumeDeclaration2() {
    if (this.tokenType === types2.Semicolon) {
      return consumeRawDeclaration2.call(this, this.tokenIndex);
    }
    const node2 = this.parseWithFallback(this.Declaration, consumeRawDeclaration2);
    if (this.tokenType === types2.Semicolon) {
      this.next();
    }
    return node2;
  }
  const name2 = "Block";
  const walkContext2 = "block";
  const structure2 = {
    children: [[
      "Atrule",
      "Rule",
      "Declaration"
    ]]
  };
  function parse2(isStyleBlock) {
    const consumer = isStyleBlock ? consumeDeclaration2 : consumeRule2;
    const start = this.tokenStart;
    let children = this.createList();
    this.eat(types2.LeftCurlyBracket);
    scan:
      while (!this.eof) {
        switch (this.tokenType) {
          case types2.RightCurlyBracket:
            break scan;
          case types2.WhiteSpace:
          case types2.Comment:
            this.next();
            break;
          case types2.AtKeyword:
            children.push(this.parseWithFallback(this.Atrule.bind(this, isStyleBlock), consumeRaw2));
            break;
          default:
            if (isStyleBlock && this.isDelim(AMPERSAND2)) {
              children.push(consumeRule2.call(this));
            } else {
              children.push(consumer.call(this));
            }
        }
      }
    if (!this.eof) {
      this.eat(types2.RightCurlyBracket);
    }
    return {
      type: "Block",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate2(node2) {
    this.token(types2.LeftCurlyBracket, "{");
    this.children(node2, (prev) => {
      if (prev.type === "Declaration") {
        this.token(types2.Semicolon, ";");
      }
    });
    this.token(types2.RightCurlyBracket, "}");
  }
  Block$1.generate = generate2;
  Block$1.name = name2;
  Block$1.parse = parse2;
  Block$1.structure = structure2;
  Block$1.walkContext = walkContext2;
  return Block$1;
}
var Brackets$1 = {};
var hasRequiredBrackets;
function requireBrackets() {
  if (hasRequiredBrackets) return Brackets$1;
  hasRequiredBrackets = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Brackets";
  const structure2 = {
    children: [[]]
  };
  function parse2(readSequence2, recognizer) {
    const start = this.tokenStart;
    let children = null;
    this.eat(types2.LeftSquareBracket);
    children = readSequence2.call(this, recognizer);
    if (!this.eof) {
      this.eat(types2.RightSquareBracket);
    }
    return {
      type: "Brackets",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate2(node2) {
    this.token(types2.Delim, "[");
    this.children(node2);
    this.token(types2.Delim, "]");
  }
  Brackets$1.generate = generate2;
  Brackets$1.name = name2;
  Brackets$1.parse = parse2;
  Brackets$1.structure = structure2;
  return Brackets$1;
}
var CDC$2 = {};
var hasRequiredCDC;
function requireCDC() {
  if (hasRequiredCDC) return CDC$2;
  hasRequiredCDC = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "CDC";
  const structure2 = [];
  function parse2() {
    const start = this.tokenStart;
    this.eat(types2.CDC);
    return {
      type: "CDC",
      loc: this.getLocation(start, this.tokenStart)
    };
  }
  function generate2() {
    this.token(types2.CDC, "-->");
  }
  CDC$2.generate = generate2;
  CDC$2.name = name2;
  CDC$2.parse = parse2;
  CDC$2.structure = structure2;
  return CDC$2;
}
var CDO$2 = {};
var hasRequiredCDO;
function requireCDO() {
  if (hasRequiredCDO) return CDO$2;
  hasRequiredCDO = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "CDO";
  const structure2 = [];
  function parse2() {
    const start = this.tokenStart;
    this.eat(types2.CDO);
    return {
      type: "CDO",
      loc: this.getLocation(start, this.tokenStart)
    };
  }
  function generate2() {
    this.token(types2.CDO, "<!--");
  }
  CDO$2.generate = generate2;
  CDO$2.name = name2;
  CDO$2.parse = parse2;
  CDO$2.structure = structure2;
  return CDO$2;
}
var ClassSelector$1 = {};
var hasRequiredClassSelector;
function requireClassSelector() {
  if (hasRequiredClassSelector) return ClassSelector$1;
  hasRequiredClassSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const FULLSTOP2 = 46;
  const name2 = "ClassSelector";
  const structure2 = {
    name: String
  };
  function parse2() {
    this.eatDelim(FULLSTOP2);
    return {
      type: "ClassSelector",
      loc: this.getLocation(this.tokenStart - 1, this.tokenEnd),
      name: this.consume(types2.Ident)
    };
  }
  function generate2(node2) {
    this.token(types2.Delim, ".");
    this.token(types2.Ident, node2.name);
  }
  ClassSelector$1.generate = generate2;
  ClassSelector$1.name = name2;
  ClassSelector$1.parse = parse2;
  ClassSelector$1.structure = structure2;
  return ClassSelector$1;
}
var Combinator$1 = {};
var hasRequiredCombinator;
function requireCombinator() {
  if (hasRequiredCombinator) return Combinator$1;
  hasRequiredCombinator = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const PLUSSIGN2 = 43;
  const SOLIDUS2 = 47;
  const GREATERTHANSIGN2 = 62;
  const TILDE2 = 126;
  const name2 = "Combinator";
  const structure2 = {
    name: String
  };
  function parse2() {
    const start = this.tokenStart;
    let name3;
    switch (this.tokenType) {
      case types2.WhiteSpace:
        name3 = " ";
        break;
      case types2.Delim:
        switch (this.charCodeAt(this.tokenStart)) {
          case GREATERTHANSIGN2:
          case PLUSSIGN2:
          case TILDE2:
            this.next();
            break;
          case SOLIDUS2:
            this.next();
            this.eatIdent("deep");
            this.eatDelim(SOLIDUS2);
            break;
          default:
            this.error("Combinator is expected");
        }
        name3 = this.substrToCursor(start);
        break;
    }
    return {
      type: "Combinator",
      loc: this.getLocation(start, this.tokenStart),
      name: name3
    };
  }
  function generate2(node2) {
    this.tokenize(node2.name);
  }
  Combinator$1.generate = generate2;
  Combinator$1.name = name2;
  Combinator$1.parse = parse2;
  Combinator$1.structure = structure2;
  return Combinator$1;
}
var Comment$2 = {};
var hasRequiredComment;
function requireComment() {
  if (hasRequiredComment) return Comment$2;
  hasRequiredComment = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const ASTERISK2 = 42;
  const SOLIDUS2 = 47;
  const name2 = "Comment";
  const structure2 = {
    value: String
  };
  function parse2() {
    const start = this.tokenStart;
    let end = this.tokenEnd;
    this.eat(types2.Comment);
    if (end - start + 2 >= 2 && this.charCodeAt(end - 2) === ASTERISK2 && this.charCodeAt(end - 1) === SOLIDUS2) {
      end -= 2;
    }
    return {
      type: "Comment",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substring(start + 2, end)
    };
  }
  function generate2(node2) {
    this.token(types2.Comment, "/*" + node2.value + "*/");
  }
  Comment$2.generate = generate2;
  Comment$2.name = name2;
  Comment$2.parse = parse2;
  Comment$2.structure = structure2;
  return Comment$2;
}
var Condition$1 = {};
var hasRequiredCondition;
function requireCondition() {
  if (hasRequiredCondition) return Condition$1;
  hasRequiredCondition = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const likelyFeatureToken2 = /* @__PURE__ */ new Set([types2.Colon, types2.RightParenthesis, types2.EOF]);
  const name2 = "Condition";
  const structure2 = {
    kind: String,
    children: [[
      "Identifier",
      "Feature",
      "FeatureFunction",
      "FeatureRange",
      "SupportsDeclaration"
    ]]
  };
  function featureOrRange2(kind) {
    if (this.lookupTypeNonSC(1) === types2.Ident && likelyFeatureToken2.has(this.lookupTypeNonSC(2))) {
      return this.Feature(kind);
    }
    return this.FeatureRange(kind);
  }
  const parentheses2 = {
    media: featureOrRange2,
    container: featureOrRange2,
    supports() {
      return this.SupportsDeclaration();
    }
  };
  function parse2(kind = "media") {
    const children = this.createList();
    scan: while (!this.eof) {
      switch (this.tokenType) {
        case types2.Comment:
        case types2.WhiteSpace:
          this.next();
          continue;
        case types2.Ident:
          children.push(this.Identifier());
          break;
        case types2.LeftParenthesis: {
          let term = this.parseWithFallback(
            () => parentheses2[kind].call(this, kind),
            () => null
          );
          if (!term) {
            term = this.parseWithFallback(
              () => {
                this.eat(types2.LeftParenthesis);
                const res = this.Condition(kind);
                this.eat(types2.RightParenthesis);
                return res;
              },
              () => {
                return this.GeneralEnclosed(kind);
              }
            );
          }
          children.push(term);
          break;
        }
        case types2.Function: {
          let term = this.parseWithFallback(
            () => this.FeatureFunction(kind),
            () => null
          );
          if (!term) {
            term = this.GeneralEnclosed(kind);
          }
          children.push(term);
          break;
        }
        default:
          break scan;
      }
    }
    if (children.isEmpty) {
      this.error("Condition is expected");
    }
    return {
      type: "Condition",
      loc: this.getLocationFromList(children),
      kind,
      children
    };
  }
  function generate2(node2) {
    node2.children.forEach((child) => {
      if (child.type === "Condition") {
        this.token(types2.LeftParenthesis, "(");
        this.node(child);
        this.token(types2.RightParenthesis, ")");
      } else {
        this.node(child);
      }
    });
  }
  Condition$1.generate = generate2;
  Condition$1.name = name2;
  Condition$1.parse = parse2;
  Condition$1.structure = structure2;
  return Condition$1;
}
var Declaration$1 = {};
var hasRequiredDeclaration;
function requireDeclaration() {
  if (hasRequiredDeclaration) return Declaration$1;
  hasRequiredDeclaration = 1;
  const names2 = /* @__PURE__ */ requireNames();
  const types2 = /* @__PURE__ */ requireTypes();
  const EXCLAMATIONMARK2 = 33;
  const NUMBERSIGN2 = 35;
  const DOLLARSIGN2 = 36;
  const AMPERSAND2 = 38;
  const ASTERISK2 = 42;
  const PLUSSIGN2 = 43;
  const SOLIDUS2 = 47;
  function consumeValueRaw2() {
    return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, true);
  }
  function consumeCustomPropertyRaw2() {
    return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);
  }
  function consumeValue2() {
    const startValueToken = this.tokenIndex;
    const value2 = this.Value();
    if (value2.type !== "Raw" && this.eof === false && this.tokenType !== types2.Semicolon && this.isDelim(EXCLAMATIONMARK2) === false && this.isBalanceEdge(startValueToken) === false) {
      this.error();
    }
    return value2;
  }
  const name2 = "Declaration";
  const walkContext2 = "declaration";
  const structure2 = {
    important: [Boolean, String],
    property: String,
    value: ["Value", "Raw"]
  };
  function parse2() {
    const start = this.tokenStart;
    const startToken = this.tokenIndex;
    const property2 = readProperty2.call(this);
    const customProperty = names2.isCustomProperty(property2);
    const parseValue = customProperty ? this.parseCustomProperty : this.parseValue;
    const consumeRaw2 = customProperty ? consumeCustomPropertyRaw2 : consumeValueRaw2;
    let important = false;
    let value2;
    this.skipSC();
    this.eat(types2.Colon);
    const valueStart = this.tokenIndex;
    if (!customProperty) {
      this.skipSC();
    }
    if (parseValue) {
      value2 = this.parseWithFallback(consumeValue2, consumeRaw2);
    } else {
      value2 = consumeRaw2.call(this, this.tokenIndex);
    }
    if (customProperty && value2.type === "Value" && value2.children.isEmpty) {
      for (let offset = valueStart - this.tokenIndex; offset <= 0; offset++) {
        if (this.lookupType(offset) === types2.WhiteSpace) {
          value2.children.appendData({
            type: "WhiteSpace",
            loc: null,
            value: " "
          });
          break;
        }
      }
    }
    if (this.isDelim(EXCLAMATIONMARK2)) {
      important = getImportant2.call(this);
      this.skipSC();
    }
    if (this.eof === false && this.tokenType !== types2.Semicolon && this.isBalanceEdge(startToken) === false) {
      this.error();
    }
    return {
      type: "Declaration",
      loc: this.getLocation(start, this.tokenStart),
      important,
      property: property2,
      value: value2
    };
  }
  function generate2(node2) {
    this.token(types2.Ident, node2.property);
    this.token(types2.Colon, ":");
    this.node(node2.value);
    if (node2.important) {
      this.token(types2.Delim, "!");
      this.token(types2.Ident, node2.important === true ? "important" : node2.important);
    }
  }
  function readProperty2() {
    const start = this.tokenStart;
    if (this.tokenType === types2.Delim) {
      switch (this.charCodeAt(this.tokenStart)) {
        case ASTERISK2:
        case DOLLARSIGN2:
        case PLUSSIGN2:
        case NUMBERSIGN2:
        case AMPERSAND2:
          this.next();
          break;
        // TODO: not sure we should support this hack
        case SOLIDUS2:
          this.next();
          if (this.isDelim(SOLIDUS2)) {
            this.next();
          }
          break;
      }
    }
    if (this.tokenType === types2.Hash) {
      this.eat(types2.Hash);
    } else {
      this.eat(types2.Ident);
    }
    return this.substrToCursor(start);
  }
  function getImportant2() {
    this.eat(types2.Delim);
    this.skipSC();
    const important = this.consume(types2.Ident);
    return important === "important" ? true : important;
  }
  Declaration$1.generate = generate2;
  Declaration$1.name = name2;
  Declaration$1.parse = parse2;
  Declaration$1.structure = structure2;
  Declaration$1.walkContext = walkContext2;
  return Declaration$1;
}
var DeclarationList$1 = {};
var hasRequiredDeclarationList;
function requireDeclarationList() {
  if (hasRequiredDeclarationList) return DeclarationList$1;
  hasRequiredDeclarationList = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const AMPERSAND2 = 38;
  function consumeRaw2() {
    return this.Raw(this.consumeUntilSemicolonIncluded, true);
  }
  const name2 = "DeclarationList";
  const structure2 = {
    children: [[
      "Declaration",
      "Atrule",
      "Rule"
    ]]
  };
  function parse2() {
    const children = this.createList();
    while (!this.eof) {
      switch (this.tokenType) {
        case types2.WhiteSpace:
        case types2.Comment:
        case types2.Semicolon:
          this.next();
          break;
        case types2.AtKeyword:
          children.push(this.parseWithFallback(this.Atrule.bind(this, true), consumeRaw2));
          break;
        default:
          if (this.isDelim(AMPERSAND2)) {
            children.push(this.parseWithFallback(this.Rule, consumeRaw2));
          } else {
            children.push(this.parseWithFallback(this.Declaration, consumeRaw2));
          }
      }
    }
    return {
      type: "DeclarationList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate2(node2) {
    this.children(node2, (prev) => {
      if (prev.type === "Declaration") {
        this.token(types2.Semicolon, ";");
      }
    });
  }
  DeclarationList$1.generate = generate2;
  DeclarationList$1.name = name2;
  DeclarationList$1.parse = parse2;
  DeclarationList$1.structure = structure2;
  return DeclarationList$1;
}
var Dimension$2 = {};
var hasRequiredDimension;
function requireDimension() {
  if (hasRequiredDimension) return Dimension$2;
  hasRequiredDimension = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Dimension";
  const structure2 = {
    value: String,
    unit: String
  };
  function parse2() {
    const start = this.tokenStart;
    const value2 = this.consumeNumber(types2.Dimension);
    return {
      type: "Dimension",
      loc: this.getLocation(start, this.tokenStart),
      value: value2,
      unit: this.substring(start + value2.length, this.tokenStart)
    };
  }
  function generate2(node2) {
    this.token(types2.Dimension, node2.value + node2.unit);
  }
  Dimension$2.generate = generate2;
  Dimension$2.name = name2;
  Dimension$2.parse = parse2;
  Dimension$2.structure = structure2;
  return Dimension$2;
}
var Feature$1 = {};
var hasRequiredFeature;
function requireFeature() {
  if (hasRequiredFeature) return Feature$1;
  hasRequiredFeature = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const SOLIDUS2 = 47;
  const name2 = "Feature";
  const structure2 = {
    kind: String,
    name: String,
    value: ["Identifier", "Number", "Dimension", "Ratio", "Function", null]
  };
  function parse2(kind) {
    const start = this.tokenStart;
    let name3;
    let value2 = null;
    this.eat(types2.LeftParenthesis);
    this.skipSC();
    name3 = this.consume(types2.Ident);
    this.skipSC();
    if (this.tokenType !== types2.RightParenthesis) {
      this.eat(types2.Colon);
      this.skipSC();
      switch (this.tokenType) {
        case types2.Number:
          if (this.lookupNonWSType(1) === types2.Delim) {
            value2 = this.Ratio();
          } else {
            value2 = this.Number();
          }
          break;
        case types2.Dimension:
          value2 = this.Dimension();
          break;
        case types2.Ident:
          value2 = this.Identifier();
          break;
        case types2.Function:
          value2 = this.parseWithFallback(
            () => {
              const res = this.Function(this.readSequence, this.scope.Value);
              this.skipSC();
              if (this.isDelim(SOLIDUS2)) {
                this.error();
              }
              return res;
            },
            () => {
              return this.Ratio();
            }
          );
          break;
        default:
          this.error("Number, dimension, ratio or identifier is expected");
      }
      this.skipSC();
    }
    if (!this.eof) {
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "Feature",
      loc: this.getLocation(start, this.tokenStart),
      kind,
      name: name3,
      value: value2
    };
  }
  function generate2(node2) {
    this.token(types2.LeftParenthesis, "(");
    this.token(types2.Ident, node2.name);
    if (node2.value !== null) {
      this.token(types2.Colon, ":");
      this.node(node2.value);
    }
    this.token(types2.RightParenthesis, ")");
  }
  Feature$1.generate = generate2;
  Feature$1.name = name2;
  Feature$1.parse = parse2;
  Feature$1.structure = structure2;
  return Feature$1;
}
var FeatureFunction$1 = {};
var hasRequiredFeatureFunction;
function requireFeatureFunction() {
  if (hasRequiredFeatureFunction) return FeatureFunction$1;
  hasRequiredFeatureFunction = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "FeatureFunction";
  const structure2 = {
    kind: String,
    feature: String,
    value: ["Declaration", "Selector"]
  };
  function getFeatureParser2(kind, name3) {
    const featuresOfKind = this.features[kind] || {};
    const parser2 = featuresOfKind[name3];
    if (typeof parser2 !== "function") {
      this.error(`Unknown feature ${name3}()`);
    }
    return parser2;
  }
  function parse2(kind = "unknown") {
    const start = this.tokenStart;
    const functionName = this.consumeFunctionName();
    const valueParser = getFeatureParser2.call(this, kind, functionName.toLowerCase());
    this.skipSC();
    const value2 = this.parseWithFallback(
      () => {
        const startValueToken = this.tokenIndex;
        const value3 = valueParser.call(this);
        if (this.eof === false && this.isBalanceEdge(startValueToken) === false) {
          this.error();
        }
        return value3;
      },
      () => this.Raw(null, false)
    );
    if (!this.eof) {
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "FeatureFunction",
      loc: this.getLocation(start, this.tokenStart),
      kind,
      feature: functionName,
      value: value2
    };
  }
  function generate2(node2) {
    this.token(types2.Function, node2.feature + "(");
    this.node(node2.value);
    this.token(types2.RightParenthesis, ")");
  }
  FeatureFunction$1.generate = generate2;
  FeatureFunction$1.name = name2;
  FeatureFunction$1.parse = parse2;
  FeatureFunction$1.structure = structure2;
  return FeatureFunction$1;
}
var FeatureRange$1 = {};
var hasRequiredFeatureRange;
function requireFeatureRange() {
  if (hasRequiredFeatureRange) return FeatureRange$1;
  hasRequiredFeatureRange = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const SOLIDUS2 = 47;
  const LESSTHANSIGN2 = 60;
  const EQUALSSIGN2 = 61;
  const GREATERTHANSIGN2 = 62;
  const name2 = "FeatureRange";
  const structure2 = {
    kind: String,
    left: ["Identifier", "Number", "Dimension", "Ratio", "Function"],
    leftComparison: String,
    middle: ["Identifier", "Number", "Dimension", "Ratio", "Function"],
    rightComparison: [String, null],
    right: ["Identifier", "Number", "Dimension", "Ratio", "Function", null]
  };
  function readTerm2() {
    this.skipSC();
    switch (this.tokenType) {
      case types2.Number:
        if (this.isDelim(SOLIDUS2, this.lookupOffsetNonSC(1))) {
          return this.Ratio();
        } else {
          return this.Number();
        }
      case types2.Dimension:
        return this.Dimension();
      case types2.Ident:
        return this.Identifier();
      case types2.Function:
        return this.parseWithFallback(
          () => {
            const res = this.Function(this.readSequence, this.scope.Value);
            this.skipSC();
            if (this.isDelim(SOLIDUS2)) {
              this.error();
            }
            return res;
          },
          () => {
            return this.Ratio();
          }
        );
      default:
        this.error("Number, dimension, ratio or identifier is expected");
    }
  }
  function readComparison2(expectColon) {
    this.skipSC();
    if (this.isDelim(LESSTHANSIGN2) || this.isDelim(GREATERTHANSIGN2)) {
      const value2 = this.source[this.tokenStart];
      this.next();
      if (this.isDelim(EQUALSSIGN2)) {
        this.next();
        return value2 + "=";
      }
      return value2;
    }
    if (this.isDelim(EQUALSSIGN2)) {
      return "=";
    }
    this.error(`Expected ${expectColon ? '":", ' : ""}"<", ">", "=" or ")"`);
  }
  function parse2(kind = "unknown") {
    const start = this.tokenStart;
    this.skipSC();
    this.eat(types2.LeftParenthesis);
    const left = readTerm2.call(this);
    const leftComparison = readComparison2.call(this, left.type === "Identifier");
    const middle = readTerm2.call(this);
    let rightComparison = null;
    let right = null;
    if (this.lookupNonWSType(0) !== types2.RightParenthesis) {
      rightComparison = readComparison2.call(this);
      right = readTerm2.call(this);
    }
    this.skipSC();
    this.eat(types2.RightParenthesis);
    return {
      type: "FeatureRange",
      loc: this.getLocation(start, this.tokenStart),
      kind,
      left,
      leftComparison,
      middle,
      rightComparison,
      right
    };
  }
  function generate2(node2) {
    this.token(types2.LeftParenthesis, "(");
    this.node(node2.left);
    this.tokenize(node2.leftComparison);
    this.node(node2.middle);
    if (node2.right) {
      this.tokenize(node2.rightComparison);
      this.node(node2.right);
    }
    this.token(types2.RightParenthesis, ")");
  }
  FeatureRange$1.generate = generate2;
  FeatureRange$1.name = name2;
  FeatureRange$1.parse = parse2;
  FeatureRange$1.structure = structure2;
  return FeatureRange$1;
}
var _Function = {};
var hasRequired_Function;
function require_Function() {
  if (hasRequired_Function) return _Function;
  hasRequired_Function = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Function";
  const walkContext2 = "function";
  const structure2 = {
    name: String,
    children: [[]]
  };
  function parse2(readSequence2, recognizer) {
    const start = this.tokenStart;
    const name3 = this.consumeFunctionName();
    const nameLowerCase = name3.toLowerCase();
    let children;
    children = recognizer.hasOwnProperty(nameLowerCase) ? recognizer[nameLowerCase].call(this, recognizer) : readSequence2.call(this, recognizer);
    if (!this.eof) {
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "Function",
      loc: this.getLocation(start, this.tokenStart),
      name: name3,
      children
    };
  }
  function generate2(node2) {
    this.token(types2.Function, node2.name + "(");
    this.children(node2);
    this.token(types2.RightParenthesis, ")");
  }
  _Function.generate = generate2;
  _Function.name = name2;
  _Function.parse = parse2;
  _Function.structure = structure2;
  _Function.walkContext = walkContext2;
  return _Function;
}
var GeneralEnclosed$1 = {};
var hasRequiredGeneralEnclosed;
function requireGeneralEnclosed() {
  if (hasRequiredGeneralEnclosed) return GeneralEnclosed$1;
  hasRequiredGeneralEnclosed = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "GeneralEnclosed";
  const structure2 = {
    kind: String,
    function: [String, null],
    children: [[]]
  };
  function parse2(kind) {
    const start = this.tokenStart;
    let functionName = null;
    if (this.tokenType === types2.Function) {
      functionName = this.consumeFunctionName();
    } else {
      this.eat(types2.LeftParenthesis);
    }
    const children = this.parseWithFallback(
      () => {
        const startValueToken = this.tokenIndex;
        const children2 = this.readSequence(this.scope.Value);
        if (this.eof === false && this.isBalanceEdge(startValueToken) === false) {
          this.error();
        }
        return children2;
      },
      () => this.createSingleNodeList(
        this.Raw(null, false)
      )
    );
    if (!this.eof) {
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "GeneralEnclosed",
      loc: this.getLocation(start, this.tokenStart),
      kind,
      function: functionName,
      children
    };
  }
  function generate2(node2) {
    if (node2.function) {
      this.token(types2.Function, node2.function + "(");
    } else {
      this.token(types2.LeftParenthesis, "(");
    }
    this.children(node2);
    this.token(types2.RightParenthesis, ")");
  }
  GeneralEnclosed$1.generate = generate2;
  GeneralEnclosed$1.name = name2;
  GeneralEnclosed$1.parse = parse2;
  GeneralEnclosed$1.structure = structure2;
  return GeneralEnclosed$1;
}
var Hash$2 = {};
var hasRequiredHash;
function requireHash() {
  if (hasRequiredHash) return Hash$2;
  hasRequiredHash = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const xxx2 = "XXX";
  const name2 = "Hash";
  const structure2 = {
    value: String
  };
  function parse2() {
    const start = this.tokenStart;
    this.eat(types2.Hash);
    return {
      type: "Hash",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substrToCursor(start + 1)
    };
  }
  function generate2(node2) {
    this.token(types2.Hash, "#" + node2.value);
  }
  Hash$2.generate = generate2;
  Hash$2.name = name2;
  Hash$2.parse = parse2;
  Hash$2.structure = structure2;
  Hash$2.xxx = xxx2;
  return Hash$2;
}
var Identifier$1 = {};
var hasRequiredIdentifier;
function requireIdentifier() {
  if (hasRequiredIdentifier) return Identifier$1;
  hasRequiredIdentifier = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Identifier";
  const structure2 = {
    name: String
  };
  function parse2() {
    return {
      type: "Identifier",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      name: this.consume(types2.Ident)
    };
  }
  function generate2(node2) {
    this.token(types2.Ident, node2.name);
  }
  Identifier$1.generate = generate2;
  Identifier$1.name = name2;
  Identifier$1.parse = parse2;
  Identifier$1.structure = structure2;
  return Identifier$1;
}
var IdSelector$1 = {};
var hasRequiredIdSelector;
function requireIdSelector() {
  if (hasRequiredIdSelector) return IdSelector$1;
  hasRequiredIdSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "IdSelector";
  const structure2 = {
    name: String
  };
  function parse2() {
    const start = this.tokenStart;
    this.eat(types2.Hash);
    return {
      type: "IdSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: this.substrToCursor(start + 1)
    };
  }
  function generate2(node2) {
    this.token(types2.Delim, "#" + node2.name);
  }
  IdSelector$1.generate = generate2;
  IdSelector$1.name = name2;
  IdSelector$1.parse = parse2;
  IdSelector$1.structure = structure2;
  return IdSelector$1;
}
var Layer$1 = {};
var hasRequiredLayer$1;
function requireLayer$1() {
  if (hasRequiredLayer$1) return Layer$1;
  hasRequiredLayer$1 = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const FULLSTOP2 = 46;
  const name2 = "Layer";
  const structure2 = {
    name: String
  };
  function parse2() {
    let tokenStart = this.tokenStart;
    let name3 = this.consume(types2.Ident);
    while (this.isDelim(FULLSTOP2)) {
      this.eat(types2.Delim);
      name3 += "." + this.consume(types2.Ident);
    }
    return {
      type: "Layer",
      loc: this.getLocation(tokenStart, this.tokenStart),
      name: name3
    };
  }
  function generate2(node2) {
    this.tokenize(node2.name);
  }
  Layer$1.generate = generate2;
  Layer$1.name = name2;
  Layer$1.parse = parse2;
  Layer$1.structure = structure2;
  return Layer$1;
}
var LayerList$1 = {};
var hasRequiredLayerList;
function requireLayerList() {
  if (hasRequiredLayerList) return LayerList$1;
  hasRequiredLayerList = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "LayerList";
  const structure2 = {
    children: [[
      "Layer"
    ]]
  };
  function parse2() {
    const children = this.createList();
    this.skipSC();
    while (!this.eof) {
      children.push(this.Layer());
      if (this.lookupTypeNonSC(0) !== types2.Comma) {
        break;
      }
      this.skipSC();
      this.next();
      this.skipSC();
    }
    return {
      type: "LayerList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate2(node2) {
    this.children(node2, () => this.token(types2.Comma, ","));
  }
  LayerList$1.generate = generate2;
  LayerList$1.name = name2;
  LayerList$1.parse = parse2;
  LayerList$1.structure = structure2;
  return LayerList$1;
}
var MediaQuery$1 = {};
var hasRequiredMediaQuery;
function requireMediaQuery() {
  if (hasRequiredMediaQuery) return MediaQuery$1;
  hasRequiredMediaQuery = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "MediaQuery";
  const structure2 = {
    modifier: [String, null],
    mediaType: [String, null],
    condition: ["Condition", null]
  };
  function parse2() {
    const start = this.tokenStart;
    let modifier = null;
    let mediaType = null;
    let condition = null;
    this.skipSC();
    if (this.tokenType === types2.Ident && this.lookupTypeNonSC(1) !== types2.LeftParenthesis) {
      const ident2 = this.consume(types2.Ident);
      const identLowerCase = ident2.toLowerCase();
      if (identLowerCase === "not" || identLowerCase === "only") {
        this.skipSC();
        modifier = identLowerCase;
        mediaType = this.consume(types2.Ident);
      } else {
        mediaType = ident2;
      }
      switch (this.lookupTypeNonSC(0)) {
        case types2.Ident: {
          this.skipSC();
          this.eatIdent("and");
          condition = this.Condition("media");
          break;
        }
        case types2.LeftCurlyBracket:
        case types2.Semicolon:
        case types2.Comma:
        case types2.EOF:
          break;
        default:
          this.error("Identifier or parenthesis is expected");
      }
    } else {
      switch (this.tokenType) {
        case types2.Ident:
        case types2.LeftParenthesis:
        case types2.Function: {
          condition = this.Condition("media");
          break;
        }
        case types2.LeftCurlyBracket:
        case types2.Semicolon:
        case types2.EOF:
          break;
        default:
          this.error("Identifier or parenthesis is expected");
      }
    }
    return {
      type: "MediaQuery",
      loc: this.getLocation(start, this.tokenStart),
      modifier,
      mediaType,
      condition
    };
  }
  function generate2(node2) {
    if (node2.mediaType) {
      if (node2.modifier) {
        this.token(types2.Ident, node2.modifier);
      }
      this.token(types2.Ident, node2.mediaType);
      if (node2.condition) {
        this.token(types2.Ident, "and");
        this.node(node2.condition);
      }
    } else if (node2.condition) {
      this.node(node2.condition);
    }
  }
  MediaQuery$1.generate = generate2;
  MediaQuery$1.name = name2;
  MediaQuery$1.parse = parse2;
  MediaQuery$1.structure = structure2;
  return MediaQuery$1;
}
var MediaQueryList$1 = {};
var hasRequiredMediaQueryList;
function requireMediaQueryList() {
  if (hasRequiredMediaQueryList) return MediaQueryList$1;
  hasRequiredMediaQueryList = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "MediaQueryList";
  const structure2 = {
    children: [[
      "MediaQuery"
    ]]
  };
  function parse2() {
    const children = this.createList();
    this.skipSC();
    while (!this.eof) {
      children.push(this.MediaQuery());
      if (this.tokenType !== types2.Comma) {
        break;
      }
      this.next();
    }
    return {
      type: "MediaQueryList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate2(node2) {
    this.children(node2, () => this.token(types2.Comma, ","));
  }
  MediaQueryList$1.generate = generate2;
  MediaQueryList$1.name = name2;
  MediaQueryList$1.parse = parse2;
  MediaQueryList$1.structure = structure2;
  return MediaQueryList$1;
}
var NestingSelector$1 = {};
var hasRequiredNestingSelector;
function requireNestingSelector() {
  if (hasRequiredNestingSelector) return NestingSelector$1;
  hasRequiredNestingSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const AMPERSAND2 = 38;
  const name2 = "NestingSelector";
  const structure2 = {};
  function parse2() {
    const start = this.tokenStart;
    this.eatDelim(AMPERSAND2);
    return {
      type: "NestingSelector",
      loc: this.getLocation(start, this.tokenStart)
    };
  }
  function generate2() {
    this.token(types2.Delim, "&");
  }
  NestingSelector$1.generate = generate2;
  NestingSelector$1.name = name2;
  NestingSelector$1.parse = parse2;
  NestingSelector$1.structure = structure2;
  return NestingSelector$1;
}
var Nth$1 = {};
var hasRequiredNth;
function requireNth() {
  if (hasRequiredNth) return Nth$1;
  hasRequiredNth = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Nth";
  const structure2 = {
    nth: ["AnPlusB", "Identifier"],
    selector: ["SelectorList", null]
  };
  function parse2() {
    this.skipSC();
    const start = this.tokenStart;
    let end = start;
    let selector2 = null;
    let nth2;
    if (this.lookupValue(0, "odd") || this.lookupValue(0, "even")) {
      nth2 = this.Identifier();
    } else {
      nth2 = this.AnPlusB();
    }
    end = this.tokenStart;
    this.skipSC();
    if (this.lookupValue(0, "of")) {
      this.next();
      selector2 = this.SelectorList();
      end = this.tokenStart;
    }
    return {
      type: "Nth",
      loc: this.getLocation(start, end),
      nth: nth2,
      selector: selector2
    };
  }
  function generate2(node2) {
    this.node(node2.nth);
    if (node2.selector !== null) {
      this.token(types2.Ident, "of");
      this.node(node2.selector);
    }
  }
  Nth$1.generate = generate2;
  Nth$1.name = name2;
  Nth$1.parse = parse2;
  Nth$1.structure = structure2;
  return Nth$1;
}
var _Number = {};
var hasRequired_Number;
function require_Number() {
  if (hasRequired_Number) return _Number;
  hasRequired_Number = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Number";
  const structure2 = {
    value: String
  };
  function parse2() {
    return {
      type: "Number",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      value: this.consume(types2.Number)
    };
  }
  function generate2(node2) {
    this.token(types2.Number, node2.value);
  }
  _Number.generate = generate2;
  _Number.name = name2;
  _Number.parse = parse2;
  _Number.structure = structure2;
  return _Number;
}
var Operator$1 = {};
var hasRequiredOperator;
function requireOperator() {
  if (hasRequiredOperator) return Operator$1;
  hasRequiredOperator = 1;
  const name2 = "Operator";
  const structure2 = {
    value: String
  };
  function parse2() {
    const start = this.tokenStart;
    this.next();
    return {
      type: "Operator",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substrToCursor(start)
    };
  }
  function generate2(node2) {
    this.tokenize(node2.value);
  }
  Operator$1.generate = generate2;
  Operator$1.name = name2;
  Operator$1.parse = parse2;
  Operator$1.structure = structure2;
  return Operator$1;
}
var Parentheses$1 = {};
var hasRequiredParentheses;
function requireParentheses() {
  if (hasRequiredParentheses) return Parentheses$1;
  hasRequiredParentheses = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Parentheses";
  const structure2 = {
    children: [[]]
  };
  function parse2(readSequence2, recognizer) {
    const start = this.tokenStart;
    let children = null;
    this.eat(types2.LeftParenthesis);
    children = readSequence2.call(this, recognizer);
    if (!this.eof) {
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "Parentheses",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate2(node2) {
    this.token(types2.LeftParenthesis, "(");
    this.children(node2);
    this.token(types2.RightParenthesis, ")");
  }
  Parentheses$1.generate = generate2;
  Parentheses$1.name = name2;
  Parentheses$1.parse = parse2;
  Parentheses$1.structure = structure2;
  return Parentheses$1;
}
var Percentage$2 = {};
var hasRequiredPercentage;
function requirePercentage() {
  if (hasRequiredPercentage) return Percentage$2;
  hasRequiredPercentage = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Percentage";
  const structure2 = {
    value: String
  };
  function parse2() {
    return {
      type: "Percentage",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      value: this.consumeNumber(types2.Percentage)
    };
  }
  function generate2(node2) {
    this.token(types2.Percentage, node2.value + "%");
  }
  Percentage$2.generate = generate2;
  Percentage$2.name = name2;
  Percentage$2.parse = parse2;
  Percentage$2.structure = structure2;
  return Percentage$2;
}
var PseudoClassSelector$1 = {};
var hasRequiredPseudoClassSelector;
function requirePseudoClassSelector() {
  if (hasRequiredPseudoClassSelector) return PseudoClassSelector$1;
  hasRequiredPseudoClassSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "PseudoClassSelector";
  const walkContext2 = "function";
  const structure2 = {
    name: String,
    children: [["Raw"], null]
  };
  function parse2() {
    const start = this.tokenStart;
    let children = null;
    let name3;
    let nameLowerCase;
    this.eat(types2.Colon);
    if (this.tokenType === types2.Function) {
      name3 = this.consumeFunctionName();
      nameLowerCase = name3.toLowerCase();
      if (this.lookupNonWSType(0) == types2.RightParenthesis) {
        children = this.createList();
      } else if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
        this.skipSC();
        children = this.pseudo[nameLowerCase].call(this);
        this.skipSC();
      } else {
        children = this.createList();
        children.push(
          this.Raw(null, false)
        );
      }
      this.eat(types2.RightParenthesis);
    } else {
      name3 = this.consume(types2.Ident);
    }
    return {
      type: "PseudoClassSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: name3,
      children
    };
  }
  function generate2(node2) {
    this.token(types2.Colon, ":");
    if (node2.children === null) {
      this.token(types2.Ident, node2.name);
    } else {
      this.token(types2.Function, node2.name + "(");
      this.children(node2);
      this.token(types2.RightParenthesis, ")");
    }
  }
  PseudoClassSelector$1.generate = generate2;
  PseudoClassSelector$1.name = name2;
  PseudoClassSelector$1.parse = parse2;
  PseudoClassSelector$1.structure = structure2;
  PseudoClassSelector$1.walkContext = walkContext2;
  return PseudoClassSelector$1;
}
var PseudoElementSelector$1 = {};
var hasRequiredPseudoElementSelector;
function requirePseudoElementSelector() {
  if (hasRequiredPseudoElementSelector) return PseudoElementSelector$1;
  hasRequiredPseudoElementSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "PseudoElementSelector";
  const walkContext2 = "function";
  const structure2 = {
    name: String,
    children: [["Raw"], null]
  };
  function parse2() {
    const start = this.tokenStart;
    let children = null;
    let name3;
    let nameLowerCase;
    this.eat(types2.Colon);
    this.eat(types2.Colon);
    if (this.tokenType === types2.Function) {
      name3 = this.consumeFunctionName();
      nameLowerCase = name3.toLowerCase();
      if (this.lookupNonWSType(0) == types2.RightParenthesis) {
        children = this.createList();
      } else if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
        this.skipSC();
        children = this.pseudo[nameLowerCase].call(this);
        this.skipSC();
      } else {
        children = this.createList();
        children.push(
          this.Raw(null, false)
        );
      }
      this.eat(types2.RightParenthesis);
    } else {
      name3 = this.consume(types2.Ident);
    }
    return {
      type: "PseudoElementSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: name3,
      children
    };
  }
  function generate2(node2) {
    this.token(types2.Colon, ":");
    this.token(types2.Colon, ":");
    if (node2.children === null) {
      this.token(types2.Ident, node2.name);
    } else {
      this.token(types2.Function, node2.name + "(");
      this.children(node2);
      this.token(types2.RightParenthesis, ")");
    }
  }
  PseudoElementSelector$1.generate = generate2;
  PseudoElementSelector$1.name = name2;
  PseudoElementSelector$1.parse = parse2;
  PseudoElementSelector$1.structure = structure2;
  PseudoElementSelector$1.walkContext = walkContext2;
  return PseudoElementSelector$1;
}
var Ratio$1 = {};
var hasRequiredRatio;
function requireRatio() {
  if (hasRequiredRatio) return Ratio$1;
  hasRequiredRatio = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const SOLIDUS2 = 47;
  function consumeTerm2() {
    this.skipSC();
    switch (this.tokenType) {
      case types2.Number:
        return this.Number();
      case types2.Function:
        return this.Function(this.readSequence, this.scope.Value);
      default:
        this.error("Number of function is expected");
    }
  }
  const name2 = "Ratio";
  const structure2 = {
    left: ["Number", "Function"],
    right: ["Number", "Function", null]
  };
  function parse2() {
    const start = this.tokenStart;
    const left = consumeTerm2.call(this);
    let right = null;
    this.skipSC();
    if (this.isDelim(SOLIDUS2)) {
      this.eatDelim(SOLIDUS2);
      right = consumeTerm2.call(this);
    }
    return {
      type: "Ratio",
      loc: this.getLocation(start, this.tokenStart),
      left,
      right
    };
  }
  function generate2(node2) {
    this.node(node2.left);
    this.token(types2.Delim, "/");
    if (node2.right) {
      this.node(node2.right);
    } else {
      this.node(types2.Number, 1);
    }
  }
  Ratio$1.generate = generate2;
  Ratio$1.name = name2;
  Ratio$1.parse = parse2;
  Ratio$1.structure = structure2;
  return Ratio$1;
}
var Raw$1 = {};
var hasRequiredRaw;
function requireRaw() {
  if (hasRequiredRaw) return Raw$1;
  hasRequiredRaw = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function getOffsetExcludeWS2() {
    if (this.tokenIndex > 0) {
      if (this.lookupType(-1) === types2.WhiteSpace) {
        return this.tokenIndex > 1 ? this.getTokenStart(this.tokenIndex - 1) : this.firstCharOffset;
      }
    }
    return this.tokenStart;
  }
  const name2 = "Raw";
  const structure2 = {
    value: String
  };
  function parse2(consumeUntil, excludeWhiteSpace) {
    const startOffset = this.getTokenStart(this.tokenIndex);
    let endOffset;
    this.skipUntilBalanced(this.tokenIndex, consumeUntil || this.consumeUntilBalanceEnd);
    if (excludeWhiteSpace && this.tokenStart > startOffset) {
      endOffset = getOffsetExcludeWS2.call(this);
    } else {
      endOffset = this.tokenStart;
    }
    return {
      type: "Raw",
      loc: this.getLocation(startOffset, endOffset),
      value: this.substring(startOffset, endOffset)
    };
  }
  function generate2(node2) {
    this.tokenize(node2.value);
  }
  Raw$1.generate = generate2;
  Raw$1.name = name2;
  Raw$1.parse = parse2;
  Raw$1.structure = structure2;
  return Raw$1;
}
var Rule$1 = {};
var hasRequiredRule;
function requireRule() {
  if (hasRequiredRule) return Rule$1;
  hasRequiredRule = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function consumeRaw2() {
    return this.Raw(this.consumeUntilLeftCurlyBracket, true);
  }
  function consumePrelude2() {
    const prelude = this.SelectorList();
    if (prelude.type !== "Raw" && this.eof === false && this.tokenType !== types2.LeftCurlyBracket) {
      this.error();
    }
    return prelude;
  }
  const name2 = "Rule";
  const walkContext2 = "rule";
  const structure2 = {
    prelude: ["SelectorList", "Raw"],
    block: ["Block"]
  };
  function parse2() {
    const startToken = this.tokenIndex;
    const startOffset = this.tokenStart;
    let prelude;
    let block;
    if (this.parseRulePrelude) {
      prelude = this.parseWithFallback(consumePrelude2, consumeRaw2);
    } else {
      prelude = consumeRaw2.call(this, startToken);
    }
    block = this.Block(true);
    return {
      type: "Rule",
      loc: this.getLocation(startOffset, this.tokenStart),
      prelude,
      block
    };
  }
  function generate2(node2) {
    this.node(node2.prelude);
    this.node(node2.block);
  }
  Rule$1.generate = generate2;
  Rule$1.name = name2;
  Rule$1.parse = parse2;
  Rule$1.structure = structure2;
  Rule$1.walkContext = walkContext2;
  return Rule$1;
}
var Scope$1 = {};
var hasRequiredScope$2;
function requireScope$2() {
  if (hasRequiredScope$2) return Scope$1;
  hasRequiredScope$2 = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Scope";
  const structure2 = {
    root: ["SelectorList", "Raw", null],
    limit: ["SelectorList", "Raw", null]
  };
  function parse2() {
    let root = null;
    let limit = null;
    this.skipSC();
    const startOffset = this.tokenStart;
    if (this.tokenType === types2.LeftParenthesis) {
      this.next();
      this.skipSC();
      root = this.parseWithFallback(
        this.SelectorList,
        () => this.Raw(false, true)
      );
      this.skipSC();
      this.eat(types2.RightParenthesis);
    }
    if (this.lookupNonWSType(0) === types2.Ident) {
      this.skipSC();
      this.eatIdent("to");
      this.skipSC();
      this.eat(types2.LeftParenthesis);
      this.skipSC();
      limit = this.parseWithFallback(
        this.SelectorList,
        () => this.Raw(false, true)
      );
      this.skipSC();
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "Scope",
      loc: this.getLocation(startOffset, this.tokenStart),
      root,
      limit
    };
  }
  function generate2(node2) {
    if (node2.root) {
      this.token(types2.LeftParenthesis, "(");
      this.node(node2.root);
      this.token(types2.RightParenthesis, ")");
    }
    if (node2.limit) {
      this.token(types2.Ident, "to");
      this.token(types2.LeftParenthesis, "(");
      this.node(node2.limit);
      this.token(types2.RightParenthesis, ")");
    }
  }
  Scope$1.generate = generate2;
  Scope$1.name = name2;
  Scope$1.parse = parse2;
  Scope$1.structure = structure2;
  return Scope$1;
}
var Selector$1 = {};
var hasRequiredSelector$1;
function requireSelector$1() {
  if (hasRequiredSelector$1) return Selector$1;
  hasRequiredSelector$1 = 1;
  const name2 = "Selector";
  const structure2 = {
    children: [[
      "TypeSelector",
      "IdSelector",
      "ClassSelector",
      "AttributeSelector",
      "PseudoClassSelector",
      "PseudoElementSelector",
      "Combinator"
    ]]
  };
  function parse2() {
    const children = this.readSequence(this.scope.Selector);
    if (this.getFirstListNode(children) === null) {
      this.error("Selector is expected");
    }
    return {
      type: "Selector",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate2(node2) {
    this.children(node2);
  }
  Selector$1.generate = generate2;
  Selector$1.name = name2;
  Selector$1.parse = parse2;
  Selector$1.structure = structure2;
  return Selector$1;
}
var SelectorList$1 = {};
var hasRequiredSelectorList;
function requireSelectorList() {
  if (hasRequiredSelectorList) return SelectorList$1;
  hasRequiredSelectorList = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "SelectorList";
  const walkContext2 = "selector";
  const structure2 = {
    children: [[
      "Selector",
      "Raw"
    ]]
  };
  function parse2() {
    const children = this.createList();
    while (!this.eof) {
      children.push(this.Selector());
      if (this.tokenType === types2.Comma) {
        this.next();
        continue;
      }
      break;
    }
    return {
      type: "SelectorList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate2(node2) {
    this.children(node2, () => this.token(types2.Comma, ","));
  }
  SelectorList$1.generate = generate2;
  SelectorList$1.name = name2;
  SelectorList$1.parse = parse2;
  SelectorList$1.structure = structure2;
  SelectorList$1.walkContext = walkContext2;
  return SelectorList$1;
}
var _String = {};
var string = {};
var hasRequiredString;
function requireString() {
  if (hasRequiredString) return string;
  hasRequiredString = 1;
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const utils2 = /* @__PURE__ */ requireUtils();
  const REVERSE_SOLIDUS2 = 92;
  const QUOTATION_MARK2 = 34;
  const APOSTROPHE2 = 39;
  function decode2(str) {
    const len = str.length;
    const firstChar = str.charCodeAt(0);
    const start = firstChar === QUOTATION_MARK2 || firstChar === APOSTROPHE2 ? 1 : 0;
    const end = start === 1 && len > 1 && str.charCodeAt(len - 1) === firstChar ? len - 2 : len - 1;
    let decoded = "";
    for (let i = start; i <= end; i++) {
      let code2 = str.charCodeAt(i);
      if (code2 === REVERSE_SOLIDUS2) {
        if (i === end) {
          if (i !== len - 1) {
            decoded = str.substr(i + 1);
          }
          break;
        }
        code2 = str.charCodeAt(++i);
        if (charCodeDefinitions2.isValidEscape(REVERSE_SOLIDUS2, code2)) {
          const escapeStart = i - 1;
          const escapeEnd = utils2.consumeEscaped(str, escapeStart);
          i = escapeEnd - 1;
          decoded += utils2.decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
        } else {
          if (code2 === 13 && str.charCodeAt(i + 1) === 10) {
            i++;
          }
        }
      } else {
        decoded += str[i];
      }
    }
    return decoded;
  }
  function encode2(str, apostrophe) {
    const quote = apostrophe ? "'" : '"';
    const quoteCode = apostrophe ? APOSTROPHE2 : QUOTATION_MARK2;
    let encoded = "";
    let wsBeforeHexIsNeeded = false;
    for (let i = 0; i < str.length; i++) {
      const code2 = str.charCodeAt(i);
      if (code2 === 0) {
        encoded += "�";
        continue;
      }
      if (code2 <= 31 || code2 === 127) {
        encoded += "\\" + code2.toString(16);
        wsBeforeHexIsNeeded = true;
        continue;
      }
      if (code2 === quoteCode || code2 === REVERSE_SOLIDUS2) {
        encoded += "\\" + str.charAt(i);
        wsBeforeHexIsNeeded = false;
      } else {
        if (wsBeforeHexIsNeeded && (charCodeDefinitions2.isHexDigit(code2) || charCodeDefinitions2.isWhiteSpace(code2))) {
          encoded += " ";
        }
        encoded += str.charAt(i);
        wsBeforeHexIsNeeded = false;
      }
    }
    return quote + encoded + quote;
  }
  string.decode = decode2;
  string.encode = encode2;
  return string;
}
var hasRequired_String;
function require_String() {
  if (hasRequired_String) return _String;
  hasRequired_String = 1;
  const string2 = /* @__PURE__ */ requireString();
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "String";
  const structure2 = {
    value: String
  };
  function parse2() {
    return {
      type: "String",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      value: string2.decode(this.consume(types2.String))
    };
  }
  function generate2(node2) {
    this.token(types2.String, string2.encode(node2.value));
  }
  _String.generate = generate2;
  _String.name = name2;
  _String.parse = parse2;
  _String.structure = structure2;
  return _String;
}
var StyleSheet$1 = {};
var hasRequiredStyleSheet;
function requireStyleSheet() {
  if (hasRequiredStyleSheet) return StyleSheet$1;
  hasRequiredStyleSheet = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const EXCLAMATIONMARK2 = 33;
  function consumeRaw2() {
    return this.Raw(null, false);
  }
  const name2 = "StyleSheet";
  const walkContext2 = "stylesheet";
  const structure2 = {
    children: [[
      "Comment",
      "CDO",
      "CDC",
      "Atrule",
      "Rule",
      "Raw"
    ]]
  };
  function parse2() {
    const start = this.tokenStart;
    const children = this.createList();
    let child;
    while (!this.eof) {
      switch (this.tokenType) {
        case types2.WhiteSpace:
          this.next();
          continue;
        case types2.Comment:
          if (this.charCodeAt(this.tokenStart + 2) !== EXCLAMATIONMARK2) {
            this.next();
            continue;
          }
          child = this.Comment();
          break;
        case types2.CDO:
          child = this.CDO();
          break;
        case types2.CDC:
          child = this.CDC();
          break;
        // CSS Syntax Module Level 3
        // §2.2 Error handling
        // At the "top level" of a stylesheet, an <at-keyword-token> starts an at-rule.
        case types2.AtKeyword:
          child = this.parseWithFallback(this.Atrule, consumeRaw2);
          break;
        // Anything else starts a qualified rule ...
        default:
          child = this.parseWithFallback(this.Rule, consumeRaw2);
      }
      children.push(child);
    }
    return {
      type: "StyleSheet",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate2(node2) {
    this.children(node2);
  }
  StyleSheet$1.generate = generate2;
  StyleSheet$1.name = name2;
  StyleSheet$1.parse = parse2;
  StyleSheet$1.structure = structure2;
  StyleSheet$1.walkContext = walkContext2;
  return StyleSheet$1;
}
var SupportsDeclaration$1 = {};
var hasRequiredSupportsDeclaration;
function requireSupportsDeclaration() {
  if (hasRequiredSupportsDeclaration) return SupportsDeclaration$1;
  hasRequiredSupportsDeclaration = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "SupportsDeclaration";
  const structure2 = {
    declaration: "Declaration"
  };
  function parse2() {
    const start = this.tokenStart;
    this.eat(types2.LeftParenthesis);
    this.skipSC();
    const declaration = this.Declaration();
    if (!this.eof) {
      this.eat(types2.RightParenthesis);
    }
    return {
      type: "SupportsDeclaration",
      loc: this.getLocation(start, this.tokenStart),
      declaration
    };
  }
  function generate2(node2) {
    this.token(types2.LeftParenthesis, "(");
    this.node(node2.declaration);
    this.token(types2.RightParenthesis, ")");
  }
  SupportsDeclaration$1.generate = generate2;
  SupportsDeclaration$1.name = name2;
  SupportsDeclaration$1.parse = parse2;
  SupportsDeclaration$1.structure = structure2;
  return SupportsDeclaration$1;
}
var TypeSelector$1 = {};
var hasRequiredTypeSelector;
function requireTypeSelector() {
  if (hasRequiredTypeSelector) return TypeSelector$1;
  hasRequiredTypeSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const ASTERISK2 = 42;
  const VERTICALLINE2 = 124;
  function eatIdentifierOrAsterisk2() {
    if (this.tokenType !== types2.Ident && this.isDelim(ASTERISK2) === false) {
      this.error("Identifier or asterisk is expected");
    }
    this.next();
  }
  const name2 = "TypeSelector";
  const structure2 = {
    name: String
  };
  function parse2() {
    const start = this.tokenStart;
    if (this.isDelim(VERTICALLINE2)) {
      this.next();
      eatIdentifierOrAsterisk2.call(this);
    } else {
      eatIdentifierOrAsterisk2.call(this);
      if (this.isDelim(VERTICALLINE2)) {
        this.next();
        eatIdentifierOrAsterisk2.call(this);
      }
    }
    return {
      type: "TypeSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: this.substrToCursor(start)
    };
  }
  function generate2(node2) {
    this.tokenize(node2.name);
  }
  TypeSelector$1.generate = generate2;
  TypeSelector$1.name = name2;
  TypeSelector$1.parse = parse2;
  TypeSelector$1.structure = structure2;
  return TypeSelector$1;
}
var UnicodeRange$1 = {};
var hasRequiredUnicodeRange;
function requireUnicodeRange() {
  if (hasRequiredUnicodeRange) return UnicodeRange$1;
  hasRequiredUnicodeRange = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const PLUSSIGN2 = 43;
  const HYPHENMINUS2 = 45;
  const QUESTIONMARK2 = 63;
  function eatHexSequence2(offset, allowDash) {
    let len = 0;
    for (let pos = this.tokenStart + offset; pos < this.tokenEnd; pos++) {
      const code2 = this.charCodeAt(pos);
      if (code2 === HYPHENMINUS2 && allowDash && len !== 0) {
        eatHexSequence2.call(this, offset + len + 1, false);
        return -1;
      }
      if (!charCodeDefinitions2.isHexDigit(code2)) {
        this.error(
          allowDash && len !== 0 ? "Hyphen minus" + (len < 6 ? " or hex digit" : "") + " is expected" : len < 6 ? "Hex digit is expected" : "Unexpected input",
          pos
        );
      }
      if (++len > 6) {
        this.error("Too many hex digits", pos);
      }
    }
    this.next();
    return len;
  }
  function eatQuestionMarkSequence2(max) {
    let count = 0;
    while (this.isDelim(QUESTIONMARK2)) {
      if (++count > max) {
        this.error("Too many question marks");
      }
      this.next();
    }
  }
  function startsWith2(code2) {
    if (this.charCodeAt(this.tokenStart) !== code2) {
      this.error((code2 === PLUSSIGN2 ? "Plus sign" : "Hyphen minus") + " is expected");
    }
  }
  function scanUnicodeRange2() {
    let hexLength = 0;
    switch (this.tokenType) {
      case types2.Number:
        hexLength = eatHexSequence2.call(this, 1, true);
        if (this.isDelim(QUESTIONMARK2)) {
          eatQuestionMarkSequence2.call(this, 6 - hexLength);
          break;
        }
        if (this.tokenType === types2.Dimension || this.tokenType === types2.Number) {
          startsWith2.call(this, HYPHENMINUS2);
          eatHexSequence2.call(this, 1, false);
          break;
        }
        break;
      case types2.Dimension:
        hexLength = eatHexSequence2.call(this, 1, true);
        if (hexLength > 0) {
          eatQuestionMarkSequence2.call(this, 6 - hexLength);
        }
        break;
      default:
        this.eatDelim(PLUSSIGN2);
        if (this.tokenType === types2.Ident) {
          hexLength = eatHexSequence2.call(this, 0, true);
          if (hexLength > 0) {
            eatQuestionMarkSequence2.call(this, 6 - hexLength);
          }
          break;
        }
        if (this.isDelim(QUESTIONMARK2)) {
          this.next();
          eatQuestionMarkSequence2.call(this, 5);
          break;
        }
        this.error("Hex digit or question mark is expected");
    }
  }
  const name2 = "UnicodeRange";
  const structure2 = {
    value: String
  };
  function parse2() {
    const start = this.tokenStart;
    this.eatIdent("u");
    scanUnicodeRange2.call(this);
    return {
      type: "UnicodeRange",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substrToCursor(start)
    };
  }
  function generate2(node2) {
    this.tokenize(node2.value);
  }
  UnicodeRange$1.generate = generate2;
  UnicodeRange$1.name = name2;
  UnicodeRange$1.parse = parse2;
  UnicodeRange$1.structure = structure2;
  return UnicodeRange$1;
}
var Url$2 = {};
var url = {};
var hasRequiredUrl$1;
function requireUrl$1() {
  if (hasRequiredUrl$1) return url;
  hasRequiredUrl$1 = 1;
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const utils2 = /* @__PURE__ */ requireUtils();
  const SPACE2 = 32;
  const REVERSE_SOLIDUS2 = 92;
  const QUOTATION_MARK2 = 34;
  const APOSTROPHE2 = 39;
  const LEFTPARENTHESIS2 = 40;
  const RIGHTPARENTHESIS2 = 41;
  function decode2(str) {
    const len = str.length;
    let start = 4;
    let end = str.charCodeAt(len - 1) === RIGHTPARENTHESIS2 ? len - 2 : len - 1;
    let decoded = "";
    while (start < end && charCodeDefinitions2.isWhiteSpace(str.charCodeAt(start))) {
      start++;
    }
    while (start < end && charCodeDefinitions2.isWhiteSpace(str.charCodeAt(end))) {
      end--;
    }
    for (let i = start; i <= end; i++) {
      let code2 = str.charCodeAt(i);
      if (code2 === REVERSE_SOLIDUS2) {
        if (i === end) {
          if (i !== len - 1) {
            decoded = str.substr(i + 1);
          }
          break;
        }
        code2 = str.charCodeAt(++i);
        if (charCodeDefinitions2.isValidEscape(REVERSE_SOLIDUS2, code2)) {
          const escapeStart = i - 1;
          const escapeEnd = utils2.consumeEscaped(str, escapeStart);
          i = escapeEnd - 1;
          decoded += utils2.decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
        } else {
          if (code2 === 13 && str.charCodeAt(i + 1) === 10) {
            i++;
          }
        }
      } else {
        decoded += str[i];
      }
    }
    return decoded;
  }
  function encode2(str) {
    let encoded = "";
    let wsBeforeHexIsNeeded = false;
    for (let i = 0; i < str.length; i++) {
      const code2 = str.charCodeAt(i);
      if (code2 === 0) {
        encoded += "�";
        continue;
      }
      if (code2 <= 31 || code2 === 127) {
        encoded += "\\" + code2.toString(16);
        wsBeforeHexIsNeeded = true;
        continue;
      }
      if (code2 === SPACE2 || code2 === REVERSE_SOLIDUS2 || code2 === QUOTATION_MARK2 || code2 === APOSTROPHE2 || code2 === LEFTPARENTHESIS2 || code2 === RIGHTPARENTHESIS2) {
        encoded += "\\" + str.charAt(i);
        wsBeforeHexIsNeeded = false;
      } else {
        if (wsBeforeHexIsNeeded && charCodeDefinitions2.isHexDigit(code2)) {
          encoded += " ";
        }
        encoded += str.charAt(i);
        wsBeforeHexIsNeeded = false;
      }
    }
    return "url(" + encoded + ")";
  }
  url.decode = decode2;
  url.encode = encode2;
  return url;
}
var hasRequiredUrl;
function requireUrl() {
  if (hasRequiredUrl) return Url$2;
  hasRequiredUrl = 1;
  const url2 = /* @__PURE__ */ requireUrl$1();
  const string2 = /* @__PURE__ */ requireString();
  const types2 = /* @__PURE__ */ requireTypes();
  const name2 = "Url";
  const structure2 = {
    value: String
  };
  function parse2() {
    const start = this.tokenStart;
    let value2;
    switch (this.tokenType) {
      case types2.Url:
        value2 = url2.decode(this.consume(types2.Url));
        break;
      case types2.Function:
        if (!this.cmpStr(this.tokenStart, this.tokenEnd, "url(")) {
          this.error("Function name must be `url`");
        }
        this.eat(types2.Function);
        this.skipSC();
        value2 = string2.decode(this.consume(types2.String));
        this.skipSC();
        if (!this.eof) {
          this.eat(types2.RightParenthesis);
        }
        break;
      default:
        this.error("Url or Function is expected");
    }
    return {
      type: "Url",
      loc: this.getLocation(start, this.tokenStart),
      value: value2
    };
  }
  function generate2(node2) {
    this.token(types2.Url, url2.encode(node2.value));
  }
  Url$2.generate = generate2;
  Url$2.name = name2;
  Url$2.parse = parse2;
  Url$2.structure = structure2;
  return Url$2;
}
var Value$1 = {};
var hasRequiredValue$1;
function requireValue$1() {
  if (hasRequiredValue$1) return Value$1;
  hasRequiredValue$1 = 1;
  const name2 = "Value";
  const structure2 = {
    children: [[]]
  };
  function parse2() {
    const start = this.tokenStart;
    const children = this.readSequence(this.scope.Value);
    return {
      type: "Value",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate2(node2) {
    this.children(node2);
  }
  Value$1.generate = generate2;
  Value$1.name = name2;
  Value$1.parse = parse2;
  Value$1.structure = structure2;
  return Value$1;
}
var WhiteSpace$2 = {};
var hasRequiredWhiteSpace;
function requireWhiteSpace() {
  if (hasRequiredWhiteSpace) return WhiteSpace$2;
  hasRequiredWhiteSpace = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const SPACE2 = Object.freeze({
    type: "WhiteSpace",
    loc: null,
    value: " "
  });
  const name2 = "WhiteSpace";
  const structure2 = {
    value: String
  };
  function parse2() {
    this.eat(types2.WhiteSpace);
    return SPACE2;
  }
  function generate2(node2) {
    this.token(types2.WhiteSpace, node2.value);
  }
  WhiteSpace$2.generate = generate2;
  WhiteSpace$2.name = name2;
  WhiteSpace$2.parse = parse2;
  WhiteSpace$2.structure = structure2;
  return WhiteSpace$2;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node$2;
  hasRequiredNode = 1;
  const AnPlusB2 = /* @__PURE__ */ requireAnPlusB();
  const Atrule2 = /* @__PURE__ */ requireAtrule$1();
  const AtrulePrelude2 = /* @__PURE__ */ requireAtrulePrelude$1();
  const AttributeSelector2 = /* @__PURE__ */ requireAttributeSelector();
  const Block2 = /* @__PURE__ */ requireBlock();
  const Brackets2 = /* @__PURE__ */ requireBrackets();
  const CDC2 = /* @__PURE__ */ requireCDC();
  const CDO2 = /* @__PURE__ */ requireCDO();
  const ClassSelector2 = /* @__PURE__ */ requireClassSelector();
  const Combinator2 = /* @__PURE__ */ requireCombinator();
  const Comment2 = /* @__PURE__ */ requireComment();
  const Condition2 = /* @__PURE__ */ requireCondition();
  const Declaration2 = /* @__PURE__ */ requireDeclaration();
  const DeclarationList2 = /* @__PURE__ */ requireDeclarationList();
  const Dimension2 = /* @__PURE__ */ requireDimension();
  const Feature2 = /* @__PURE__ */ requireFeature();
  const FeatureFunction2 = /* @__PURE__ */ requireFeatureFunction();
  const FeatureRange2 = /* @__PURE__ */ requireFeatureRange();
  const Function = /* @__PURE__ */ require_Function();
  const GeneralEnclosed2 = /* @__PURE__ */ requireGeneralEnclosed();
  const Hash2 = /* @__PURE__ */ requireHash();
  const Identifier2 = /* @__PURE__ */ requireIdentifier();
  const IdSelector2 = /* @__PURE__ */ requireIdSelector();
  const Layer2 = /* @__PURE__ */ requireLayer$1();
  const LayerList2 = /* @__PURE__ */ requireLayerList();
  const MediaQuery2 = /* @__PURE__ */ requireMediaQuery();
  const MediaQueryList2 = /* @__PURE__ */ requireMediaQueryList();
  const NestingSelector2 = /* @__PURE__ */ requireNestingSelector();
  const Nth2 = /* @__PURE__ */ requireNth();
  const Number$12 = /* @__PURE__ */ require_Number();
  const Operator2 = /* @__PURE__ */ requireOperator();
  const Parentheses2 = /* @__PURE__ */ requireParentheses();
  const Percentage2 = /* @__PURE__ */ requirePercentage();
  const PseudoClassSelector2 = /* @__PURE__ */ requirePseudoClassSelector();
  const PseudoElementSelector2 = /* @__PURE__ */ requirePseudoElementSelector();
  const Ratio2 = /* @__PURE__ */ requireRatio();
  const Raw2 = /* @__PURE__ */ requireRaw();
  const Rule2 = /* @__PURE__ */ requireRule();
  const Scope2 = /* @__PURE__ */ requireScope$2();
  const Selector2 = /* @__PURE__ */ requireSelector$1();
  const SelectorList2 = /* @__PURE__ */ requireSelectorList();
  const String$12 = /* @__PURE__ */ require_String();
  const StyleSheet2 = /* @__PURE__ */ requireStyleSheet();
  const SupportsDeclaration2 = /* @__PURE__ */ requireSupportsDeclaration();
  const TypeSelector2 = /* @__PURE__ */ requireTypeSelector();
  const UnicodeRange2 = /* @__PURE__ */ requireUnicodeRange();
  const Url2 = /* @__PURE__ */ requireUrl();
  const Value2 = /* @__PURE__ */ requireValue$1();
  const WhiteSpace2 = /* @__PURE__ */ requireWhiteSpace();
  node$2.AnPlusB = AnPlusB2;
  node$2.Atrule = Atrule2;
  node$2.AtrulePrelude = AtrulePrelude2;
  node$2.AttributeSelector = AttributeSelector2;
  node$2.Block = Block2;
  node$2.Brackets = Brackets2;
  node$2.CDC = CDC2;
  node$2.CDO = CDO2;
  node$2.ClassSelector = ClassSelector2;
  node$2.Combinator = Combinator2;
  node$2.Comment = Comment2;
  node$2.Condition = Condition2;
  node$2.Declaration = Declaration2;
  node$2.DeclarationList = DeclarationList2;
  node$2.Dimension = Dimension2;
  node$2.Feature = Feature2;
  node$2.FeatureFunction = FeatureFunction2;
  node$2.FeatureRange = FeatureRange2;
  node$2.Function = Function;
  node$2.GeneralEnclosed = GeneralEnclosed2;
  node$2.Hash = Hash2;
  node$2.Identifier = Identifier2;
  node$2.IdSelector = IdSelector2;
  node$2.Layer = Layer2;
  node$2.LayerList = LayerList2;
  node$2.MediaQuery = MediaQuery2;
  node$2.MediaQueryList = MediaQueryList2;
  node$2.NestingSelector = NestingSelector2;
  node$2.Nth = Nth2;
  node$2.Number = Number$12;
  node$2.Operator = Operator2;
  node$2.Parentheses = Parentheses2;
  node$2.Percentage = Percentage2;
  node$2.PseudoClassSelector = PseudoClassSelector2;
  node$2.PseudoElementSelector = PseudoElementSelector2;
  node$2.Ratio = Ratio2;
  node$2.Raw = Raw2;
  node$2.Rule = Rule2;
  node$2.Scope = Scope2;
  node$2.Selector = Selector2;
  node$2.SelectorList = SelectorList2;
  node$2.String = String$12;
  node$2.StyleSheet = StyleSheet2;
  node$2.SupportsDeclaration = SupportsDeclaration2;
  node$2.TypeSelector = TypeSelector2;
  node$2.UnicodeRange = UnicodeRange2;
  node$2.Url = Url2;
  node$2.Value = Value2;
  node$2.WhiteSpace = WhiteSpace2;
  return node$2;
}
var lexer$1;
var hasRequiredLexer;
function requireLexer() {
  if (hasRequiredLexer) return lexer$1;
  hasRequiredLexer = 1;
  const genericConst2 = /* @__PURE__ */ requireGenericConst();
  const data2 = /* @__PURE__ */ requireData();
  const index = /* @__PURE__ */ requireNode();
  const lexerConfig2 = {
    generic: true,
    cssWideKeywords: genericConst2.cssWideKeywords,
    ...data2,
    node: index
  };
  lexer$1 = lexerConfig2;
  return lexer$1;
}
var scope$2 = {};
var _default;
var hasRequired_default;
function require_default() {
  if (hasRequired_default) return _default;
  hasRequired_default = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const NUMBERSIGN2 = 35;
  const ASTERISK2 = 42;
  const PLUSSIGN2 = 43;
  const HYPHENMINUS2 = 45;
  const SOLIDUS2 = 47;
  const U2 = 117;
  function defaultRecognizer2(context) {
    switch (this.tokenType) {
      case types2.Hash:
        return this.Hash();
      case types2.Comma:
        return this.Operator();
      case types2.LeftParenthesis:
        return this.Parentheses(this.readSequence, context.recognizer);
      case types2.LeftSquareBracket:
        return this.Brackets(this.readSequence, context.recognizer);
      case types2.String:
        return this.String();
      case types2.Dimension:
        return this.Dimension();
      case types2.Percentage:
        return this.Percentage();
      case types2.Number:
        return this.Number();
      case types2.Function:
        return this.cmpStr(this.tokenStart, this.tokenEnd, "url(") ? this.Url() : this.Function(this.readSequence, context.recognizer);
      case types2.Url:
        return this.Url();
      case types2.Ident:
        if (this.cmpChar(this.tokenStart, U2) && this.cmpChar(this.tokenStart + 1, PLUSSIGN2)) {
          return this.UnicodeRange();
        } else {
          return this.Identifier();
        }
      case types2.Delim: {
        const code2 = this.charCodeAt(this.tokenStart);
        if (code2 === SOLIDUS2 || code2 === ASTERISK2 || code2 === PLUSSIGN2 || code2 === HYPHENMINUS2) {
          return this.Operator();
        }
        if (code2 === NUMBERSIGN2) {
          this.error("Hex or identifier is expected", this.tokenStart + 1);
        }
        break;
      }
    }
  }
  _default = defaultRecognizer2;
  return _default;
}
var atrulePrelude_1;
var hasRequiredAtrulePrelude;
function requireAtrulePrelude() {
  if (hasRequiredAtrulePrelude) return atrulePrelude_1;
  hasRequiredAtrulePrelude = 1;
  const _default2 = /* @__PURE__ */ require_default();
  const atrulePrelude2 = {
    getNode: _default2
  };
  atrulePrelude_1 = atrulePrelude2;
  return atrulePrelude_1;
}
var selector$2;
var hasRequiredSelector;
function requireSelector() {
  if (hasRequiredSelector) return selector$2;
  hasRequiredSelector = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const NUMBERSIGN2 = 35;
  const AMPERSAND2 = 38;
  const ASTERISK2 = 42;
  const PLUSSIGN2 = 43;
  const SOLIDUS2 = 47;
  const FULLSTOP2 = 46;
  const GREATERTHANSIGN2 = 62;
  const VERTICALLINE2 = 124;
  const TILDE2 = 126;
  function onWhiteSpace2(next, children) {
    if (children.last !== null && children.last.type !== "Combinator" && next !== null && next.type !== "Combinator") {
      children.push({
        // FIXME: this.Combinator() should be used instead
        type: "Combinator",
        loc: null,
        name: " "
      });
    }
  }
  function getNode2() {
    switch (this.tokenType) {
      case types2.LeftSquareBracket:
        return this.AttributeSelector();
      case types2.Hash:
        return this.IdSelector();
      case types2.Colon:
        if (this.lookupType(1) === types2.Colon) {
          return this.PseudoElementSelector();
        } else {
          return this.PseudoClassSelector();
        }
      case types2.Ident:
        return this.TypeSelector();
      case types2.Number:
      case types2.Percentage:
        return this.Percentage();
      case types2.Dimension:
        if (this.charCodeAt(this.tokenStart) === FULLSTOP2) {
          this.error("Identifier is expected", this.tokenStart + 1);
        }
        break;
      case types2.Delim: {
        const code2 = this.charCodeAt(this.tokenStart);
        switch (code2) {
          case PLUSSIGN2:
          case GREATERTHANSIGN2:
          case TILDE2:
          case SOLIDUS2:
            return this.Combinator();
          case FULLSTOP2:
            return this.ClassSelector();
          case ASTERISK2:
          case VERTICALLINE2:
            return this.TypeSelector();
          case NUMBERSIGN2:
            return this.IdSelector();
          case AMPERSAND2:
            return this.NestingSelector();
        }
        break;
      }
    }
  }
  const Selector2 = {
    onWhiteSpace: onWhiteSpace2,
    getNode: getNode2
  };
  selector$2 = Selector2;
  return selector$2;
}
var expression;
var hasRequiredExpression;
function requireExpression() {
  if (hasRequiredExpression) return expression;
  hasRequiredExpression = 1;
  function expressionFn2() {
    return this.createSingleNodeList(
      this.Raw(null, false)
    );
  }
  expression = expressionFn2;
  return expression;
}
var _var;
var hasRequired_var;
function require_var() {
  if (hasRequired_var) return _var;
  hasRequired_var = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function varFn2() {
    const children = this.createList();
    this.skipSC();
    children.push(this.Identifier());
    this.skipSC();
    if (this.tokenType === types2.Comma) {
      children.push(this.Operator());
      const startIndex = this.tokenIndex;
      const value2 = this.parseCustomProperty ? this.Value(null) : this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);
      if (value2.type === "Value" && value2.children.isEmpty) {
        for (let offset = startIndex - this.tokenIndex; offset <= 0; offset++) {
          if (this.lookupType(offset) === types2.WhiteSpace) {
            value2.children.appendData({
              type: "WhiteSpace",
              loc: null,
              value: " "
            });
            break;
          }
        }
      }
      children.push(value2);
    }
    return children;
  }
  _var = varFn2;
  return _var;
}
var value_1;
var hasRequiredValue;
function requireValue() {
  if (hasRequiredValue) return value_1;
  hasRequiredValue = 1;
  const _default2 = /* @__PURE__ */ require_default();
  const expression2 = /* @__PURE__ */ requireExpression();
  const _var2 = /* @__PURE__ */ require_var();
  function isPlusMinusOperator2(node2) {
    return node2 !== null && node2.type === "Operator" && (node2.value[node2.value.length - 1] === "-" || node2.value[node2.value.length - 1] === "+");
  }
  const value2 = {
    getNode: _default2,
    onWhiteSpace(next, children) {
      if (isPlusMinusOperator2(next)) {
        next.value = " " + next.value;
      }
      if (isPlusMinusOperator2(children.last)) {
        children.last.value += " ";
      }
    },
    "expression": expression2,
    "var": _var2
  };
  value_1 = value2;
  return value_1;
}
var hasRequiredScope$1;
function requireScope$1() {
  if (hasRequiredScope$1) return scope$2;
  hasRequiredScope$1 = 1;
  const atrulePrelude2 = /* @__PURE__ */ requireAtrulePrelude();
  const selector2 = /* @__PURE__ */ requireSelector();
  const value2 = /* @__PURE__ */ requireValue();
  scope$2.AtrulePrelude = atrulePrelude2;
  scope$2.Selector = selector2;
  scope$2.Value = value2;
  return scope$2;
}
var container_1;
var hasRequiredContainer;
function requireContainer() {
  if (hasRequiredContainer) return container_1;
  hasRequiredContainer = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  const nonContainerNameKeywords2 = /* @__PURE__ */ new Set(["none", "and", "not", "or"]);
  const container2 = {
    parse: {
      prelude() {
        const children = this.createList();
        if (this.tokenType === types2.Ident) {
          const name2 = this.substring(this.tokenStart, this.tokenEnd);
          if (!nonContainerNameKeywords2.has(name2.toLowerCase())) {
            children.push(this.Identifier());
          }
        }
        children.push(this.Condition("container"));
        return children;
      },
      block(nested = false) {
        return this.Block(nested);
      }
    }
  };
  container_1 = container2;
  return container_1;
}
var fontFace_1;
var hasRequiredFontFace;
function requireFontFace() {
  if (hasRequiredFontFace) return fontFace_1;
  hasRequiredFontFace = 1;
  const fontFace2 = {
    parse: {
      prelude: null,
      block() {
        return this.Block(true);
      }
    }
  };
  fontFace_1 = fontFace2;
  return fontFace_1;
}
var _import;
var hasRequired_import;
function require_import() {
  if (hasRequired_import) return _import;
  hasRequired_import = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function parseWithFallback2(parse2, fallback) {
    return this.parseWithFallback(
      () => {
        try {
          return parse2.call(this);
        } finally {
          this.skipSC();
          if (this.lookupNonWSType(0) !== types2.RightParenthesis) {
            this.error();
          }
        }
      },
      fallback || (() => this.Raw(null, true))
    );
  }
  const parseFunctions2 = {
    layer() {
      this.skipSC();
      const children = this.createList();
      const node2 = parseWithFallback2.call(this, this.Layer);
      if (node2.type !== "Raw" || node2.value !== "") {
        children.push(node2);
      }
      return children;
    },
    supports() {
      this.skipSC();
      const children = this.createList();
      const node2 = parseWithFallback2.call(
        this,
        this.Declaration,
        () => parseWithFallback2.call(this, () => this.Condition("supports"))
      );
      if (node2.type !== "Raw" || node2.value !== "") {
        children.push(node2);
      }
      return children;
    }
  };
  const importAtrule2 = {
    parse: {
      prelude() {
        const children = this.createList();
        switch (this.tokenType) {
          case types2.String:
            children.push(this.String());
            break;
          case types2.Url:
          case types2.Function:
            children.push(this.Url());
            break;
          default:
            this.error("String or url() is expected");
        }
        this.skipSC();
        if (this.tokenType === types2.Ident && this.cmpStr(this.tokenStart, this.tokenEnd, "layer")) {
          children.push(this.Identifier());
        } else if (this.tokenType === types2.Function && this.cmpStr(this.tokenStart, this.tokenEnd, "layer(")) {
          children.push(this.Function(null, parseFunctions2));
        }
        this.skipSC();
        if (this.tokenType === types2.Function && this.cmpStr(this.tokenStart, this.tokenEnd, "supports(")) {
          children.push(this.Function(null, parseFunctions2));
        }
        if (this.lookupNonWSType(0) === types2.Ident || this.lookupNonWSType(0) === types2.LeftParenthesis) {
          children.push(this.MediaQueryList());
        }
        return children;
      },
      block: null
    }
  };
  _import = importAtrule2;
  return _import;
}
var layer_1;
var hasRequiredLayer;
function requireLayer() {
  if (hasRequiredLayer) return layer_1;
  hasRequiredLayer = 1;
  const layer2 = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.LayerList()
        );
      },
      block() {
        return this.Block(false);
      }
    }
  };
  layer_1 = layer2;
  return layer_1;
}
var media_1;
var hasRequiredMedia;
function requireMedia() {
  if (hasRequiredMedia) return media_1;
  hasRequiredMedia = 1;
  const media2 = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.MediaQueryList()
        );
      },
      block(nested = false) {
        return this.Block(nested);
      }
    }
  };
  media_1 = media2;
  return media_1;
}
var nest_1;
var hasRequiredNest;
function requireNest() {
  if (hasRequiredNest) return nest_1;
  hasRequiredNest = 1;
  const nest2 = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.SelectorList()
        );
      },
      block() {
        return this.Block(true);
      }
    }
  };
  nest_1 = nest2;
  return nest_1;
}
var page_1;
var hasRequiredPage;
function requirePage() {
  if (hasRequiredPage) return page_1;
  hasRequiredPage = 1;
  const page2 = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.SelectorList()
        );
      },
      block() {
        return this.Block(true);
      }
    }
  };
  page_1 = page2;
  return page_1;
}
var scope_1;
var hasRequiredScope;
function requireScope() {
  if (hasRequiredScope) return scope_1;
  hasRequiredScope = 1;
  const scope2 = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.Scope()
        );
      },
      block(nested = false) {
        return this.Block(nested);
      }
    }
  };
  scope_1 = scope2;
  return scope_1;
}
var startingStyle_1;
var hasRequiredStartingStyle;
function requireStartingStyle() {
  if (hasRequiredStartingStyle) return startingStyle_1;
  hasRequiredStartingStyle = 1;
  const startingStyle2 = {
    parse: {
      prelude: null,
      block(nested = false) {
        return this.Block(nested);
      }
    }
  };
  startingStyle_1 = startingStyle2;
  return startingStyle_1;
}
var supports_1;
var hasRequiredSupports;
function requireSupports() {
  if (hasRequiredSupports) return supports_1;
  hasRequiredSupports = 1;
  const supports2 = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.Condition("supports")
        );
      },
      block(nested = false) {
        return this.Block(nested);
      }
    }
  };
  supports_1 = supports2;
  return supports_1;
}
var atrule_1;
var hasRequiredAtrule;
function requireAtrule() {
  if (hasRequiredAtrule) return atrule_1;
  hasRequiredAtrule = 1;
  const container2 = /* @__PURE__ */ requireContainer();
  const fontFace2 = /* @__PURE__ */ requireFontFace();
  const _import2 = /* @__PURE__ */ require_import();
  const layer2 = /* @__PURE__ */ requireLayer();
  const media2 = /* @__PURE__ */ requireMedia();
  const nest2 = /* @__PURE__ */ requireNest();
  const page2 = /* @__PURE__ */ requirePage();
  const scope2 = /* @__PURE__ */ requireScope();
  const startingStyle2 = /* @__PURE__ */ requireStartingStyle();
  const supports2 = /* @__PURE__ */ requireSupports();
  const atrule2 = {
    container: container2,
    "font-face": fontFace2,
    import: _import2,
    layer: layer2,
    media: media2,
    nest: nest2,
    page: page2,
    scope: scope2,
    "starting-style": startingStyle2,
    supports: supports2
  };
  atrule_1 = atrule2;
  return atrule_1;
}
var lang = {};
var hasRequiredLang;
function requireLang() {
  if (hasRequiredLang) return lang;
  hasRequiredLang = 1;
  const types2 = /* @__PURE__ */ requireTypes();
  function parseLanguageRangeList2() {
    const children = this.createList();
    this.skipSC();
    loop: while (!this.eof) {
      switch (this.tokenType) {
        case types2.Ident:
          children.push(this.Identifier());
          break;
        case types2.String:
          children.push(this.String());
          break;
        case types2.Comma:
          children.push(this.Operator());
          break;
        case types2.RightParenthesis:
          break loop;
        default:
          this.error("Identifier, string or comma is expected");
      }
      this.skipSC();
    }
    return children;
  }
  lang.parseLanguageRangeList = parseLanguageRangeList2;
  return lang;
}
var pseudo_1;
var hasRequiredPseudo;
function requirePseudo() {
  if (hasRequiredPseudo) return pseudo_1;
  hasRequiredPseudo = 1;
  const lang2 = /* @__PURE__ */ requireLang();
  const selectorList2 = {
    parse() {
      return this.createSingleNodeList(
        this.SelectorList()
      );
    }
  };
  const selector2 = {
    parse() {
      return this.createSingleNodeList(
        this.Selector()
      );
    }
  };
  const identList2 = {
    parse() {
      return this.createSingleNodeList(
        this.Identifier()
      );
    }
  };
  const langList2 = {
    parse: lang2.parseLanguageRangeList
  };
  const nth2 = {
    parse() {
      return this.createSingleNodeList(
        this.Nth()
      );
    }
  };
  const pseudo2 = {
    "dir": identList2,
    "has": selectorList2,
    "lang": langList2,
    "matches": selectorList2,
    "is": selectorList2,
    "-moz-any": selectorList2,
    "-webkit-any": selectorList2,
    "where": selectorList2,
    "not": selectorList2,
    "nth-child": nth2,
    "nth-last-child": nth2,
    "nth-last-of-type": nth2,
    "nth-of-type": nth2,
    "slotted": selector2,
    "host": selector2,
    "host-context": selector2
  };
  pseudo_1 = pseudo2;
  return pseudo_1;
}
var indexParse = {};
var hasRequiredIndexParse;
function requireIndexParse() {
  if (hasRequiredIndexParse) return indexParse;
  hasRequiredIndexParse = 1;
  const AnPlusB2 = /* @__PURE__ */ requireAnPlusB();
  const Atrule2 = /* @__PURE__ */ requireAtrule$1();
  const AtrulePrelude2 = /* @__PURE__ */ requireAtrulePrelude$1();
  const AttributeSelector2 = /* @__PURE__ */ requireAttributeSelector();
  const Block2 = /* @__PURE__ */ requireBlock();
  const Brackets2 = /* @__PURE__ */ requireBrackets();
  const CDC2 = /* @__PURE__ */ requireCDC();
  const CDO2 = /* @__PURE__ */ requireCDO();
  const ClassSelector2 = /* @__PURE__ */ requireClassSelector();
  const Combinator2 = /* @__PURE__ */ requireCombinator();
  const Comment2 = /* @__PURE__ */ requireComment();
  const Condition2 = /* @__PURE__ */ requireCondition();
  const Declaration2 = /* @__PURE__ */ requireDeclaration();
  const DeclarationList2 = /* @__PURE__ */ requireDeclarationList();
  const Dimension2 = /* @__PURE__ */ requireDimension();
  const Feature2 = /* @__PURE__ */ requireFeature();
  const FeatureFunction2 = /* @__PURE__ */ requireFeatureFunction();
  const FeatureRange2 = /* @__PURE__ */ requireFeatureRange();
  const Function = /* @__PURE__ */ require_Function();
  const GeneralEnclosed2 = /* @__PURE__ */ requireGeneralEnclosed();
  const Hash2 = /* @__PURE__ */ requireHash();
  const Identifier2 = /* @__PURE__ */ requireIdentifier();
  const IdSelector2 = /* @__PURE__ */ requireIdSelector();
  const Layer2 = /* @__PURE__ */ requireLayer$1();
  const LayerList2 = /* @__PURE__ */ requireLayerList();
  const MediaQuery2 = /* @__PURE__ */ requireMediaQuery();
  const MediaQueryList2 = /* @__PURE__ */ requireMediaQueryList();
  const NestingSelector2 = /* @__PURE__ */ requireNestingSelector();
  const Nth2 = /* @__PURE__ */ requireNth();
  const Number2 = /* @__PURE__ */ require_Number();
  const Operator2 = /* @__PURE__ */ requireOperator();
  const Parentheses2 = /* @__PURE__ */ requireParentheses();
  const Percentage2 = /* @__PURE__ */ requirePercentage();
  const PseudoClassSelector2 = /* @__PURE__ */ requirePseudoClassSelector();
  const PseudoElementSelector2 = /* @__PURE__ */ requirePseudoElementSelector();
  const Ratio2 = /* @__PURE__ */ requireRatio();
  const Raw2 = /* @__PURE__ */ requireRaw();
  const Rule2 = /* @__PURE__ */ requireRule();
  const Scope2 = /* @__PURE__ */ requireScope$2();
  const Selector2 = /* @__PURE__ */ requireSelector$1();
  const SelectorList2 = /* @__PURE__ */ requireSelectorList();
  const String2 = /* @__PURE__ */ require_String();
  const StyleSheet2 = /* @__PURE__ */ requireStyleSheet();
  const SupportsDeclaration2 = /* @__PURE__ */ requireSupportsDeclaration();
  const TypeSelector2 = /* @__PURE__ */ requireTypeSelector();
  const UnicodeRange2 = /* @__PURE__ */ requireUnicodeRange();
  const Url2 = /* @__PURE__ */ requireUrl();
  const Value2 = /* @__PURE__ */ requireValue$1();
  const WhiteSpace2 = /* @__PURE__ */ requireWhiteSpace();
  indexParse.AnPlusB = AnPlusB2.parse;
  indexParse.Atrule = Atrule2.parse;
  indexParse.AtrulePrelude = AtrulePrelude2.parse;
  indexParse.AttributeSelector = AttributeSelector2.parse;
  indexParse.Block = Block2.parse;
  indexParse.Brackets = Brackets2.parse;
  indexParse.CDC = CDC2.parse;
  indexParse.CDO = CDO2.parse;
  indexParse.ClassSelector = ClassSelector2.parse;
  indexParse.Combinator = Combinator2.parse;
  indexParse.Comment = Comment2.parse;
  indexParse.Condition = Condition2.parse;
  indexParse.Declaration = Declaration2.parse;
  indexParse.DeclarationList = DeclarationList2.parse;
  indexParse.Dimension = Dimension2.parse;
  indexParse.Feature = Feature2.parse;
  indexParse.FeatureFunction = FeatureFunction2.parse;
  indexParse.FeatureRange = FeatureRange2.parse;
  indexParse.Function = Function.parse;
  indexParse.GeneralEnclosed = GeneralEnclosed2.parse;
  indexParse.Hash = Hash2.parse;
  indexParse.Identifier = Identifier2.parse;
  indexParse.IdSelector = IdSelector2.parse;
  indexParse.Layer = Layer2.parse;
  indexParse.LayerList = LayerList2.parse;
  indexParse.MediaQuery = MediaQuery2.parse;
  indexParse.MediaQueryList = MediaQueryList2.parse;
  indexParse.NestingSelector = NestingSelector2.parse;
  indexParse.Nth = Nth2.parse;
  indexParse.Number = Number2.parse;
  indexParse.Operator = Operator2.parse;
  indexParse.Parentheses = Parentheses2.parse;
  indexParse.Percentage = Percentage2.parse;
  indexParse.PseudoClassSelector = PseudoClassSelector2.parse;
  indexParse.PseudoElementSelector = PseudoElementSelector2.parse;
  indexParse.Ratio = Ratio2.parse;
  indexParse.Raw = Raw2.parse;
  indexParse.Rule = Rule2.parse;
  indexParse.Scope = Scope2.parse;
  indexParse.Selector = Selector2.parse;
  indexParse.SelectorList = SelectorList2.parse;
  indexParse.String = String2.parse;
  indexParse.StyleSheet = StyleSheet2.parse;
  indexParse.SupportsDeclaration = SupportsDeclaration2.parse;
  indexParse.TypeSelector = TypeSelector2.parse;
  indexParse.UnicodeRange = UnicodeRange2.parse;
  indexParse.Url = Url2.parse;
  indexParse.Value = Value2.parse;
  indexParse.WhiteSpace = WhiteSpace2.parse;
  return indexParse;
}
var parser;
var hasRequiredParser;
function requireParser() {
  if (hasRequiredParser) return parser;
  hasRequiredParser = 1;
  const index = /* @__PURE__ */ requireScope$1();
  const index$1 = /* @__PURE__ */ requireAtrule();
  const index$2 = /* @__PURE__ */ requirePseudo();
  const indexParse2 = /* @__PURE__ */ requireIndexParse();
  const config = {
    parseContext: {
      default: "StyleSheet",
      stylesheet: "StyleSheet",
      atrule: "Atrule",
      atrulePrelude(options) {
        return this.AtrulePrelude(options.atrule ? String(options.atrule) : null);
      },
      mediaQueryList: "MediaQueryList",
      mediaQuery: "MediaQuery",
      condition(options) {
        return this.Condition(options.kind);
      },
      rule: "Rule",
      selectorList: "SelectorList",
      selector: "Selector",
      block() {
        return this.Block(true);
      },
      declarationList: "DeclarationList",
      declaration: "Declaration",
      value: "Value"
    },
    features: {
      supports: {
        selector() {
          return this.Selector();
        }
      },
      container: {
        style() {
          return this.Declaration();
        }
      }
    },
    scope: index,
    atrule: index$1,
    pseudo: index$2,
    node: indexParse2
  };
  parser = config;
  return parser;
}
var walker;
var hasRequiredWalker;
function requireWalker() {
  if (hasRequiredWalker) return walker;
  hasRequiredWalker = 1;
  const index = /* @__PURE__ */ requireNode();
  const config = {
    node: index
  };
  walker = config;
  return walker;
}
var syntax_1;
var hasRequiredSyntax;
function requireSyntax() {
  if (hasRequiredSyntax) return syntax_1;
  hasRequiredSyntax = 1;
  const create2 = /* @__PURE__ */ requireCreate();
  const lexer2 = /* @__PURE__ */ requireLexer();
  const parser2 = /* @__PURE__ */ requireParser();
  const walker2 = /* @__PURE__ */ requireWalker();
  const syntax2 = create2({
    ...lexer2,
    ...parser2,
    ...walker2
  });
  syntax_1 = syntax2;
  return syntax_1;
}
var version$1 = {};
const version = "3.2.1";
const require$$0 = {
  version
};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version$1;
  hasRequiredVersion = 1;
  const { version: version2 } = require$$0;
  version$1.version = version2;
  return version$1;
}
var definitionSyntax = {};
var hasRequiredDefinitionSyntax;
function requireDefinitionSyntax() {
  if (hasRequiredDefinitionSyntax) return definitionSyntax;
  hasRequiredDefinitionSyntax = 1;
  const SyntaxError2 = /* @__PURE__ */ require_SyntaxError();
  const generate2 = /* @__PURE__ */ requireGenerate();
  const parse2 = /* @__PURE__ */ requireParse();
  const walk2 = /* @__PURE__ */ requireWalk();
  definitionSyntax.SyntaxError = SyntaxError2.SyntaxError;
  definitionSyntax.generate = generate2.generate;
  definitionSyntax.parse = parse2.parse;
  definitionSyntax.walk = walk2.walk;
  return definitionSyntax;
}
var clone$1 = {};
var hasRequiredClone;
function requireClone() {
  if (hasRequiredClone) return clone$1;
  hasRequiredClone = 1;
  const List2 = /* @__PURE__ */ requireList();
  function clone2(node2) {
    const result = {};
    for (const key of Object.keys(node2)) {
      let value2 = node2[key];
      if (value2) {
        if (Array.isArray(value2) || value2 instanceof List2.List) {
          value2 = value2.map(clone2);
        } else if (value2.constructor === Object) {
          value2 = clone2(value2);
        }
      }
      result[key] = value2;
    }
    return result;
  }
  clone$1.clone = clone2;
  return clone$1;
}
var ident = {};
var hasRequiredIdent;
function requireIdent() {
  if (hasRequiredIdent) return ident;
  hasRequiredIdent = 1;
  const charCodeDefinitions2 = /* @__PURE__ */ requireCharCodeDefinitions();
  const utils2 = /* @__PURE__ */ requireUtils();
  const REVERSE_SOLIDUS2 = 92;
  function decode2(str) {
    const end = str.length - 1;
    let decoded = "";
    for (let i = 0; i < str.length; i++) {
      let code2 = str.charCodeAt(i);
      if (code2 === REVERSE_SOLIDUS2) {
        if (i === end) {
          break;
        }
        code2 = str.charCodeAt(++i);
        if (charCodeDefinitions2.isValidEscape(REVERSE_SOLIDUS2, code2)) {
          const escapeStart = i - 1;
          const escapeEnd = utils2.consumeEscaped(str, escapeStart);
          i = escapeEnd - 1;
          decoded += utils2.decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
        } else {
          if (code2 === 13 && str.charCodeAt(i + 1) === 10) {
            i++;
          }
        }
      } else {
        decoded += str[i];
      }
    }
    return decoded;
  }
  function encode2(str) {
    let encoded = "";
    if (str.length === 1 && str.charCodeAt(0) === 45) {
      return "\\-";
    }
    for (let i = 0; i < str.length; i++) {
      const code2 = str.charCodeAt(i);
      if (code2 === 0) {
        encoded += "�";
        continue;
      }
      if (
        // If the character is in the range [\1-\1f] (U+0001 to U+001F) or is U+007F ...
        // Note: Do not compare with 0x0001 since 0x0000 is precessed before
        code2 <= 31 || code2 === 127 || // [or] ... is in the range [0-9] (U+0030 to U+0039),
        code2 >= 48 && code2 <= 57 && // If the character is the first character ...
        (i === 0 || // If the character is the second character ... and the first character is a "-" (U+002D)
        i === 1 && str.charCodeAt(0) === 45)
      ) {
        encoded += "\\" + code2.toString(16) + " ";
        continue;
      }
      if (charCodeDefinitions2.isName(code2)) {
        encoded += str.charAt(i);
      } else {
        encoded += "\\" + str.charAt(i);
      }
    }
    return encoded;
  }
  ident.decode = decode2;
  ident.encode = encode2;
  return ident;
}
var hasRequiredCjs;
function requireCjs() {
  if (hasRequiredCjs) return cjs;
  hasRequiredCjs = 1;
  const index$1 = /* @__PURE__ */ requireSyntax();
  const version2 = /* @__PURE__ */ requireVersion();
  const create2 = /* @__PURE__ */ requireCreate();
  const List2 = /* @__PURE__ */ requireList();
  const Lexer2 = /* @__PURE__ */ requireLexer$1();
  const index = /* @__PURE__ */ requireDefinitionSyntax();
  const clone2 = /* @__PURE__ */ requireClone();
  const names$12 = /* @__PURE__ */ requireNames();
  const ident2 = /* @__PURE__ */ requireIdent();
  const string2 = /* @__PURE__ */ requireString();
  const url2 = /* @__PURE__ */ requireUrl$1();
  const types2 = /* @__PURE__ */ requireTypes();
  const names2 = /* @__PURE__ */ requireNames$1();
  const TokenStream2 = /* @__PURE__ */ requireTokenStream();
  const OffsetToLocation2 = /* @__PURE__ */ requireOffsetToLocation();
  const {
    tokenize: tokenize2,
    parse: parse2,
    generate: generate2,
    lexer: lexer2,
    createLexer: createLexer2,
    walk: walk2,
    find: find2,
    findLast: findLast2,
    findAll: findAll2,
    toPlainObject: toPlainObject2,
    fromPlainObject: fromPlainObject2,
    fork: fork2
  } = index$1;
  cjs.version = version2.version;
  cjs.createSyntax = create2;
  cjs.List = List2.List;
  cjs.Lexer = Lexer2.Lexer;
  cjs.definitionSyntax = index;
  cjs.clone = clone2.clone;
  cjs.isCustomProperty = names$12.isCustomProperty;
  cjs.keyword = names$12.keyword;
  cjs.property = names$12.property;
  cjs.vendorPrefix = names$12.vendorPrefix;
  cjs.ident = ident2;
  cjs.string = string2;
  cjs.url = url2;
  cjs.tokenTypes = types2;
  cjs.tokenNames = names2;
  cjs.TokenStream = TokenStream2.TokenStream;
  cjs.OffsetToLocation = OffsetToLocation2.OffsetToLocation;
  cjs.createLexer = createLexer2;
  cjs.find = find2;
  cjs.findAll = findAll2;
  cjs.findLast = findLast2;
  cjs.fork = fork2;
  cjs.fromPlainObject = fromPlainObject2;
  cjs.generate = generate2;
  cjs.lexer = lexer2;
  cjs.parse = parse2;
  cjs.toPlainObject = toPlainObject2;
  cjs.tokenize = tokenize2;
  cjs.walk = walk2;
  return cjs;
}
const EOF$1 = 0;
const Ident = 1;
const Function$2 = 2;
const AtKeyword = 3;
const Hash$1 = 4;
const String$2 = 5;
const BadString = 6;
const Url$1 = 7;
const BadUrl = 8;
const Delim = 9;
const Number$2 = 10;
const Percentage$1 = 11;
const Dimension$1 = 12;
const WhiteSpace$1 = 13;
const CDO$1 = 14;
const CDC$1 = 15;
const Colon = 16;
const Semicolon = 17;
const Comma = 18;
const LeftSquareBracket = 19;
const RightSquareBracket = 20;
const LeftParenthesis = 21;
const RightParenthesis = 22;
const LeftCurlyBracket = 23;
const RightCurlyBracket = 24;
const Comment$1 = 25;
const EOF = 0;
function isDigit(code2) {
  return code2 >= 48 && code2 <= 57;
}
function isHexDigit(code2) {
  return isDigit(code2) || // 0 .. 9
  code2 >= 65 && code2 <= 70 || // A .. F
  code2 >= 97 && code2 <= 102;
}
function isUppercaseLetter(code2) {
  return code2 >= 65 && code2 <= 90;
}
function isLowercaseLetter(code2) {
  return code2 >= 97 && code2 <= 122;
}
function isLetter(code2) {
  return isUppercaseLetter(code2) || isLowercaseLetter(code2);
}
function isNonAscii(code2) {
  return code2 >= 128;
}
function isNameStart(code2) {
  return isLetter(code2) || isNonAscii(code2) || code2 === 95;
}
function isName(code2) {
  return isNameStart(code2) || isDigit(code2) || code2 === 45;
}
function isNonPrintable(code2) {
  return code2 >= 0 && code2 <= 8 || code2 === 11 || code2 >= 14 && code2 <= 31 || code2 === 127;
}
function isNewline(code2) {
  return code2 === 10 || code2 === 13 || code2 === 12;
}
function isWhiteSpace(code2) {
  return isNewline(code2) || code2 === 32 || code2 === 9;
}
function isValidEscape(first, second) {
  if (first !== 92) {
    return false;
  }
  if (isNewline(second) || second === EOF) {
    return false;
  }
  return true;
}
function isIdentifierStart(first, second, third) {
  if (first === 45) {
    return isNameStart(second) || second === 45 || isValidEscape(second, third);
  }
  if (isNameStart(first)) {
    return true;
  }
  if (first === 92) {
    return isValidEscape(first, second);
  }
  return false;
}
function isNumberStart(first, second, third) {
  if (first === 43 || first === 45) {
    if (isDigit(second)) {
      return 2;
    }
    return second === 46 && isDigit(third) ? 3 : 0;
  }
  if (first === 46) {
    return isDigit(second) ? 2 : 0;
  }
  if (isDigit(first)) {
    return 1;
  }
  return 0;
}
function isBOM(code2) {
  if (code2 === 65279) {
    return 1;
  }
  if (code2 === 65534) {
    return 1;
  }
  return 0;
}
const CATEGORY = new Array(128);
const EofCategory = 128;
const WhiteSpaceCategory = 130;
const DigitCategory = 131;
const NameStartCategory = 132;
const NonPrintableCategory = 133;
for (let i = 0; i < CATEGORY.length; i++) {
  CATEGORY[i] = isWhiteSpace(i) && WhiteSpaceCategory || isDigit(i) && DigitCategory || isNameStart(i) && NameStartCategory || isNonPrintable(i) && NonPrintableCategory || i || EofCategory;
}
function charCodeCategory(code2) {
  return code2 < 128 ? CATEGORY[code2] : NameStartCategory;
}
function getCharCode(source, offset) {
  return offset < source.length ? source.charCodeAt(offset) : 0;
}
function getNewlineLength(source, offset, code2) {
  if (code2 === 13 && getCharCode(source, offset + 1) === 10) {
    return 2;
  }
  return 1;
}
function cmpChar(testStr, offset, referenceCode) {
  let code2 = testStr.charCodeAt(offset);
  if (isUppercaseLetter(code2)) {
    code2 = code2 | 32;
  }
  return code2 === referenceCode;
}
function cmpStr(testStr, start, end, referenceStr) {
  if (end - start !== referenceStr.length) {
    return false;
  }
  if (start < 0 || end > testStr.length) {
    return false;
  }
  for (let i = start; i < end; i++) {
    const referenceCode = referenceStr.charCodeAt(i - start);
    let testCode = testStr.charCodeAt(i);
    if (isUppercaseLetter(testCode)) {
      testCode = testCode | 32;
    }
    if (testCode !== referenceCode) {
      return false;
    }
  }
  return true;
}
function findWhiteSpaceStart(source, offset) {
  for (; offset >= 0; offset--) {
    if (!isWhiteSpace(source.charCodeAt(offset))) {
      break;
    }
  }
  return offset + 1;
}
function findWhiteSpaceEnd(source, offset) {
  for (; offset < source.length; offset++) {
    if (!isWhiteSpace(source.charCodeAt(offset))) {
      break;
    }
  }
  return offset;
}
function findDecimalNumberEnd(source, offset) {
  for (; offset < source.length; offset++) {
    if (!isDigit(source.charCodeAt(offset))) {
      break;
    }
  }
  return offset;
}
function consumeEscaped(source, offset) {
  offset += 2;
  if (isHexDigit(getCharCode(source, offset - 1))) {
    for (const maxOffset = Math.min(source.length, offset + 5); offset < maxOffset; offset++) {
      if (!isHexDigit(getCharCode(source, offset))) {
        break;
      }
    }
    const code2 = getCharCode(source, offset);
    if (isWhiteSpace(code2)) {
      offset += getNewlineLength(source, offset, code2);
    }
  }
  return offset;
}
function consumeName(source, offset) {
  for (; offset < source.length; offset++) {
    const code2 = source.charCodeAt(offset);
    if (isName(code2)) {
      continue;
    }
    if (isValidEscape(code2, getCharCode(source, offset + 1))) {
      offset = consumeEscaped(source, offset) - 1;
      continue;
    }
    break;
  }
  return offset;
}
function consumeNumber(source, offset) {
  let code2 = source.charCodeAt(offset);
  if (code2 === 43 || code2 === 45) {
    code2 = source.charCodeAt(offset += 1);
  }
  if (isDigit(code2)) {
    offset = findDecimalNumberEnd(source, offset + 1);
    code2 = source.charCodeAt(offset);
  }
  if (code2 === 46 && isDigit(source.charCodeAt(offset + 1))) {
    offset += 2;
    offset = findDecimalNumberEnd(source, offset);
  }
  if (cmpChar(
    source,
    offset,
    101
    /* e */
  )) {
    let sign = 0;
    code2 = source.charCodeAt(offset + 1);
    if (code2 === 45 || code2 === 43) {
      sign = 1;
      code2 = source.charCodeAt(offset + 2);
    }
    if (isDigit(code2)) {
      offset = findDecimalNumberEnd(source, offset + 1 + sign + 1);
    }
  }
  return offset;
}
function consumeBadUrlRemnants(source, offset) {
  for (; offset < source.length; offset++) {
    const code2 = source.charCodeAt(offset);
    if (code2 === 41) {
      offset++;
      break;
    }
    if (isValidEscape(code2, getCharCode(source, offset + 1))) {
      offset = consumeEscaped(source, offset);
    }
  }
  return offset;
}
function decodeEscaped(escaped) {
  if (escaped.length === 1 && !isHexDigit(escaped.charCodeAt(0))) {
    return escaped[0];
  }
  let code2 = parseInt(escaped, 16);
  if (code2 === 0 || // If this number is zero,
  code2 >= 55296 && code2 <= 57343 || // or is for a surrogate,
  code2 > 1114111) {
    code2 = 65533;
  }
  return String.fromCodePoint(code2);
}
const tokenNames = [
  "EOF-token",
  "ident-token",
  "function-token",
  "at-keyword-token",
  "hash-token",
  "string-token",
  "bad-string-token",
  "url-token",
  "bad-url-token",
  "delim-token",
  "number-token",
  "percentage-token",
  "dimension-token",
  "whitespace-token",
  "CDO-token",
  "CDC-token",
  "colon-token",
  "semicolon-token",
  "comma-token",
  "[-token",
  "]-token",
  "(-token",
  ")-token",
  "{-token",
  "}-token",
  "comment-token"
];
const MIN_SIZE = 16 * 1024;
function adoptBuffer(buffer = null, size) {
  if (buffer === null || buffer.length < size) {
    return new Uint32Array(Math.max(size + 1024, MIN_SIZE));
  }
  return buffer;
}
const N$4 = 10;
const F$2 = 12;
const R$2 = 13;
function computeLinesAndColumns(host) {
  const source = host.source;
  const sourceLength = source.length;
  const startOffset = source.length > 0 ? isBOM(source.charCodeAt(0)) : 0;
  const lines = adoptBuffer(host.lines, sourceLength);
  const columns = adoptBuffer(host.columns, sourceLength);
  let line = host.startLine;
  let column = host.startColumn;
  for (let i = startOffset; i < sourceLength; i++) {
    const code2 = source.charCodeAt(i);
    lines[i] = line;
    columns[i] = column++;
    if (code2 === N$4 || code2 === R$2 || code2 === F$2) {
      if (code2 === R$2 && i + 1 < sourceLength && source.charCodeAt(i + 1) === N$4) {
        i++;
        lines[i] = line;
        columns[i] = column;
      }
      line++;
      column = 1;
    }
  }
  lines[sourceLength] = line;
  columns[sourceLength] = column;
  host.lines = lines;
  host.columns = columns;
  host.computed = true;
}
class OffsetToLocation {
  constructor(source, startOffset, startLine, startColumn) {
    this.setSource(source, startOffset, startLine, startColumn);
    this.lines = null;
    this.columns = null;
  }
  setSource(source = "", startOffset = 0, startLine = 1, startColumn = 1) {
    this.source = source;
    this.startOffset = startOffset;
    this.startLine = startLine;
    this.startColumn = startColumn;
    this.computed = false;
  }
  getLocation(offset, filename) {
    if (!this.computed) {
      computeLinesAndColumns(this);
    }
    return {
      source: filename,
      offset: this.startOffset + offset,
      line: this.lines[offset],
      column: this.columns[offset]
    };
  }
  getLocationRange(start, end, filename) {
    if (!this.computed) {
      computeLinesAndColumns(this);
    }
    return {
      source: filename,
      start: {
        offset: this.startOffset + start,
        line: this.lines[start],
        column: this.columns[start]
      },
      end: {
        offset: this.startOffset + end,
        line: this.lines[end],
        column: this.columns[end]
      }
    };
  }
}
const OFFSET_MASK = 16777215;
const TYPE_SHIFT = 24;
const BLOCK_OPEN_TOKEN = 1;
const BLOCK_CLOSE_TOKEN = 2;
const balancePair$1 = new Uint8Array(32);
balancePair$1[Function$2] = RightParenthesis;
balancePair$1[LeftParenthesis] = RightParenthesis;
balancePair$1[LeftSquareBracket] = RightSquareBracket;
balancePair$1[LeftCurlyBracket] = RightCurlyBracket;
const blockTokens = new Uint8Array(32);
blockTokens[Function$2] = BLOCK_OPEN_TOKEN;
blockTokens[LeftParenthesis] = BLOCK_OPEN_TOKEN;
blockTokens[LeftSquareBracket] = BLOCK_OPEN_TOKEN;
blockTokens[LeftCurlyBracket] = BLOCK_OPEN_TOKEN;
blockTokens[RightParenthesis] = BLOCK_CLOSE_TOKEN;
blockTokens[RightSquareBracket] = BLOCK_CLOSE_TOKEN;
blockTokens[RightCurlyBracket] = BLOCK_CLOSE_TOKEN;
function boundIndex(index, min, max) {
  return index < min ? min : index > max ? max : index;
}
class TokenStream {
  constructor(source, tokenize2) {
    this.setSource(source, tokenize2);
  }
  reset() {
    this.eof = false;
    this.tokenIndex = -1;
    this.tokenType = 0;
    this.tokenStart = this.firstCharOffset;
    this.tokenEnd = this.firstCharOffset;
  }
  setSource(source = "", tokenize2 = () => {
  }) {
    source = String(source || "");
    const sourceLength = source.length;
    const offsetAndType = adoptBuffer(this.offsetAndType, source.length + 1);
    const balance = adoptBuffer(this.balance, source.length + 1);
    let tokenCount = 0;
    let firstCharOffset = -1;
    let balanceCloseType = 0;
    let balanceStart = source.length;
    this.offsetAndType = null;
    this.balance = null;
    balance.fill(0);
    tokenize2(source, (type, start, end) => {
      const index = tokenCount++;
      offsetAndType[index] = type << TYPE_SHIFT | end;
      if (firstCharOffset === -1) {
        firstCharOffset = start;
      }
      balance[index] = balanceStart;
      if (type === balanceCloseType) {
        const prevBalanceStart = balance[balanceStart];
        balance[balanceStart] = index;
        balanceStart = prevBalanceStart;
        balanceCloseType = balancePair$1[offsetAndType[prevBalanceStart] >> TYPE_SHIFT];
      } else if (this.isBlockOpenerTokenType(type)) {
        balanceStart = index;
        balanceCloseType = balancePair$1[type];
      }
    });
    offsetAndType[tokenCount] = EOF$1 << TYPE_SHIFT | sourceLength;
    balance[tokenCount] = tokenCount;
    for (let i = 0; i < tokenCount; i++) {
      const balanceStart2 = balance[i];
      if (balanceStart2 <= i) {
        const balanceEnd = balance[balanceStart2];
        if (balanceEnd !== i) {
          balance[i] = balanceEnd;
        }
      } else if (balanceStart2 > tokenCount) {
        balance[i] = tokenCount;
      }
    }
    this.source = source;
    this.firstCharOffset = firstCharOffset === -1 ? 0 : firstCharOffset;
    this.tokenCount = tokenCount;
    this.offsetAndType = offsetAndType;
    this.balance = balance;
    this.reset();
    this.next();
  }
  lookupType(offset) {
    offset += this.tokenIndex;
    if (offset < this.tokenCount) {
      return this.offsetAndType[offset] >> TYPE_SHIFT;
    }
    return EOF$1;
  }
  lookupTypeNonSC(idx) {
    for (let offset = this.tokenIndex; offset < this.tokenCount; offset++) {
      const tokenType2 = this.offsetAndType[offset] >> TYPE_SHIFT;
      if (tokenType2 !== WhiteSpace$1 && tokenType2 !== Comment$1) {
        if (idx-- === 0) {
          return tokenType2;
        }
      }
    }
    return EOF$1;
  }
  lookupOffset(offset) {
    offset += this.tokenIndex;
    if (offset < this.tokenCount) {
      return this.offsetAndType[offset - 1] & OFFSET_MASK;
    }
    return this.source.length;
  }
  lookupOffsetNonSC(idx) {
    for (let offset = this.tokenIndex; offset < this.tokenCount; offset++) {
      const tokenType2 = this.offsetAndType[offset] >> TYPE_SHIFT;
      if (tokenType2 !== WhiteSpace$1 && tokenType2 !== Comment$1) {
        if (idx-- === 0) {
          return offset - this.tokenIndex;
        }
      }
    }
    return EOF$1;
  }
  lookupValue(offset, referenceStr) {
    offset += this.tokenIndex;
    if (offset < this.tokenCount) {
      return cmpStr(
        this.source,
        this.offsetAndType[offset - 1] & OFFSET_MASK,
        this.offsetAndType[offset] & OFFSET_MASK,
        referenceStr
      );
    }
    return false;
  }
  getTokenStart(tokenIndex) {
    if (tokenIndex === this.tokenIndex) {
      return this.tokenStart;
    }
    if (tokenIndex > 0) {
      return tokenIndex < this.tokenCount ? this.offsetAndType[tokenIndex - 1] & OFFSET_MASK : this.offsetAndType[this.tokenCount] & OFFSET_MASK;
    }
    return this.firstCharOffset;
  }
  getTokenEnd(tokenIndex) {
    if (tokenIndex === this.tokenIndex) {
      return this.tokenEnd;
    }
    return this.offsetAndType[boundIndex(tokenIndex, 0, this.tokenCount)] & OFFSET_MASK;
  }
  getTokenType(tokenIndex) {
    if (tokenIndex === this.tokenIndex) {
      return this.tokenType;
    }
    return this.offsetAndType[boundIndex(tokenIndex, 0, this.tokenCount)] >> TYPE_SHIFT;
  }
  substrToCursor(start) {
    return this.source.substring(start, this.tokenStart);
  }
  isBlockOpenerTokenType(tokenType2) {
    return blockTokens[tokenType2] === BLOCK_OPEN_TOKEN;
  }
  isBlockCloserTokenType(tokenType2) {
    return blockTokens[tokenType2] === BLOCK_CLOSE_TOKEN;
  }
  getBlockTokenPairIndex(tokenIndex) {
    const type = this.getTokenType(tokenIndex);
    if (blockTokens[type] === 1) {
      const pairIndex = this.balance[tokenIndex];
      const closeType = this.getTokenType(pairIndex);
      return balancePair$1[type] === closeType ? pairIndex : -1;
    } else if (blockTokens[type] === 2) {
      const pairIndex = this.balance[tokenIndex];
      const openType = this.getTokenType(pairIndex);
      return balancePair$1[openType] === type ? pairIndex : -1;
    }
    return -1;
  }
  isBalanceEdge(tokenIndex) {
    return this.balance[this.tokenIndex] < tokenIndex;
  }
  isDelim(code2, offset) {
    if (offset) {
      return this.lookupType(offset) === Delim && this.source.charCodeAt(this.lookupOffset(offset)) === code2;
    }
    return this.tokenType === Delim && this.source.charCodeAt(this.tokenStart) === code2;
  }
  skip(tokenCount) {
    let next = this.tokenIndex + tokenCount;
    if (next < this.tokenCount) {
      this.tokenIndex = next;
      this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK;
      next = this.offsetAndType[next];
      this.tokenType = next >> TYPE_SHIFT;
      this.tokenEnd = next & OFFSET_MASK;
    } else {
      this.tokenIndex = this.tokenCount;
      this.next();
    }
  }
  next() {
    let next = this.tokenIndex + 1;
    if (next < this.tokenCount) {
      this.tokenIndex = next;
      this.tokenStart = this.tokenEnd;
      next = this.offsetAndType[next];
      this.tokenType = next >> TYPE_SHIFT;
      this.tokenEnd = next & OFFSET_MASK;
    } else {
      this.eof = true;
      this.tokenIndex = this.tokenCount;
      this.tokenType = EOF$1;
      this.tokenStart = this.tokenEnd = this.source.length;
    }
  }
  skipSC() {
    while (this.tokenType === WhiteSpace$1 || this.tokenType === Comment$1) {
      this.next();
    }
  }
  skipUntilBalanced(startToken, stopConsume) {
    let cursor = startToken;
    let balanceEnd = 0;
    let offset = 0;
    loop:
      for (; cursor < this.tokenCount; cursor++) {
        balanceEnd = this.balance[cursor];
        if (balanceEnd < startToken) {
          break loop;
        }
        offset = cursor > 0 ? this.offsetAndType[cursor - 1] & OFFSET_MASK : this.firstCharOffset;
        switch (stopConsume(this.source.charCodeAt(offset))) {
          case 1:
            break loop;
          case 2:
            cursor++;
            break loop;
          default:
            if (this.isBlockOpenerTokenType(this.offsetAndType[cursor] >> TYPE_SHIFT)) {
              cursor = balanceEnd;
            }
        }
      }
    this.skip(cursor - this.tokenIndex);
  }
  forEachToken(fn) {
    for (let i = 0, offset = this.firstCharOffset; i < this.tokenCount; i++) {
      const start = offset;
      const item = this.offsetAndType[i];
      const end = item & OFFSET_MASK;
      const type = item >> TYPE_SHIFT;
      offset = end;
      fn(type, start, end, i);
    }
  }
  dump() {
    const tokens = new Array(this.tokenCount);
    this.forEachToken((type, start, end, index) => {
      tokens[index] = {
        idx: index,
        type: tokenNames[type],
        chunk: this.source.substring(start, end),
        balance: this.balance[index]
      };
    });
    return tokens;
  }
}
function tokenize$1(source, onToken) {
  function getCharCode2(offset2) {
    return offset2 < sourceLength ? source.charCodeAt(offset2) : 0;
  }
  function consumeNumericToken() {
    offset = consumeNumber(source, offset);
    if (isIdentifierStart(getCharCode2(offset), getCharCode2(offset + 1), getCharCode2(offset + 2))) {
      type = Dimension$1;
      offset = consumeName(source, offset);
      return;
    }
    if (getCharCode2(offset) === 37) {
      type = Percentage$1;
      offset++;
      return;
    }
    type = Number$2;
  }
  function consumeIdentLikeToken() {
    const nameStartOffset = offset;
    offset = consumeName(source, offset);
    if (cmpStr(source, nameStartOffset, offset, "url") && getCharCode2(offset) === 40) {
      offset = findWhiteSpaceEnd(source, offset + 1);
      if (getCharCode2(offset) === 34 || getCharCode2(offset) === 39) {
        type = Function$2;
        offset = nameStartOffset + 4;
        return;
      }
      consumeUrlToken();
      return;
    }
    if (getCharCode2(offset) === 40) {
      type = Function$2;
      offset++;
      return;
    }
    type = Ident;
  }
  function consumeStringToken(endingCodePoint) {
    if (!endingCodePoint) {
      endingCodePoint = getCharCode2(offset++);
    }
    type = String$2;
    for (; offset < source.length; offset++) {
      const code2 = source.charCodeAt(offset);
      switch (charCodeCategory(code2)) {
        // ending code point
        case endingCodePoint:
          offset++;
          return;
        // EOF
        // case EofCategory:
        // This is a parse error. Return the <string-token>.
        // return;
        // newline
        case WhiteSpaceCategory:
          if (isNewline(code2)) {
            offset += getNewlineLength(source, offset, code2);
            type = BadString;
            return;
          }
          break;
        // U+005C REVERSE SOLIDUS (\)
        case 92:
          if (offset === source.length - 1) {
            break;
          }
          const nextCode = getCharCode2(offset + 1);
          if (isNewline(nextCode)) {
            offset += getNewlineLength(source, offset + 1, nextCode);
          } else if (isValidEscape(code2, nextCode)) {
            offset = consumeEscaped(source, offset) - 1;
          }
          break;
      }
    }
  }
  function consumeUrlToken() {
    type = Url$1;
    offset = findWhiteSpaceEnd(source, offset);
    for (; offset < source.length; offset++) {
      const code2 = source.charCodeAt(offset);
      switch (charCodeCategory(code2)) {
        // U+0029 RIGHT PARENTHESIS ())
        case 41:
          offset++;
          return;
        // EOF
        // case EofCategory:
        // This is a parse error. Return the <url-token>.
        // return;
        // whitespace
        case WhiteSpaceCategory:
          offset = findWhiteSpaceEnd(source, offset);
          if (getCharCode2(offset) === 41 || offset >= source.length) {
            if (offset < source.length) {
              offset++;
            }
            return;
          }
          offset = consumeBadUrlRemnants(source, offset);
          type = BadUrl;
          return;
        // U+0022 QUOTATION MARK (")
        // U+0027 APOSTROPHE (')
        // U+0028 LEFT PARENTHESIS (()
        // non-printable code point
        case 34:
        case 39:
        case 40:
        case NonPrintableCategory:
          offset = consumeBadUrlRemnants(source, offset);
          type = BadUrl;
          return;
        // U+005C REVERSE SOLIDUS (\)
        case 92:
          if (isValidEscape(code2, getCharCode2(offset + 1))) {
            offset = consumeEscaped(source, offset) - 1;
            break;
          }
          offset = consumeBadUrlRemnants(source, offset);
          type = BadUrl;
          return;
      }
    }
  }
  source = String(source || "");
  const sourceLength = source.length;
  let start = isBOM(getCharCode2(0));
  let offset = start;
  let type;
  while (offset < sourceLength) {
    const code2 = source.charCodeAt(offset);
    switch (charCodeCategory(code2)) {
      // whitespace
      case WhiteSpaceCategory:
        type = WhiteSpace$1;
        offset = findWhiteSpaceEnd(source, offset + 1);
        break;
      // U+0022 QUOTATION MARK (")
      case 34:
        consumeStringToken();
        break;
      // U+0023 NUMBER SIGN (#)
      case 35:
        if (isName(getCharCode2(offset + 1)) || isValidEscape(getCharCode2(offset + 1), getCharCode2(offset + 2))) {
          type = Hash$1;
          offset = consumeName(source, offset + 1);
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+0027 APOSTROPHE (')
      case 39:
        consumeStringToken();
        break;
      // U+0028 LEFT PARENTHESIS (()
      case 40:
        type = LeftParenthesis;
        offset++;
        break;
      // U+0029 RIGHT PARENTHESIS ())
      case 41:
        type = RightParenthesis;
        offset++;
        break;
      // U+002B PLUS SIGN (+)
      case 43:
        if (isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
          consumeNumericToken();
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+002C COMMA (,)
      case 44:
        type = Comma;
        offset++;
        break;
      // U+002D HYPHEN-MINUS (-)
      case 45:
        if (isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
          consumeNumericToken();
        } else {
          if (getCharCode2(offset + 1) === 45 && getCharCode2(offset + 2) === 62) {
            type = CDC$1;
            offset = offset + 3;
          } else {
            if (isIdentifierStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
              consumeIdentLikeToken();
            } else {
              type = Delim;
              offset++;
            }
          }
        }
        break;
      // U+002E FULL STOP (.)
      case 46:
        if (isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
          consumeNumericToken();
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+002F SOLIDUS (/)
      case 47:
        if (getCharCode2(offset + 1) === 42) {
          type = Comment$1;
          offset = source.indexOf("*/", offset + 2);
          offset = offset === -1 ? source.length : offset + 2;
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+003A COLON (:)
      case 58:
        type = Colon;
        offset++;
        break;
      // U+003B SEMICOLON (;)
      case 59:
        type = Semicolon;
        offset++;
        break;
      // U+003C LESS-THAN SIGN (<)
      case 60:
        if (getCharCode2(offset + 1) === 33 && getCharCode2(offset + 2) === 45 && getCharCode2(offset + 3) === 45) {
          type = CDO$1;
          offset = offset + 4;
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+0040 COMMERCIAL AT (@)
      case 64:
        if (isIdentifierStart(getCharCode2(offset + 1), getCharCode2(offset + 2), getCharCode2(offset + 3))) {
          type = AtKeyword;
          offset = consumeName(source, offset + 1);
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+005B LEFT SQUARE BRACKET ([)
      case 91:
        type = LeftSquareBracket;
        offset++;
        break;
      // U+005C REVERSE SOLIDUS (\)
      case 92:
        if (isValidEscape(code2, getCharCode2(offset + 1))) {
          consumeIdentLikeToken();
        } else {
          type = Delim;
          offset++;
        }
        break;
      // U+005D RIGHT SQUARE BRACKET (])
      case 93:
        type = RightSquareBracket;
        offset++;
        break;
      // U+007B LEFT CURLY BRACKET ({)
      case 123:
        type = LeftCurlyBracket;
        offset++;
        break;
      // U+007D RIGHT CURLY BRACKET (})
      case 125:
        type = RightCurlyBracket;
        offset++;
        break;
      // digit
      case DigitCategory:
        consumeNumericToken();
        break;
      // name-start code point
      case NameStartCategory:
        consumeIdentLikeToken();
        break;
      // EOF
      // case EofCategory:
      // Return an <EOF-token>.
      // break;
      // anything else
      default:
        type = Delim;
        offset++;
    }
    onToken(type, start, start = offset);
  }
}
let releasedCursors = null;
class List {
  static createItem(data2) {
    return {
      prev: null,
      next: null,
      data: data2
    };
  }
  constructor() {
    this.head = null;
    this.tail = null;
    this.cursor = null;
  }
  createItem(data2) {
    return List.createItem(data2);
  }
  // cursor helpers
  allocateCursor(prev, next) {
    let cursor;
    if (releasedCursors !== null) {
      cursor = releasedCursors;
      releasedCursors = releasedCursors.cursor;
      cursor.prev = prev;
      cursor.next = next;
      cursor.cursor = this.cursor;
    } else {
      cursor = {
        prev,
        next,
        cursor: this.cursor
      };
    }
    this.cursor = cursor;
    return cursor;
  }
  releaseCursor() {
    const { cursor } = this;
    this.cursor = cursor.cursor;
    cursor.prev = null;
    cursor.next = null;
    cursor.cursor = releasedCursors;
    releasedCursors = cursor;
  }
  updateCursors(prevOld, prevNew, nextOld, nextNew) {
    let { cursor } = this;
    while (cursor !== null) {
      if (cursor.prev === prevOld) {
        cursor.prev = prevNew;
      }
      if (cursor.next === nextOld) {
        cursor.next = nextNew;
      }
      cursor = cursor.cursor;
    }
  }
  *[Symbol.iterator]() {
    for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
      yield cursor.data;
    }
  }
  // getters
  get size() {
    let size = 0;
    for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
      size++;
    }
    return size;
  }
  get isEmpty() {
    return this.head === null;
  }
  get first() {
    return this.head && this.head.data;
  }
  get last() {
    return this.tail && this.tail.data;
  }
  // convertors
  fromArray(array) {
    let cursor = null;
    this.head = null;
    for (let data2 of array) {
      const item = List.createItem(data2);
      if (cursor !== null) {
        cursor.next = item;
      } else {
        this.head = item;
      }
      item.prev = cursor;
      cursor = item;
    }
    this.tail = cursor;
    return this;
  }
  toArray() {
    return [...this];
  }
  toJSON() {
    return [...this];
  }
  // array-like methods
  forEach(fn, thisArg = this) {
    const cursor = this.allocateCursor(null, this.head);
    while (cursor.next !== null) {
      const item = cursor.next;
      cursor.next = item.next;
      fn.call(thisArg, item.data, item, this);
    }
    this.releaseCursor();
  }
  forEachRight(fn, thisArg = this) {
    const cursor = this.allocateCursor(this.tail, null);
    while (cursor.prev !== null) {
      const item = cursor.prev;
      cursor.prev = item.prev;
      fn.call(thisArg, item.data, item, this);
    }
    this.releaseCursor();
  }
  reduce(fn, initialValue, thisArg = this) {
    let cursor = this.allocateCursor(null, this.head);
    let acc = initialValue;
    let item;
    while (cursor.next !== null) {
      item = cursor.next;
      cursor.next = item.next;
      acc = fn.call(thisArg, acc, item.data, item, this);
    }
    this.releaseCursor();
    return acc;
  }
  reduceRight(fn, initialValue, thisArg = this) {
    let cursor = this.allocateCursor(this.tail, null);
    let acc = initialValue;
    let item;
    while (cursor.prev !== null) {
      item = cursor.prev;
      cursor.prev = item.prev;
      acc = fn.call(thisArg, acc, item.data, item, this);
    }
    this.releaseCursor();
    return acc;
  }
  some(fn, thisArg = this) {
    for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
      if (fn.call(thisArg, cursor.data, cursor, this)) {
        return true;
      }
    }
    return false;
  }
  map(fn, thisArg = this) {
    const result = new List();
    for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
      result.appendData(fn.call(thisArg, cursor.data, cursor, this));
    }
    return result;
  }
  filter(fn, thisArg = this) {
    const result = new List();
    for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
      if (fn.call(thisArg, cursor.data, cursor, this)) {
        result.appendData(cursor.data);
      }
    }
    return result;
  }
  nextUntil(start, fn, thisArg = this) {
    if (start === null) {
      return;
    }
    const cursor = this.allocateCursor(null, start);
    while (cursor.next !== null) {
      const item = cursor.next;
      cursor.next = item.next;
      if (fn.call(thisArg, item.data, item, this)) {
        break;
      }
    }
    this.releaseCursor();
  }
  prevUntil(start, fn, thisArg = this) {
    if (start === null) {
      return;
    }
    const cursor = this.allocateCursor(start, null);
    while (cursor.prev !== null) {
      const item = cursor.prev;
      cursor.prev = item.prev;
      if (fn.call(thisArg, item.data, item, this)) {
        break;
      }
    }
    this.releaseCursor();
  }
  // mutation
  clear() {
    this.head = null;
    this.tail = null;
  }
  copy() {
    const result = new List();
    for (let data2 of this) {
      result.appendData(data2);
    }
    return result;
  }
  prepend(item) {
    this.updateCursors(null, item, this.head, item);
    if (this.head !== null) {
      this.head.prev = item;
      item.next = this.head;
    } else {
      this.tail = item;
    }
    this.head = item;
    return this;
  }
  prependData(data2) {
    return this.prepend(List.createItem(data2));
  }
  append(item) {
    return this.insert(item);
  }
  appendData(data2) {
    return this.insert(List.createItem(data2));
  }
  insert(item, before = null) {
    if (before !== null) {
      this.updateCursors(before.prev, item, before, item);
      if (before.prev === null) {
        if (this.head !== before) {
          throw new Error("before doesn't belong to list");
        }
        this.head = item;
        before.prev = item;
        item.next = before;
        this.updateCursors(null, item);
      } else {
        before.prev.next = item;
        item.prev = before.prev;
        before.prev = item;
        item.next = before;
      }
    } else {
      this.updateCursors(this.tail, item, null, item);
      if (this.tail !== null) {
        this.tail.next = item;
        item.prev = this.tail;
      } else {
        this.head = item;
      }
      this.tail = item;
    }
    return this;
  }
  insertData(data2, before) {
    return this.insert(List.createItem(data2), before);
  }
  remove(item) {
    this.updateCursors(item, item.prev, item, item.next);
    if (item.prev !== null) {
      item.prev.next = item.next;
    } else {
      if (this.head !== item) {
        throw new Error("item doesn't belong to list");
      }
      this.head = item.next;
    }
    if (item.next !== null) {
      item.next.prev = item.prev;
    } else {
      if (this.tail !== item) {
        throw new Error("item doesn't belong to list");
      }
      this.tail = item.prev;
    }
    item.prev = null;
    item.next = null;
    return item;
  }
  push(data2) {
    this.insert(List.createItem(data2));
  }
  pop() {
    return this.tail !== null ? this.remove(this.tail) : null;
  }
  unshift(data2) {
    this.prepend(List.createItem(data2));
  }
  shift() {
    return this.head !== null ? this.remove(this.head) : null;
  }
  prependList(list) {
    return this.insertList(list, this.head);
  }
  appendList(list) {
    return this.insertList(list);
  }
  insertList(list, before) {
    if (list.head === null) {
      return this;
    }
    if (before !== void 0 && before !== null) {
      this.updateCursors(before.prev, list.tail, before, list.head);
      if (before.prev !== null) {
        before.prev.next = list.head;
        list.head.prev = before.prev;
      } else {
        this.head = list.head;
      }
      before.prev = list.tail;
      list.tail.next = before;
    } else {
      this.updateCursors(this.tail, list.tail, null, list.head);
      if (this.tail !== null) {
        this.tail.next = list.head;
        list.head.prev = this.tail;
      } else {
        this.head = list.head;
      }
      this.tail = list.tail;
    }
    list.head = null;
    list.tail = null;
    return this;
  }
  replace(oldItem, newItemOrList) {
    if ("head" in newItemOrList) {
      this.insertList(newItemOrList, oldItem);
    } else {
      this.insert(newItemOrList, oldItem);
    }
    this.remove(oldItem);
  }
}
function createCustomError(name2, message) {
  const error2 = Object.create(SyntaxError.prototype);
  const errorStack = new Error();
  return Object.assign(error2, {
    name: name2,
    message,
    get stack() {
      return (errorStack.stack || "").replace(/^(.+\n){1,3}/, `${name2}: ${message}
`);
    }
  });
}
const MAX_LINE_LENGTH = 100;
const OFFSET_CORRECTION = 60;
const TAB_REPLACEMENT = "    ";
function sourceFragment({ source, line, column, baseLine, baseColumn }, extraLines) {
  function processLines(start, end) {
    return lines.slice(start, end).map(
      (line2, idx) => String(start + idx + 1).padStart(maxNumLength) + " |" + line2
    ).join("\n");
  }
  const prelines = "\n".repeat(Math.max(baseLine - 1, 0));
  const precolumns = " ".repeat(Math.max(baseColumn - 1, 0));
  const lines = (prelines + precolumns + source).split(/\r\n?|\n|\f/);
  const startLine = Math.max(1, line - extraLines) - 1;
  const endLine = Math.min(line + extraLines, lines.length + 1);
  const maxNumLength = Math.max(4, String(endLine).length) + 1;
  let cutLeft = 0;
  column += (TAB_REPLACEMENT.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;
  if (column > MAX_LINE_LENGTH) {
    cutLeft = column - OFFSET_CORRECTION + 3;
    column = OFFSET_CORRECTION - 2;
  }
  for (let i = startLine; i <= endLine; i++) {
    if (i >= 0 && i < lines.length) {
      lines[i] = lines[i].replace(/\t/g, TAB_REPLACEMENT);
      lines[i] = (cutLeft > 0 && lines[i].length > cutLeft ? "…" : "") + lines[i].substr(cutLeft, MAX_LINE_LENGTH - 2) + (lines[i].length > cutLeft + MAX_LINE_LENGTH - 1 ? "…" : "");
    }
  }
  return [
    processLines(startLine, line),
    new Array(column + maxNumLength + 2).join("-") + "^",
    processLines(line, endLine)
  ].filter(Boolean).join("\n").replace(/^(\s+\d+\s+\|\n)+/, "").replace(/\n(\s+\d+\s+\|)+$/, "");
}
function SyntaxError$2(message, source, offset, line, column, baseLine = 1, baseColumn = 1) {
  const error2 = Object.assign(createCustomError("SyntaxError", message), {
    source,
    offset,
    line,
    column,
    sourceFragment(extraLines) {
      return sourceFragment({ source, line, column, baseLine, baseColumn }, isNaN(extraLines) ? 0 : extraLines);
    },
    get formattedMessage() {
      return `Parse error: ${message}
` + sourceFragment({ source, line, column, baseLine, baseColumn }, 2);
    }
  });
  return error2;
}
function readSequence(recognizer) {
  const children = this.createList();
  let space = false;
  const context = {
    recognizer
  };
  while (!this.eof) {
    switch (this.tokenType) {
      case Comment$1:
        this.next();
        continue;
      case WhiteSpace$1:
        space = true;
        this.next();
        continue;
    }
    let child = recognizer.getNode.call(this, context);
    if (child === void 0) {
      break;
    }
    if (space) {
      if (recognizer.onWhiteSpace) {
        recognizer.onWhiteSpace.call(this, child, children, context);
      }
      space = false;
    }
    children.push(child);
  }
  if (space && recognizer.onWhiteSpace) {
    recognizer.onWhiteSpace.call(this, null, children, context);
  }
  return children;
}
const NOOP = () => {
};
const EXCLAMATIONMARK$3 = 33;
const NUMBERSIGN$4 = 35;
const SEMICOLON = 59;
const LEFTCURLYBRACKET$1 = 123;
const NULL = 0;
const arrayMethods = {
  createList() {
    return [];
  },
  createSingleNodeList(node2) {
    return [node2];
  },
  getFirstListNode(list) {
    return list && list[0] || null;
  },
  getLastListNode(list) {
    return list && list.length > 0 ? list[list.length - 1] : null;
  }
};
const listMethods = {
  createList() {
    return new List();
  },
  createSingleNodeList(node2) {
    return new List().appendData(node2);
  },
  getFirstListNode(list) {
    return list && list.first;
  },
  getLastListNode(list) {
    return list && list.last;
  }
};
function createParseContext(name2) {
  return function() {
    return this[name2]();
  };
}
function fetchParseValues(dict) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const name2 of Object.keys(dict)) {
    const item = dict[name2];
    const fn = item.parse || item;
    if (fn) {
      result[name2] = fn;
    }
  }
  return result;
}
function processConfig(config) {
  const parseConfig = {
    context: /* @__PURE__ */ Object.create(null),
    features: Object.assign(/* @__PURE__ */ Object.create(null), config.features),
    scope: Object.assign(/* @__PURE__ */ Object.create(null), config.scope),
    atrule: fetchParseValues(config.atrule),
    pseudo: fetchParseValues(config.pseudo),
    node: fetchParseValues(config.node)
  };
  for (const [name2, context] of Object.entries(config.parseContext)) {
    switch (typeof context) {
      case "function":
        parseConfig.context[name2] = context;
        break;
      case "string":
        parseConfig.context[name2] = createParseContext(context);
        break;
    }
  }
  return {
    config: parseConfig,
    ...parseConfig,
    ...parseConfig.node
  };
}
function createParser(config) {
  let source = "";
  let filename = "<unknown>";
  let needPositions = false;
  let onParseError = NOOP;
  let onParseErrorThrow = false;
  const locationMap = new OffsetToLocation();
  const parser2 = Object.assign(new TokenStream(), processConfig(config || {}), {
    parseAtrulePrelude: true,
    parseRulePrelude: true,
    parseValue: true,
    parseCustomProperty: false,
    readSequence,
    consumeUntilBalanceEnd: () => 0,
    consumeUntilLeftCurlyBracket(code2) {
      return code2 === LEFTCURLYBRACKET$1 ? 1 : 0;
    },
    consumeUntilLeftCurlyBracketOrSemicolon(code2) {
      return code2 === LEFTCURLYBRACKET$1 || code2 === SEMICOLON ? 1 : 0;
    },
    consumeUntilExclamationMarkOrSemicolon(code2) {
      return code2 === EXCLAMATIONMARK$3 || code2 === SEMICOLON ? 1 : 0;
    },
    consumeUntilSemicolonIncluded(code2) {
      return code2 === SEMICOLON ? 2 : 0;
    },
    createList: NOOP,
    createSingleNodeList: NOOP,
    getFirstListNode: NOOP,
    getLastListNode: NOOP,
    parseWithFallback(consumer, fallback) {
      const startIndex = this.tokenIndex;
      try {
        return consumer.call(this);
      } catch (e) {
        if (onParseErrorThrow) {
          throw e;
        }
        this.skip(startIndex - this.tokenIndex);
        const fallbackNode = fallback.call(this);
        onParseErrorThrow = true;
        onParseError(e, fallbackNode);
        onParseErrorThrow = false;
        return fallbackNode;
      }
    },
    lookupNonWSType(offset) {
      let type;
      do {
        type = this.lookupType(offset++);
        if (type !== WhiteSpace$1 && type !== Comment$1) {
          return type;
        }
      } while (type !== NULL);
      return NULL;
    },
    charCodeAt(offset) {
      return offset >= 0 && offset < source.length ? source.charCodeAt(offset) : 0;
    },
    substring(offsetStart, offsetEnd) {
      return source.substring(offsetStart, offsetEnd);
    },
    substrToCursor(start) {
      return this.source.substring(start, this.tokenStart);
    },
    cmpChar(offset, charCode) {
      return cmpChar(source, offset, charCode);
    },
    cmpStr(offsetStart, offsetEnd, str) {
      return cmpStr(source, offsetStart, offsetEnd, str);
    },
    consume(tokenType2) {
      const start = this.tokenStart;
      this.eat(tokenType2);
      return this.substrToCursor(start);
    },
    consumeFunctionName() {
      const name2 = source.substring(this.tokenStart, this.tokenEnd - 1);
      this.eat(Function$2);
      return name2;
    },
    consumeNumber(type) {
      const number2 = source.substring(this.tokenStart, consumeNumber(source, this.tokenStart));
      this.eat(type);
      return number2;
    },
    eat(tokenType2) {
      if (this.tokenType !== tokenType2) {
        const tokenName = tokenNames[tokenType2].slice(0, -6).replace(/-/g, " ").replace(/^./, (m) => m.toUpperCase());
        let message = `${/[[\](){}]/.test(tokenName) ? `"${tokenName}"` : tokenName} is expected`;
        let offset = this.tokenStart;
        switch (tokenType2) {
          case Ident:
            if (this.tokenType === Function$2 || this.tokenType === Url$1) {
              offset = this.tokenEnd - 1;
              message = "Identifier is expected but function found";
            } else {
              message = "Identifier is expected";
            }
            break;
          case Hash$1:
            if (this.isDelim(NUMBERSIGN$4)) {
              this.next();
              offset++;
              message = "Name is expected";
            }
            break;
          case Percentage$1:
            if (this.tokenType === Number$2) {
              offset = this.tokenEnd;
              message = "Percent sign is expected";
            }
            break;
        }
        this.error(message, offset);
      }
      this.next();
    },
    eatIdent(name2) {
      if (this.tokenType !== Ident || this.lookupValue(0, name2) === false) {
        this.error(`Identifier "${name2}" is expected`);
      }
      this.next();
    },
    eatDelim(code2) {
      if (!this.isDelim(code2)) {
        this.error(`Delim "${String.fromCharCode(code2)}" is expected`);
      }
      this.next();
    },
    getLocation(start, end) {
      if (needPositions) {
        return locationMap.getLocationRange(
          start,
          end,
          filename
        );
      }
      return null;
    },
    getLocationFromList(list) {
      if (needPositions) {
        const head = this.getFirstListNode(list);
        const tail = this.getLastListNode(list);
        return locationMap.getLocationRange(
          head !== null ? head.loc.start.offset - locationMap.startOffset : this.tokenStart,
          tail !== null ? tail.loc.end.offset - locationMap.startOffset : this.tokenStart,
          filename
        );
      }
      return null;
    },
    error(message, offset) {
      const location = typeof offset !== "undefined" && offset < source.length ? locationMap.getLocation(offset) : this.eof ? locationMap.getLocation(findWhiteSpaceStart(source, source.length - 1)) : locationMap.getLocation(this.tokenStart);
      throw new SyntaxError$2(
        message || "Unexpected input",
        source,
        location.offset,
        location.line,
        location.column,
        locationMap.startLine,
        locationMap.startColumn
      );
    }
  });
  const createTokenIterateAPI = () => ({
    filename,
    source,
    tokenCount: parser2.tokenCount,
    getTokenType: (index) => parser2.getTokenType(index),
    getTokenTypeName: (index) => tokenNames[parser2.getTokenType(index)],
    getTokenStart: (index) => parser2.getTokenStart(index),
    getTokenEnd: (index) => parser2.getTokenEnd(index),
    getTokenValue: (index) => parser2.source.substring(parser2.getTokenStart(index), parser2.getTokenEnd(index)),
    substring: (start, end) => parser2.source.substring(start, end),
    balance: parser2.balance.subarray(0, parser2.tokenCount + 1),
    isBlockOpenerTokenType: parser2.isBlockOpenerTokenType,
    isBlockCloserTokenType: parser2.isBlockCloserTokenType,
    getBlockTokenPairIndex: (index) => parser2.getBlockTokenPairIndex(index),
    getLocation: (offset) => locationMap.getLocation(offset, filename),
    getRangeLocation: (start, end) => locationMap.getLocationRange(start, end, filename)
  });
  const parse2 = function(source_, options) {
    source = source_;
    options = options || {};
    parser2.setSource(source, tokenize$1);
    locationMap.setSource(
      source,
      options.offset,
      options.line,
      options.column
    );
    filename = options.filename || "<unknown>";
    needPositions = Boolean(options.positions);
    onParseError = typeof options.onParseError === "function" ? options.onParseError : NOOP;
    onParseErrorThrow = false;
    parser2.parseAtrulePrelude = "parseAtrulePrelude" in options ? Boolean(options.parseAtrulePrelude) : true;
    parser2.parseRulePrelude = "parseRulePrelude" in options ? Boolean(options.parseRulePrelude) : true;
    parser2.parseValue = "parseValue" in options ? Boolean(options.parseValue) : true;
    parser2.parseCustomProperty = "parseCustomProperty" in options ? Boolean(options.parseCustomProperty) : false;
    const { context = "default", list = true, onComment, onToken } = options;
    if (context in parser2.context === false) {
      throw new Error("Unknown context `" + context + "`");
    }
    Object.assign(parser2, list ? listMethods : arrayMethods);
    if (Array.isArray(onToken)) {
      parser2.forEachToken((type, start, end) => {
        onToken.push({ type, start, end });
      });
    } else if (typeof onToken === "function") {
      parser2.forEachToken(onToken.bind(createTokenIterateAPI()));
    }
    if (typeof onComment === "function") {
      parser2.forEachToken((type, start, end) => {
        if (type === Comment$1) {
          const loc = parser2.getLocation(start, end);
          const value2 = cmpStr(source, end - 2, end, "*/") ? source.slice(start + 2, end - 2) : source.slice(start + 2, end);
          onComment(value2, loc);
        }
      });
    }
    const ast = parser2.context[context].call(parser2, options);
    if (!parser2.eof) {
      parser2.error();
    }
    return ast;
  };
  return Object.assign(parse2, {
    SyntaxError: SyntaxError$2,
    config: parser2.config
  });
}
const trackNodes = /* @__PURE__ */ new Set(["Atrule", "Selector", "Declaration"]);
function generateSourceMap(handlers) {
  const map = new sourceMapGeneratorExports.SourceMapGenerator();
  const generated = {
    line: 1,
    column: 0
  };
  const original = {
    line: 0,
    // should be zero to add first mapping
    column: 0
  };
  const activatedGenerated = {
    line: 1,
    column: 0
  };
  const activatedMapping = {
    generated: activatedGenerated
  };
  let line = 1;
  let column = 0;
  let sourceMappingActive = false;
  const origHandlersNode = handlers.node;
  handlers.node = function(node2) {
    if (node2.loc && node2.loc.start && trackNodes.has(node2.type)) {
      const nodeLine = node2.loc.start.line;
      const nodeColumn = node2.loc.start.column - 1;
      if (original.line !== nodeLine || original.column !== nodeColumn) {
        original.line = nodeLine;
        original.column = nodeColumn;
        generated.line = line;
        generated.column = column;
        if (sourceMappingActive) {
          sourceMappingActive = false;
          if (generated.line !== activatedGenerated.line || generated.column !== activatedGenerated.column) {
            map.addMapping(activatedMapping);
          }
        }
        sourceMappingActive = true;
        map.addMapping({
          source: node2.loc.source,
          original,
          generated
        });
      }
    }
    origHandlersNode.call(this, node2);
    if (sourceMappingActive && trackNodes.has(node2.type)) {
      activatedGenerated.line = line;
      activatedGenerated.column = column;
    }
  };
  const origHandlersEmit = handlers.emit;
  handlers.emit = function(value2, type, auto) {
    for (let i = 0; i < value2.length; i++) {
      if (value2.charCodeAt(i) === 10) {
        line++;
        column = 0;
      } else {
        column++;
      }
    }
    origHandlersEmit(value2, type, auto);
  };
  const origHandlersResult = handlers.result;
  handlers.result = function() {
    if (sourceMappingActive) {
      map.addMapping(activatedMapping);
    }
    return {
      css: origHandlersResult(),
      map
    };
  };
  return handlers;
}
const PLUSSIGN$9 = 43;
const HYPHENMINUS$6 = 45;
const code = (type, value2) => {
  if (type === Delim) {
    type = value2;
  }
  if (typeof type === "string") {
    type = Math.min(type.charCodeAt(0), 128) << 6;
  }
  return type << 1;
};
const specPairs = [
  [Ident, Ident],
  [Ident, Function$2],
  [Ident, Url$1],
  [Ident, BadUrl],
  [Ident, "-"],
  [Ident, Number$2],
  [Ident, Percentage$1],
  [Ident, Dimension$1],
  [Ident, CDC$1],
  [Ident, LeftParenthesis],
  [AtKeyword, Ident],
  [AtKeyword, Function$2],
  [AtKeyword, Url$1],
  [AtKeyword, BadUrl],
  [AtKeyword, "-"],
  [AtKeyword, Number$2],
  [AtKeyword, Percentage$1],
  [AtKeyword, Dimension$1],
  [AtKeyword, CDC$1],
  [Hash$1, Ident],
  [Hash$1, Function$2],
  [Hash$1, Url$1],
  [Hash$1, BadUrl],
  [Hash$1, "-"],
  [Hash$1, Number$2],
  [Hash$1, Percentage$1],
  [Hash$1, Dimension$1],
  [Hash$1, CDC$1],
  [Dimension$1, Ident],
  [Dimension$1, Function$2],
  [Dimension$1, Url$1],
  [Dimension$1, BadUrl],
  [Dimension$1, "-"],
  [Dimension$1, Number$2],
  [Dimension$1, Percentage$1],
  [Dimension$1, Dimension$1],
  [Dimension$1, CDC$1],
  ["#", Ident],
  ["#", Function$2],
  ["#", Url$1],
  ["#", BadUrl],
  ["#", "-"],
  ["#", Number$2],
  ["#", Percentage$1],
  ["#", Dimension$1],
  ["#", CDC$1],
  // https://github.com/w3c/csswg-drafts/pull/6874
  ["-", Ident],
  ["-", Function$2],
  ["-", Url$1],
  ["-", BadUrl],
  ["-", "-"],
  ["-", Number$2],
  ["-", Percentage$1],
  ["-", Dimension$1],
  ["-", CDC$1],
  // https://github.com/w3c/csswg-drafts/pull/6874
  [Number$2, Ident],
  [Number$2, Function$2],
  [Number$2, Url$1],
  [Number$2, BadUrl],
  [Number$2, Number$2],
  [Number$2, Percentage$1],
  [Number$2, Dimension$1],
  [Number$2, "%"],
  [Number$2, CDC$1],
  // https://github.com/w3c/csswg-drafts/pull/6874
  ["@", Ident],
  ["@", Function$2],
  ["@", Url$1],
  ["@", BadUrl],
  ["@", "-"],
  ["@", CDC$1],
  // https://github.com/w3c/csswg-drafts/pull/6874
  [".", Number$2],
  [".", Percentage$1],
  [".", Dimension$1],
  ["+", Number$2],
  ["+", Percentage$1],
  ["+", Dimension$1],
  ["/", "*"]
];
const safePairs = specPairs.concat([
  [Ident, Hash$1],
  [Dimension$1, Hash$1],
  [Hash$1, Hash$1],
  [AtKeyword, LeftParenthesis],
  [AtKeyword, String$2],
  [AtKeyword, Colon],
  [Percentage$1, Percentage$1],
  [Percentage$1, Dimension$1],
  [Percentage$1, Function$2],
  [Percentage$1, "-"],
  [RightParenthesis, Ident],
  [RightParenthesis, Function$2],
  [RightParenthesis, Percentage$1],
  [RightParenthesis, Dimension$1],
  [RightParenthesis, Hash$1],
  [RightParenthesis, "-"]
]);
function createMap(pairs) {
  const isWhiteSpaceRequired = new Set(
    pairs.map(([prev, next]) => code(prev) << 16 | code(next))
  );
  return function(prevCode, type, value2) {
    const nextCode = code(type, value2);
    const nextCharCode = value2.charCodeAt(0);
    const emitWs = nextCharCode === HYPHENMINUS$6 && type !== Ident && type !== Function$2 && type !== CDC$1 || nextCharCode === PLUSSIGN$9 ? isWhiteSpaceRequired.has((prevCode & 65534) << 16 | nextCharCode << 7) : isWhiteSpaceRequired.has((prevCode & 65534) << 16 | nextCode);
    return nextCode | emitWs;
  };
}
const spec = createMap(specPairs);
const safe = createMap(safePairs);
const tokenBefore = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  safe,
  spec
});
const REVERSESOLIDUS = 92;
function processChildren(node2, delimeter) {
  if (typeof delimeter === "function") {
    let prev = null;
    node2.children.forEach((node3) => {
      if (prev !== null) {
        delimeter.call(this, prev);
      }
      this.node(node3);
      prev = node3;
    });
    return;
  }
  node2.children.forEach(this.node, this);
}
function createGenerator(config) {
  const types2 = /* @__PURE__ */ new Map();
  for (let [name2, item] of Object.entries(config.node)) {
    const fn = item.generate || item;
    if (typeof fn === "function") {
      types2.set(name2, item.generate || item);
    }
  }
  return function(node2, options) {
    let buffer = "";
    let prevCode = 0;
    let handlers = {
      node(node3) {
        if (types2.has(node3.type)) {
          types2.get(node3.type).call(publicApi, node3);
        } else {
          throw new Error("Unknown node type: " + node3.type);
        }
      },
      tokenBefore: safe,
      token(type, value2, suppressAutoWhiteSpace) {
        prevCode = this.tokenBefore(prevCode, type, value2);
        if (!suppressAutoWhiteSpace && prevCode & 1) {
          this.emit(" ", WhiteSpace$1, true);
        }
        this.emit(value2, type, false);
        if (type === Delim && value2.charCodeAt(0) === REVERSESOLIDUS) {
          this.emit("\n", WhiteSpace$1, true);
        }
      },
      emit(value2) {
        buffer += value2;
      },
      result() {
        return buffer;
      }
    };
    if (options) {
      if (typeof options.decorator === "function") {
        handlers = options.decorator(handlers);
      }
      if (options.sourceMap) {
        handlers = generateSourceMap(handlers);
      }
      if (options.mode in tokenBefore) {
        handlers.tokenBefore = tokenBefore[options.mode];
      }
    }
    const publicApi = {
      node: (node3) => handlers.node(node3),
      children: processChildren,
      token: (type, value2) => handlers.token(type, value2),
      tokenize: (raw) => tokenize$1(raw, (type, start, end) => {
        handlers.token(
          type,
          raw.slice(start, end),
          start !== 0
          // suppress auto whitespace for internal value tokens
        );
      })
    };
    handlers.node(node2);
    return handlers.result();
  };
}
function createConvertor(walk2) {
  return {
    fromPlainObject(ast) {
      walk2(ast, {
        enter(node2) {
          if (node2.children && node2.children instanceof List === false) {
            node2.children = new List().fromArray(node2.children);
          }
        }
      });
      return ast;
    },
    toPlainObject(ast) {
      walk2(ast, {
        leave(node2) {
          if (node2.children && node2.children instanceof List) {
            node2.children = node2.children.toArray();
          }
        }
      });
      return ast;
    }
  };
}
const { hasOwnProperty: hasOwnProperty$3 } = Object.prototype;
const noop$2 = function() {
};
function ensureFunction$1(value2) {
  return typeof value2 === "function" ? value2 : noop$2;
}
function invokeForType(fn, type) {
  return function(node2, item, list) {
    if (node2.type === type) {
      fn.call(this, node2, item, list);
    }
  };
}
function getWalkersFromStructure(name2, nodeType) {
  const structure2 = nodeType.structure;
  const walkers = [];
  for (const key in structure2) {
    if (hasOwnProperty$3.call(structure2, key) === false) {
      continue;
    }
    let fieldTypes = structure2[key];
    const walker2 = {
      name: key,
      type: false,
      nullable: false
    };
    if (!Array.isArray(fieldTypes)) {
      fieldTypes = [fieldTypes];
    }
    for (const fieldType of fieldTypes) {
      if (fieldType === null) {
        walker2.nullable = true;
      } else if (typeof fieldType === "string") {
        walker2.type = "node";
      } else if (Array.isArray(fieldType)) {
        walker2.type = "list";
      }
    }
    if (walker2.type) {
      walkers.push(walker2);
    }
  }
  if (walkers.length) {
    return {
      context: nodeType.walkContext,
      fields: walkers
    };
  }
  return null;
}
function getTypesFromConfig(config) {
  const types2 = {};
  for (const name2 in config.node) {
    if (hasOwnProperty$3.call(config.node, name2)) {
      const nodeType = config.node[name2];
      if (!nodeType.structure) {
        throw new Error("Missed `structure` field in `" + name2 + "` node type definition");
      }
      types2[name2] = getWalkersFromStructure(name2, nodeType);
    }
  }
  return types2;
}
function createTypeIterator(config, reverse) {
  const fields = config.fields.slice();
  const contextName = config.context;
  const useContext = typeof contextName === "string";
  if (reverse) {
    fields.reverse();
  }
  return function(node2, context, walk2, walkReducer) {
    let prevContextValue;
    if (useContext) {
      prevContextValue = context[contextName];
      context[contextName] = node2;
    }
    for (const field of fields) {
      const ref = node2[field.name];
      if (!field.nullable || ref) {
        if (field.type === "list") {
          const breakWalk = reverse ? ref.reduceRight(walkReducer, false) : ref.reduce(walkReducer, false);
          if (breakWalk) {
            return true;
          }
        } else if (walk2(ref)) {
          return true;
        }
      }
    }
    if (useContext) {
      context[contextName] = prevContextValue;
    }
  };
}
function createFastTraveralMap({
  StyleSheet: StyleSheet2,
  Atrule: Atrule2,
  Rule: Rule2,
  Block: Block2,
  DeclarationList: DeclarationList2
}) {
  return {
    Atrule: {
      StyleSheet: StyleSheet2,
      Atrule: Atrule2,
      Rule: Rule2,
      Block: Block2
    },
    Rule: {
      StyleSheet: StyleSheet2,
      Atrule: Atrule2,
      Rule: Rule2,
      Block: Block2
    },
    Declaration: {
      StyleSheet: StyleSheet2,
      Atrule: Atrule2,
      Rule: Rule2,
      Block: Block2,
      DeclarationList: DeclarationList2
    }
  };
}
function createWalker(config) {
  const types2 = getTypesFromConfig(config);
  const iteratorsNatural = {};
  const iteratorsReverse = {};
  const breakWalk = /* @__PURE__ */ Symbol("break-walk");
  const skipNode = /* @__PURE__ */ Symbol("skip-node");
  for (const name2 in types2) {
    if (hasOwnProperty$3.call(types2, name2) && types2[name2] !== null) {
      iteratorsNatural[name2] = createTypeIterator(types2[name2], false);
      iteratorsReverse[name2] = createTypeIterator(types2[name2], true);
    }
  }
  const fastTraversalIteratorsNatural = createFastTraveralMap(iteratorsNatural);
  const fastTraversalIteratorsReverse = createFastTraveralMap(iteratorsReverse);
  const walk2 = function(root, options) {
    function walkNode(node2, item, list) {
      const enterRet = enter.call(context, node2, item, list);
      if (enterRet === breakWalk) {
        return true;
      }
      if (enterRet === skipNode) {
        return false;
      }
      if (iterators.hasOwnProperty(node2.type)) {
        if (iterators[node2.type](node2, context, walkNode, walkReducer)) {
          return true;
        }
      }
      if (leave.call(context, node2, item, list) === breakWalk) {
        return true;
      }
      return false;
    }
    let enter = noop$2;
    let leave = noop$2;
    let iterators = iteratorsNatural;
    let walkReducer = (ret, data2, item, list) => ret || walkNode(data2, item, list);
    const context = {
      break: breakWalk,
      skip: skipNode,
      root,
      stylesheet: null,
      atrule: null,
      atrulePrelude: null,
      rule: null,
      selector: null,
      block: null,
      declaration: null,
      function: null
    };
    if (typeof options === "function") {
      enter = options;
    } else if (options) {
      enter = ensureFunction$1(options.enter);
      leave = ensureFunction$1(options.leave);
      if (options.reverse) {
        iterators = iteratorsReverse;
      }
      if (options.visit) {
        if (fastTraversalIteratorsNatural.hasOwnProperty(options.visit)) {
          iterators = options.reverse ? fastTraversalIteratorsReverse[options.visit] : fastTraversalIteratorsNatural[options.visit];
        } else if (!types2.hasOwnProperty(options.visit)) {
          throw new Error("Bad value `" + options.visit + "` for `visit` option (should be: " + Object.keys(types2).sort().join(", ") + ")");
        }
        enter = invokeForType(enter, options.visit);
        leave = invokeForType(leave, options.visit);
      }
    }
    if (enter === noop$2 && leave === noop$2) {
      throw new Error("Neither `enter` nor `leave` walker handler is set or both aren't a function");
    }
    walkNode(root);
  };
  walk2.break = breakWalk;
  walk2.skip = skipNode;
  walk2.find = function(ast, fn) {
    let found = null;
    walk2(ast, function(node2, item, list) {
      if (fn.call(this, node2, item, list)) {
        found = node2;
        return breakWalk;
      }
    });
    return found;
  };
  walk2.findLast = function(ast, fn) {
    let found = null;
    walk2(ast, {
      reverse: true,
      enter(node2, item, list) {
        if (fn.call(this, node2, item, list)) {
          found = node2;
          return breakWalk;
        }
      }
    });
    return found;
  };
  walk2.findAll = function(ast, fn) {
    const found = [];
    walk2(ast, function(node2, item, list) {
      if (fn.call(this, node2, item, list)) {
        found.push(node2);
      }
    });
    return found;
  };
  return walk2;
}
function noop$1(value2) {
  return value2;
}
function generateMultiplier(multiplier) {
  const { min, max, comma } = multiplier;
  if (min === 0 && max === 0) {
    return comma ? "#?" : "*";
  }
  if (min === 0 && max === 1) {
    return "?";
  }
  if (min === 1 && max === 0) {
    return comma ? "#" : "+";
  }
  if (min === 1 && max === 1) {
    return "";
  }
  return (comma ? "#" : "") + (min === max ? "{" + min + "}" : "{" + min + "," + (max !== 0 ? max : "") + "}");
}
function generateTypeOpts(node2) {
  switch (node2.type) {
    case "Range":
      return " [" + (node2.min === null ? "-∞" : node2.min) + "," + (node2.max === null ? "∞" : node2.max) + "]";
    default:
      throw new Error("Unknown node type `" + node2.type + "`");
  }
}
function generateSequence(node2, decorate, forceBraces, compact) {
  const combinator = node2.combinator === " " || compact ? node2.combinator : " " + node2.combinator + " ";
  const result = node2.terms.map((term) => internalGenerate(term, decorate, forceBraces, compact)).join(combinator);
  if (node2.explicit || forceBraces) {
    return (compact || result[0] === "," ? "[" : "[ ") + result + (compact ? "]" : " ]");
  }
  return result;
}
function internalGenerate(node2, decorate, forceBraces, compact) {
  let result;
  switch (node2.type) {
    case "Group":
      result = generateSequence(node2, decorate, forceBraces, compact) + (node2.disallowEmpty ? "!" : "");
      break;
    case "Multiplier":
      return internalGenerate(node2.term, decorate, forceBraces, compact) + decorate(generateMultiplier(node2), node2);
    case "Boolean":
      result = "<boolean-expr[" + internalGenerate(node2.term, decorate, forceBraces, compact) + "]>";
      break;
    case "Type":
      result = "<" + node2.name + (node2.opts ? decorate(generateTypeOpts(node2.opts), node2.opts) : "") + ">";
      break;
    case "Property":
      result = "<'" + node2.name + "'>";
      break;
    case "Keyword":
      result = node2.name;
      break;
    case "AtKeyword":
      result = "@" + node2.name;
      break;
    case "Function":
      result = node2.name + "(";
      break;
    case "String":
    case "Token":
      result = node2.value;
      break;
    case "Comma":
      result = ",";
      break;
    default:
      throw new Error("Unknown node type `" + node2.type + "`");
  }
  return decorate(result, node2);
}
function generate$O(node2, options) {
  let decorate = noop$1;
  let forceBraces = false;
  let compact = false;
  if (typeof options === "function") {
    decorate = options;
  } else if (options) {
    forceBraces = Boolean(options.forceBraces);
    compact = Boolean(options.compact);
    if (typeof options.decorate === "function") {
      decorate = options.decorate;
    }
  }
  return internalGenerate(node2, decorate, forceBraces, compact);
}
const defaultLoc = { offset: 0, line: 1, column: 1 };
function locateMismatch(matchResult, node2) {
  const tokens = matchResult.tokens;
  const longestMatch = matchResult.longestMatch;
  const mismatchNode = longestMatch < tokens.length ? tokens[longestMatch].node || null : null;
  const badNode = mismatchNode !== node2 ? mismatchNode : null;
  let mismatchOffset = 0;
  let mismatchLength = 0;
  let entries = 0;
  let css = "";
  let start;
  let end;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].value;
    if (i === longestMatch) {
      mismatchLength = token.length;
      mismatchOffset = css.length;
    }
    if (badNode !== null && tokens[i].node === badNode) {
      if (i <= longestMatch) {
        entries++;
      } else {
        entries = 0;
      }
    }
    css += token;
  }
  if (longestMatch === tokens.length || entries > 1) {
    start = fromLoc(badNode || node2, "end") || buildLoc(defaultLoc, css);
    end = buildLoc(start);
  } else {
    start = fromLoc(badNode, "start") || buildLoc(fromLoc(node2, "start") || defaultLoc, css.slice(0, mismatchOffset));
    end = fromLoc(badNode, "end") || buildLoc(start, css.substr(mismatchOffset, mismatchLength));
  }
  return {
    css,
    mismatchOffset,
    mismatchLength,
    start,
    end
  };
}
function fromLoc(node2, point) {
  const value2 = node2 && node2.loc && node2.loc[point];
  if (value2) {
    return "line" in value2 ? buildLoc(value2) : value2;
  }
  return null;
}
function buildLoc({ offset, line, column }, extra) {
  const loc = {
    offset,
    line,
    column
  };
  if (extra) {
    const lines = extra.split(/\n|\r\n?|\f/);
    loc.offset += extra.length;
    loc.line += lines.length - 1;
    loc.column = lines.length === 1 ? loc.column + extra.length : lines.pop().length + 1;
  }
  return loc;
}
const SyntaxReferenceError = function(type, referenceName) {
  const error2 = createCustomError(
    "SyntaxReferenceError",
    type + (referenceName ? " `" + referenceName + "`" : "")
  );
  error2.reference = referenceName;
  return error2;
};
const SyntaxMatchError = function(message, syntax2, node2, matchResult) {
  const error2 = createCustomError("SyntaxMatchError", message);
  const {
    css,
    mismatchOffset,
    mismatchLength,
    start,
    end
  } = locateMismatch(matchResult, node2);
  error2.rawMessage = message;
  error2.syntax = syntax2 ? generate$O(syntax2) : "<generic>";
  error2.css = css;
  error2.mismatchOffset = mismatchOffset;
  error2.mismatchLength = mismatchLength;
  error2.message = message + "\n  syntax: " + error2.syntax + "\n   value: " + (css || "<empty string>") + "\n  --------" + new Array(error2.mismatchOffset + 1).join("-") + "^";
  Object.assign(error2, start);
  error2.loc = {
    source: node2 && node2.loc && node2.loc.source || "<unknown>",
    start,
    end
  };
  return error2;
};
const keywords = /* @__PURE__ */ new Map();
const properties = /* @__PURE__ */ new Map();
const HYPHENMINUS$5 = 45;
const keyword = getKeywordDescriptor;
const property = getPropertyDescriptor;
function isCustomProperty(str, offset) {
  offset = offset || 0;
  return str.length - offset >= 2 && str.charCodeAt(offset) === HYPHENMINUS$5 && str.charCodeAt(offset + 1) === HYPHENMINUS$5;
}
function getVendorPrefix(str, offset) {
  offset = offset || 0;
  if (str.length - offset >= 3) {
    if (str.charCodeAt(offset) === HYPHENMINUS$5 && str.charCodeAt(offset + 1) !== HYPHENMINUS$5) {
      const secondDashIndex = str.indexOf("-", offset + 2);
      if (secondDashIndex !== -1) {
        return str.substring(offset, secondDashIndex + 1);
      }
    }
  }
  return "";
}
function getKeywordDescriptor(keyword2) {
  if (keywords.has(keyword2)) {
    return keywords.get(keyword2);
  }
  const name2 = keyword2.toLowerCase();
  let descriptor = keywords.get(name2);
  if (descriptor === void 0) {
    const custom = isCustomProperty(name2, 0);
    const vendor = !custom ? getVendorPrefix(name2, 0) : "";
    descriptor = Object.freeze({
      basename: name2.substr(vendor.length),
      name: name2,
      prefix: vendor,
      vendor,
      custom
    });
  }
  keywords.set(keyword2, descriptor);
  return descriptor;
}
function getPropertyDescriptor(property2) {
  if (properties.has(property2)) {
    return properties.get(property2);
  }
  let name2 = property2;
  let hack = property2[0];
  if (hack === "/") {
    hack = property2[1] === "/" ? "//" : "/";
  } else if (hack !== "_" && hack !== "*" && hack !== "$" && hack !== "#" && hack !== "+" && hack !== "&") {
    hack = "";
  }
  const custom = isCustomProperty(name2, hack.length);
  if (!custom) {
    name2 = name2.toLowerCase();
    if (properties.has(name2)) {
      const descriptor2 = properties.get(name2);
      properties.set(property2, descriptor2);
      return descriptor2;
    }
  }
  const vendor = !custom ? getVendorPrefix(name2, hack.length) : "";
  const prefix = name2.substr(0, hack.length + vendor.length);
  const descriptor = Object.freeze({
    basename: name2.substr(prefix.length),
    name: name2.substr(hack.length),
    hack,
    vendor,
    prefix,
    custom
  });
  properties.set(property2, descriptor);
  return descriptor;
}
const cssWideKeywords = [
  "initial",
  "inherit",
  "unset",
  "revert",
  "revert-layer"
];
const PLUSSIGN$8 = 43;
const HYPHENMINUS$4 = 45;
const N$3 = 110;
const DISALLOW_SIGN$1 = true;
const ALLOW_SIGN$1 = false;
function isDelim$1(token, code2) {
  return token !== null && token.type === Delim && token.value.charCodeAt(0) === code2;
}
function skipSC(token, offset, getNextToken) {
  while (token !== null && (token.type === WhiteSpace$1 || token.type === Comment$1)) {
    token = getNextToken(++offset);
  }
  return offset;
}
function checkInteger$1(token, valueOffset, disallowSign, offset) {
  if (!token) {
    return 0;
  }
  const code2 = token.value.charCodeAt(valueOffset);
  if (code2 === PLUSSIGN$8 || code2 === HYPHENMINUS$4) {
    if (disallowSign) {
      return 0;
    }
    valueOffset++;
  }
  for (; valueOffset < token.value.length; valueOffset++) {
    if (!isDigit(token.value.charCodeAt(valueOffset))) {
      return 0;
    }
  }
  return offset + 1;
}
function consumeB$1(token, offset_, getNextToken) {
  let sign = false;
  let offset = skipSC(token, offset_, getNextToken);
  token = getNextToken(offset);
  if (token === null) {
    return offset_;
  }
  if (token.type !== Number$2) {
    if (isDelim$1(token, PLUSSIGN$8) || isDelim$1(token, HYPHENMINUS$4)) {
      sign = true;
      offset = skipSC(getNextToken(++offset), offset, getNextToken);
      token = getNextToken(offset);
      if (token === null || token.type !== Number$2) {
        return 0;
      }
    } else {
      return offset_;
    }
  }
  if (!sign) {
    const code2 = token.value.charCodeAt(0);
    if (code2 !== PLUSSIGN$8 && code2 !== HYPHENMINUS$4) {
      return 0;
    }
  }
  return checkInteger$1(token, sign ? 0 : 1, sign, offset);
}
function anPlusB(token, getNextToken) {
  let offset = 0;
  if (!token) {
    return 0;
  }
  if (token.type === Number$2) {
    return checkInteger$1(token, 0, ALLOW_SIGN$1, offset);
  } else if (token.type === Ident && token.value.charCodeAt(0) === HYPHENMINUS$4) {
    if (!cmpChar(token.value, 1, N$3)) {
      return 0;
    }
    switch (token.value.length) {
      // -n
      // -n <signed-integer>
      // -n ['+' | '-'] <signless-integer>
      case 2:
        return consumeB$1(getNextToken(++offset), offset, getNextToken);
      // -n- <signless-integer>
      case 3:
        if (token.value.charCodeAt(2) !== HYPHENMINUS$4) {
          return 0;
        }
        offset = skipSC(getNextToken(++offset), offset, getNextToken);
        token = getNextToken(offset);
        return checkInteger$1(token, 0, DISALLOW_SIGN$1, offset);
      // <dashndashdigit-ident>
      default:
        if (token.value.charCodeAt(2) !== HYPHENMINUS$4) {
          return 0;
        }
        return checkInteger$1(token, 3, DISALLOW_SIGN$1, offset);
    }
  } else if (token.type === Ident || isDelim$1(token, PLUSSIGN$8) && getNextToken(offset + 1).type === Ident) {
    if (token.type !== Ident) {
      token = getNextToken(++offset);
    }
    if (token === null || !cmpChar(token.value, 0, N$3)) {
      return 0;
    }
    switch (token.value.length) {
      // '+'? n
      // '+'? n <signed-integer>
      // '+'? n ['+' | '-'] <signless-integer>
      case 1:
        return consumeB$1(getNextToken(++offset), offset, getNextToken);
      // '+'? n- <signless-integer>
      case 2:
        if (token.value.charCodeAt(1) !== HYPHENMINUS$4) {
          return 0;
        }
        offset = skipSC(getNextToken(++offset), offset, getNextToken);
        token = getNextToken(offset);
        return checkInteger$1(token, 0, DISALLOW_SIGN$1, offset);
      // '+'? <ndashdigit-ident>
      default:
        if (token.value.charCodeAt(1) !== HYPHENMINUS$4) {
          return 0;
        }
        return checkInteger$1(token, 2, DISALLOW_SIGN$1, offset);
    }
  } else if (token.type === Dimension$1) {
    let code2 = token.value.charCodeAt(0);
    let sign = code2 === PLUSSIGN$8 || code2 === HYPHENMINUS$4 ? 1 : 0;
    let i = sign;
    for (; i < token.value.length; i++) {
      if (!isDigit(token.value.charCodeAt(i))) {
        break;
      }
    }
    if (i === sign) {
      return 0;
    }
    if (!cmpChar(token.value, i, N$3)) {
      return 0;
    }
    if (i + 1 === token.value.length) {
      return consumeB$1(getNextToken(++offset), offset, getNextToken);
    } else {
      if (token.value.charCodeAt(i + 1) !== HYPHENMINUS$4) {
        return 0;
      }
      if (i + 2 === token.value.length) {
        offset = skipSC(getNextToken(++offset), offset, getNextToken);
        token = getNextToken(offset);
        return checkInteger$1(token, 0, DISALLOW_SIGN$1, offset);
      } else {
        return checkInteger$1(token, i + 2, DISALLOW_SIGN$1, offset);
      }
    }
  }
  return 0;
}
const PLUSSIGN$7 = 43;
const HYPHENMINUS$3 = 45;
const QUESTIONMARK$2 = 63;
const U$1 = 117;
function isDelim(token, code2) {
  return token !== null && token.type === Delim && token.value.charCodeAt(0) === code2;
}
function startsWith$1(token, code2) {
  return token.value.charCodeAt(0) === code2;
}
function hexSequence(token, offset, allowDash) {
  let hexlen = 0;
  for (let pos = offset; pos < token.value.length; pos++) {
    const code2 = token.value.charCodeAt(pos);
    if (code2 === HYPHENMINUS$3 && allowDash && hexlen !== 0) {
      hexSequence(token, offset + hexlen + 1, false);
      return 6;
    }
    if (!isHexDigit(code2)) {
      return 0;
    }
    if (++hexlen > 6) {
      return 0;
    }
  }
  return hexlen;
}
function withQuestionMarkSequence(consumed, length2, getNextToken) {
  if (!consumed) {
    return 0;
  }
  while (isDelim(getNextToken(length2), QUESTIONMARK$2)) {
    if (++consumed > 6) {
      return 0;
    }
    length2++;
  }
  return length2;
}
function urange(token, getNextToken) {
  let length2 = 0;
  if (token === null || token.type !== Ident || !cmpChar(token.value, 0, U$1)) {
    return 0;
  }
  token = getNextToken(++length2);
  if (token === null) {
    return 0;
  }
  if (isDelim(token, PLUSSIGN$7)) {
    token = getNextToken(++length2);
    if (token === null) {
      return 0;
    }
    if (token.type === Ident) {
      return withQuestionMarkSequence(hexSequence(token, 0, true), ++length2, getNextToken);
    }
    if (isDelim(token, QUESTIONMARK$2)) {
      return withQuestionMarkSequence(1, ++length2, getNextToken);
    }
    return 0;
  }
  if (token.type === Number$2) {
    const consumedHexLength = hexSequence(token, 1, true);
    if (consumedHexLength === 0) {
      return 0;
    }
    token = getNextToken(++length2);
    if (token === null) {
      return length2;
    }
    if (token.type === Dimension$1 || token.type === Number$2) {
      if (!startsWith$1(token, HYPHENMINUS$3) || !hexSequence(token, 1, false)) {
        return 0;
      }
      return length2 + 1;
    }
    return withQuestionMarkSequence(consumedHexLength, length2, getNextToken);
  }
  if (token.type === Dimension$1) {
    return withQuestionMarkSequence(hexSequence(token, 1, true), ++length2, getNextToken);
  }
  return 0;
}
const calcFunctionNames = [
  "calc(",
  "-moz-calc(",
  "-webkit-calc("
];
const comparisonFunctionNames = [
  "min(",
  "max(",
  "clamp("
];
const steppedValueFunctionNames = [
  "round(",
  "mod(",
  "rem("
];
const trigNumberFunctionNames = [
  "sin(",
  "cos(",
  "tan("
];
const trigAngleFunctionNames = [
  "asin(",
  "acos(",
  "atan(",
  "atan2("
];
const otherNumberFunctionNames = [
  "pow(",
  "sqrt(",
  "log(",
  "exp(",
  "sign("
];
const expNumberDimensionPercentageFunctionNames = [
  "hypot("
];
const signFunctionNames = [
  "abs("
];
const numberFunctionNames = [
  ...calcFunctionNames,
  ...comparisonFunctionNames,
  ...steppedValueFunctionNames,
  ...trigNumberFunctionNames,
  ...otherNumberFunctionNames,
  ...expNumberDimensionPercentageFunctionNames,
  ...signFunctionNames
];
const percentageFunctionNames = [
  ...calcFunctionNames,
  ...comparisonFunctionNames,
  ...steppedValueFunctionNames,
  ...expNumberDimensionPercentageFunctionNames,
  ...signFunctionNames
];
const dimensionFunctionNames = [
  ...calcFunctionNames,
  ...comparisonFunctionNames,
  ...steppedValueFunctionNames,
  ...trigAngleFunctionNames,
  ...expNumberDimensionPercentageFunctionNames,
  ...signFunctionNames
];
const balancePair = /* @__PURE__ */ new Map([
  [Function$2, RightParenthesis],
  [LeftParenthesis, RightParenthesis],
  [LeftSquareBracket, RightSquareBracket],
  [LeftCurlyBracket, RightCurlyBracket]
]);
function charCodeAt(str, index) {
  return index < str.length ? str.charCodeAt(index) : 0;
}
function eqStr(actual, expected) {
  return cmpStr(actual, 0, actual.length, expected);
}
function eqStrAny(actual, expected) {
  for (let i = 0; i < expected.length; i++) {
    if (eqStr(actual, expected[i])) {
      return true;
    }
  }
  return false;
}
function isPostfixIeHack(str, offset) {
  if (offset !== str.length - 2) {
    return false;
  }
  return charCodeAt(str, offset) === 92 && // U+005C REVERSE SOLIDUS (\)
  isDigit(charCodeAt(str, offset + 1));
}
function outOfRange(opts, value2, numEnd) {
  if (opts && opts.type === "Range") {
    const num = Number(
      numEnd !== void 0 && numEnd !== value2.length ? value2.substr(0, numEnd) : value2
    );
    if (isNaN(num)) {
      return true;
    }
    if (opts.min !== null && num < opts.min && typeof opts.min !== "string") {
      return true;
    }
    if (opts.max !== null && num > opts.max && typeof opts.max !== "string") {
      return true;
    }
  }
  return false;
}
function consumeFunction(token, getNextToken) {
  let balanceCloseType = 0;
  let balanceStash = [];
  let length2 = 0;
  scan:
    do {
      switch (token.type) {
        case RightCurlyBracket:
        case RightParenthesis:
        case RightSquareBracket:
          if (token.type !== balanceCloseType) {
            break scan;
          }
          balanceCloseType = balanceStash.pop();
          if (balanceStash.length === 0) {
            length2++;
            break scan;
          }
          break;
        case Function$2:
        case LeftParenthesis:
        case LeftSquareBracket:
        case LeftCurlyBracket:
          balanceStash.push(balanceCloseType);
          balanceCloseType = balancePair.get(token.type);
          break;
      }
      length2++;
    } while (token = getNextToken(length2));
  return length2;
}
function math(next, functionNames) {
  return function(token, getNextToken, opts) {
    if (token === null) {
      return 0;
    }
    if (token.type === Function$2 && eqStrAny(token.value, functionNames)) {
      return consumeFunction(token, getNextToken);
    }
    return next(token, getNextToken, opts);
  };
}
function tokenType(expectedTokenType) {
  return function(token) {
    if (token === null || token.type !== expectedTokenType) {
      return 0;
    }
    return 1;
  };
}
function customIdent(token) {
  if (token === null || token.type !== Ident) {
    return 0;
  }
  const name2 = token.value.toLowerCase();
  if (eqStrAny(name2, cssWideKeywords)) {
    return 0;
  }
  if (eqStr(name2, "default")) {
    return 0;
  }
  return 1;
}
function dashedIdent(token) {
  if (token === null || token.type !== Ident) {
    return 0;
  }
  if (charCodeAt(token.value, 0) !== 45 || charCodeAt(token.value, 1) !== 45) {
    return 0;
  }
  return 1;
}
function customPropertyName(token) {
  if (!dashedIdent(token)) {
    return 0;
  }
  if (token.value === "--") {
    return 0;
  }
  return 1;
}
function hexColor(token) {
  if (token === null || token.type !== Hash$1) {
    return 0;
  }
  const length2 = token.value.length;
  if (length2 !== 4 && length2 !== 5 && length2 !== 7 && length2 !== 9) {
    return 0;
  }
  for (let i = 1; i < length2; i++) {
    if (!isHexDigit(charCodeAt(token.value, i))) {
      return 0;
    }
  }
  return 1;
}
function idSelector(token) {
  if (token === null || token.type !== Hash$1) {
    return 0;
  }
  if (!isIdentifierStart(charCodeAt(token.value, 1), charCodeAt(token.value, 2), charCodeAt(token.value, 3))) {
    return 0;
  }
  return 1;
}
function declarationValue(token, getNextToken) {
  if (!token) {
    return 0;
  }
  let balanceCloseType = 0;
  let balanceStash = [];
  let length2 = 0;
  scan:
    do {
      switch (token.type) {
        // ... <bad-string-token>, <bad-url-token>,
        case BadString:
        case BadUrl:
          break scan;
        // ... unmatched <)-token>, <]-token>, or <}-token>,
        case RightCurlyBracket:
        case RightParenthesis:
        case RightSquareBracket:
          if (token.type !== balanceCloseType) {
            break scan;
          }
          balanceCloseType = balanceStash.pop();
          break;
        // ... or top-level <semicolon-token> tokens
        case Semicolon:
          if (balanceCloseType === 0) {
            break scan;
          }
          break;
        // ... or <delim-token> tokens with a value of "!"
        case Delim:
          if (balanceCloseType === 0 && token.value === "!") {
            break scan;
          }
          break;
        case Function$2:
        case LeftParenthesis:
        case LeftSquareBracket:
        case LeftCurlyBracket:
          balanceStash.push(balanceCloseType);
          balanceCloseType = balancePair.get(token.type);
          break;
      }
      length2++;
    } while (token = getNextToken(length2));
  return length2;
}
function anyValue(token, getNextToken) {
  if (!token) {
    return 0;
  }
  let balanceCloseType = 0;
  let balanceStash = [];
  let length2 = 0;
  scan:
    do {
      switch (token.type) {
        // ... does not contain <bad-string-token>, <bad-url-token>,
        case BadString:
        case BadUrl:
          break scan;
        // ... unmatched <)-token>, <]-token>, or <}-token>,
        case RightCurlyBracket:
        case RightParenthesis:
        case RightSquareBracket:
          if (token.type !== balanceCloseType) {
            break scan;
          }
          balanceCloseType = balanceStash.pop();
          break;
        case Function$2:
        case LeftParenthesis:
        case LeftSquareBracket:
        case LeftCurlyBracket:
          balanceStash.push(balanceCloseType);
          balanceCloseType = balancePair.get(token.type);
          break;
      }
      length2++;
    } while (token = getNextToken(length2));
  return length2;
}
function dimension(type) {
  if (type) {
    type = new Set(type);
  }
  return function(token, getNextToken, opts) {
    if (token === null || token.type !== Dimension$1) {
      return 0;
    }
    const numberEnd = consumeNumber(token.value, 0);
    if (type !== null) {
      const reverseSolidusOffset = token.value.indexOf("\\", numberEnd);
      const unit = reverseSolidusOffset === -1 || !isPostfixIeHack(token.value, reverseSolidusOffset) ? token.value.substr(numberEnd) : token.value.substring(numberEnd, reverseSolidusOffset);
      if (type.has(unit.toLowerCase()) === false) {
        return 0;
      }
    }
    if (outOfRange(opts, token.value, numberEnd)) {
      return 0;
    }
    return 1;
  };
}
function percentage(token, getNextToken, opts) {
  if (token === null || token.type !== Percentage$1) {
    return 0;
  }
  if (outOfRange(opts, token.value, token.value.length - 1)) {
    return 0;
  }
  return 1;
}
function zero(next) {
  if (typeof next !== "function") {
    next = function() {
      return 0;
    };
  }
  return function(token, getNextToken, opts) {
    if (token !== null && token.type === Number$2) {
      if (Number(token.value) === 0) {
        return 1;
      }
    }
    return next(token, getNextToken, opts);
  };
}
function number(token, getNextToken, opts) {
  if (token === null) {
    return 0;
  }
  const numberEnd = consumeNumber(token.value, 0);
  const isNumber = numberEnd === token.value.length;
  if (!isNumber && !isPostfixIeHack(token.value, numberEnd)) {
    return 0;
  }
  if (outOfRange(opts, token.value, numberEnd)) {
    return 0;
  }
  return 1;
}
function integer(token, getNextToken, opts) {
  if (token === null || token.type !== Number$2) {
    return 0;
  }
  let i = charCodeAt(token.value, 0) === 43 || // U+002B PLUS SIGN (+)
  charCodeAt(token.value, 0) === 45 ? 1 : 0;
  for (; i < token.value.length; i++) {
    if (!isDigit(charCodeAt(token.value, i))) {
      return 0;
    }
  }
  if (outOfRange(opts, token.value, i)) {
    return 0;
  }
  return 1;
}
const tokenTypes = {
  "ident-token": tokenType(Ident),
  "function-token": tokenType(Function$2),
  "at-keyword-token": tokenType(AtKeyword),
  "hash-token": tokenType(Hash$1),
  "string-token": tokenType(String$2),
  "bad-string-token": tokenType(BadString),
  "url-token": tokenType(Url$1),
  "bad-url-token": tokenType(BadUrl),
  "delim-token": tokenType(Delim),
  "number-token": tokenType(Number$2),
  "percentage-token": tokenType(Percentage$1),
  "dimension-token": tokenType(Dimension$1),
  "whitespace-token": tokenType(WhiteSpace$1),
  "CDO-token": tokenType(CDO$1),
  "CDC-token": tokenType(CDC$1),
  "colon-token": tokenType(Colon),
  "semicolon-token": tokenType(Semicolon),
  "comma-token": tokenType(Comma),
  "[-token": tokenType(LeftSquareBracket),
  "]-token": tokenType(RightSquareBracket),
  "(-token": tokenType(LeftParenthesis),
  ")-token": tokenType(RightParenthesis),
  "{-token": tokenType(LeftCurlyBracket),
  "}-token": tokenType(RightCurlyBracket)
};
const productionTypes = {
  // token type aliases
  "string": tokenType(String$2),
  "ident": tokenType(Ident),
  // percentage
  "percentage": math(percentage, percentageFunctionNames),
  // numeric
  "zero": zero(),
  "number": math(number, numberFunctionNames),
  "integer": math(integer, numberFunctionNames),
  // complex types
  "custom-ident": customIdent,
  "dashed-ident": dashedIdent,
  "custom-property-name": customPropertyName,
  "hex-color": hexColor,
  "id-selector": idSelector,
  // element( <id-selector> )
  "an-plus-b": anPlusB,
  "urange": urange,
  "declaration-value": declarationValue,
  "any-value": anyValue
};
const unitGroups = [
  "length",
  "angle",
  "time",
  "frequency",
  "resolution",
  "flex",
  "decibel",
  "semitones"
];
function createDemensionTypes(units2) {
  const {
    angle: angle2,
    decibel: decibel2,
    frequency: frequency2,
    flex: flex2,
    length: length2,
    resolution: resolution2,
    semitones: semitones2,
    time: time2
  } = units2 || {};
  return {
    "dimension": math(dimension(null), dimensionFunctionNames),
    "angle": math(dimension(angle2), dimensionFunctionNames),
    "decibel": math(dimension(decibel2), dimensionFunctionNames),
    "frequency": math(dimension(frequency2), dimensionFunctionNames),
    "flex": math(dimension(flex2), dimensionFunctionNames),
    "length": math(zero(dimension(length2)), dimensionFunctionNames),
    "resolution": math(dimension(resolution2), dimensionFunctionNames),
    "semitones": math(dimension(semitones2), dimensionFunctionNames),
    "time": math(dimension(time2), dimensionFunctionNames)
  };
}
function createAttrUnit(units2) {
  const unitSet = /* @__PURE__ */ new Set();
  for (const group of unitGroups) {
    if (Array.isArray(units2[group])) {
      for (const unit of units2[group]) {
        unitSet.add(unit.toLowerCase());
      }
    }
  }
  return function attrUnit(token) {
    if (token === null) {
      return 0;
    }
    if (token.type === Delim && token.value === "%") {
      return 1;
    }
    if (token.type === Ident && unitSet.has(token.value.toLowerCase())) {
      return 1;
    }
    return 0;
  };
}
function createGenericTypes(units2) {
  return {
    ...tokenTypes,
    ...productionTypes,
    ...createDemensionTypes(units2),
    "attr-unit": createAttrUnit(units2)
  };
}
const length = [
  // absolute length units https://www.w3.org/TR/css-values-3/#lengths
  "cm",
  "mm",
  "q",
  "in",
  "pt",
  "pc",
  "px",
  // font-relative length units https://drafts.csswg.org/css-values-4/#font-relative-lengths
  "em",
  "rem",
  "ex",
  "rex",
  "cap",
  "rcap",
  "ch",
  "rch",
  "ic",
  "ric",
  "lh",
  "rlh",
  // viewport-percentage lengths https://drafts.csswg.org/css-values-4/#viewport-relative-lengths
  "vw",
  "svw",
  "lvw",
  "dvw",
  "vh",
  "svh",
  "lvh",
  "dvh",
  "vi",
  "svi",
  "lvi",
  "dvi",
  "vb",
  "svb",
  "lvb",
  "dvb",
  "vmin",
  "svmin",
  "lvmin",
  "dvmin",
  "vmax",
  "svmax",
  "lvmax",
  "dvmax",
  // container relative lengths https://drafts.csswg.org/css-contain-3/#container-lengths
  "cqw",
  "cqh",
  "cqi",
  "cqb",
  "cqmin",
  "cqmax"
];
const angle = ["deg", "grad", "rad", "turn"];
const time = ["s", "ms"];
const frequency = ["hz", "khz"];
const resolution = ["dpi", "dpcm", "dppx", "x"];
const flex = ["fr"];
const decibel = ["db"];
const semitones = ["st"];
const units = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  angle,
  decibel,
  flex,
  frequency,
  length,
  resolution,
  semitones,
  time
});
function SyntaxError$1(message, input, offset) {
  return Object.assign(createCustomError("SyntaxError", message), {
    input,
    offset,
    rawMessage: message,
    message: message + "\n  " + input + "\n--" + new Array((offset || input.length) + 1).join("-") + "^"
  });
}
const TAB$1 = 9;
const N$2 = 10;
const F$1 = 12;
const R$1 = 13;
const SPACE$3 = 32;
const NAME_CHAR = new Uint8Array(128).map(
  (_, idx) => /[a-zA-Z0-9\-]/.test(String.fromCharCode(idx)) ? 1 : 0
);
class Scanner {
  constructor(str) {
    this.str = str;
    this.pos = 0;
  }
  charCodeAt(pos) {
    return pos < this.str.length ? this.str.charCodeAt(pos) : 0;
  }
  charCode() {
    return this.charCodeAt(this.pos);
  }
  isNameCharCode(code2 = this.charCode()) {
    return code2 < 128 && NAME_CHAR[code2] === 1;
  }
  nextCharCode() {
    return this.charCodeAt(this.pos + 1);
  }
  nextNonWsCode(pos) {
    return this.charCodeAt(this.findWsEnd(pos));
  }
  skipWs() {
    this.pos = this.findWsEnd(this.pos);
  }
  findWsEnd(pos) {
    for (; pos < this.str.length; pos++) {
      const code2 = this.str.charCodeAt(pos);
      if (code2 !== R$1 && code2 !== N$2 && code2 !== F$1 && code2 !== SPACE$3 && code2 !== TAB$1) {
        break;
      }
    }
    return pos;
  }
  substringToPos(end) {
    return this.str.substring(this.pos, this.pos = end);
  }
  eat(code2) {
    if (this.charCode() !== code2) {
      this.error("Expect `" + String.fromCharCode(code2) + "`");
    }
    this.pos++;
  }
  peek() {
    return this.pos < this.str.length ? this.str.charAt(this.pos++) : "";
  }
  error(message) {
    throw new SyntaxError$1(message, this.str, this.pos);
  }
  scanSpaces() {
    return this.substringToPos(this.findWsEnd(this.pos));
  }
  scanWord() {
    let end = this.pos;
    for (; end < this.str.length; end++) {
      const code2 = this.str.charCodeAt(end);
      if (code2 >= 128 || NAME_CHAR[code2] === 0) {
        break;
      }
    }
    if (this.pos === end) {
      this.error("Expect a keyword");
    }
    return this.substringToPos(end);
  }
  scanNumber() {
    let end = this.pos;
    for (; end < this.str.length; end++) {
      const code2 = this.str.charCodeAt(end);
      if (code2 < 48 || code2 > 57) {
        break;
      }
    }
    if (this.pos === end) {
      this.error("Expect a number");
    }
    return this.substringToPos(end);
  }
  scanString() {
    const end = this.str.indexOf("'", this.pos + 1);
    if (end === -1) {
      this.pos = this.str.length;
      this.error("Expect an apostrophe");
    }
    return this.substringToPos(end + 1);
  }
}
const TAB = 9;
const N$1 = 10;
const F = 12;
const R = 13;
const SPACE$2 = 32;
const EXCLAMATIONMARK$2 = 33;
const NUMBERSIGN$3 = 35;
const AMPERSAND$5 = 38;
const APOSTROPHE$2 = 39;
const LEFTPARENTHESIS$2 = 40;
const RIGHTPARENTHESIS$2 = 41;
const ASTERISK$6 = 42;
const PLUSSIGN$6 = 43;
const COMMA = 44;
const HYPERMINUS = 45;
const LESSTHANSIGN$1 = 60;
const GREATERTHANSIGN$3 = 62;
const QUESTIONMARK$1 = 63;
const COMMERCIALAT = 64;
const LEFTSQUAREBRACKET = 91;
const RIGHTSQUAREBRACKET = 93;
const LEFTCURLYBRACKET = 123;
const VERTICALLINE$3 = 124;
const RIGHTCURLYBRACKET = 125;
const INFINITY = 8734;
const COMBINATOR_PRECEDENCE = {
  " ": 1,
  "&&": 2,
  "||": 3,
  "|": 4
};
function readMultiplierRange(scanner2) {
  let min = null;
  let max = null;
  scanner2.eat(LEFTCURLYBRACKET);
  scanner2.skipWs();
  min = scanner2.scanNumber(scanner2);
  scanner2.skipWs();
  if (scanner2.charCode() === COMMA) {
    scanner2.pos++;
    scanner2.skipWs();
    if (scanner2.charCode() !== RIGHTCURLYBRACKET) {
      max = scanner2.scanNumber(scanner2);
      scanner2.skipWs();
    }
  } else {
    max = min;
  }
  scanner2.eat(RIGHTCURLYBRACKET);
  return {
    min: Number(min),
    max: max ? Number(max) : 0
  };
}
function readMultiplier(scanner2) {
  let range = null;
  let comma = false;
  switch (scanner2.charCode()) {
    case ASTERISK$6:
      scanner2.pos++;
      range = {
        min: 0,
        max: 0
      };
      break;
    case PLUSSIGN$6:
      scanner2.pos++;
      range = {
        min: 1,
        max: 0
      };
      break;
    case QUESTIONMARK$1:
      scanner2.pos++;
      range = {
        min: 0,
        max: 1
      };
      break;
    case NUMBERSIGN$3:
      scanner2.pos++;
      comma = true;
      if (scanner2.charCode() === LEFTCURLYBRACKET) {
        range = readMultiplierRange(scanner2);
      } else if (scanner2.charCode() === QUESTIONMARK$1) {
        scanner2.pos++;
        range = {
          min: 0,
          max: 0
        };
      } else {
        range = {
          min: 1,
          max: 0
        };
      }
      break;
    case LEFTCURLYBRACKET:
      range = readMultiplierRange(scanner2);
      break;
    default:
      return null;
  }
  return {
    type: "Multiplier",
    comma,
    min: range.min,
    max: range.max,
    term: null
  };
}
function maybeMultiplied(scanner2, node2) {
  const multiplier = readMultiplier(scanner2);
  if (multiplier !== null) {
    multiplier.term = node2;
    if (scanner2.charCode() === NUMBERSIGN$3 && scanner2.charCodeAt(scanner2.pos - 1) === PLUSSIGN$6) {
      return maybeMultiplied(scanner2, multiplier);
    }
    if (scanner2.charCode() === QUESTIONMARK$1 && scanner2.charCodeAt(scanner2.pos - 1) === RIGHTCURLYBRACKET) {
      return maybeMultiplied(scanner2, multiplier);
    }
    return multiplier;
  }
  return node2;
}
function maybeToken(scanner2) {
  const ch = scanner2.peek();
  if (ch === "") {
    return null;
  }
  return maybeMultiplied(scanner2, {
    type: "Token",
    value: ch
  });
}
function readProperty$1(scanner2) {
  let name2;
  scanner2.eat(LESSTHANSIGN$1);
  scanner2.eat(APOSTROPHE$2);
  name2 = scanner2.scanWord();
  scanner2.eat(APOSTROPHE$2);
  scanner2.eat(GREATERTHANSIGN$3);
  return maybeMultiplied(scanner2, {
    type: "Property",
    name: name2
  });
}
function readTypeRange(scanner2) {
  let min = null;
  let max = null;
  let sign = 1;
  scanner2.eat(LEFTSQUAREBRACKET);
  if (scanner2.charCode() === HYPERMINUS) {
    scanner2.peek();
    sign = -1;
  }
  if (sign == -1 && scanner2.charCode() === INFINITY) {
    scanner2.peek();
  } else {
    min = sign * Number(scanner2.scanNumber(scanner2));
    if (scanner2.isNameCharCode()) {
      min += scanner2.scanWord();
    }
  }
  scanner2.skipWs();
  scanner2.eat(COMMA);
  scanner2.skipWs();
  if (scanner2.charCode() === INFINITY) {
    scanner2.peek();
  } else {
    sign = 1;
    if (scanner2.charCode() === HYPERMINUS) {
      scanner2.peek();
      sign = -1;
    }
    max = sign * Number(scanner2.scanNumber(scanner2));
    if (scanner2.isNameCharCode()) {
      max += scanner2.scanWord();
    }
  }
  scanner2.eat(RIGHTSQUAREBRACKET);
  return {
    type: "Range",
    min,
    max
  };
}
function readType(scanner2) {
  let name2;
  let opts = null;
  scanner2.eat(LESSTHANSIGN$1);
  name2 = scanner2.scanWord();
  if (name2 === "boolean-expr") {
    scanner2.eat(LEFTSQUAREBRACKET);
    const implicitGroup = readImplicitGroup(scanner2, RIGHTSQUAREBRACKET);
    scanner2.eat(RIGHTSQUAREBRACKET);
    scanner2.eat(GREATERTHANSIGN$3);
    return maybeMultiplied(scanner2, {
      type: "Boolean",
      term: implicitGroup.terms.length === 1 ? implicitGroup.terms[0] : implicitGroup
    });
  }
  if (scanner2.charCode() === LEFTPARENTHESIS$2 && scanner2.nextCharCode() === RIGHTPARENTHESIS$2) {
    scanner2.pos += 2;
    name2 += "()";
  }
  if (scanner2.charCodeAt(scanner2.findWsEnd(scanner2.pos)) === LEFTSQUAREBRACKET) {
    scanner2.skipWs();
    opts = readTypeRange(scanner2);
  }
  scanner2.eat(GREATERTHANSIGN$3);
  return maybeMultiplied(scanner2, {
    type: "Type",
    name: name2,
    opts
  });
}
function readKeywordOrFunction(scanner2) {
  const name2 = scanner2.scanWord();
  if (scanner2.charCode() === LEFTPARENTHESIS$2) {
    scanner2.pos++;
    return {
      type: "Function",
      name: name2
    };
  }
  return maybeMultiplied(scanner2, {
    type: "Keyword",
    name: name2
  });
}
function regroupTerms(terms, combinators) {
  function createGroup(terms2, combinator2) {
    return {
      type: "Group",
      terms: terms2,
      combinator: combinator2,
      disallowEmpty: false,
      explicit: false
    };
  }
  let combinator;
  combinators = Object.keys(combinators).sort((a, b) => COMBINATOR_PRECEDENCE[a] - COMBINATOR_PRECEDENCE[b]);
  while (combinators.length > 0) {
    combinator = combinators.shift();
    let i = 0;
    let subgroupStart = 0;
    for (; i < terms.length; i++) {
      const term = terms[i];
      if (term.type === "Combinator") {
        if (term.value === combinator) {
          if (subgroupStart === -1) {
            subgroupStart = i - 1;
          }
          terms.splice(i, 1);
          i--;
        } else {
          if (subgroupStart !== -1 && i - subgroupStart > 1) {
            terms.splice(
              subgroupStart,
              i - subgroupStart,
              createGroup(terms.slice(subgroupStart, i), combinator)
            );
            i = subgroupStart + 1;
          }
          subgroupStart = -1;
        }
      }
    }
    if (subgroupStart !== -1 && combinators.length) {
      terms.splice(
        subgroupStart,
        i - subgroupStart,
        createGroup(terms.slice(subgroupStart, i), combinator)
      );
    }
  }
  return combinator;
}
function readImplicitGroup(scanner2, stopCharCode = -1) {
  const combinators = /* @__PURE__ */ Object.create(null);
  const terms = [];
  let prevToken = null;
  let prevTokenPos = scanner2.pos;
  let prevTokenIsFunction = false;
  while (scanner2.charCode() !== stopCharCode) {
    let token = prevTokenIsFunction ? readImplicitGroup(scanner2, RIGHTPARENTHESIS$2) : peek(scanner2);
    if (!token) {
      break;
    }
    if (token.type === "Spaces") {
      continue;
    }
    if (prevTokenIsFunction) {
      if (token.terms.length === 0) {
        prevTokenIsFunction = false;
        continue;
      }
      if (token.combinator === " ") {
        while (token.terms.length > 1) {
          combinators[" "] = true;
          terms.push({
            type: "Combinator",
            value: " "
          }, token.terms.shift());
        }
        token = token.terms[0];
      }
    }
    if (token.type === "Combinator") {
      if (prevToken === null || prevToken.type === "Combinator") {
        scanner2.pos = prevTokenPos;
        scanner2.error("Unexpected combinator");
      }
      combinators[token.value] = true;
    } else if (prevToken !== null && prevToken.type !== "Combinator") {
      combinators[" "] = true;
      terms.push({
        type: "Combinator",
        value: " "
      });
    }
    terms.push(token);
    prevToken = token;
    prevTokenPos = scanner2.pos;
    prevTokenIsFunction = token.type === "Function";
  }
  if (prevToken !== null && prevToken.type === "Combinator") {
    scanner2.pos -= prevTokenPos;
    scanner2.error("Unexpected combinator");
  }
  return {
    type: "Group",
    terms,
    combinator: regroupTerms(terms, combinators) || " ",
    disallowEmpty: false,
    explicit: false
  };
}
function readGroup(scanner2) {
  let result;
  scanner2.eat(LEFTSQUAREBRACKET);
  result = readImplicitGroup(scanner2, RIGHTSQUAREBRACKET);
  scanner2.eat(RIGHTSQUAREBRACKET);
  result.explicit = true;
  if (scanner2.charCode() === EXCLAMATIONMARK$2) {
    scanner2.pos++;
    result.disallowEmpty = true;
  }
  return result;
}
function peek(scanner2) {
  let code2 = scanner2.charCode();
  switch (code2) {
    case RIGHTSQUAREBRACKET:
      break;
    case LEFTSQUAREBRACKET:
      return maybeMultiplied(scanner2, readGroup(scanner2));
    case LESSTHANSIGN$1:
      return scanner2.nextCharCode() === APOSTROPHE$2 ? readProperty$1(scanner2) : readType(scanner2);
    case VERTICALLINE$3:
      return {
        type: "Combinator",
        value: scanner2.substringToPos(
          scanner2.pos + (scanner2.nextCharCode() === VERTICALLINE$3 ? 2 : 1)
        )
      };
    case AMPERSAND$5:
      scanner2.pos++;
      scanner2.eat(AMPERSAND$5);
      return {
        type: "Combinator",
        value: "&&"
      };
    case COMMA:
      scanner2.pos++;
      return {
        type: "Comma"
      };
    case APOSTROPHE$2:
      return maybeMultiplied(scanner2, {
        type: "String",
        value: scanner2.scanString()
      });
    case SPACE$2:
    case TAB:
    case N$1:
    case R:
    case F:
      return {
        type: "Spaces",
        value: scanner2.scanSpaces()
      };
    case COMMERCIALAT:
      code2 = scanner2.nextCharCode();
      if (scanner2.isNameCharCode(code2)) {
        scanner2.pos++;
        return {
          type: "AtKeyword",
          name: scanner2.scanWord()
        };
      }
      return maybeToken(scanner2);
    case ASTERISK$6:
    case PLUSSIGN$6:
    case QUESTIONMARK$1:
    case NUMBERSIGN$3:
    case EXCLAMATIONMARK$2:
      break;
    case LEFTCURLYBRACKET:
      code2 = scanner2.nextCharCode();
      if (code2 < 48 || code2 > 57) {
        return maybeToken(scanner2);
      }
      break;
    default:
      if (scanner2.isNameCharCode(code2)) {
        return readKeywordOrFunction(scanner2);
      }
      return maybeToken(scanner2);
  }
}
function parse$O(source) {
  const scanner2 = new Scanner(source);
  const result = readImplicitGroup(scanner2);
  if (scanner2.pos !== source.length) {
    scanner2.error("Unexpected input");
  }
  if (result.terms.length === 1 && result.terms[0].type === "Group") {
    return result.terms[0];
  }
  return result;
}
const noop = function() {
};
function ensureFunction(value2) {
  return typeof value2 === "function" ? value2 : noop;
}
function walk$1(node2, options, context) {
  function walk2(node3) {
    enter.call(context, node3);
    switch (node3.type) {
      case "Group":
        node3.terms.forEach(walk2);
        break;
      case "Multiplier":
      case "Boolean":
        walk2(node3.term);
        break;
      case "Type":
      case "Property":
      case "Keyword":
      case "AtKeyword":
      case "Function":
      case "String":
      case "Token":
      case "Comma":
        break;
      default:
        throw new Error("Unknown type: " + node3.type);
    }
    leave.call(context, node3);
  }
  let enter = noop;
  let leave = noop;
  if (typeof options === "function") {
    enter = options;
  } else if (options) {
    enter = ensureFunction(options.enter);
    leave = ensureFunction(options.leave);
  }
  if (enter === noop && leave === noop) {
    throw new Error("Neither `enter` nor `leave` walker handler is set or both aren't a function");
  }
  walk2(node2);
}
const astToTokens = {
  decorator(handlers) {
    const tokens = [];
    let curNode = null;
    return {
      ...handlers,
      node(node2) {
        const tmp = curNode;
        curNode = node2;
        handlers.node.call(this, node2);
        curNode = tmp;
      },
      emit(value2, type, auto) {
        tokens.push({
          type,
          value: value2,
          node: auto ? null : curNode
        });
      },
      result() {
        return tokens;
      }
    };
  }
};
function stringToTokens(str) {
  const tokens = [];
  tokenize$1(
    str,
    (type, start, end) => tokens.push({
      type,
      value: str.slice(start, end),
      node: null
    })
  );
  return tokens;
}
function prepareTokens(value2, syntax2) {
  if (typeof value2 === "string") {
    return stringToTokens(value2);
  }
  return syntax2.generate(value2, astToTokens);
}
const MATCH = { type: "Match" };
const MISMATCH = { type: "Mismatch" };
const DISALLOW_EMPTY = { type: "DisallowEmpty" };
const LEFTPARENTHESIS$1 = 40;
const RIGHTPARENTHESIS$1 = 41;
function createCondition(match2, thenBranch, elseBranch) {
  if (thenBranch === MATCH && elseBranch === MISMATCH) {
    return match2;
  }
  if (match2 === MATCH && thenBranch === MATCH && elseBranch === MATCH) {
    return match2;
  }
  if (match2.type === "If" && match2.else === MISMATCH && thenBranch === MATCH) {
    thenBranch = match2.then;
    match2 = match2.match;
  }
  return {
    type: "If",
    match: match2,
    then: thenBranch,
    else: elseBranch
  };
}
function isFunctionType(name2) {
  return name2.length > 2 && name2.charCodeAt(name2.length - 2) === LEFTPARENTHESIS$1 && name2.charCodeAt(name2.length - 1) === RIGHTPARENTHESIS$1;
}
function isEnumCapatible(term) {
  return term.type === "Keyword" || term.type === "AtKeyword" || term.type === "Function" || term.type === "Type" && isFunctionType(term.name);
}
function groupNode(terms, combinator = " ", explicit = false) {
  return {
    type: "Group",
    terms,
    combinator,
    disallowEmpty: false,
    explicit
  };
}
function replaceTypeInGraph(node2, replacements, visited = /* @__PURE__ */ new Set()) {
  if (!visited.has(node2)) {
    visited.add(node2);
    switch (node2.type) {
      case "If":
        node2.match = replaceTypeInGraph(node2.match, replacements, visited);
        node2.then = replaceTypeInGraph(node2.then, replacements, visited);
        node2.else = replaceTypeInGraph(node2.else, replacements, visited);
        break;
      case "Type":
        return replacements[node2.name] || node2;
    }
  }
  return node2;
}
function buildGroupMatchGraph(combinator, terms, atLeastOneTermMatched) {
  switch (combinator) {
    case " ": {
      let result = MATCH;
      for (let i = terms.length - 1; i >= 0; i--) {
        const term = terms[i];
        result = createCondition(
          term,
          result,
          MISMATCH
        );
      }
      return result;
    }
    case "|": {
      let result = MISMATCH;
      let map = null;
      for (let i = terms.length - 1; i >= 0; i--) {
        let term = terms[i];
        if (isEnumCapatible(term)) {
          if (map === null && i > 0 && isEnumCapatible(terms[i - 1])) {
            map = /* @__PURE__ */ Object.create(null);
            result = createCondition(
              {
                type: "Enum",
                map
              },
              MATCH,
              result
            );
          }
          if (map !== null) {
            const key = (isFunctionType(term.name) ? term.name.slice(0, -1) : term.name).toLowerCase();
            if (key in map === false) {
              map[key] = term;
              continue;
            }
          }
        }
        map = null;
        result = createCondition(
          term,
          MATCH,
          result
        );
      }
      return result;
    }
    case "&&": {
      if (terms.length > 5) {
        return {
          type: "MatchOnce",
          terms,
          all: true
        };
      }
      let result = MISMATCH;
      for (let i = terms.length - 1; i >= 0; i--) {
        const term = terms[i];
        let thenClause;
        if (terms.length > 1) {
          thenClause = buildGroupMatchGraph(
            combinator,
            terms.filter(function(newGroupTerm) {
              return newGroupTerm !== term;
            }),
            false
          );
        } else {
          thenClause = MATCH;
        }
        result = createCondition(
          term,
          thenClause,
          result
        );
      }
      return result;
    }
    case "||": {
      if (terms.length > 5) {
        return {
          type: "MatchOnce",
          terms,
          all: false
        };
      }
      let result = atLeastOneTermMatched ? MATCH : MISMATCH;
      for (let i = terms.length - 1; i >= 0; i--) {
        const term = terms[i];
        let thenClause;
        if (terms.length > 1) {
          thenClause = buildGroupMatchGraph(
            combinator,
            terms.filter(function(newGroupTerm) {
              return newGroupTerm !== term;
            }),
            true
          );
        } else {
          thenClause = MATCH;
        }
        result = createCondition(
          term,
          thenClause,
          result
        );
      }
      return result;
    }
  }
}
function buildMultiplierMatchGraph(node2) {
  let result = MATCH;
  let matchTerm = buildMatchGraphInternal(node2.term);
  if (node2.max === 0) {
    matchTerm = createCondition(
      matchTerm,
      DISALLOW_EMPTY,
      MISMATCH
    );
    result = createCondition(
      matchTerm,
      null,
      // will be a loop
      MISMATCH
    );
    result.then = createCondition(
      MATCH,
      MATCH,
      result
      // make a loop
    );
    if (node2.comma) {
      result.then.else = createCondition(
        { type: "Comma", syntax: node2 },
        result,
        MISMATCH
      );
    }
  } else {
    for (let i = node2.min || 1; i <= node2.max; i++) {
      if (node2.comma && result !== MATCH) {
        result = createCondition(
          { type: "Comma", syntax: node2 },
          result,
          MISMATCH
        );
      }
      result = createCondition(
        matchTerm,
        createCondition(
          MATCH,
          MATCH,
          result
        ),
        MISMATCH
      );
    }
  }
  if (node2.min === 0) {
    result = createCondition(
      MATCH,
      MATCH,
      result
    );
  } else {
    for (let i = 0; i < node2.min - 1; i++) {
      if (node2.comma && result !== MATCH) {
        result = createCondition(
          { type: "Comma", syntax: node2 },
          result,
          MISMATCH
        );
      }
      result = createCondition(
        matchTerm,
        result,
        MISMATCH
      );
    }
  }
  return result;
}
function buildMatchGraphInternal(node2) {
  if (typeof node2 === "function") {
    return {
      type: "Generic",
      fn: node2
    };
  }
  switch (node2.type) {
    case "Group": {
      let result = buildGroupMatchGraph(
        node2.combinator,
        node2.terms.map(buildMatchGraphInternal),
        false
      );
      if (node2.disallowEmpty) {
        result = createCondition(
          result,
          DISALLOW_EMPTY,
          MISMATCH
        );
      }
      return result;
    }
    case "Multiplier":
      return buildMultiplierMatchGraph(node2);
    // https://drafts.csswg.org/css-values-5/#boolean
    case "Boolean": {
      const term = buildMatchGraphInternal(node2.term);
      const matchNode = buildMatchGraphInternal(groupNode([
        groupNode([
          { type: "Keyword", name: "not" },
          { type: "Type", name: "!boolean-group" }
        ]),
        groupNode([
          { type: "Type", name: "!boolean-group" },
          groupNode([
            { type: "Multiplier", comma: false, min: 0, max: 0, term: groupNode([
              { type: "Keyword", name: "and" },
              { type: "Type", name: "!boolean-group" }
            ]) },
            { type: "Multiplier", comma: false, min: 0, max: 0, term: groupNode([
              { type: "Keyword", name: "or" },
              { type: "Type", name: "!boolean-group" }
            ]) }
          ], "|")
        ])
      ], "|"));
      const booleanGroup = buildMatchGraphInternal(
        groupNode([
          { type: "Type", name: "!term" },
          groupNode([
            { type: "Token", value: "(" },
            { type: "Type", name: "!self" },
            { type: "Token", value: ")" }
          ]),
          { type: "Type", name: "general-enclosed" }
        ], "|")
      );
      replaceTypeInGraph(booleanGroup, { "!term": term, "!self": matchNode });
      replaceTypeInGraph(matchNode, { "!boolean-group": booleanGroup });
      return matchNode;
    }
    case "Type":
    case "Property":
      return {
        type: node2.type,
        name: node2.name,
        syntax: node2
      };
    case "Keyword":
      return {
        type: node2.type,
        name: node2.name.toLowerCase(),
        syntax: node2
      };
    case "AtKeyword":
      return {
        type: node2.type,
        name: "@" + node2.name.toLowerCase(),
        syntax: node2
      };
    case "Function":
      return {
        type: node2.type,
        name: node2.name.toLowerCase() + "(",
        syntax: node2
      };
    case "String":
      if (node2.value.length === 3) {
        return {
          type: "Token",
          value: node2.value.charAt(1),
          syntax: node2
        };
      }
      return {
        type: node2.type,
        value: node2.value.substr(1, node2.value.length - 2).replace(/\\'/g, "'"),
        syntax: node2
      };
    case "Token":
      return {
        type: node2.type,
        value: node2.value,
        syntax: node2
      };
    case "Comma":
      return {
        type: node2.type,
        syntax: node2
      };
    default:
      throw new Error("Unknown node type:", node2.type);
  }
}
function buildMatchGraph(syntaxTree, ref) {
  if (typeof syntaxTree === "string") {
    syntaxTree = parse$O(syntaxTree);
  }
  return {
    type: "MatchGraph",
    match: buildMatchGraphInternal(syntaxTree),
    syntax: ref || null,
    source: syntaxTree
  };
}
const { hasOwnProperty: hasOwnProperty$2 } = Object.prototype;
const STUB = 0;
const TOKEN = 1;
const OPEN_SYNTAX = 2;
const CLOSE_SYNTAX = 3;
const EXIT_REASON_MATCH = "Match";
const EXIT_REASON_MISMATCH = "Mismatch";
const EXIT_REASON_ITERATION_LIMIT = "Maximum iteration number exceeded (please fill an issue on https://github.com/csstree/csstree/issues)";
const ITERATION_LIMIT = 15e3;
function reverseList(list) {
  let prev = null;
  let next = null;
  let item = list;
  while (item !== null) {
    next = item.prev;
    item.prev = prev;
    prev = item;
    item = next;
  }
  return prev;
}
function areStringsEqualCaseInsensitive(testStr, referenceStr) {
  if (testStr.length !== referenceStr.length) {
    return false;
  }
  for (let i = 0; i < testStr.length; i++) {
    const referenceCode = referenceStr.charCodeAt(i);
    let testCode = testStr.charCodeAt(i);
    if (testCode >= 65 && testCode <= 90) {
      testCode = testCode | 32;
    }
    if (testCode !== referenceCode) {
      return false;
    }
  }
  return true;
}
function isContextEdgeDelim(token) {
  if (token.type !== Delim) {
    return false;
  }
  return token.value !== "?";
}
function isCommaContextStart(token) {
  if (token === null) {
    return true;
  }
  return token.type === Comma || token.type === Function$2 || token.type === LeftParenthesis || token.type === LeftSquareBracket || token.type === LeftCurlyBracket || isContextEdgeDelim(token);
}
function isCommaContextEnd(token) {
  if (token === null) {
    return true;
  }
  return token.type === RightParenthesis || token.type === RightSquareBracket || token.type === RightCurlyBracket || token.type === Delim && token.value === "/";
}
function internalMatch(tokens, state, syntaxes) {
  function moveToNextToken() {
    do {
      tokenIndex++;
      token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
    } while (token !== null && (token.type === WhiteSpace$1 || token.type === Comment$1));
  }
  function getNextToken(offset) {
    const nextIndex = tokenIndex + offset;
    return nextIndex < tokens.length ? tokens[nextIndex] : null;
  }
  function stateSnapshotFromSyntax(nextState, prev) {
    return {
      nextState,
      matchStack,
      syntaxStack,
      thenStack,
      tokenIndex,
      prev
    };
  }
  function pushThenStack(nextState) {
    thenStack = {
      nextState,
      matchStack,
      syntaxStack,
      prev: thenStack
    };
  }
  function pushElseStack(nextState) {
    elseStack = stateSnapshotFromSyntax(nextState, elseStack);
  }
  function addTokenToMatch() {
    matchStack = {
      type: TOKEN,
      syntax: state.syntax,
      token,
      prev: matchStack
    };
    moveToNextToken();
    syntaxStash = null;
    if (tokenIndex > longestMatch) {
      longestMatch = tokenIndex;
    }
  }
  function openSyntax() {
    syntaxStack = {
      syntax: state.syntax,
      opts: state.syntax.opts || syntaxStack !== null && syntaxStack.opts || null,
      prev: syntaxStack
    };
    matchStack = {
      type: OPEN_SYNTAX,
      syntax: state.syntax,
      token: matchStack.token,
      prev: matchStack
    };
  }
  function closeSyntax() {
    if (matchStack.type === OPEN_SYNTAX) {
      matchStack = matchStack.prev;
    } else {
      matchStack = {
        type: CLOSE_SYNTAX,
        syntax: syntaxStack.syntax,
        token: matchStack.token,
        prev: matchStack
      };
    }
    syntaxStack = syntaxStack.prev;
  }
  let syntaxStack = null;
  let thenStack = null;
  let elseStack = null;
  let syntaxStash = null;
  let iterationCount = 0;
  let exitReason = null;
  let token = null;
  let tokenIndex = -1;
  let longestMatch = 0;
  let matchStack = {
    type: STUB,
    syntax: null,
    token: null,
    prev: null
  };
  moveToNextToken();
  while (exitReason === null && ++iterationCount < ITERATION_LIMIT) {
    switch (state.type) {
      case "Match":
        if (thenStack === null) {
          if (token !== null) {
            if (tokenIndex !== tokens.length - 1 || token.value !== "\\0" && token.value !== "\\9") {
              state = MISMATCH;
              break;
            }
          }
          exitReason = EXIT_REASON_MATCH;
          break;
        }
        state = thenStack.nextState;
        if (state === DISALLOW_EMPTY) {
          if (thenStack.matchStack === matchStack) {
            state = MISMATCH;
            break;
          } else {
            state = MATCH;
          }
        }
        while (thenStack.syntaxStack !== syntaxStack) {
          closeSyntax();
        }
        thenStack = thenStack.prev;
        break;
      case "Mismatch":
        if (syntaxStash !== null && syntaxStash !== false) {
          if (elseStack === null || tokenIndex > elseStack.tokenIndex) {
            elseStack = syntaxStash;
            syntaxStash = false;
          }
        } else if (elseStack === null) {
          exitReason = EXIT_REASON_MISMATCH;
          break;
        }
        state = elseStack.nextState;
        thenStack = elseStack.thenStack;
        syntaxStack = elseStack.syntaxStack;
        matchStack = elseStack.matchStack;
        tokenIndex = elseStack.tokenIndex;
        token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
        elseStack = elseStack.prev;
        break;
      case "MatchGraph":
        state = state.match;
        break;
      case "If":
        if (state.else !== MISMATCH) {
          pushElseStack(state.else);
        }
        if (state.then !== MATCH) {
          pushThenStack(state.then);
        }
        state = state.match;
        break;
      case "MatchOnce":
        state = {
          type: "MatchOnceBuffer",
          syntax: state,
          index: 0,
          mask: 0
        };
        break;
      case "MatchOnceBuffer": {
        const terms = state.syntax.terms;
        if (state.index === terms.length) {
          if (state.mask === 0 || state.syntax.all) {
            state = MISMATCH;
            break;
          }
          state = MATCH;
          break;
        }
        if (state.mask === (1 << terms.length) - 1) {
          state = MATCH;
          break;
        }
        for (; state.index < terms.length; state.index++) {
          const matchFlag = 1 << state.index;
          if ((state.mask & matchFlag) === 0) {
            pushElseStack(state);
            pushThenStack({
              type: "AddMatchOnce",
              syntax: state.syntax,
              mask: state.mask | matchFlag
            });
            state = terms[state.index++];
            break;
          }
        }
        break;
      }
      case "AddMatchOnce":
        state = {
          type: "MatchOnceBuffer",
          syntax: state.syntax,
          index: 0,
          mask: state.mask
        };
        break;
      case "Enum":
        if (token !== null) {
          let name2 = token.value.toLowerCase();
          if (name2.indexOf("\\") !== -1) {
            name2 = name2.replace(/\\[09].*$/, "");
          }
          if (hasOwnProperty$2.call(state.map, name2)) {
            state = state.map[name2];
            break;
          }
        }
        state = MISMATCH;
        break;
      case "Generic": {
        const opts = syntaxStack !== null ? syntaxStack.opts : null;
        const lastTokenIndex2 = tokenIndex + Math.floor(state.fn(token, getNextToken, opts));
        if (!isNaN(lastTokenIndex2) && lastTokenIndex2 > tokenIndex) {
          while (tokenIndex < lastTokenIndex2) {
            addTokenToMatch();
          }
          state = MATCH;
        } else {
          state = MISMATCH;
        }
        break;
      }
      case "Type":
      case "Property": {
        const syntaxDict = state.type === "Type" ? "types" : "properties";
        const dictSyntax = hasOwnProperty$2.call(syntaxes, syntaxDict) ? syntaxes[syntaxDict][state.name] : null;
        if (!dictSyntax || !dictSyntax.match) {
          throw new Error(
            "Bad syntax reference: " + (state.type === "Type" ? "<" + state.name + ">" : "<'" + state.name + "'>")
          );
        }
        if (syntaxStash !== false && token !== null && state.type === "Type") {
          const lowPriorityMatching = (
            // https://drafts.csswg.org/css-values-4/#custom-idents
            // When parsing positionally-ambiguous keywords in a property value, a <custom-ident> production
            // can only claim the keyword if no other unfulfilled production can claim it.
            state.name === "custom-ident" && token.type === Ident || // https://drafts.csswg.org/css-values-4/#lengths
            // ... if a `0` could be parsed as either a <number> or a <length> in a property (such as line-height),
            // it must parse as a <number>
            state.name === "length" && token.value === "0"
          );
          if (lowPriorityMatching) {
            if (syntaxStash === null) {
              syntaxStash = stateSnapshotFromSyntax(state, elseStack);
            }
            state = MISMATCH;
            break;
          }
        }
        openSyntax();
        state = dictSyntax.matchRef || dictSyntax.match;
        break;
      }
      case "Keyword": {
        const name2 = state.name;
        if (token !== null) {
          let keywordName = token.value;
          if (keywordName.indexOf("\\") !== -1) {
            keywordName = keywordName.replace(/\\[09].*$/, "");
          }
          if (areStringsEqualCaseInsensitive(keywordName, name2)) {
            addTokenToMatch();
            state = MATCH;
            break;
          }
        }
        state = MISMATCH;
        break;
      }
      case "AtKeyword":
      case "Function":
        if (token !== null && areStringsEqualCaseInsensitive(token.value, state.name)) {
          addTokenToMatch();
          state = MATCH;
          break;
        }
        state = MISMATCH;
        break;
      case "Token":
        if (token !== null && token.value === state.value) {
          addTokenToMatch();
          state = MATCH;
          break;
        }
        state = MISMATCH;
        break;
      case "Comma":
        if (token !== null && token.type === Comma) {
          if (isCommaContextStart(matchStack.token)) {
            state = MISMATCH;
          } else {
            addTokenToMatch();
            state = isCommaContextEnd(token) ? MISMATCH : MATCH;
          }
        } else {
          state = isCommaContextStart(matchStack.token) || isCommaContextEnd(token) ? MATCH : MISMATCH;
        }
        break;
      case "String":
        let string2 = "";
        let lastTokenIndex = tokenIndex;
        for (; lastTokenIndex < tokens.length && string2.length < state.value.length; lastTokenIndex++) {
          string2 += tokens[lastTokenIndex].value;
        }
        if (areStringsEqualCaseInsensitive(string2, state.value)) {
          while (tokenIndex < lastTokenIndex) {
            addTokenToMatch();
          }
          state = MATCH;
        } else {
          state = MISMATCH;
        }
        break;
      default:
        throw new Error("Unknown node type: " + state.type);
    }
  }
  switch (exitReason) {
    case null:
      console.warn("[csstree-match] BREAK after " + ITERATION_LIMIT + " iterations");
      exitReason = EXIT_REASON_ITERATION_LIMIT;
      matchStack = null;
      break;
    case EXIT_REASON_MATCH:
      while (syntaxStack !== null) {
        closeSyntax();
      }
      break;
    default:
      matchStack = null;
  }
  return {
    tokens,
    reason: exitReason,
    iterations: iterationCount,
    match: matchStack,
    longestMatch
  };
}
function matchAsTree(tokens, matchGraph2, syntaxes) {
  const matchResult = internalMatch(tokens, matchGraph2, syntaxes || {});
  if (matchResult.match === null) {
    return matchResult;
  }
  let item = matchResult.match;
  let host = matchResult.match = {
    syntax: matchGraph2.syntax || null,
    match: []
  };
  const hostStack = [host];
  item = reverseList(item).prev;
  while (item !== null) {
    switch (item.type) {
      case OPEN_SYNTAX:
        host.match.push(host = {
          syntax: item.syntax,
          match: []
        });
        hostStack.push(host);
        break;
      case CLOSE_SYNTAX:
        hostStack.pop();
        host = hostStack[hostStack.length - 1];
        break;
      default:
        host.match.push({
          syntax: item.syntax || null,
          token: item.token.value,
          node: item.token.node
        });
    }
    item = item.prev;
  }
  return matchResult;
}
function getTrace(node2) {
  function shouldPutToTrace(syntax2) {
    if (syntax2 === null) {
      return false;
    }
    return syntax2.type === "Type" || syntax2.type === "Property" || syntax2.type === "Keyword";
  }
  function hasMatch(matchNode) {
    if (Array.isArray(matchNode.match)) {
      for (let i = 0; i < matchNode.match.length; i++) {
        if (hasMatch(matchNode.match[i])) {
          if (shouldPutToTrace(matchNode.syntax)) {
            result.unshift(matchNode.syntax);
          }
          return true;
        }
      }
    } else if (matchNode.node === node2) {
      result = shouldPutToTrace(matchNode.syntax) ? [matchNode.syntax] : [];
      return true;
    }
    return false;
  }
  let result = null;
  if (this.matched !== null) {
    hasMatch(this.matched);
  }
  return result;
}
function isType(node2, type) {
  return testNode(this, node2, (match2) => match2.type === "Type" && match2.name === type);
}
function isProperty(node2, property2) {
  return testNode(this, node2, (match2) => match2.type === "Property" && match2.name === property2);
}
function isKeyword(node2) {
  return testNode(this, node2, (match2) => match2.type === "Keyword");
}
function testNode(match2, node2, fn) {
  const trace2 = getTrace.call(match2, node2);
  if (trace2 === null) {
    return false;
  }
  return trace2.some(fn);
}
const trace = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getTrace,
  isKeyword,
  isProperty,
  isType
});
function getFirstMatchNode(matchNode) {
  if ("node" in matchNode) {
    return matchNode.node;
  }
  return getFirstMatchNode(matchNode.match[0]);
}
function getLastMatchNode(matchNode) {
  if ("node" in matchNode) {
    return matchNode.node;
  }
  return getLastMatchNode(matchNode.match[matchNode.match.length - 1]);
}
function matchFragments(lexer2, ast, match2, type, name2) {
  function findFragments(matchNode) {
    if (matchNode.syntax !== null && matchNode.syntax.type === type && matchNode.syntax.name === name2) {
      const start = getFirstMatchNode(matchNode);
      const end = getLastMatchNode(matchNode);
      lexer2.syntax.walk(ast, function(node2, item, list) {
        if (node2 === start) {
          const nodes = new List();
          do {
            nodes.appendData(item.data);
            if (item.data === end) {
              break;
            }
            item = item.next;
          } while (item !== null);
          fragments.push({
            parent: list,
            nodes
          });
        }
      });
    }
    if (Array.isArray(matchNode.match)) {
      matchNode.match.forEach(findFragments);
    }
  }
  const fragments = [];
  if (match2.matched !== null) {
    findFragments(match2.matched);
  }
  return fragments;
}
const { hasOwnProperty: hasOwnProperty$1 } = Object.prototype;
function isValidNumber(value2) {
  return typeof value2 === "number" && isFinite(value2) && Math.floor(value2) === value2 && value2 >= 0;
}
function isValidLocation(loc) {
  return Boolean(loc) && isValidNumber(loc.offset) && isValidNumber(loc.line) && isValidNumber(loc.column);
}
function createNodeStructureChecker(type, fields) {
  return function checkNode(node2, warn) {
    if (!node2 || node2.constructor !== Object) {
      return warn(node2, "Type of node should be an Object");
    }
    for (let key in node2) {
      let valid = true;
      if (hasOwnProperty$1.call(node2, key) === false) {
        continue;
      }
      if (key === "type") {
        if (node2.type !== type) {
          warn(node2, "Wrong node type `" + node2.type + "`, expected `" + type + "`");
        }
      } else if (key === "loc") {
        if (node2.loc === null) {
          continue;
        } else if (node2.loc && node2.loc.constructor === Object) {
          if (typeof node2.loc.source !== "string") {
            key += ".source";
          } else if (!isValidLocation(node2.loc.start)) {
            key += ".start";
          } else if (!isValidLocation(node2.loc.end)) {
            key += ".end";
          } else {
            continue;
          }
        }
        valid = false;
      } else if (fields.hasOwnProperty(key)) {
        valid = false;
        for (let i = 0; !valid && i < fields[key].length; i++) {
          const fieldType = fields[key][i];
          switch (fieldType) {
            case String:
              valid = typeof node2[key] === "string";
              break;
            case Boolean:
              valid = typeof node2[key] === "boolean";
              break;
            case null:
              valid = node2[key] === null;
              break;
            default:
              if (typeof fieldType === "string") {
                valid = node2[key] && node2[key].type === fieldType;
              } else if (Array.isArray(fieldType)) {
                valid = node2[key] instanceof List;
              }
          }
        }
      } else {
        warn(node2, "Unknown field `" + key + "` for " + type + " node type");
      }
      if (!valid) {
        warn(node2, "Bad value for `" + type + "." + key + "`");
      }
    }
    for (const key in fields) {
      if (hasOwnProperty$1.call(fields, key) && hasOwnProperty$1.call(node2, key) === false) {
        warn(node2, "Field `" + type + "." + key + "` is missed");
      }
    }
  };
}
function genTypesList(fieldTypes, path) {
  const docsTypes = [];
  for (let i = 0; i < fieldTypes.length; i++) {
    const fieldType = fieldTypes[i];
    if (fieldType === String || fieldType === Boolean) {
      docsTypes.push(fieldType.name.toLowerCase());
    } else if (fieldType === null) {
      docsTypes.push("null");
    } else if (typeof fieldType === "string") {
      docsTypes.push(fieldType);
    } else if (Array.isArray(fieldType)) {
      docsTypes.push("List<" + (genTypesList(fieldType, path) || "any") + ">");
    } else {
      throw new Error("Wrong value `" + fieldType + "` in `" + path + "` structure definition");
    }
  }
  return docsTypes.join(" | ");
}
function processStructure(name2, nodeType) {
  const structure2 = nodeType.structure;
  const fields = {
    type: String,
    loc: true
  };
  const docs = {
    type: '"' + name2 + '"'
  };
  for (const key in structure2) {
    if (hasOwnProperty$1.call(structure2, key) === false) {
      continue;
    }
    const fieldTypes = fields[key] = Array.isArray(structure2[key]) ? structure2[key].slice() : [structure2[key]];
    docs[key] = genTypesList(fieldTypes, name2 + "." + key);
  }
  return {
    docs,
    check: createNodeStructureChecker(name2, fields)
  };
}
function getStructureFromConfig(config) {
  const structure2 = {};
  if (config.node) {
    for (const name2 in config.node) {
      if (hasOwnProperty$1.call(config.node, name2)) {
        const nodeType = config.node[name2];
        if (nodeType.structure) {
          structure2[name2] = processStructure(name2, nodeType);
        } else {
          throw new Error("Missed `structure` field in `" + name2 + "` node type definition");
        }
      }
    }
  }
  return structure2;
}
function dumpMapSyntax(map, compact, syntaxAsAst) {
  const result = {};
  for (const name2 in map) {
    if (map[name2].syntax) {
      result[name2] = syntaxAsAst ? map[name2].syntax : generate$O(map[name2].syntax, { compact });
    }
  }
  return result;
}
function dumpAtruleMapSyntax(map, compact, syntaxAsAst) {
  const result = {};
  for (const [name2, atrule2] of Object.entries(map)) {
    result[name2] = {
      prelude: atrule2.prelude && (syntaxAsAst ? atrule2.prelude.syntax : generate$O(atrule2.prelude.syntax, { compact })),
      descriptors: atrule2.descriptors && dumpMapSyntax(atrule2.descriptors, compact, syntaxAsAst)
    };
  }
  return result;
}
function valueHasVar(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value.toLowerCase() === "var(") {
      return true;
    }
  }
  return false;
}
function syntaxHasTopLevelCommaMultiplier(syntax2) {
  const singleTerm = syntax2.terms[0];
  return syntax2.explicit === false && syntax2.terms.length === 1 && singleTerm.type === "Multiplier" && singleTerm.comma === true;
}
function buildMatchResult(matched, error2, iterations) {
  return {
    matched,
    iterations,
    error: error2,
    ...trace
  };
}
function matchSyntax(lexer2, syntax2, value2, useCssWideKeywords) {
  const tokens = prepareTokens(value2, lexer2.syntax);
  let result;
  if (valueHasVar(tokens)) {
    return buildMatchResult(null, new Error("Matching for a tree with var() is not supported"));
  }
  if (useCssWideKeywords) {
    result = matchAsTree(tokens, lexer2.cssWideKeywordsSyntax, lexer2);
  }
  if (!useCssWideKeywords || !result.match) {
    result = matchAsTree(tokens, syntax2.match, lexer2);
    if (!result.match) {
      return buildMatchResult(
        null,
        new SyntaxMatchError(result.reason, syntax2.syntax, value2, result),
        result.iterations
      );
    }
  }
  return buildMatchResult(result.match, null, result.iterations);
}
class Lexer {
  constructor(config, syntax2, structure2) {
    this.cssWideKeywords = cssWideKeywords;
    this.syntax = syntax2;
    this.generic = false;
    this.units = { ...units };
    this.atrules = /* @__PURE__ */ Object.create(null);
    this.properties = /* @__PURE__ */ Object.create(null);
    this.types = /* @__PURE__ */ Object.create(null);
    this.structure = structure2 || getStructureFromConfig(config);
    if (config) {
      if (config.cssWideKeywords) {
        this.cssWideKeywords = config.cssWideKeywords;
      }
      if (config.units) {
        for (const group of Object.keys(units)) {
          if (Array.isArray(config.units[group])) {
            this.units[group] = config.units[group];
          }
        }
      }
      if (config.types) {
        for (const [name2, type] of Object.entries(config.types)) {
          this.addType_(name2, type);
        }
      }
      if (config.generic) {
        this.generic = true;
        for (const [name2, value2] of Object.entries(createGenericTypes(this.units))) {
          this.addType_(name2, value2);
        }
      }
      if (config.atrules) {
        for (const [name2, atrule2] of Object.entries(config.atrules)) {
          this.addAtrule_(name2, atrule2);
        }
      }
      if (config.properties) {
        for (const [name2, property2] of Object.entries(config.properties)) {
          this.addProperty_(name2, property2);
        }
      }
    }
    this.cssWideKeywordsSyntax = buildMatchGraph(this.cssWideKeywords.join(" |  "));
  }
  checkStructure(ast) {
    function collectWarning(node2, message) {
      warns.push({ node: node2, message });
    }
    const structure2 = this.structure;
    const warns = [];
    this.syntax.walk(ast, function(node2) {
      if (structure2.hasOwnProperty(node2.type)) {
        structure2[node2.type].check(node2, collectWarning);
      } else {
        collectWarning(node2, "Unknown node type `" + node2.type + "`");
      }
    });
    return warns.length ? warns : false;
  }
  createDescriptor(syntax2, type, name2, parent = null) {
    const ref = {
      type,
      name: name2
    };
    const descriptor = {
      type,
      name: name2,
      parent,
      serializable: typeof syntax2 === "string" || syntax2 && typeof syntax2.type === "string",
      syntax: null,
      match: null,
      matchRef: null
      // used for properties when a syntax referenced as <'property'> in other syntax definitions
    };
    if (typeof syntax2 === "function") {
      descriptor.match = buildMatchGraph(syntax2, ref);
    } else {
      if (typeof syntax2 === "string") {
        Object.defineProperty(descriptor, "syntax", {
          get() {
            Object.defineProperty(descriptor, "syntax", {
              value: parse$O(syntax2)
            });
            return descriptor.syntax;
          }
        });
      } else {
        descriptor.syntax = syntax2;
      }
      Object.defineProperty(descriptor, "match", {
        get() {
          Object.defineProperty(descriptor, "match", {
            value: buildMatchGraph(descriptor.syntax, ref)
          });
          return descriptor.match;
        }
      });
      if (type === "Property") {
        Object.defineProperty(descriptor, "matchRef", {
          get() {
            const syntax3 = descriptor.syntax;
            const value2 = syntaxHasTopLevelCommaMultiplier(syntax3) ? buildMatchGraph({
              ...syntax3,
              terms: [syntax3.terms[0].term]
            }, ref) : null;
            Object.defineProperty(descriptor, "matchRef", {
              value: value2
            });
            return value2;
          }
        });
      }
    }
    return descriptor;
  }
  addAtrule_(name2, syntax2) {
    if (!syntax2) {
      return;
    }
    this.atrules[name2] = {
      type: "Atrule",
      name: name2,
      prelude: syntax2.prelude ? this.createDescriptor(syntax2.prelude, "AtrulePrelude", name2) : null,
      descriptors: syntax2.descriptors ? Object.keys(syntax2.descriptors).reduce(
        (map, descName) => {
          map[descName] = this.createDescriptor(syntax2.descriptors[descName], "AtruleDescriptor", descName, name2);
          return map;
        },
        /* @__PURE__ */ Object.create(null)
      ) : null
    };
  }
  addProperty_(name2, syntax2) {
    if (!syntax2) {
      return;
    }
    this.properties[name2] = this.createDescriptor(syntax2, "Property", name2);
  }
  addType_(name2, syntax2) {
    if (!syntax2) {
      return;
    }
    this.types[name2] = this.createDescriptor(syntax2, "Type", name2);
  }
  checkAtruleName(atruleName) {
    if (!this.getAtrule(atruleName)) {
      return new SyntaxReferenceError("Unknown at-rule", "@" + atruleName);
    }
  }
  checkAtrulePrelude(atruleName, prelude) {
    const error2 = this.checkAtruleName(atruleName);
    if (error2) {
      return error2;
    }
    const atrule2 = this.getAtrule(atruleName);
    if (!atrule2.prelude && prelude) {
      return new SyntaxError("At-rule `@" + atruleName + "` should not contain a prelude");
    }
    if (atrule2.prelude && !prelude) {
      if (!matchSyntax(this, atrule2.prelude, "", false).matched) {
        return new SyntaxError("At-rule `@" + atruleName + "` should contain a prelude");
      }
    }
  }
  checkAtruleDescriptorName(atruleName, descriptorName) {
    const error2 = this.checkAtruleName(atruleName);
    if (error2) {
      return error2;
    }
    const atrule2 = this.getAtrule(atruleName);
    const descriptor = keyword(descriptorName);
    if (!atrule2.descriptors) {
      return new SyntaxError("At-rule `@" + atruleName + "` has no known descriptors");
    }
    if (!atrule2.descriptors[descriptor.name] && !atrule2.descriptors[descriptor.basename]) {
      return new SyntaxReferenceError("Unknown at-rule descriptor", descriptorName);
    }
  }
  checkPropertyName(propertyName) {
    if (!this.getProperty(propertyName)) {
      return new SyntaxReferenceError("Unknown property", propertyName);
    }
  }
  matchAtrulePrelude(atruleName, prelude) {
    const error2 = this.checkAtrulePrelude(atruleName, prelude);
    if (error2) {
      return buildMatchResult(null, error2);
    }
    const atrule2 = this.getAtrule(atruleName);
    if (!atrule2.prelude) {
      return buildMatchResult(null, null);
    }
    return matchSyntax(this, atrule2.prelude, prelude || "", false);
  }
  matchAtruleDescriptor(atruleName, descriptorName, value2) {
    const error2 = this.checkAtruleDescriptorName(atruleName, descriptorName);
    if (error2) {
      return buildMatchResult(null, error2);
    }
    const atrule2 = this.getAtrule(atruleName);
    const descriptor = keyword(descriptorName);
    return matchSyntax(this, atrule2.descriptors[descriptor.name] || atrule2.descriptors[descriptor.basename], value2, false);
  }
  matchDeclaration(node2) {
    if (node2.type !== "Declaration") {
      return buildMatchResult(null, new Error("Not a Declaration node"));
    }
    return this.matchProperty(node2.property, node2.value);
  }
  matchProperty(propertyName, value2) {
    if (property(propertyName).custom) {
      return buildMatchResult(null, new Error("Lexer matching doesn't applicable for custom properties"));
    }
    const error2 = this.checkPropertyName(propertyName);
    if (error2) {
      return buildMatchResult(null, error2);
    }
    return matchSyntax(this, this.getProperty(propertyName), value2, true);
  }
  matchType(typeName, value2) {
    const typeSyntax = this.getType(typeName);
    if (!typeSyntax) {
      return buildMatchResult(null, new SyntaxReferenceError("Unknown type", typeName));
    }
    return matchSyntax(this, typeSyntax, value2, false);
  }
  match(syntax2, value2) {
    if (typeof syntax2 !== "string" && (!syntax2 || !syntax2.type)) {
      return buildMatchResult(null, new SyntaxReferenceError("Bad syntax"));
    }
    if (typeof syntax2 === "string" || !syntax2.match) {
      syntax2 = this.createDescriptor(syntax2, "Type", "anonymous");
    }
    return matchSyntax(this, syntax2, value2, false);
  }
  findValueFragments(propertyName, value2, type, name2) {
    return matchFragments(this, value2, this.matchProperty(propertyName, value2), type, name2);
  }
  findDeclarationValueFragments(declaration, type, name2) {
    return matchFragments(this, declaration.value, this.matchDeclaration(declaration), type, name2);
  }
  findAllFragments(ast, type, name2) {
    const result = [];
    this.syntax.walk(ast, {
      visit: "Declaration",
      enter: (declaration) => {
        result.push.apply(result, this.findDeclarationValueFragments(declaration, type, name2));
      }
    });
    return result;
  }
  getAtrule(atruleName, fallbackBasename = true) {
    const atrule2 = keyword(atruleName);
    const atruleEntry = atrule2.vendor && fallbackBasename ? this.atrules[atrule2.name] || this.atrules[atrule2.basename] : this.atrules[atrule2.name];
    return atruleEntry || null;
  }
  getAtrulePrelude(atruleName, fallbackBasename = true) {
    const atrule2 = this.getAtrule(atruleName, fallbackBasename);
    return atrule2 && atrule2.prelude || null;
  }
  getAtruleDescriptor(atruleName, name2) {
    return this.atrules.hasOwnProperty(atruleName) && this.atrules.declarators ? this.atrules[atruleName].declarators[name2] || null : null;
  }
  getProperty(propertyName, fallbackBasename = true) {
    const property$1 = property(propertyName);
    const propertyEntry = property$1.vendor && fallbackBasename ? this.properties[property$1.name] || this.properties[property$1.basename] : this.properties[property$1.name];
    return propertyEntry || null;
  }
  getType(name2) {
    return hasOwnProperty.call(this.types, name2) ? this.types[name2] : null;
  }
  validate() {
    function syntaxRef(name2, isType2) {
      return isType2 ? `<${name2}>` : `<'${name2}'>`;
    }
    function validate(syntax2, name2, broken, descriptor) {
      if (broken.has(name2)) {
        return broken.get(name2);
      }
      broken.set(name2, false);
      if (descriptor.syntax !== null) {
        walk$1(descriptor.syntax, function(node2) {
          if (node2.type !== "Type" && node2.type !== "Property") {
            return;
          }
          const map = node2.type === "Type" ? syntax2.types : syntax2.properties;
          const brokenMap = node2.type === "Type" ? brokenTypes : brokenProperties;
          if (!hasOwnProperty.call(map, node2.name)) {
            errors.push(`${syntaxRef(name2, broken === brokenTypes)} used missed syntax definition ${syntaxRef(node2.name, node2.type === "Type")}`);
            broken.set(name2, true);
          } else if (validate(syntax2, node2.name, brokenMap, map[node2.name])) {
            errors.push(`${syntaxRef(name2, broken === brokenTypes)} used broken syntax definition ${syntaxRef(node2.name, node2.type === "Type")}`);
            broken.set(name2, true);
          }
        }, this);
      }
    }
    const errors = [];
    let brokenTypes = /* @__PURE__ */ new Map();
    let brokenProperties = /* @__PURE__ */ new Map();
    for (const key in this.types) {
      validate(this, key, brokenTypes, this.types[key]);
    }
    for (const key in this.properties) {
      validate(this, key, brokenProperties, this.properties[key]);
    }
    const brokenTypesArray = [...brokenTypes.keys()].filter((name2) => brokenTypes.get(name2));
    const brokenPropertiesArray = [...brokenProperties.keys()].filter((name2) => brokenProperties.get(name2));
    if (brokenTypesArray.length || brokenPropertiesArray.length) {
      return {
        errors,
        types: brokenTypesArray,
        properties: brokenPropertiesArray
      };
    }
    return null;
  }
  dump(syntaxAsAst, pretty) {
    return {
      generic: this.generic,
      cssWideKeywords: this.cssWideKeywords,
      units: this.units,
      types: dumpMapSyntax(this.types, !pretty, syntaxAsAst),
      properties: dumpMapSyntax(this.properties, !pretty, syntaxAsAst),
      atrules: dumpAtruleMapSyntax(this.atrules, !pretty, syntaxAsAst)
    };
  }
  toString() {
    return JSON.stringify(this.dump());
  }
}
function appendOrSet(a, b) {
  if (typeof b === "string" && /^\s*\|/.test(b)) {
    return typeof a === "string" ? a + b : b.replace(/^\s*\|\s*/, "");
  }
  return b || null;
}
function extractProps(obj, props) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const prop of Object.keys(obj)) {
    if (props.includes(prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
}
function mergeDicts(base, ext, fields) {
  const result = { ...base };
  for (const [key, props] of Object.entries(ext)) {
    result[key] = {
      ...result[key],
      ...fields ? extractProps(props, fields) : props
    };
  }
  return result;
}
function mix(dest, src) {
  const result = { ...dest };
  for (const [prop, value2] of Object.entries(src)) {
    switch (prop) {
      case "generic":
        result[prop] = Boolean(value2);
        break;
      case "cssWideKeywords":
        result[prop] = dest[prop] ? [...dest[prop], ...value2] : value2 || [];
        break;
      case "units":
        result[prop] = { ...dest[prop] };
        for (const [name2, patch2] of Object.entries(value2)) {
          result[prop][name2] = Array.isArray(patch2) ? patch2 : [];
        }
        break;
      case "atrules":
        result[prop] = { ...dest[prop] };
        for (const [name2, atrule2] of Object.entries(value2)) {
          const exists = result[prop][name2] || {};
          const current = result[prop][name2] = {
            prelude: exists.prelude || null,
            descriptors: {
              ...exists.descriptors
            }
          };
          if (!atrule2) {
            continue;
          }
          current.prelude = atrule2.prelude ? appendOrSet(current.prelude, atrule2.prelude) : current.prelude || null;
          for (const [descriptorName, descriptorValue] of Object.entries(atrule2.descriptors || {})) {
            current.descriptors[descriptorName] = descriptorValue ? appendOrSet(current.descriptors[descriptorName], descriptorValue) : null;
          }
          if (!Object.keys(current.descriptors).length) {
            current.descriptors = null;
          }
        }
        break;
      case "types":
      case "properties":
        result[prop] = { ...dest[prop] };
        for (const [name2, syntax2] of Object.entries(value2)) {
          result[prop][name2] = appendOrSet(result[prop][name2], syntax2);
        }
        break;
      case "parseContext":
        result[prop] = {
          ...dest[prop],
          ...value2
        };
        break;
      case "scope":
      case "features":
        result[prop] = mergeDicts(dest[prop], value2);
        break;
      case "atrule":
      case "pseudo":
        result[prop] = mergeDicts(dest[prop], value2, ["parse"]);
        break;
      case "node":
        result[prop] = mergeDicts(dest[prop], value2, ["name", "structure", "parse", "generate", "walkContext"]);
        break;
    }
  }
  return result;
}
function createSyntax(config) {
  const parse2 = createParser(config);
  const walk2 = createWalker(config);
  const generate2 = createGenerator(config);
  const { fromPlainObject: fromPlainObject2, toPlainObject: toPlainObject2 } = createConvertor(walk2);
  const syntax2 = {
    lexer: null,
    createLexer: (config2) => new Lexer(config2, syntax2, syntax2.lexer.structure),
    tokenize: tokenize$1,
    parse: parse2,
    generate: generate2,
    walk: walk2,
    find: walk2.find,
    findLast: walk2.findLast,
    findAll: walk2.findAll,
    fromPlainObject: fromPlainObject2,
    toPlainObject: toPlainObject2,
    fork(extension) {
      const base = mix({}, config);
      return createSyntax(
        typeof extension === "function" ? extension(base) : mix(base, extension)
      );
    }
  };
  syntax2.lexer = new Lexer({
    generic: config.generic,
    cssWideKeywords: config.cssWideKeywords,
    units: config.units,
    types: config.types,
    atrules: config.atrules,
    properties: config.properties,
    node: config.node
  }, syntax2);
  return syntax2;
}
const createSyntax$1 = (config) => createSyntax(mix({}, config));
const require$2 = createRequire(import.meta.url);
const patch = require$2("../data/patch.json");
const require$1 = createRequire(import.meta.url);
const mdnAtrules = require$1("mdn-data/css/at-rules.json");
const mdnProperties = require$1("mdn-data/css/properties.json");
const mdnSyntaxes = require$1("mdn-data/css/syntaxes.json");
const hasOwn = Object.hasOwn || ((object, property2) => Object.prototype.hasOwnProperty.call(object, property2));
const extendSyntax = /^\s*\|\s*/;
function preprocessAtrules(dict) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const [atruleName, atrule2] of Object.entries(dict)) {
    let descriptors = null;
    if (atrule2.descriptors) {
      descriptors = /* @__PURE__ */ Object.create(null);
      for (const [name2, descriptor] of Object.entries(atrule2.descriptors)) {
        descriptors[name2] = descriptor.syntax;
      }
    }
    result[atruleName.substr(1)] = {
      prelude: atrule2.syntax.trim().replace(/\{(.|\s)+\}/, "").match(/^@\S+\s+([^;\{]*)/)[1].trim() || null,
      descriptors
    };
  }
  return result;
}
function patchDictionary(dict, patchDict) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key, value2] of Object.entries(dict)) {
    if (value2) {
      result[key] = value2.syntax || value2;
    }
  }
  for (const key of Object.keys(patchDict)) {
    if (hasOwn(dict, key)) {
      if (patchDict[key].syntax) {
        result[key] = extendSyntax.test(patchDict[key].syntax) ? result[key] + " " + patchDict[key].syntax.trim() : patchDict[key].syntax;
      } else {
        delete result[key];
      }
    } else {
      if (patchDict[key].syntax) {
        result[key] = patchDict[key].syntax.replace(extendSyntax, "");
      }
    }
  }
  return result;
}
function preprocessPatchAtrulesDescritors(declarations) {
  const result = {};
  for (const [key, value2] of Object.entries(declarations || {})) {
    result[key] = typeof value2 === "string" ? { syntax: value2 } : value2;
  }
  return result;
}
function patchAtrules(dict, patchDict) {
  const result = {};
  for (const key in dict) {
    if (patchDict[key] === null) {
      continue;
    }
    const atrulePatch = patchDict[key] || {};
    result[key] = {
      prelude: key in patchDict && "prelude" in atrulePatch ? atrulePatch.prelude : dict[key].prelude || null,
      descriptors: patchDictionary(
        dict[key].descriptors || {},
        preprocessPatchAtrulesDescritors(atrulePatch.descriptors)
      )
    };
  }
  for (const [key, atrulePatch] of Object.entries(patchDict)) {
    if (atrulePatch && !hasOwn(dict, key)) {
      result[key] = {
        prelude: atrulePatch.prelude || null,
        descriptors: atrulePatch.descriptors ? patchDictionary({}, preprocessPatchAtrulesDescritors(atrulePatch.descriptors)) : null
      };
    }
  }
  return result;
}
const definitions = {
  types: patchDictionary(mdnSyntaxes, patch.types),
  atrules: patchAtrules(preprocessAtrules(mdnAtrules), patch.atrules),
  properties: patchDictionary(mdnProperties, patch.properties)
};
const PLUSSIGN$5 = 43;
const HYPHENMINUS$2 = 45;
const N = 110;
const DISALLOW_SIGN = true;
const ALLOW_SIGN = false;
function checkInteger(offset, disallowSign) {
  let pos = this.tokenStart + offset;
  const code2 = this.charCodeAt(pos);
  if (code2 === PLUSSIGN$5 || code2 === HYPHENMINUS$2) {
    if (disallowSign) {
      this.error("Number sign is not allowed");
    }
    pos++;
  }
  for (; pos < this.tokenEnd; pos++) {
    if (!isDigit(this.charCodeAt(pos))) {
      this.error("Integer is expected", pos);
    }
  }
}
function checkTokenIsInteger(disallowSign) {
  return checkInteger.call(this, 0, disallowSign);
}
function expectCharCode(offset, code2) {
  if (!this.cmpChar(this.tokenStart + offset, code2)) {
    let msg = "";
    switch (code2) {
      case N:
        msg = "N is expected";
        break;
      case HYPHENMINUS$2:
        msg = "HyphenMinus is expected";
        break;
    }
    this.error(msg, this.tokenStart + offset);
  }
}
function consumeB() {
  let offset = 0;
  let sign = 0;
  let type = this.tokenType;
  while (type === WhiteSpace$1 || type === Comment$1) {
    type = this.lookupType(++offset);
  }
  if (type !== Number$2) {
    if (this.isDelim(PLUSSIGN$5, offset) || this.isDelim(HYPHENMINUS$2, offset)) {
      sign = this.isDelim(PLUSSIGN$5, offset) ? PLUSSIGN$5 : HYPHENMINUS$2;
      do {
        type = this.lookupType(++offset);
      } while (type === WhiteSpace$1 || type === Comment$1);
      if (type !== Number$2) {
        this.skip(offset);
        checkTokenIsInteger.call(this, DISALLOW_SIGN);
      }
    } else {
      return null;
    }
  }
  if (offset > 0) {
    this.skip(offset);
  }
  if (sign === 0) {
    type = this.charCodeAt(this.tokenStart);
    if (type !== PLUSSIGN$5 && type !== HYPHENMINUS$2) {
      this.error("Number sign is expected");
    }
  }
  checkTokenIsInteger.call(this, sign !== 0);
  return sign === HYPHENMINUS$2 ? "-" + this.consume(Number$2) : this.consume(Number$2);
}
const name$M = "AnPlusB";
const structure$M = {
  a: [String, null],
  b: [String, null]
};
function parse$N() {
  const start = this.tokenStart;
  let a = null;
  let b = null;
  if (this.tokenType === Number$2) {
    checkTokenIsInteger.call(this, ALLOW_SIGN);
    b = this.consume(Number$2);
  } else if (this.tokenType === Ident && this.cmpChar(this.tokenStart, HYPHENMINUS$2)) {
    a = "-1";
    expectCharCode.call(this, 1, N);
    switch (this.tokenEnd - this.tokenStart) {
      // -n
      // -n <signed-integer>
      // -n ['+' | '-'] <signless-integer>
      case 2:
        this.next();
        b = consumeB.call(this);
        break;
      // -n- <signless-integer>
      case 3:
        expectCharCode.call(this, 2, HYPHENMINUS$2);
        this.next();
        this.skipSC();
        checkTokenIsInteger.call(this, DISALLOW_SIGN);
        b = "-" + this.consume(Number$2);
        break;
      // <dashndashdigit-ident>
      default:
        expectCharCode.call(this, 2, HYPHENMINUS$2);
        checkInteger.call(this, 3, DISALLOW_SIGN);
        this.next();
        b = this.substrToCursor(start + 2);
    }
  } else if (this.tokenType === Ident || this.isDelim(PLUSSIGN$5) && this.lookupType(1) === Ident) {
    let sign = 0;
    a = "1";
    if (this.isDelim(PLUSSIGN$5)) {
      sign = 1;
      this.next();
    }
    expectCharCode.call(this, 0, N);
    switch (this.tokenEnd - this.tokenStart) {
      // '+'? n
      // '+'? n <signed-integer>
      // '+'? n ['+' | '-'] <signless-integer>
      case 1:
        this.next();
        b = consumeB.call(this);
        break;
      // '+'? n- <signless-integer>
      case 2:
        expectCharCode.call(this, 1, HYPHENMINUS$2);
        this.next();
        this.skipSC();
        checkTokenIsInteger.call(this, DISALLOW_SIGN);
        b = "-" + this.consume(Number$2);
        break;
      // '+'? <ndashdigit-ident>
      default:
        expectCharCode.call(this, 1, HYPHENMINUS$2);
        checkInteger.call(this, 2, DISALLOW_SIGN);
        this.next();
        b = this.substrToCursor(start + sign + 1);
    }
  } else if (this.tokenType === Dimension$1) {
    const code2 = this.charCodeAt(this.tokenStart);
    const sign = code2 === PLUSSIGN$5 || code2 === HYPHENMINUS$2;
    let i = this.tokenStart + sign;
    for (; i < this.tokenEnd; i++) {
      if (!isDigit(this.charCodeAt(i))) {
        break;
      }
    }
    if (i === this.tokenStart + sign) {
      this.error("Integer is expected", this.tokenStart + sign);
    }
    expectCharCode.call(this, i - this.tokenStart, N);
    a = this.substring(start, i);
    if (i + 1 === this.tokenEnd) {
      this.next();
      b = consumeB.call(this);
    } else {
      expectCharCode.call(this, i - this.tokenStart + 1, HYPHENMINUS$2);
      if (i + 2 === this.tokenEnd) {
        this.next();
        this.skipSC();
        checkTokenIsInteger.call(this, DISALLOW_SIGN);
        b = "-" + this.consume(Number$2);
      } else {
        checkInteger.call(this, i - this.tokenStart + 2, DISALLOW_SIGN);
        this.next();
        b = this.substrToCursor(i + 1);
      }
    }
  } else {
    this.error();
  }
  if (a !== null && a.charCodeAt(0) === PLUSSIGN$5) {
    a = a.substr(1);
  }
  if (b !== null && b.charCodeAt(0) === PLUSSIGN$5) {
    b = b.substr(1);
  }
  return {
    type: "AnPlusB",
    loc: this.getLocation(start, this.tokenStart),
    a,
    b
  };
}
function generate$N(node2) {
  if (node2.a) {
    const a = node2.a === "+1" && "n" || node2.a === "1" && "n" || node2.a === "-1" && "-n" || node2.a + "n";
    if (node2.b) {
      const b = node2.b[0] === "-" || node2.b[0] === "+" ? node2.b : "+" + node2.b;
      this.tokenize(a + b);
    } else {
      this.tokenize(a);
    }
  } else {
    this.tokenize(node2.b);
  }
}
const AnPlusB = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$N,
  name: name$M,
  parse: parse$N,
  structure: structure$M
});
function consumeRaw$4() {
  return this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true);
}
function isDeclarationBlockAtrule() {
  for (let offset = 1, type; type = this.lookupType(offset); offset++) {
    if (type === RightCurlyBracket) {
      return true;
    }
    if (type === LeftCurlyBracket || type === AtKeyword) {
      return false;
    }
  }
  return false;
}
const name$L = "Atrule";
const walkContext$9 = "atrule";
const structure$L = {
  name: String,
  prelude: ["AtrulePrelude", "Raw", null],
  block: ["Block", null]
};
function parse$M(isDeclaration = false) {
  const start = this.tokenStart;
  let name2;
  let nameLowerCase;
  let prelude = null;
  let block = null;
  this.eat(AtKeyword);
  name2 = this.substrToCursor(start + 1);
  nameLowerCase = name2.toLowerCase();
  this.skipSC();
  if (this.eof === false && this.tokenType !== LeftCurlyBracket && this.tokenType !== Semicolon) {
    if (this.parseAtrulePrelude) {
      prelude = this.parseWithFallback(this.AtrulePrelude.bind(this, name2, isDeclaration), consumeRaw$4);
    } else {
      prelude = consumeRaw$4.call(this, this.tokenIndex);
    }
    this.skipSC();
  }
  switch (this.tokenType) {
    case Semicolon:
      this.next();
      break;
    case LeftCurlyBracket:
      if (hasOwnProperty.call(this.atrule, nameLowerCase) && typeof this.atrule[nameLowerCase].block === "function") {
        block = this.atrule[nameLowerCase].block.call(this, isDeclaration);
      } else {
        block = this.Block(isDeclarationBlockAtrule.call(this));
      }
      break;
  }
  return {
    type: "Atrule",
    loc: this.getLocation(start, this.tokenStart),
    name: name2,
    prelude,
    block
  };
}
function generate$M(node2) {
  this.token(AtKeyword, "@" + node2.name);
  if (node2.prelude !== null) {
    this.node(node2.prelude);
  }
  if (node2.block) {
    this.node(node2.block);
  } else {
    this.token(Semicolon, ";");
  }
}
const Atrule = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$M,
  name: name$L,
  parse: parse$M,
  structure: structure$L,
  walkContext: walkContext$9
});
const name$K = "AtrulePrelude";
const walkContext$8 = "atrulePrelude";
const structure$K = {
  children: [[]]
};
function parse$L(name2) {
  let children = null;
  if (name2 !== null) {
    name2 = name2.toLowerCase();
  }
  this.skipSC();
  if (hasOwnProperty.call(this.atrule, name2) && typeof this.atrule[name2].prelude === "function") {
    children = this.atrule[name2].prelude.call(this);
  } else {
    children = this.readSequence(this.scope.AtrulePrelude);
  }
  this.skipSC();
  if (this.eof !== true && this.tokenType !== LeftCurlyBracket && this.tokenType !== Semicolon) {
    this.error("Semicolon or block is expected");
  }
  return {
    type: "AtrulePrelude",
    loc: this.getLocationFromList(children),
    children
  };
}
function generate$L(node2) {
  this.children(node2);
}
const AtrulePrelude = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$L,
  name: name$K,
  parse: parse$L,
  structure: structure$K,
  walkContext: walkContext$8
});
const DOLLARSIGN$1 = 36;
const ASTERISK$5 = 42;
const EQUALSSIGN$1 = 61;
const CIRCUMFLEXACCENT = 94;
const VERTICALLINE$2 = 124;
const TILDE$2 = 126;
function getAttributeName() {
  if (this.eof) {
    this.error("Unexpected end of input");
  }
  const start = this.tokenStart;
  let expectIdent = false;
  if (this.isDelim(ASTERISK$5)) {
    expectIdent = true;
    this.next();
  } else if (!this.isDelim(VERTICALLINE$2)) {
    this.eat(Ident);
  }
  if (this.isDelim(VERTICALLINE$2)) {
    if (this.charCodeAt(this.tokenStart + 1) !== EQUALSSIGN$1) {
      this.next();
      this.eat(Ident);
    } else if (expectIdent) {
      this.error("Identifier is expected", this.tokenEnd);
    }
  } else if (expectIdent) {
    this.error("Vertical line is expected");
  }
  return {
    type: "Identifier",
    loc: this.getLocation(start, this.tokenStart),
    name: this.substrToCursor(start)
  };
}
function getOperator() {
  const start = this.tokenStart;
  const code2 = this.charCodeAt(start);
  if (code2 !== EQUALSSIGN$1 && // =
  code2 !== TILDE$2 && // ~=
  code2 !== CIRCUMFLEXACCENT && // ^=
  code2 !== DOLLARSIGN$1 && // $=
  code2 !== ASTERISK$5 && // *=
  code2 !== VERTICALLINE$2) {
    this.error("Attribute selector (=, ~=, ^=, $=, *=, |=) is expected");
  }
  this.next();
  if (code2 !== EQUALSSIGN$1) {
    if (!this.isDelim(EQUALSSIGN$1)) {
      this.error("Equal sign is expected");
    }
    this.next();
  }
  return this.substrToCursor(start);
}
const name$J = "AttributeSelector";
const structure$J = {
  name: "Identifier",
  matcher: [String, null],
  value: ["String", "Identifier", null],
  flags: [String, null]
};
function parse$K() {
  const start = this.tokenStart;
  let name2;
  let matcher = null;
  let value2 = null;
  let flags = null;
  this.eat(LeftSquareBracket);
  this.skipSC();
  name2 = getAttributeName.call(this);
  this.skipSC();
  if (this.tokenType !== RightSquareBracket) {
    if (this.tokenType !== Ident) {
      matcher = getOperator.call(this);
      this.skipSC();
      value2 = this.tokenType === String$2 ? this.String() : this.Identifier();
      this.skipSC();
    }
    if (this.tokenType === Ident) {
      flags = this.consume(Ident);
      this.skipSC();
    }
  }
  this.eat(RightSquareBracket);
  return {
    type: "AttributeSelector",
    loc: this.getLocation(start, this.tokenStart),
    name: name2,
    matcher,
    value: value2,
    flags
  };
}
function generate$K(node2) {
  this.token(Delim, "[");
  this.node(node2.name);
  if (node2.matcher !== null) {
    this.tokenize(node2.matcher);
    this.node(node2.value);
  }
  if (node2.flags !== null) {
    this.token(Ident, node2.flags);
  }
  this.token(Delim, "]");
}
const AttributeSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$K,
  name: name$J,
  parse: parse$K,
  structure: structure$J
});
const AMPERSAND$4 = 38;
function consumeRaw$3() {
  return this.Raw(null, true);
}
function consumeRule() {
  return this.parseWithFallback(this.Rule, consumeRaw$3);
}
function consumeRawDeclaration() {
  return this.Raw(this.consumeUntilSemicolonIncluded, true);
}
function consumeDeclaration() {
  if (this.tokenType === Semicolon) {
    return consumeRawDeclaration.call(this, this.tokenIndex);
  }
  const node2 = this.parseWithFallback(this.Declaration, consumeRawDeclaration);
  if (this.tokenType === Semicolon) {
    this.next();
  }
  return node2;
}
const name$I = "Block";
const walkContext$7 = "block";
const structure$I = {
  children: [[
    "Atrule",
    "Rule",
    "Declaration"
  ]]
};
function parse$J(isStyleBlock) {
  const consumer = isStyleBlock ? consumeDeclaration : consumeRule;
  const start = this.tokenStart;
  let children = this.createList();
  this.eat(LeftCurlyBracket);
  scan:
    while (!this.eof) {
      switch (this.tokenType) {
        case RightCurlyBracket:
          break scan;
        case WhiteSpace$1:
        case Comment$1:
          this.next();
          break;
        case AtKeyword:
          children.push(this.parseWithFallback(this.Atrule.bind(this, isStyleBlock), consumeRaw$3));
          break;
        default:
          if (isStyleBlock && this.isDelim(AMPERSAND$4)) {
            children.push(consumeRule.call(this));
          } else {
            children.push(consumer.call(this));
          }
      }
    }
  if (!this.eof) {
    this.eat(RightCurlyBracket);
  }
  return {
    type: "Block",
    loc: this.getLocation(start, this.tokenStart),
    children
  };
}
function generate$J(node2) {
  this.token(LeftCurlyBracket, "{");
  this.children(node2, (prev) => {
    if (prev.type === "Declaration") {
      this.token(Semicolon, ";");
    }
  });
  this.token(RightCurlyBracket, "}");
}
const Block = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$J,
  name: name$I,
  parse: parse$J,
  structure: structure$I,
  walkContext: walkContext$7
});
const name$H = "Brackets";
const structure$H = {
  children: [[]]
};
function parse$I(readSequence2, recognizer) {
  const start = this.tokenStart;
  let children = null;
  this.eat(LeftSquareBracket);
  children = readSequence2.call(this, recognizer);
  if (!this.eof) {
    this.eat(RightSquareBracket);
  }
  return {
    type: "Brackets",
    loc: this.getLocation(start, this.tokenStart),
    children
  };
}
function generate$I(node2) {
  this.token(Delim, "[");
  this.children(node2);
  this.token(Delim, "]");
}
const Brackets = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$I,
  name: name$H,
  parse: parse$I,
  structure: structure$H
});
const name$G = "CDC";
const structure$G = [];
function parse$H() {
  const start = this.tokenStart;
  this.eat(CDC$1);
  return {
    type: "CDC",
    loc: this.getLocation(start, this.tokenStart)
  };
}
function generate$H() {
  this.token(CDC$1, "-->");
}
const CDC = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$H,
  name: name$G,
  parse: parse$H,
  structure: structure$G
});
const name$F = "CDO";
const structure$F = [];
function parse$G() {
  const start = this.tokenStart;
  this.eat(CDO$1);
  return {
    type: "CDO",
    loc: this.getLocation(start, this.tokenStart)
  };
}
function generate$G() {
  this.token(CDO$1, "<!--");
}
const CDO = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$G,
  name: name$F,
  parse: parse$G,
  structure: structure$F
});
const FULLSTOP$2 = 46;
const name$E = "ClassSelector";
const structure$E = {
  name: String
};
function parse$F() {
  this.eatDelim(FULLSTOP$2);
  return {
    type: "ClassSelector",
    loc: this.getLocation(this.tokenStart - 1, this.tokenEnd),
    name: this.consume(Ident)
  };
}
function generate$F(node2) {
  this.token(Delim, ".");
  this.token(Ident, node2.name);
}
const ClassSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$F,
  name: name$E,
  parse: parse$F,
  structure: structure$E
});
const PLUSSIGN$4 = 43;
const SOLIDUS$7 = 47;
const GREATERTHANSIGN$2 = 62;
const TILDE$1 = 126;
const name$D = "Combinator";
const structure$D = {
  name: String
};
function parse$E() {
  const start = this.tokenStart;
  let name2;
  switch (this.tokenType) {
    case WhiteSpace$1:
      name2 = " ";
      break;
    case Delim:
      switch (this.charCodeAt(this.tokenStart)) {
        case GREATERTHANSIGN$2:
        case PLUSSIGN$4:
        case TILDE$1:
          this.next();
          break;
        case SOLIDUS$7:
          this.next();
          this.eatIdent("deep");
          this.eatDelim(SOLIDUS$7);
          break;
        default:
          this.error("Combinator is expected");
      }
      name2 = this.substrToCursor(start);
      break;
  }
  return {
    type: "Combinator",
    loc: this.getLocation(start, this.tokenStart),
    name: name2
  };
}
function generate$E(node2) {
  this.tokenize(node2.name);
}
const Combinator = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$E,
  name: name$D,
  parse: parse$E,
  structure: structure$D
});
const ASTERISK$4 = 42;
const SOLIDUS$6 = 47;
const name$C = "Comment";
const structure$C = {
  value: String
};
function parse$D() {
  const start = this.tokenStart;
  let end = this.tokenEnd;
  this.eat(Comment$1);
  if (end - start + 2 >= 2 && this.charCodeAt(end - 2) === ASTERISK$4 && this.charCodeAt(end - 1) === SOLIDUS$6) {
    end -= 2;
  }
  return {
    type: "Comment",
    loc: this.getLocation(start, this.tokenStart),
    value: this.substring(start + 2, end)
  };
}
function generate$D(node2) {
  this.token(Comment$1, "/*" + node2.value + "*/");
}
const Comment = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$D,
  name: name$C,
  parse: parse$D,
  structure: structure$C
});
const likelyFeatureToken = /* @__PURE__ */ new Set([Colon, RightParenthesis, EOF$1]);
const name$B = "Condition";
const structure$B = {
  kind: String,
  children: [[
    "Identifier",
    "Feature",
    "FeatureFunction",
    "FeatureRange",
    "SupportsDeclaration"
  ]]
};
function featureOrRange(kind) {
  if (this.lookupTypeNonSC(1) === Ident && likelyFeatureToken.has(this.lookupTypeNonSC(2))) {
    return this.Feature(kind);
  }
  return this.FeatureRange(kind);
}
const parentheses = {
  media: featureOrRange,
  container: featureOrRange,
  supports() {
    return this.SupportsDeclaration();
  }
};
function parse$C(kind = "media") {
  const children = this.createList();
  scan: while (!this.eof) {
    switch (this.tokenType) {
      case Comment$1:
      case WhiteSpace$1:
        this.next();
        continue;
      case Ident:
        children.push(this.Identifier());
        break;
      case LeftParenthesis: {
        let term = this.parseWithFallback(
          () => parentheses[kind].call(this, kind),
          () => null
        );
        if (!term) {
          term = this.parseWithFallback(
            () => {
              this.eat(LeftParenthesis);
              const res = this.Condition(kind);
              this.eat(RightParenthesis);
              return res;
            },
            () => {
              return this.GeneralEnclosed(kind);
            }
          );
        }
        children.push(term);
        break;
      }
      case Function$2: {
        let term = this.parseWithFallback(
          () => this.FeatureFunction(kind),
          () => null
        );
        if (!term) {
          term = this.GeneralEnclosed(kind);
        }
        children.push(term);
        break;
      }
      default:
        break scan;
    }
  }
  if (children.isEmpty) {
    this.error("Condition is expected");
  }
  return {
    type: "Condition",
    loc: this.getLocationFromList(children),
    kind,
    children
  };
}
function generate$C(node2) {
  node2.children.forEach((child) => {
    if (child.type === "Condition") {
      this.token(LeftParenthesis, "(");
      this.node(child);
      this.token(RightParenthesis, ")");
    } else {
      this.node(child);
    }
  });
}
const Condition = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$C,
  name: name$B,
  parse: parse$C,
  structure: structure$B
});
const EXCLAMATIONMARK$1 = 33;
const NUMBERSIGN$2 = 35;
const DOLLARSIGN = 36;
const AMPERSAND$3 = 38;
const ASTERISK$3 = 42;
const PLUSSIGN$3 = 43;
const SOLIDUS$5 = 47;
function consumeValueRaw() {
  return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, true);
}
function consumeCustomPropertyRaw() {
  return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);
}
function consumeValue() {
  const startValueToken = this.tokenIndex;
  const value2 = this.Value();
  if (value2.type !== "Raw" && this.eof === false && this.tokenType !== Semicolon && this.isDelim(EXCLAMATIONMARK$1) === false && this.isBalanceEdge(startValueToken) === false) {
    this.error();
  }
  return value2;
}
const name$A = "Declaration";
const walkContext$6 = "declaration";
const structure$A = {
  important: [Boolean, String],
  property: String,
  value: ["Value", "Raw"]
};
function parse$B() {
  const start = this.tokenStart;
  const startToken = this.tokenIndex;
  const property2 = readProperty.call(this);
  const customProperty = isCustomProperty(property2);
  const parseValue = customProperty ? this.parseCustomProperty : this.parseValue;
  const consumeRaw2 = customProperty ? consumeCustomPropertyRaw : consumeValueRaw;
  let important = false;
  let value2;
  this.skipSC();
  this.eat(Colon);
  const valueStart = this.tokenIndex;
  if (!customProperty) {
    this.skipSC();
  }
  if (parseValue) {
    value2 = this.parseWithFallback(consumeValue, consumeRaw2);
  } else {
    value2 = consumeRaw2.call(this, this.tokenIndex);
  }
  if (customProperty && value2.type === "Value" && value2.children.isEmpty) {
    for (let offset = valueStart - this.tokenIndex; offset <= 0; offset++) {
      if (this.lookupType(offset) === WhiteSpace$1) {
        value2.children.appendData({
          type: "WhiteSpace",
          loc: null,
          value: " "
        });
        break;
      }
    }
  }
  if (this.isDelim(EXCLAMATIONMARK$1)) {
    important = getImportant.call(this);
    this.skipSC();
  }
  if (this.eof === false && this.tokenType !== Semicolon && this.isBalanceEdge(startToken) === false) {
    this.error();
  }
  return {
    type: "Declaration",
    loc: this.getLocation(start, this.tokenStart),
    important,
    property: property2,
    value: value2
  };
}
function generate$B(node2) {
  this.token(Ident, node2.property);
  this.token(Colon, ":");
  this.node(node2.value);
  if (node2.important) {
    this.token(Delim, "!");
    this.token(Ident, node2.important === true ? "important" : node2.important);
  }
}
function readProperty() {
  const start = this.tokenStart;
  if (this.tokenType === Delim) {
    switch (this.charCodeAt(this.tokenStart)) {
      case ASTERISK$3:
      case DOLLARSIGN:
      case PLUSSIGN$3:
      case NUMBERSIGN$2:
      case AMPERSAND$3:
        this.next();
        break;
      // TODO: not sure we should support this hack
      case SOLIDUS$5:
        this.next();
        if (this.isDelim(SOLIDUS$5)) {
          this.next();
        }
        break;
    }
  }
  if (this.tokenType === Hash$1) {
    this.eat(Hash$1);
  } else {
    this.eat(Ident);
  }
  return this.substrToCursor(start);
}
function getImportant() {
  this.eat(Delim);
  this.skipSC();
  const important = this.consume(Ident);
  return important === "important" ? true : important;
}
const Declaration = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$B,
  name: name$A,
  parse: parse$B,
  structure: structure$A,
  walkContext: walkContext$6
});
const AMPERSAND$2 = 38;
function consumeRaw$2() {
  return this.Raw(this.consumeUntilSemicolonIncluded, true);
}
const name$z = "DeclarationList";
const structure$z = {
  children: [[
    "Declaration",
    "Atrule",
    "Rule"
  ]]
};
function parse$A() {
  const children = this.createList();
  while (!this.eof) {
    switch (this.tokenType) {
      case WhiteSpace$1:
      case Comment$1:
      case Semicolon:
        this.next();
        break;
      case AtKeyword:
        children.push(this.parseWithFallback(this.Atrule.bind(this, true), consumeRaw$2));
        break;
      default:
        if (this.isDelim(AMPERSAND$2)) {
          children.push(this.parseWithFallback(this.Rule, consumeRaw$2));
        } else {
          children.push(this.parseWithFallback(this.Declaration, consumeRaw$2));
        }
    }
  }
  return {
    type: "DeclarationList",
    loc: this.getLocationFromList(children),
    children
  };
}
function generate$A(node2) {
  this.children(node2, (prev) => {
    if (prev.type === "Declaration") {
      this.token(Semicolon, ";");
    }
  });
}
const DeclarationList = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$A,
  name: name$z,
  parse: parse$A,
  structure: structure$z
});
const name$y = "Dimension";
const structure$y = {
  value: String,
  unit: String
};
function parse$z() {
  const start = this.tokenStart;
  const value2 = this.consumeNumber(Dimension$1);
  return {
    type: "Dimension",
    loc: this.getLocation(start, this.tokenStart),
    value: value2,
    unit: this.substring(start + value2.length, this.tokenStart)
  };
}
function generate$z(node2) {
  this.token(Dimension$1, node2.value + node2.unit);
}
const Dimension = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$z,
  name: name$y,
  parse: parse$z,
  structure: structure$y
});
const SOLIDUS$4 = 47;
const name$x = "Feature";
const structure$x = {
  kind: String,
  name: String,
  value: ["Identifier", "Number", "Dimension", "Ratio", "Function", null]
};
function parse$y(kind) {
  const start = this.tokenStart;
  let name2;
  let value2 = null;
  this.eat(LeftParenthesis);
  this.skipSC();
  name2 = this.consume(Ident);
  this.skipSC();
  if (this.tokenType !== RightParenthesis) {
    this.eat(Colon);
    this.skipSC();
    switch (this.tokenType) {
      case Number$2:
        if (this.lookupNonWSType(1) === Delim) {
          value2 = this.Ratio();
        } else {
          value2 = this.Number();
        }
        break;
      case Dimension$1:
        value2 = this.Dimension();
        break;
      case Ident:
        value2 = this.Identifier();
        break;
      case Function$2:
        value2 = this.parseWithFallback(
          () => {
            const res = this.Function(this.readSequence, this.scope.Value);
            this.skipSC();
            if (this.isDelim(SOLIDUS$4)) {
              this.error();
            }
            return res;
          },
          () => {
            return this.Ratio();
          }
        );
        break;
      default:
        this.error("Number, dimension, ratio or identifier is expected");
    }
    this.skipSC();
  }
  if (!this.eof) {
    this.eat(RightParenthesis);
  }
  return {
    type: "Feature",
    loc: this.getLocation(start, this.tokenStart),
    kind,
    name: name2,
    value: value2
  };
}
function generate$y(node2) {
  this.token(LeftParenthesis, "(");
  this.token(Ident, node2.name);
  if (node2.value !== null) {
    this.token(Colon, ":");
    this.node(node2.value);
  }
  this.token(RightParenthesis, ")");
}
const Feature = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$y,
  name: name$x,
  parse: parse$y,
  structure: structure$x
});
const name$w = "FeatureFunction";
const structure$w = {
  kind: String,
  feature: String,
  value: ["Declaration", "Selector"]
};
function getFeatureParser(kind, name2) {
  const featuresOfKind = this.features[kind] || {};
  const parser2 = featuresOfKind[name2];
  if (typeof parser2 !== "function") {
    this.error(`Unknown feature ${name2}()`);
  }
  return parser2;
}
function parse$x(kind = "unknown") {
  const start = this.tokenStart;
  const functionName = this.consumeFunctionName();
  const valueParser = getFeatureParser.call(this, kind, functionName.toLowerCase());
  this.skipSC();
  const value2 = this.parseWithFallback(
    () => {
      const startValueToken = this.tokenIndex;
      const value3 = valueParser.call(this);
      if (this.eof === false && this.isBalanceEdge(startValueToken) === false) {
        this.error();
      }
      return value3;
    },
    () => this.Raw(null, false)
  );
  if (!this.eof) {
    this.eat(RightParenthesis);
  }
  return {
    type: "FeatureFunction",
    loc: this.getLocation(start, this.tokenStart),
    kind,
    feature: functionName,
    value: value2
  };
}
function generate$x(node2) {
  this.token(Function$2, node2.feature + "(");
  this.node(node2.value);
  this.token(RightParenthesis, ")");
}
const FeatureFunction = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$x,
  name: name$w,
  parse: parse$x,
  structure: structure$w
});
const SOLIDUS$3 = 47;
const LESSTHANSIGN = 60;
const EQUALSSIGN = 61;
const GREATERTHANSIGN$1 = 62;
const name$v = "FeatureRange";
const structure$v = {
  kind: String,
  left: ["Identifier", "Number", "Dimension", "Ratio", "Function"],
  leftComparison: String,
  middle: ["Identifier", "Number", "Dimension", "Ratio", "Function"],
  rightComparison: [String, null],
  right: ["Identifier", "Number", "Dimension", "Ratio", "Function", null]
};
function readTerm() {
  this.skipSC();
  switch (this.tokenType) {
    case Number$2:
      if (this.isDelim(SOLIDUS$3, this.lookupOffsetNonSC(1))) {
        return this.Ratio();
      } else {
        return this.Number();
      }
    case Dimension$1:
      return this.Dimension();
    case Ident:
      return this.Identifier();
    case Function$2:
      return this.parseWithFallback(
        () => {
          const res = this.Function(this.readSequence, this.scope.Value);
          this.skipSC();
          if (this.isDelim(SOLIDUS$3)) {
            this.error();
          }
          return res;
        },
        () => {
          return this.Ratio();
        }
      );
    default:
      this.error("Number, dimension, ratio or identifier is expected");
  }
}
function readComparison(expectColon) {
  this.skipSC();
  if (this.isDelim(LESSTHANSIGN) || this.isDelim(GREATERTHANSIGN$1)) {
    const value2 = this.source[this.tokenStart];
    this.next();
    if (this.isDelim(EQUALSSIGN)) {
      this.next();
      return value2 + "=";
    }
    return value2;
  }
  if (this.isDelim(EQUALSSIGN)) {
    return "=";
  }
  this.error(`Expected ${expectColon ? '":", ' : ""}"<", ">", "=" or ")"`);
}
function parse$w(kind = "unknown") {
  const start = this.tokenStart;
  this.skipSC();
  this.eat(LeftParenthesis);
  const left = readTerm.call(this);
  const leftComparison = readComparison.call(this, left.type === "Identifier");
  const middle = readTerm.call(this);
  let rightComparison = null;
  let right = null;
  if (this.lookupNonWSType(0) !== RightParenthesis) {
    rightComparison = readComparison.call(this);
    right = readTerm.call(this);
  }
  this.skipSC();
  this.eat(RightParenthesis);
  return {
    type: "FeatureRange",
    loc: this.getLocation(start, this.tokenStart),
    kind,
    left,
    leftComparison,
    middle,
    rightComparison,
    right
  };
}
function generate$w(node2) {
  this.token(LeftParenthesis, "(");
  this.node(node2.left);
  this.tokenize(node2.leftComparison);
  this.node(node2.middle);
  if (node2.right) {
    this.tokenize(node2.rightComparison);
    this.node(node2.right);
  }
  this.token(RightParenthesis, ")");
}
const FeatureRange = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$w,
  name: name$v,
  parse: parse$w,
  structure: structure$v
});
const name$u = "Function";
const walkContext$5 = "function";
const structure$u = {
  name: String,
  children: [[]]
};
function parse$v(readSequence2, recognizer) {
  const start = this.tokenStart;
  const name2 = this.consumeFunctionName();
  const nameLowerCase = name2.toLowerCase();
  let children;
  children = recognizer.hasOwnProperty(nameLowerCase) ? recognizer[nameLowerCase].call(this, recognizer) : readSequence2.call(this, recognizer);
  if (!this.eof) {
    this.eat(RightParenthesis);
  }
  return {
    type: "Function",
    loc: this.getLocation(start, this.tokenStart),
    name: name2,
    children
  };
}
function generate$v(node2) {
  this.token(Function$2, node2.name + "(");
  this.children(node2);
  this.token(RightParenthesis, ")");
}
const Function$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$v,
  name: name$u,
  parse: parse$v,
  structure: structure$u,
  walkContext: walkContext$5
});
const name$t = "GeneralEnclosed";
const structure$t = {
  kind: String,
  function: [String, null],
  children: [[]]
};
function parse$u(kind) {
  const start = this.tokenStart;
  let functionName = null;
  if (this.tokenType === Function$2) {
    functionName = this.consumeFunctionName();
  } else {
    this.eat(LeftParenthesis);
  }
  const children = this.parseWithFallback(
    () => {
      const startValueToken = this.tokenIndex;
      const children2 = this.readSequence(this.scope.Value);
      if (this.eof === false && this.isBalanceEdge(startValueToken) === false) {
        this.error();
      }
      return children2;
    },
    () => this.createSingleNodeList(
      this.Raw(null, false)
    )
  );
  if (!this.eof) {
    this.eat(RightParenthesis);
  }
  return {
    type: "GeneralEnclosed",
    loc: this.getLocation(start, this.tokenStart),
    kind,
    function: functionName,
    children
  };
}
function generate$u(node2) {
  if (node2.function) {
    this.token(Function$2, node2.function + "(");
  } else {
    this.token(LeftParenthesis, "(");
  }
  this.children(node2);
  this.token(RightParenthesis, ")");
}
const GeneralEnclosed = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$u,
  name: name$t,
  parse: parse$u,
  structure: structure$t
});
const xxx = "XXX";
const name$s = "Hash";
const structure$s = {
  value: String
};
function parse$t() {
  const start = this.tokenStart;
  this.eat(Hash$1);
  return {
    type: "Hash",
    loc: this.getLocation(start, this.tokenStart),
    value: this.substrToCursor(start + 1)
  };
}
function generate$t(node2) {
  this.token(Hash$1, "#" + node2.value);
}
const Hash = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$t,
  name: name$s,
  parse: parse$t,
  structure: structure$s,
  xxx
});
const name$r = "Identifier";
const structure$r = {
  name: String
};
function parse$s() {
  return {
    type: "Identifier",
    loc: this.getLocation(this.tokenStart, this.tokenEnd),
    name: this.consume(Ident)
  };
}
function generate$s(node2) {
  this.token(Ident, node2.name);
}
const Identifier = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$s,
  name: name$r,
  parse: parse$s,
  structure: structure$r
});
const name$q = "IdSelector";
const structure$q = {
  name: String
};
function parse$r() {
  const start = this.tokenStart;
  this.eat(Hash$1);
  return {
    type: "IdSelector",
    loc: this.getLocation(start, this.tokenStart),
    name: this.substrToCursor(start + 1)
  };
}
function generate$r(node2) {
  this.token(Delim, "#" + node2.name);
}
const IdSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$r,
  name: name$q,
  parse: parse$r,
  structure: structure$q
});
const FULLSTOP$1 = 46;
const name$p = "Layer";
const structure$p = {
  name: String
};
function parse$q() {
  let tokenStart = this.tokenStart;
  let name2 = this.consume(Ident);
  while (this.isDelim(FULLSTOP$1)) {
    this.eat(Delim);
    name2 += "." + this.consume(Ident);
  }
  return {
    type: "Layer",
    loc: this.getLocation(tokenStart, this.tokenStart),
    name: name2
  };
}
function generate$q(node2) {
  this.tokenize(node2.name);
}
const Layer = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$q,
  name: name$p,
  parse: parse$q,
  structure: structure$p
});
const name$o = "LayerList";
const structure$o = {
  children: [[
    "Layer"
  ]]
};
function parse$p() {
  const children = this.createList();
  this.skipSC();
  while (!this.eof) {
    children.push(this.Layer());
    if (this.lookupTypeNonSC(0) !== Comma) {
      break;
    }
    this.skipSC();
    this.next();
    this.skipSC();
  }
  return {
    type: "LayerList",
    loc: this.getLocationFromList(children),
    children
  };
}
function generate$p(node2) {
  this.children(node2, () => this.token(Comma, ","));
}
const LayerList = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$p,
  name: name$o,
  parse: parse$p,
  structure: structure$o
});
const name$n = "MediaQuery";
const structure$n = {
  modifier: [String, null],
  mediaType: [String, null],
  condition: ["Condition", null]
};
function parse$o() {
  const start = this.tokenStart;
  let modifier = null;
  let mediaType = null;
  let condition = null;
  this.skipSC();
  if (this.tokenType === Ident && this.lookupTypeNonSC(1) !== LeftParenthesis) {
    const ident2 = this.consume(Ident);
    const identLowerCase = ident2.toLowerCase();
    if (identLowerCase === "not" || identLowerCase === "only") {
      this.skipSC();
      modifier = identLowerCase;
      mediaType = this.consume(Ident);
    } else {
      mediaType = ident2;
    }
    switch (this.lookupTypeNonSC(0)) {
      case Ident: {
        this.skipSC();
        this.eatIdent("and");
        condition = this.Condition("media");
        break;
      }
      case LeftCurlyBracket:
      case Semicolon:
      case Comma:
      case EOF$1:
        break;
      default:
        this.error("Identifier or parenthesis is expected");
    }
  } else {
    switch (this.tokenType) {
      case Ident:
      case LeftParenthesis:
      case Function$2: {
        condition = this.Condition("media");
        break;
      }
      case LeftCurlyBracket:
      case Semicolon:
      case EOF$1:
        break;
      default:
        this.error("Identifier or parenthesis is expected");
    }
  }
  return {
    type: "MediaQuery",
    loc: this.getLocation(start, this.tokenStart),
    modifier,
    mediaType,
    condition
  };
}
function generate$o(node2) {
  if (node2.mediaType) {
    if (node2.modifier) {
      this.token(Ident, node2.modifier);
    }
    this.token(Ident, node2.mediaType);
    if (node2.condition) {
      this.token(Ident, "and");
      this.node(node2.condition);
    }
  } else if (node2.condition) {
    this.node(node2.condition);
  }
}
const MediaQuery = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$o,
  name: name$n,
  parse: parse$o,
  structure: structure$n
});
const name$m = "MediaQueryList";
const structure$m = {
  children: [[
    "MediaQuery"
  ]]
};
function parse$n() {
  const children = this.createList();
  this.skipSC();
  while (!this.eof) {
    children.push(this.MediaQuery());
    if (this.tokenType !== Comma) {
      break;
    }
    this.next();
  }
  return {
    type: "MediaQueryList",
    loc: this.getLocationFromList(children),
    children
  };
}
function generate$n(node2) {
  this.children(node2, () => this.token(Comma, ","));
}
const MediaQueryList = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$n,
  name: name$m,
  parse: parse$n,
  structure: structure$m
});
const AMPERSAND$1 = 38;
const name$l = "NestingSelector";
const structure$l = {};
function parse$m() {
  const start = this.tokenStart;
  this.eatDelim(AMPERSAND$1);
  return {
    type: "NestingSelector",
    loc: this.getLocation(start, this.tokenStart)
  };
}
function generate$m() {
  this.token(Delim, "&");
}
const NestingSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$m,
  name: name$l,
  parse: parse$m,
  structure: structure$l
});
const name$k = "Nth";
const structure$k = {
  nth: ["AnPlusB", "Identifier"],
  selector: ["SelectorList", null]
};
function parse$l() {
  this.skipSC();
  const start = this.tokenStart;
  let end = start;
  let selector2 = null;
  let nth2;
  if (this.lookupValue(0, "odd") || this.lookupValue(0, "even")) {
    nth2 = this.Identifier();
  } else {
    nth2 = this.AnPlusB();
  }
  end = this.tokenStart;
  this.skipSC();
  if (this.lookupValue(0, "of")) {
    this.next();
    selector2 = this.SelectorList();
    end = this.tokenStart;
  }
  return {
    type: "Nth",
    loc: this.getLocation(start, end),
    nth: nth2,
    selector: selector2
  };
}
function generate$l(node2) {
  this.node(node2.nth);
  if (node2.selector !== null) {
    this.token(Ident, "of");
    this.node(node2.selector);
  }
}
const Nth = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$l,
  name: name$k,
  parse: parse$l,
  structure: structure$k
});
const name$j = "Number";
const structure$j = {
  value: String
};
function parse$k() {
  return {
    type: "Number",
    loc: this.getLocation(this.tokenStart, this.tokenEnd),
    value: this.consume(Number$2)
  };
}
function generate$k(node2) {
  this.token(Number$2, node2.value);
}
const Number$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$k,
  name: name$j,
  parse: parse$k,
  structure: structure$j
});
const name$i = "Operator";
const structure$i = {
  value: String
};
function parse$j() {
  const start = this.tokenStart;
  this.next();
  return {
    type: "Operator",
    loc: this.getLocation(start, this.tokenStart),
    value: this.substrToCursor(start)
  };
}
function generate$j(node2) {
  this.tokenize(node2.value);
}
const Operator = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$j,
  name: name$i,
  parse: parse$j,
  structure: structure$i
});
const name$h = "Parentheses";
const structure$h = {
  children: [[]]
};
function parse$i(readSequence2, recognizer) {
  const start = this.tokenStart;
  let children = null;
  this.eat(LeftParenthesis);
  children = readSequence2.call(this, recognizer);
  if (!this.eof) {
    this.eat(RightParenthesis);
  }
  return {
    type: "Parentheses",
    loc: this.getLocation(start, this.tokenStart),
    children
  };
}
function generate$i(node2) {
  this.token(LeftParenthesis, "(");
  this.children(node2);
  this.token(RightParenthesis, ")");
}
const Parentheses = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$i,
  name: name$h,
  parse: parse$i,
  structure: structure$h
});
const name$g = "Percentage";
const structure$g = {
  value: String
};
function parse$h() {
  return {
    type: "Percentage",
    loc: this.getLocation(this.tokenStart, this.tokenEnd),
    value: this.consumeNumber(Percentage$1)
  };
}
function generate$h(node2) {
  this.token(Percentage$1, node2.value + "%");
}
const Percentage = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$h,
  name: name$g,
  parse: parse$h,
  structure: structure$g
});
const name$f = "PseudoClassSelector";
const walkContext$4 = "function";
const structure$f = {
  name: String,
  children: [["Raw"], null]
};
function parse$g() {
  const start = this.tokenStart;
  let children = null;
  let name2;
  let nameLowerCase;
  this.eat(Colon);
  if (this.tokenType === Function$2) {
    name2 = this.consumeFunctionName();
    nameLowerCase = name2.toLowerCase();
    if (this.lookupNonWSType(0) == RightParenthesis) {
      children = this.createList();
    } else if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
      this.skipSC();
      children = this.pseudo[nameLowerCase].call(this);
      this.skipSC();
    } else {
      children = this.createList();
      children.push(
        this.Raw(null, false)
      );
    }
    this.eat(RightParenthesis);
  } else {
    name2 = this.consume(Ident);
  }
  return {
    type: "PseudoClassSelector",
    loc: this.getLocation(start, this.tokenStart),
    name: name2,
    children
  };
}
function generate$g(node2) {
  this.token(Colon, ":");
  if (node2.children === null) {
    this.token(Ident, node2.name);
  } else {
    this.token(Function$2, node2.name + "(");
    this.children(node2);
    this.token(RightParenthesis, ")");
  }
}
const PseudoClassSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$g,
  name: name$f,
  parse: parse$g,
  structure: structure$f,
  walkContext: walkContext$4
});
const name$e = "PseudoElementSelector";
const walkContext$3 = "function";
const structure$e = {
  name: String,
  children: [["Raw"], null]
};
function parse$f() {
  const start = this.tokenStart;
  let children = null;
  let name2;
  let nameLowerCase;
  this.eat(Colon);
  this.eat(Colon);
  if (this.tokenType === Function$2) {
    name2 = this.consumeFunctionName();
    nameLowerCase = name2.toLowerCase();
    if (this.lookupNonWSType(0) == RightParenthesis) {
      children = this.createList();
    } else if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
      this.skipSC();
      children = this.pseudo[nameLowerCase].call(this);
      this.skipSC();
    } else {
      children = this.createList();
      children.push(
        this.Raw(null, false)
      );
    }
    this.eat(RightParenthesis);
  } else {
    name2 = this.consume(Ident);
  }
  return {
    type: "PseudoElementSelector",
    loc: this.getLocation(start, this.tokenStart),
    name: name2,
    children
  };
}
function generate$f(node2) {
  this.token(Colon, ":");
  this.token(Colon, ":");
  if (node2.children === null) {
    this.token(Ident, node2.name);
  } else {
    this.token(Function$2, node2.name + "(");
    this.children(node2);
    this.token(RightParenthesis, ")");
  }
}
const PseudoElementSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$f,
  name: name$e,
  parse: parse$f,
  structure: structure$e,
  walkContext: walkContext$3
});
const SOLIDUS$2 = 47;
function consumeTerm() {
  this.skipSC();
  switch (this.tokenType) {
    case Number$2:
      return this.Number();
    case Function$2:
      return this.Function(this.readSequence, this.scope.Value);
    default:
      this.error("Number of function is expected");
  }
}
const name$d = "Ratio";
const structure$d = {
  left: ["Number", "Function"],
  right: ["Number", "Function", null]
};
function parse$e() {
  const start = this.tokenStart;
  const left = consumeTerm.call(this);
  let right = null;
  this.skipSC();
  if (this.isDelim(SOLIDUS$2)) {
    this.eatDelim(SOLIDUS$2);
    right = consumeTerm.call(this);
  }
  return {
    type: "Ratio",
    loc: this.getLocation(start, this.tokenStart),
    left,
    right
  };
}
function generate$e(node2) {
  this.node(node2.left);
  this.token(Delim, "/");
  if (node2.right) {
    this.node(node2.right);
  } else {
    this.node(Number$2, 1);
  }
}
const Ratio = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$e,
  name: name$d,
  parse: parse$e,
  structure: structure$d
});
function getOffsetExcludeWS() {
  if (this.tokenIndex > 0) {
    if (this.lookupType(-1) === WhiteSpace$1) {
      return this.tokenIndex > 1 ? this.getTokenStart(this.tokenIndex - 1) : this.firstCharOffset;
    }
  }
  return this.tokenStart;
}
const name$c = "Raw";
const structure$c = {
  value: String
};
function parse$d(consumeUntil, excludeWhiteSpace) {
  const startOffset = this.getTokenStart(this.tokenIndex);
  let endOffset;
  this.skipUntilBalanced(this.tokenIndex, consumeUntil || this.consumeUntilBalanceEnd);
  if (excludeWhiteSpace && this.tokenStart > startOffset) {
    endOffset = getOffsetExcludeWS.call(this);
  } else {
    endOffset = this.tokenStart;
  }
  return {
    type: "Raw",
    loc: this.getLocation(startOffset, endOffset),
    value: this.substring(startOffset, endOffset)
  };
}
function generate$d(node2) {
  this.tokenize(node2.value);
}
const Raw = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$d,
  name: name$c,
  parse: parse$d,
  structure: structure$c
});
function consumeRaw$1() {
  return this.Raw(this.consumeUntilLeftCurlyBracket, true);
}
function consumePrelude() {
  const prelude = this.SelectorList();
  if (prelude.type !== "Raw" && this.eof === false && this.tokenType !== LeftCurlyBracket) {
    this.error();
  }
  return prelude;
}
const name$b = "Rule";
const walkContext$2 = "rule";
const structure$b = {
  prelude: ["SelectorList", "Raw"],
  block: ["Block"]
};
function parse$c() {
  const startToken = this.tokenIndex;
  const startOffset = this.tokenStart;
  let prelude;
  let block;
  if (this.parseRulePrelude) {
    prelude = this.parseWithFallback(consumePrelude, consumeRaw$1);
  } else {
    prelude = consumeRaw$1.call(this, startToken);
  }
  block = this.Block(true);
  return {
    type: "Rule",
    loc: this.getLocation(startOffset, this.tokenStart),
    prelude,
    block
  };
}
function generate$c(node2) {
  this.node(node2.prelude);
  this.node(node2.block);
}
const Rule = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$c,
  name: name$b,
  parse: parse$c,
  structure: structure$b,
  walkContext: walkContext$2
});
const name$a = "Scope";
const structure$a = {
  root: ["SelectorList", "Raw", null],
  limit: ["SelectorList", "Raw", null]
};
function parse$b() {
  let root = null;
  let limit = null;
  this.skipSC();
  const startOffset = this.tokenStart;
  if (this.tokenType === LeftParenthesis) {
    this.next();
    this.skipSC();
    root = this.parseWithFallback(
      this.SelectorList,
      () => this.Raw(false, true)
    );
    this.skipSC();
    this.eat(RightParenthesis);
  }
  if (this.lookupNonWSType(0) === Ident) {
    this.skipSC();
    this.eatIdent("to");
    this.skipSC();
    this.eat(LeftParenthesis);
    this.skipSC();
    limit = this.parseWithFallback(
      this.SelectorList,
      () => this.Raw(false, true)
    );
    this.skipSC();
    this.eat(RightParenthesis);
  }
  return {
    type: "Scope",
    loc: this.getLocation(startOffset, this.tokenStart),
    root,
    limit
  };
}
function generate$b(node2) {
  if (node2.root) {
    this.token(LeftParenthesis, "(");
    this.node(node2.root);
    this.token(RightParenthesis, ")");
  }
  if (node2.limit) {
    this.token(Ident, "to");
    this.token(LeftParenthesis, "(");
    this.node(node2.limit);
    this.token(RightParenthesis, ")");
  }
}
const Scope = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$b,
  name: name$a,
  parse: parse$b,
  structure: structure$a
});
const name$9 = "Selector";
const structure$9 = {
  children: [[
    "TypeSelector",
    "IdSelector",
    "ClassSelector",
    "AttributeSelector",
    "PseudoClassSelector",
    "PseudoElementSelector",
    "Combinator"
  ]]
};
function parse$a() {
  const children = this.readSequence(this.scope.Selector);
  if (this.getFirstListNode(children) === null) {
    this.error("Selector is expected");
  }
  return {
    type: "Selector",
    loc: this.getLocationFromList(children),
    children
  };
}
function generate$a(node2) {
  this.children(node2);
}
const Selector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$a,
  name: name$9,
  parse: parse$a,
  structure: structure$9
});
const name$8 = "SelectorList";
const walkContext$1 = "selector";
const structure$8 = {
  children: [[
    "Selector",
    "Raw"
  ]]
};
function parse$9() {
  const children = this.createList();
  while (!this.eof) {
    children.push(this.Selector());
    if (this.tokenType === Comma) {
      this.next();
      continue;
    }
    break;
  }
  return {
    type: "SelectorList",
    loc: this.getLocationFromList(children),
    children
  };
}
function generate$9(node2) {
  this.children(node2, () => this.token(Comma, ","));
}
const SelectorList = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$9,
  name: name$8,
  parse: parse$9,
  structure: structure$8,
  walkContext: walkContext$1
});
const REVERSE_SOLIDUS$1 = 92;
const QUOTATION_MARK$1 = 34;
const APOSTROPHE$1 = 39;
function decode$1(str) {
  const len = str.length;
  const firstChar = str.charCodeAt(0);
  const start = firstChar === QUOTATION_MARK$1 || firstChar === APOSTROPHE$1 ? 1 : 0;
  const end = start === 1 && len > 1 && str.charCodeAt(len - 1) === firstChar ? len - 2 : len - 1;
  let decoded = "";
  for (let i = start; i <= end; i++) {
    let code2 = str.charCodeAt(i);
    if (code2 === REVERSE_SOLIDUS$1) {
      if (i === end) {
        if (i !== len - 1) {
          decoded = str.substr(i + 1);
        }
        break;
      }
      code2 = str.charCodeAt(++i);
      if (isValidEscape(REVERSE_SOLIDUS$1, code2)) {
        const escapeStart = i - 1;
        const escapeEnd = consumeEscaped(str, escapeStart);
        i = escapeEnd - 1;
        decoded += decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
      } else {
        if (code2 === 13 && str.charCodeAt(i + 1) === 10) {
          i++;
        }
      }
    } else {
      decoded += str[i];
    }
  }
  return decoded;
}
function encode$1(str, apostrophe) {
  const quote = '"';
  const quoteCode = QUOTATION_MARK$1;
  let encoded = "";
  let wsBeforeHexIsNeeded = false;
  for (let i = 0; i < str.length; i++) {
    const code2 = str.charCodeAt(i);
    if (code2 === 0) {
      encoded += "�";
      continue;
    }
    if (code2 <= 31 || code2 === 127) {
      encoded += "\\" + code2.toString(16);
      wsBeforeHexIsNeeded = true;
      continue;
    }
    if (code2 === quoteCode || code2 === REVERSE_SOLIDUS$1) {
      encoded += "\\" + str.charAt(i);
      wsBeforeHexIsNeeded = false;
    } else {
      if (wsBeforeHexIsNeeded && (isHexDigit(code2) || isWhiteSpace(code2))) {
        encoded += " ";
      }
      encoded += str.charAt(i);
      wsBeforeHexIsNeeded = false;
    }
  }
  return quote + encoded + quote;
}
const name$7 = "String";
const structure$7 = {
  value: String
};
function parse$8() {
  return {
    type: "String",
    loc: this.getLocation(this.tokenStart, this.tokenEnd),
    value: decode$1(this.consume(String$2))
  };
}
function generate$8(node2) {
  this.token(String$2, encode$1(node2.value));
}
const String$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$8,
  name: name$7,
  parse: parse$8,
  structure: structure$7
});
const EXCLAMATIONMARK = 33;
function consumeRaw() {
  return this.Raw(null, false);
}
const name$6 = "StyleSheet";
const walkContext = "stylesheet";
const structure$6 = {
  children: [[
    "Comment",
    "CDO",
    "CDC",
    "Atrule",
    "Rule",
    "Raw"
  ]]
};
function parse$7() {
  const start = this.tokenStart;
  const children = this.createList();
  let child;
  while (!this.eof) {
    switch (this.tokenType) {
      case WhiteSpace$1:
        this.next();
        continue;
      case Comment$1:
        if (this.charCodeAt(this.tokenStart + 2) !== EXCLAMATIONMARK) {
          this.next();
          continue;
        }
        child = this.Comment();
        break;
      case CDO$1:
        child = this.CDO();
        break;
      case CDC$1:
        child = this.CDC();
        break;
      // CSS Syntax Module Level 3
      // §2.2 Error handling
      // At the "top level" of a stylesheet, an <at-keyword-token> starts an at-rule.
      case AtKeyword:
        child = this.parseWithFallback(this.Atrule, consumeRaw);
        break;
      // Anything else starts a qualified rule ...
      default:
        child = this.parseWithFallback(this.Rule, consumeRaw);
    }
    children.push(child);
  }
  return {
    type: "StyleSheet",
    loc: this.getLocation(start, this.tokenStart),
    children
  };
}
function generate$7(node2) {
  this.children(node2);
}
const StyleSheet = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$7,
  name: name$6,
  parse: parse$7,
  structure: structure$6,
  walkContext
});
const name$5 = "SupportsDeclaration";
const structure$5 = {
  declaration: "Declaration"
};
function parse$6() {
  const start = this.tokenStart;
  this.eat(LeftParenthesis);
  this.skipSC();
  const declaration = this.Declaration();
  if (!this.eof) {
    this.eat(RightParenthesis);
  }
  return {
    type: "SupportsDeclaration",
    loc: this.getLocation(start, this.tokenStart),
    declaration
  };
}
function generate$6(node2) {
  this.token(LeftParenthesis, "(");
  this.node(node2.declaration);
  this.token(RightParenthesis, ")");
}
const SupportsDeclaration = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$6,
  name: name$5,
  parse: parse$6,
  structure: structure$5
});
const ASTERISK$2 = 42;
const VERTICALLINE$1 = 124;
function eatIdentifierOrAsterisk() {
  if (this.tokenType !== Ident && this.isDelim(ASTERISK$2) === false) {
    this.error("Identifier or asterisk is expected");
  }
  this.next();
}
const name$4 = "TypeSelector";
const structure$4 = {
  name: String
};
function parse$5() {
  const start = this.tokenStart;
  if (this.isDelim(VERTICALLINE$1)) {
    this.next();
    eatIdentifierOrAsterisk.call(this);
  } else {
    eatIdentifierOrAsterisk.call(this);
    if (this.isDelim(VERTICALLINE$1)) {
      this.next();
      eatIdentifierOrAsterisk.call(this);
    }
  }
  return {
    type: "TypeSelector",
    loc: this.getLocation(start, this.tokenStart),
    name: this.substrToCursor(start)
  };
}
function generate$5(node2) {
  this.tokenize(node2.name);
}
const TypeSelector = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$5,
  name: name$4,
  parse: parse$5,
  structure: structure$4
});
const PLUSSIGN$2 = 43;
const HYPHENMINUS$1 = 45;
const QUESTIONMARK = 63;
function eatHexSequence(offset, allowDash) {
  let len = 0;
  for (let pos = this.tokenStart + offset; pos < this.tokenEnd; pos++) {
    const code2 = this.charCodeAt(pos);
    if (code2 === HYPHENMINUS$1 && allowDash && len !== 0) {
      eatHexSequence.call(this, offset + len + 1, false);
      return -1;
    }
    if (!isHexDigit(code2)) {
      this.error(
        allowDash && len !== 0 ? "Hyphen minus" + (len < 6 ? " or hex digit" : "") + " is expected" : len < 6 ? "Hex digit is expected" : "Unexpected input",
        pos
      );
    }
    if (++len > 6) {
      this.error("Too many hex digits", pos);
    }
  }
  this.next();
  return len;
}
function eatQuestionMarkSequence(max) {
  let count = 0;
  while (this.isDelim(QUESTIONMARK)) {
    if (++count > max) {
      this.error("Too many question marks");
    }
    this.next();
  }
}
function startsWith(code2) {
  if (this.charCodeAt(this.tokenStart) !== code2) {
    this.error((code2 === PLUSSIGN$2 ? "Plus sign" : "Hyphen minus") + " is expected");
  }
}
function scanUnicodeRange() {
  let hexLength = 0;
  switch (this.tokenType) {
    case Number$2:
      hexLength = eatHexSequence.call(this, 1, true);
      if (this.isDelim(QUESTIONMARK)) {
        eatQuestionMarkSequence.call(this, 6 - hexLength);
        break;
      }
      if (this.tokenType === Dimension$1 || this.tokenType === Number$2) {
        startsWith.call(this, HYPHENMINUS$1);
        eatHexSequence.call(this, 1, false);
        break;
      }
      break;
    case Dimension$1:
      hexLength = eatHexSequence.call(this, 1, true);
      if (hexLength > 0) {
        eatQuestionMarkSequence.call(this, 6 - hexLength);
      }
      break;
    default:
      this.eatDelim(PLUSSIGN$2);
      if (this.tokenType === Ident) {
        hexLength = eatHexSequence.call(this, 0, true);
        if (hexLength > 0) {
          eatQuestionMarkSequence.call(this, 6 - hexLength);
        }
        break;
      }
      if (this.isDelim(QUESTIONMARK)) {
        this.next();
        eatQuestionMarkSequence.call(this, 5);
        break;
      }
      this.error("Hex digit or question mark is expected");
  }
}
const name$3 = "UnicodeRange";
const structure$3 = {
  value: String
};
function parse$4() {
  const start = this.tokenStart;
  this.eatIdent("u");
  scanUnicodeRange.call(this);
  return {
    type: "UnicodeRange",
    loc: this.getLocation(start, this.tokenStart),
    value: this.substrToCursor(start)
  };
}
function generate$4(node2) {
  this.tokenize(node2.value);
}
const UnicodeRange = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$4,
  name: name$3,
  parse: parse$4,
  structure: structure$3
});
const SPACE$1 = 32;
const REVERSE_SOLIDUS = 92;
const QUOTATION_MARK = 34;
const APOSTROPHE = 39;
const LEFTPARENTHESIS = 40;
const RIGHTPARENTHESIS = 41;
function decode(str) {
  const len = str.length;
  let start = 4;
  let end = str.charCodeAt(len - 1) === RIGHTPARENTHESIS ? len - 2 : len - 1;
  let decoded = "";
  while (start < end && isWhiteSpace(str.charCodeAt(start))) {
    start++;
  }
  while (start < end && isWhiteSpace(str.charCodeAt(end))) {
    end--;
  }
  for (let i = start; i <= end; i++) {
    let code2 = str.charCodeAt(i);
    if (code2 === REVERSE_SOLIDUS) {
      if (i === end) {
        if (i !== len - 1) {
          decoded = str.substr(i + 1);
        }
        break;
      }
      code2 = str.charCodeAt(++i);
      if (isValidEscape(REVERSE_SOLIDUS, code2)) {
        const escapeStart = i - 1;
        const escapeEnd = consumeEscaped(str, escapeStart);
        i = escapeEnd - 1;
        decoded += decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
      } else {
        if (code2 === 13 && str.charCodeAt(i + 1) === 10) {
          i++;
        }
      }
    } else {
      decoded += str[i];
    }
  }
  return decoded;
}
function encode(str) {
  let encoded = "";
  let wsBeforeHexIsNeeded = false;
  for (let i = 0; i < str.length; i++) {
    const code2 = str.charCodeAt(i);
    if (code2 === 0) {
      encoded += "�";
      continue;
    }
    if (code2 <= 31 || code2 === 127) {
      encoded += "\\" + code2.toString(16);
      wsBeforeHexIsNeeded = true;
      continue;
    }
    if (code2 === SPACE$1 || code2 === REVERSE_SOLIDUS || code2 === QUOTATION_MARK || code2 === APOSTROPHE || code2 === LEFTPARENTHESIS || code2 === RIGHTPARENTHESIS) {
      encoded += "\\" + str.charAt(i);
      wsBeforeHexIsNeeded = false;
    } else {
      if (wsBeforeHexIsNeeded && isHexDigit(code2)) {
        encoded += " ";
      }
      encoded += str.charAt(i);
      wsBeforeHexIsNeeded = false;
    }
  }
  return "url(" + encoded + ")";
}
const name$2 = "Url";
const structure$2 = {
  value: String
};
function parse$3() {
  const start = this.tokenStart;
  let value2;
  switch (this.tokenType) {
    case Url$1:
      value2 = decode(this.consume(Url$1));
      break;
    case Function$2:
      if (!this.cmpStr(this.tokenStart, this.tokenEnd, "url(")) {
        this.error("Function name must be `url`");
      }
      this.eat(Function$2);
      this.skipSC();
      value2 = decode$1(this.consume(String$2));
      this.skipSC();
      if (!this.eof) {
        this.eat(RightParenthesis);
      }
      break;
    default:
      this.error("Url or Function is expected");
  }
  return {
    type: "Url",
    loc: this.getLocation(start, this.tokenStart),
    value: value2
  };
}
function generate$3(node2) {
  this.token(Url$1, encode(node2.value));
}
const Url = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$3,
  name: name$2,
  parse: parse$3,
  structure: structure$2
});
const name$1 = "Value";
const structure$1 = {
  children: [[]]
};
function parse$2() {
  const start = this.tokenStart;
  const children = this.readSequence(this.scope.Value);
  return {
    type: "Value",
    loc: this.getLocation(start, this.tokenStart),
    children
  };
}
function generate$2(node2) {
  this.children(node2);
}
const Value = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$2,
  name: name$1,
  parse: parse$2,
  structure: structure$1
});
const SPACE = Object.freeze({
  type: "WhiteSpace",
  loc: null,
  value: " "
});
const name = "WhiteSpace";
const structure = {
  value: String
};
function parse$1() {
  this.eat(WhiteSpace$1);
  return SPACE;
}
function generate$1(node2) {
  this.token(WhiteSpace$1, node2.value);
}
const WhiteSpace = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  generate: generate$1,
  name,
  parse: parse$1,
  structure
});
const node$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AnPlusB,
  Atrule,
  AtrulePrelude,
  AttributeSelector,
  Block,
  Brackets,
  CDC,
  CDO,
  ClassSelector,
  Combinator,
  Comment,
  Condition,
  Declaration,
  DeclarationList,
  Dimension,
  Feature,
  FeatureFunction,
  FeatureRange,
  Function: Function$1,
  GeneralEnclosed,
  Hash,
  IdSelector,
  Identifier,
  Layer,
  LayerList,
  MediaQuery,
  MediaQueryList,
  NestingSelector,
  Nth,
  Number: Number$1,
  Operator,
  Parentheses,
  Percentage,
  PseudoClassSelector,
  PseudoElementSelector,
  Ratio,
  Raw,
  Rule,
  Scope,
  Selector,
  SelectorList,
  String: String$1,
  StyleSheet,
  SupportsDeclaration,
  TypeSelector,
  UnicodeRange,
  Url,
  Value,
  WhiteSpace
});
const lexerConfig = {
  generic: true,
  cssWideKeywords,
  ...definitions,
  node: node$1
};
const NUMBERSIGN$1 = 35;
const ASTERISK$1 = 42;
const PLUSSIGN$1 = 43;
const HYPHENMINUS = 45;
const SOLIDUS$1 = 47;
const U = 117;
function defaultRecognizer(context) {
  switch (this.tokenType) {
    case Hash$1:
      return this.Hash();
    case Comma:
      return this.Operator();
    case LeftParenthesis:
      return this.Parentheses(this.readSequence, context.recognizer);
    case LeftSquareBracket:
      return this.Brackets(this.readSequence, context.recognizer);
    case String$2:
      return this.String();
    case Dimension$1:
      return this.Dimension();
    case Percentage$1:
      return this.Percentage();
    case Number$2:
      return this.Number();
    case Function$2:
      return this.cmpStr(this.tokenStart, this.tokenEnd, "url(") ? this.Url() : this.Function(this.readSequence, context.recognizer);
    case Url$1:
      return this.Url();
    case Ident:
      if (this.cmpChar(this.tokenStart, U) && this.cmpChar(this.tokenStart + 1, PLUSSIGN$1)) {
        return this.UnicodeRange();
      } else {
        return this.Identifier();
      }
    case Delim: {
      const code2 = this.charCodeAt(this.tokenStart);
      if (code2 === SOLIDUS$1 || code2 === ASTERISK$1 || code2 === PLUSSIGN$1 || code2 === HYPHENMINUS) {
        return this.Operator();
      }
      if (code2 === NUMBERSIGN$1) {
        this.error("Hex or identifier is expected", this.tokenStart + 1);
      }
      break;
    }
  }
}
const atrulePrelude = {
  getNode: defaultRecognizer
};
const NUMBERSIGN = 35;
const AMPERSAND = 38;
const ASTERISK = 42;
const PLUSSIGN = 43;
const SOLIDUS = 47;
const FULLSTOP = 46;
const GREATERTHANSIGN = 62;
const VERTICALLINE = 124;
const TILDE = 126;
function onWhiteSpace(next, children) {
  if (children.last !== null && children.last.type !== "Combinator" && next !== null && next.type !== "Combinator") {
    children.push({
      // FIXME: this.Combinator() should be used instead
      type: "Combinator",
      loc: null,
      name: " "
    });
  }
}
function getNode() {
  switch (this.tokenType) {
    case LeftSquareBracket:
      return this.AttributeSelector();
    case Hash$1:
      return this.IdSelector();
    case Colon:
      if (this.lookupType(1) === Colon) {
        return this.PseudoElementSelector();
      } else {
        return this.PseudoClassSelector();
      }
    case Ident:
      return this.TypeSelector();
    case Number$2:
    case Percentage$1:
      return this.Percentage();
    case Dimension$1:
      if (this.charCodeAt(this.tokenStart) === FULLSTOP) {
        this.error("Identifier is expected", this.tokenStart + 1);
      }
      break;
    case Delim: {
      const code2 = this.charCodeAt(this.tokenStart);
      switch (code2) {
        case PLUSSIGN:
        case GREATERTHANSIGN:
        case TILDE:
        case SOLIDUS:
          return this.Combinator();
        case FULLSTOP:
          return this.ClassSelector();
        case ASTERISK:
        case VERTICALLINE:
          return this.TypeSelector();
        case NUMBERSIGN:
          return this.IdSelector();
        case AMPERSAND:
          return this.NestingSelector();
      }
      break;
    }
  }
}
const selector$1 = {
  onWhiteSpace,
  getNode
};
function expressionFn() {
  return this.createSingleNodeList(
    this.Raw(null, false)
  );
}
function varFn() {
  const children = this.createList();
  this.skipSC();
  children.push(this.Identifier());
  this.skipSC();
  if (this.tokenType === Comma) {
    children.push(this.Operator());
    const startIndex = this.tokenIndex;
    const value2 = this.parseCustomProperty ? this.Value(null) : this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);
    if (value2.type === "Value" && value2.children.isEmpty) {
      for (let offset = startIndex - this.tokenIndex; offset <= 0; offset++) {
        if (this.lookupType(offset) === WhiteSpace$1) {
          value2.children.appendData({
            type: "WhiteSpace",
            loc: null,
            value: " "
          });
          break;
        }
      }
    }
    children.push(value2);
  }
  return children;
}
function isPlusMinusOperator(node2) {
  return node2 !== null && node2.type === "Operator" && (node2.value[node2.value.length - 1] === "-" || node2.value[node2.value.length - 1] === "+");
}
const value = {
  getNode: defaultRecognizer,
  onWhiteSpace(next, children) {
    if (isPlusMinusOperator(next)) {
      next.value = " " + next.value;
    }
    if (isPlusMinusOperator(children.last)) {
      children.last.value += " ";
    }
  },
  "expression": expressionFn,
  "var": varFn
};
const scope$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AtrulePrelude: atrulePrelude,
  Selector: selector$1,
  Value: value
});
const nonContainerNameKeywords = /* @__PURE__ */ new Set(["none", "and", "not", "or"]);
const container = {
  parse: {
    prelude() {
      const children = this.createList();
      if (this.tokenType === Ident) {
        const name2 = this.substring(this.tokenStart, this.tokenEnd);
        if (!nonContainerNameKeywords.has(name2.toLowerCase())) {
          children.push(this.Identifier());
        }
      }
      children.push(this.Condition("container"));
      return children;
    },
    block(nested = false) {
      return this.Block(nested);
    }
  }
};
const fontFace = {
  parse: {
    prelude: null,
    block() {
      return this.Block(true);
    }
  }
};
function parseWithFallback(parse2, fallback) {
  return this.parseWithFallback(
    () => {
      try {
        return parse2.call(this);
      } finally {
        this.skipSC();
        if (this.lookupNonWSType(0) !== RightParenthesis) {
          this.error();
        }
      }
    },
    fallback || (() => this.Raw(null, true))
  );
}
const parseFunctions = {
  layer() {
    this.skipSC();
    const children = this.createList();
    const node2 = parseWithFallback.call(this, this.Layer);
    if (node2.type !== "Raw" || node2.value !== "") {
      children.push(node2);
    }
    return children;
  },
  supports() {
    this.skipSC();
    const children = this.createList();
    const node2 = parseWithFallback.call(
      this,
      this.Declaration,
      () => parseWithFallback.call(this, () => this.Condition("supports"))
    );
    if (node2.type !== "Raw" || node2.value !== "") {
      children.push(node2);
    }
    return children;
  }
};
const importAtrule = {
  parse: {
    prelude() {
      const children = this.createList();
      switch (this.tokenType) {
        case String$2:
          children.push(this.String());
          break;
        case Url$1:
        case Function$2:
          children.push(this.Url());
          break;
        default:
          this.error("String or url() is expected");
      }
      this.skipSC();
      if (this.tokenType === Ident && this.cmpStr(this.tokenStart, this.tokenEnd, "layer")) {
        children.push(this.Identifier());
      } else if (this.tokenType === Function$2 && this.cmpStr(this.tokenStart, this.tokenEnd, "layer(")) {
        children.push(this.Function(null, parseFunctions));
      }
      this.skipSC();
      if (this.tokenType === Function$2 && this.cmpStr(this.tokenStart, this.tokenEnd, "supports(")) {
        children.push(this.Function(null, parseFunctions));
      }
      if (this.lookupNonWSType(0) === Ident || this.lookupNonWSType(0) === LeftParenthesis) {
        children.push(this.MediaQueryList());
      }
      return children;
    },
    block: null
  }
};
const layer = {
  parse: {
    prelude() {
      return this.createSingleNodeList(
        this.LayerList()
      );
    },
    block() {
      return this.Block(false);
    }
  }
};
const media = {
  parse: {
    prelude() {
      return this.createSingleNodeList(
        this.MediaQueryList()
      );
    },
    block(nested = false) {
      return this.Block(nested);
    }
  }
};
const nest = {
  parse: {
    prelude() {
      return this.createSingleNodeList(
        this.SelectorList()
      );
    },
    block() {
      return this.Block(true);
    }
  }
};
const page = {
  parse: {
    prelude() {
      return this.createSingleNodeList(
        this.SelectorList()
      );
    },
    block() {
      return this.Block(true);
    }
  }
};
const scope = {
  parse: {
    prelude() {
      return this.createSingleNodeList(
        this.Scope()
      );
    },
    block(nested = false) {
      return this.Block(nested);
    }
  }
};
const startingStyle = {
  parse: {
    prelude: null,
    block(nested = false) {
      return this.Block(nested);
    }
  }
};
const supports = {
  parse: {
    prelude() {
      return this.createSingleNodeList(
        this.Condition("supports")
      );
    },
    block(nested = false) {
      return this.Block(nested);
    }
  }
};
const atrule = {
  container,
  "font-face": fontFace,
  import: importAtrule,
  layer,
  media,
  nest,
  page,
  scope,
  "starting-style": startingStyle,
  supports
};
function parseLanguageRangeList() {
  const children = this.createList();
  this.skipSC();
  loop: while (!this.eof) {
    switch (this.tokenType) {
      case Ident:
        children.push(this.Identifier());
        break;
      case String$2:
        children.push(this.String());
        break;
      case Comma:
        children.push(this.Operator());
        break;
      case RightParenthesis:
        break loop;
      default:
        this.error("Identifier, string or comma is expected");
    }
    this.skipSC();
  }
  return children;
}
const selectorList = {
  parse() {
    return this.createSingleNodeList(
      this.SelectorList()
    );
  }
};
const selector = {
  parse() {
    return this.createSingleNodeList(
      this.Selector()
    );
  }
};
const identList = {
  parse() {
    return this.createSingleNodeList(
      this.Identifier()
    );
  }
};
const langList = {
  parse: parseLanguageRangeList
};
const nth = {
  parse() {
    return this.createSingleNodeList(
      this.Nth()
    );
  }
};
const pseudo = {
  "dir": identList,
  "has": selectorList,
  "lang": langList,
  "matches": selectorList,
  "is": selectorList,
  "-moz-any": selectorList,
  "-webkit-any": selectorList,
  "where": selectorList,
  "not": selectorList,
  "nth-child": nth,
  "nth-last-child": nth,
  "nth-last-of-type": nth,
  "nth-of-type": nth,
  "slotted": selector,
  "host": selector,
  "host-context": selector
};
const node = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AnPlusB: parse$N,
  Atrule: parse$M,
  AtrulePrelude: parse$L,
  AttributeSelector: parse$K,
  Block: parse$J,
  Brackets: parse$I,
  CDC: parse$H,
  CDO: parse$G,
  ClassSelector: parse$F,
  Combinator: parse$E,
  Comment: parse$D,
  Condition: parse$C,
  Declaration: parse$B,
  DeclarationList: parse$A,
  Dimension: parse$z,
  Feature: parse$y,
  FeatureFunction: parse$x,
  FeatureRange: parse$w,
  Function: parse$v,
  GeneralEnclosed: parse$u,
  Hash: parse$t,
  IdSelector: parse$r,
  Identifier: parse$s,
  Layer: parse$q,
  LayerList: parse$p,
  MediaQuery: parse$o,
  MediaQueryList: parse$n,
  NestingSelector: parse$m,
  Nth: parse$l,
  Number: parse$k,
  Operator: parse$j,
  Parentheses: parse$i,
  Percentage: parse$h,
  PseudoClassSelector: parse$g,
  PseudoElementSelector: parse$f,
  Ratio: parse$e,
  Raw: parse$d,
  Rule: parse$c,
  Scope: parse$b,
  Selector: parse$a,
  SelectorList: parse$9,
  String: parse$8,
  StyleSheet: parse$7,
  SupportsDeclaration: parse$6,
  TypeSelector: parse$5,
  UnicodeRange: parse$4,
  Url: parse$3,
  Value: parse$2,
  WhiteSpace: parse$1
});
const parserConfig = {
  parseContext: {
    default: "StyleSheet",
    stylesheet: "StyleSheet",
    atrule: "Atrule",
    atrulePrelude(options) {
      return this.AtrulePrelude(options.atrule ? String(options.atrule) : null);
    },
    mediaQueryList: "MediaQueryList",
    mediaQuery: "MediaQuery",
    condition(options) {
      return this.Condition(options.kind);
    },
    rule: "Rule",
    selectorList: "SelectorList",
    selector: "Selector",
    block() {
      return this.Block(true);
    },
    declarationList: "DeclarationList",
    declaration: "Declaration",
    value: "Value"
  },
  features: {
    supports: {
      selector() {
        return this.Selector();
      }
    },
    container: {
      style() {
        return this.Declaration();
      }
    }
  },
  scope: scope$1,
  atrule,
  pseudo,
  node
};
const walkerConfig = {
  node: node$1
};
const syntax = createSyntax$1({
  ...lexerConfig,
  ...parserConfig,
  ...walkerConfig
});
function clone(node2) {
  const result = {};
  for (const key of Object.keys(node2)) {
    let value2 = node2[key];
    if (value2) {
      if (Array.isArray(value2) || value2 instanceof List) {
        value2 = value2.map(clone);
      } else if (value2.constructor === Object) {
        value2 = clone(value2);
      }
    }
    result[key] = value2;
  }
  return result;
}
const {
  tokenize,
  parse,
  generate,
  lexer,
  createLexer,
  walk,
  find,
  findLast,
  findAll,
  toPlainObject,
  fromPlainObject,
  fork
} = syntax;
export {
  findAll as a,
  clone as c,
  find as f,
  generate as g,
  parse as p,
  requireCjs as r,
  toPlainObject as t,
  walk as w
};

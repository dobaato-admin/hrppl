class ParseError extends Error {
  sourceStart;
  sourceEnd;
  parserState;
  constructor(e2, n, t2, o2) {
    super(e2), this.name = "ParseError", this.sourceStart = n, this.sourceEnd = t2, this.parserState = o2;
  }
}
class ParseErrorWithToken extends ParseError {
  token;
  constructor(e2, n, t2, o2, r2) {
    super(e2, n, t2, o2), this.token = r2;
  }
}
const e = { UnexpectedNewLineInString: "Unexpected newline while consuming a string token.", UnexpectedEOFInString: "Unexpected EOF while consuming a string token.", UnexpectedEOFInComment: "Unexpected EOF while consuming a comment.", UnexpectedEOFInURL: "Unexpected EOF while consuming a url token.", UnexpectedEOFInEscapedCodePoint: "Unexpected EOF while consuming an escaped code point.", UnexpectedCharacterInURL: "Unexpected character while consuming a url token.", InvalidEscapeSequenceInURL: "Invalid escape sequence while consuming a url token.", InvalidEscapeSequenceAfterBackslash: 'Invalid escape sequence after "\\"' };
function stringify(...e2) {
  let n = "";
  for (let t2 = 0; t2 < e2.length; t2++) n += e2[t2][1];
  return n;
}
const t = 13, o = 45, r = 10, i = 43, s = 65533;
function checkIfFourCodePointsWouldStartCDO(e2) {
  return 60 === e2.source.codePointAt(e2.cursor) && 33 === e2.source.codePointAt(e2.cursor + 1) && e2.source.codePointAt(e2.cursor + 2) === o && e2.source.codePointAt(e2.cursor + 3) === o;
}
function isDigitCodePoint(e2) {
  return e2 >= 48 && e2 <= 57;
}
function isUppercaseLetterCodePoint(e2) {
  return e2 >= 65 && e2 <= 90;
}
function isLowercaseLetterCodePoint(e2) {
  return e2 >= 97 && e2 <= 122;
}
function isHexDigitCodePoint(e2) {
  return e2 >= 48 && e2 <= 57 || e2 >= 97 && e2 <= 102 || e2 >= 65 && e2 <= 70;
}
function isLetterCodePoint(e2) {
  return isLowercaseLetterCodePoint(e2) || isUppercaseLetterCodePoint(e2);
}
function isIdentStartCodePoint(e2) {
  return isLetterCodePoint(e2) || isNonASCII_IdentCodePoint(e2) || 95 === e2;
}
function isIdentCodePoint(e2) {
  return isIdentStartCodePoint(e2) || isDigitCodePoint(e2) || e2 === o;
}
function isNonASCII_IdentCodePoint(e2) {
  return 183 === e2 || 8204 === e2 || 8205 === e2 || 8255 === e2 || 8256 === e2 || 8204 === e2 || (192 <= e2 && e2 <= 214 || 216 <= e2 && e2 <= 246 || 248 <= e2 && e2 <= 893 || 895 <= e2 && e2 <= 8191 || 8304 <= e2 && e2 <= 8591 || 11264 <= e2 && e2 <= 12271 || 12289 <= e2 && e2 <= 55295 || 63744 <= e2 && e2 <= 64975 || 65008 <= e2 && e2 <= 65533 || (0 === e2 || (!!isSurrogate(e2) || e2 >= 65536)));
}
function isNonPrintableCodePoint(e2) {
  return 11 === e2 || 127 === e2 || 0 <= e2 && e2 <= 8 || 14 <= e2 && e2 <= 31;
}
function isNewLine(e2) {
  return e2 === r || e2 === t || 12 === e2;
}
function isWhitespace(e2) {
  return 32 === e2 || e2 === r || 9 === e2 || e2 === t || 12 === e2;
}
function isSurrogate(e2) {
  return e2 >= 55296 && e2 <= 57343;
}
function checkIfTwoCodePointsAreAValidEscape(e2) {
  return 92 === e2.source.codePointAt(e2.cursor) && !isNewLine(e2.source.codePointAt(e2.cursor + 1) ?? -1);
}
function checkIfThreeCodePointsWouldStartAnIdentSequence(e2, n) {
  return n.source.codePointAt(n.cursor) === o ? n.source.codePointAt(n.cursor + 1) === o || (!!isIdentStartCodePoint(n.source.codePointAt(n.cursor + 1) ?? -1) || 92 === n.source.codePointAt(n.cursor + 1) && !isNewLine(n.source.codePointAt(n.cursor + 2) ?? -1)) : !!isIdentStartCodePoint(n.source.codePointAt(n.cursor) ?? -1) || checkIfTwoCodePointsAreAValidEscape(n);
}
function checkIfThreeCodePointsWouldStartANumber(e2) {
  return e2.source.codePointAt(e2.cursor) === i || e2.source.codePointAt(e2.cursor) === o ? !!isDigitCodePoint(e2.source.codePointAt(e2.cursor + 1) ?? -1) || 46 === e2.source.codePointAt(e2.cursor + 1) && isDigitCodePoint(e2.source.codePointAt(e2.cursor + 2) ?? -1) : 46 === e2.source.codePointAt(e2.cursor) ? isDigitCodePoint(e2.source.codePointAt(e2.cursor + 1) ?? -1) : isDigitCodePoint(e2.source.codePointAt(e2.cursor) ?? -1);
}
function checkIfTwoCodePointsStartAComment(e2) {
  return 47 === e2.source.codePointAt(e2.cursor) && 42 === e2.source.codePointAt(e2.cursor + 1);
}
function checkIfThreeCodePointsWouldStartCDC(e2) {
  return e2.source.codePointAt(e2.cursor) === o && e2.source.codePointAt(e2.cursor + 1) === o && 62 === e2.source.codePointAt(e2.cursor + 2);
}
var c, a, u;
function mirrorVariantType(e2) {
  switch (e2) {
    case c.OpenParen:
      return c.CloseParen;
    case c.CloseParen:
      return c.OpenParen;
    case c.OpenCurly:
      return c.CloseCurly;
    case c.CloseCurly:
      return c.OpenCurly;
    case c.OpenSquare:
      return c.CloseSquare;
    case c.CloseSquare:
      return c.OpenSquare;
    default:
      return null;
  }
}
function mirrorVariant(e2) {
  switch (e2[0]) {
    case c.OpenParen:
      return [c.CloseParen, ")", -1, -1, void 0];
    case c.CloseParen:
      return [c.OpenParen, "(", -1, -1, void 0];
    case c.OpenCurly:
      return [c.CloseCurly, "}", -1, -1, void 0];
    case c.CloseCurly:
      return [c.OpenCurly, "{", -1, -1, void 0];
    case c.OpenSquare:
      return [c.CloseSquare, "]", -1, -1, void 0];
    case c.CloseSquare:
      return [c.OpenSquare, "[", -1, -1, void 0];
    default:
      return null;
  }
}
function consumeComment(n, t2) {
  for (t2.advanceCodePoint(2); ; ) {
    const o2 = t2.readCodePoint();
    if (void 0 === o2) {
      const o3 = [c.Comment, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, void 0];
      return n.onParseError(new ParseErrorWithToken(e.UnexpectedEOFInComment, t2.representationStart, t2.representationEnd, ["4.3.2. Consume comments", "Unexpected EOF"], o3)), o3;
    }
    if (42 === o2 && (void 0 !== t2.source.codePointAt(t2.cursor) && 47 === t2.source.codePointAt(t2.cursor))) {
      t2.advanceCodePoint();
      break;
    }
  }
  return [c.Comment, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, void 0];
}
function consumeEscapedCodePoint(n, o2) {
  const i2 = o2.readCodePoint();
  if (void 0 === i2) return n.onParseError(new ParseError(e.UnexpectedEOFInEscapedCodePoint, o2.representationStart, o2.representationEnd, ["4.3.7. Consume an escaped code point", "Unexpected EOF"])), s;
  if (isHexDigitCodePoint(i2)) {
    const e2 = [i2];
    let n2;
    for (; void 0 !== (n2 = o2.source.codePointAt(o2.cursor)) && isHexDigitCodePoint(n2) && e2.length < 6; ) e2.push(n2), o2.advanceCodePoint();
    isWhitespace(o2.source.codePointAt(o2.cursor) ?? -1) && (o2.source.codePointAt(o2.cursor) === t && o2.source.codePointAt(o2.cursor + 1) === r && o2.advanceCodePoint(), o2.advanceCodePoint());
    const c2 = parseInt(String.fromCodePoint(...e2), 16);
    return 0 === c2 || isSurrogate(c2) || c2 > 1114111 ? s : c2;
  }
  return 0 === i2 || isSurrogate(i2) ? s : i2;
}
function consumeIdentSequence(e2, n) {
  const t2 = [];
  for (; ; ) {
    const o2 = n.source.codePointAt(n.cursor) ?? -1;
    if (0 === o2 || isSurrogate(o2)) t2.push(s), n.advanceCodePoint(+(o2 > 65535) + 1);
    else if (isIdentCodePoint(o2)) t2.push(o2), n.advanceCodePoint(+(o2 > 65535) + 1);
    else {
      if (!checkIfTwoCodePointsAreAValidEscape(n)) return t2;
      n.advanceCodePoint(), t2.push(consumeEscapedCodePoint(e2, n));
    }
  }
}
function consumeHashToken(e2, n) {
  n.advanceCodePoint();
  const t2 = n.source.codePointAt(n.cursor);
  if (void 0 !== t2 && (isIdentCodePoint(t2) || checkIfTwoCodePointsAreAValidEscape(n))) {
    let t3 = u.Unrestricted;
    checkIfThreeCodePointsWouldStartAnIdentSequence(0, n) && (t3 = u.ID);
    const o2 = consumeIdentSequence(e2, n);
    return [c.Hash, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: String.fromCodePoint(...o2), type: t3 }];
  }
  return [c.Delim, "#", n.representationStart, n.representationEnd, { value: "#" }];
}
function consumeNumber(e2, n) {
  let t2 = a.Integer;
  for (n.source.codePointAt(n.cursor) !== i && n.source.codePointAt(n.cursor) !== o || n.advanceCodePoint(); isDigitCodePoint(n.source.codePointAt(n.cursor) ?? -1); ) n.advanceCodePoint();
  if (46 === n.source.codePointAt(n.cursor) && isDigitCodePoint(n.source.codePointAt(n.cursor + 1) ?? -1)) for (n.advanceCodePoint(2), t2 = a.Number; isDigitCodePoint(n.source.codePointAt(n.cursor) ?? -1); ) n.advanceCodePoint();
  if (101 === n.source.codePointAt(n.cursor) || 69 === n.source.codePointAt(n.cursor)) {
    if (isDigitCodePoint(n.source.codePointAt(n.cursor + 1) ?? -1)) n.advanceCodePoint(2);
    else {
      if (n.source.codePointAt(n.cursor + 1) !== o && n.source.codePointAt(n.cursor + 1) !== i || !isDigitCodePoint(n.source.codePointAt(n.cursor + 2) ?? -1)) return t2;
      n.advanceCodePoint(3);
    }
    for (t2 = a.Number; isDigitCodePoint(n.source.codePointAt(n.cursor) ?? -1); ) n.advanceCodePoint();
  }
  return t2;
}
function consumeNumericToken(e2, n) {
  let t2;
  {
    const e3 = n.source.codePointAt(n.cursor);
    e3 === o ? t2 = "-" : e3 === i && (t2 = "+");
  }
  const r2 = consumeNumber(0, n), s2 = parseFloat(n.source.slice(n.representationStart, n.representationEnd + 1));
  if (checkIfThreeCodePointsWouldStartAnIdentSequence(0, n)) {
    const o2 = consumeIdentSequence(e2, n);
    return [c.Dimension, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: s2, signCharacter: t2, type: r2, unit: String.fromCodePoint(...o2) }];
  }
  return 37 === n.source.codePointAt(n.cursor) ? (n.advanceCodePoint(), [c.Percentage, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: s2, signCharacter: t2 }]) : [c.Number, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: s2, signCharacter: t2, type: r2 }];
}
function consumeWhiteSpace(e2) {
  for (; isWhitespace(e2.source.codePointAt(e2.cursor) ?? -1); ) e2.advanceCodePoint();
  return [c.Whitespace, e2.source.slice(e2.representationStart, e2.representationEnd + 1), e2.representationStart, e2.representationEnd, void 0];
}
!(function(e2) {
  e2.Comment = "comment", e2.AtKeyword = "at-keyword-token", e2.BadString = "bad-string-token", e2.BadURL = "bad-url-token", e2.CDC = "CDC-token", e2.CDO = "CDO-token", e2.Colon = "colon-token", e2.Comma = "comma-token", e2.Delim = "delim-token", e2.Dimension = "dimension-token", e2.EOF = "EOF-token", e2.Function = "function-token", e2.Hash = "hash-token", e2.Ident = "ident-token", e2.Number = "number-token", e2.Percentage = "percentage-token", e2.Semicolon = "semicolon-token", e2.String = "string-token", e2.URL = "url-token", e2.Whitespace = "whitespace-token", e2.OpenParen = "(-token", e2.CloseParen = ")-token", e2.OpenSquare = "[-token", e2.CloseSquare = "]-token", e2.OpenCurly = "{-token", e2.CloseCurly = "}-token", e2.UnicodeRange = "unicode-range-token";
})(c || (c = {})), (function(e2) {
  e2.Integer = "integer", e2.Number = "number";
})(a || (a = {})), (function(e2) {
  e2.Unrestricted = "unrestricted", e2.ID = "id";
})(u || (u = {}));
class Reader {
  cursor = 0;
  source = "";
  representationStart = 0;
  representationEnd = -1;
  constructor(e2) {
    this.source = e2;
  }
  advanceCodePoint(e2 = 1) {
    this.cursor = this.cursor + e2, this.representationEnd = this.cursor - 1;
  }
  readCodePoint() {
    const e2 = this.source.codePointAt(this.cursor);
    if (void 0 !== e2) return this.cursor = this.cursor + 1, this.representationEnd = this.cursor - 1, e2;
  }
  unreadCodePoint(e2 = 1) {
    this.cursor = this.cursor - e2, this.representationEnd = this.cursor - 1;
  }
  resetRepresentation() {
    this.representationStart = this.cursor, this.representationEnd = -1;
  }
}
function consumeStringToken(n, o2) {
  let i2 = "";
  const a2 = o2.readCodePoint();
  for (; ; ) {
    const u2 = o2.readCodePoint();
    if (void 0 === u2) {
      const t2 = [c.String, o2.source.slice(o2.representationStart, o2.representationEnd + 1), o2.representationStart, o2.representationEnd, { value: i2 }];
      return n.onParseError(new ParseErrorWithToken(e.UnexpectedEOFInString, o2.representationStart, o2.representationEnd, ["4.3.5. Consume a string token", "Unexpected EOF"], t2)), t2;
    }
    if (isNewLine(u2)) {
      o2.unreadCodePoint();
      const i3 = [c.BadString, o2.source.slice(o2.representationStart, o2.representationEnd + 1), o2.representationStart, o2.representationEnd, void 0];
      return n.onParseError(new ParseErrorWithToken(e.UnexpectedNewLineInString, o2.representationStart, o2.source.codePointAt(o2.cursor) === t && o2.source.codePointAt(o2.cursor + 1) === r ? o2.representationEnd + 2 : o2.representationEnd + 1, ["4.3.5. Consume a string token", "Unexpected newline"], i3)), i3;
    }
    if (u2 === a2) return [c.String, o2.source.slice(o2.representationStart, o2.representationEnd + 1), o2.representationStart, o2.representationEnd, { value: i2 }];
    if (92 !== u2) 0 === u2 || isSurrogate(u2) ? i2 += String.fromCodePoint(s) : i2 += String.fromCodePoint(u2);
    else {
      if (void 0 === o2.source.codePointAt(o2.cursor)) continue;
      if (isNewLine(o2.source.codePointAt(o2.cursor) ?? -1)) {
        o2.source.codePointAt(o2.cursor) === t && o2.source.codePointAt(o2.cursor + 1) === r && o2.advanceCodePoint(), o2.advanceCodePoint();
        continue;
      }
      i2 += String.fromCodePoint(consumeEscapedCodePoint(n, o2));
    }
  }
}
function checkIfCodePointsMatchURLIdent(e2) {
  return !(3 !== e2.length || 117 !== e2[0] && 85 !== e2[0] || 114 !== e2[1] && 82 !== e2[1] || 108 !== e2[2] && 76 !== e2[2]);
}
function consumeBadURL(e2, n) {
  for (; ; ) {
    const t2 = n.source.codePointAt(n.cursor);
    if (void 0 === t2) return;
    if (41 === t2) return void n.advanceCodePoint();
    checkIfTwoCodePointsAreAValidEscape(n) ? (n.advanceCodePoint(), consumeEscapedCodePoint(e2, n)) : n.advanceCodePoint();
  }
}
function consumeUrlToken(n, t2) {
  for (; isWhitespace(t2.source.codePointAt(t2.cursor) ?? -1); ) t2.advanceCodePoint();
  let o2 = "";
  for (; ; ) {
    if (void 0 === t2.source.codePointAt(t2.cursor)) {
      const r3 = [c.URL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, { value: o2 }];
      return n.onParseError(new ParseErrorWithToken(e.UnexpectedEOFInURL, t2.representationStart, t2.representationEnd, ["4.3.6. Consume a url token", "Unexpected EOF"], r3)), r3;
    }
    if (41 === t2.source.codePointAt(t2.cursor)) return t2.advanceCodePoint(), [c.URL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, { value: o2 }];
    if (isWhitespace(t2.source.codePointAt(t2.cursor) ?? -1)) {
      for (t2.advanceCodePoint(); isWhitespace(t2.source.codePointAt(t2.cursor) ?? -1); ) t2.advanceCodePoint();
      if (void 0 === t2.source.codePointAt(t2.cursor)) {
        const r3 = [c.URL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, { value: o2 }];
        return n.onParseError(new ParseErrorWithToken(e.UnexpectedEOFInURL, t2.representationStart, t2.representationEnd, ["4.3.6. Consume a url token", "Consume as much whitespace as possible", "Unexpected EOF"], r3)), r3;
      }
      return 41 === t2.source.codePointAt(t2.cursor) ? (t2.advanceCodePoint(), [c.URL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, { value: o2 }]) : (consumeBadURL(n, t2), [c.BadURL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, void 0]);
    }
    const r2 = t2.source.codePointAt(t2.cursor);
    if (34 === r2 || 39 === r2 || 40 === r2 || isNonPrintableCodePoint(r2 ?? -1)) {
      consumeBadURL(n, t2);
      const o3 = [c.BadURL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, void 0];
      return n.onParseError(new ParseErrorWithToken(e.UnexpectedCharacterInURL, t2.representationStart, t2.representationEnd, ["4.3.6. Consume a url token", `Unexpected U+0022 QUOTATION MARK ("), U+0027 APOSTROPHE ('), U+0028 LEFT PARENTHESIS (() or non-printable code point`], o3)), o3;
    }
    if (92 === r2) {
      if (checkIfTwoCodePointsAreAValidEscape(t2)) {
        t2.advanceCodePoint(), o2 += String.fromCodePoint(consumeEscapedCodePoint(n, t2));
        continue;
      }
      consumeBadURL(n, t2);
      const r3 = [c.BadURL, t2.source.slice(t2.representationStart, t2.representationEnd + 1), t2.representationStart, t2.representationEnd, void 0];
      return n.onParseError(new ParseErrorWithToken(e.InvalidEscapeSequenceInURL, t2.representationStart, t2.representationEnd, ["4.3.6. Consume a url token", "U+005C REVERSE SOLIDUS (\\)", "The input stream does not start with a valid escape sequence"], r3)), r3;
    }
    0 === t2.source.codePointAt(t2.cursor) || isSurrogate(t2.source.codePointAt(t2.cursor) ?? -1) ? (o2 += String.fromCodePoint(s), t2.advanceCodePoint()) : (o2 += t2.source[t2.cursor], t2.advanceCodePoint());
  }
}
function consumeIdentLikeToken(e2, n) {
  const t2 = consumeIdentSequence(e2, n);
  if (40 !== n.source.codePointAt(n.cursor)) return [c.Ident, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: String.fromCodePoint(...t2) }];
  if (checkIfCodePointsMatchURLIdent(t2)) {
    n.advanceCodePoint();
    let o2 = 0;
    for (; ; ) {
      const e3 = isWhitespace(n.source.codePointAt(n.cursor) ?? -1), r2 = isWhitespace(n.source.codePointAt(n.cursor + 1) ?? -1);
      if (e3 && r2) {
        o2 += 1, n.advanceCodePoint(1);
        continue;
      }
      const i2 = e3 ? n.source.codePointAt(n.cursor + 1) : n.source.codePointAt(n.cursor);
      if (34 === i2 || 39 === i2) return o2 > 0 && n.unreadCodePoint(o2), [c.Function, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: String.fromCodePoint(...t2) }];
      break;
    }
    return consumeUrlToken(e2, n);
  }
  return n.advanceCodePoint(), [c.Function, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { value: String.fromCodePoint(...t2) }];
}
function checkIfThreeCodePointsWouldStartAUnicodeRange(e2) {
  return !(117 !== e2.source.codePointAt(e2.cursor) && 85 !== e2.source.codePointAt(e2.cursor) || e2.source.codePointAt(e2.cursor + 1) !== i || 63 !== e2.source.codePointAt(e2.cursor + 2) && !isHexDigitCodePoint(e2.source.codePointAt(e2.cursor + 2) ?? -1));
}
function consumeUnicodeRangeToken(e2, n) {
  n.advanceCodePoint(2);
  const t2 = [], r2 = [];
  let i2;
  for (; void 0 !== (i2 = n.source.codePointAt(n.cursor)) && t2.length < 6 && isHexDigitCodePoint(i2); ) t2.push(i2), n.advanceCodePoint();
  for (; void 0 !== (i2 = n.source.codePointAt(n.cursor)) && t2.length < 6 && 63 === i2; ) 0 === r2.length && r2.push(...t2), t2.push(48), r2.push(70), n.advanceCodePoint();
  if (!r2.length && n.source.codePointAt(n.cursor) === o && isHexDigitCodePoint(n.source.codePointAt(n.cursor + 1) ?? -1)) for (n.advanceCodePoint(); void 0 !== (i2 = n.source.codePointAt(n.cursor)) && r2.length < 6 && isHexDigitCodePoint(i2); ) r2.push(i2), n.advanceCodePoint();
  if (!r2.length) {
    const e3 = parseInt(String.fromCodePoint(...t2), 16);
    return [c.UnicodeRange, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { startOfRange: e3, endOfRange: e3 }];
  }
  const s2 = parseInt(String.fromCodePoint(...t2), 16), a2 = parseInt(String.fromCodePoint(...r2), 16);
  return [c.UnicodeRange, n.source.slice(n.representationStart, n.representationEnd + 1), n.representationStart, n.representationEnd, { startOfRange: s2, endOfRange: a2 }];
}
function tokenize(e2, n) {
  const t2 = tokenizer(e2), o2 = [];
  for (; !t2.endOfFile(); ) o2.push(t2.nextToken());
  return o2.push(t2.nextToken()), o2;
}
function tokenizer(n, s2) {
  const a2 = n.css.valueOf(), u2 = n.unicodeRangesAllowed ?? false, d2 = new Reader(a2), p = { onParseError: noop };
  return { nextToken: function nextToken() {
    d2.resetRepresentation();
    const n2 = d2.source.codePointAt(d2.cursor);
    if (void 0 === n2) return [c.EOF, "", -1, -1, void 0];
    if (47 === n2 && checkIfTwoCodePointsStartAComment(d2)) return consumeComment(p, d2);
    if (u2 && (117 === n2 || 85 === n2) && checkIfThreeCodePointsWouldStartAUnicodeRange(d2)) return consumeUnicodeRangeToken(0, d2);
    if (isIdentStartCodePoint(n2)) return consumeIdentLikeToken(p, d2);
    if (isDigitCodePoint(n2)) return consumeNumericToken(p, d2);
    switch (n2) {
      case 44:
        return d2.advanceCodePoint(), [c.Comma, ",", d2.representationStart, d2.representationEnd, void 0];
      case 58:
        return d2.advanceCodePoint(), [c.Colon, ":", d2.representationStart, d2.representationEnd, void 0];
      case 59:
        return d2.advanceCodePoint(), [c.Semicolon, ";", d2.representationStart, d2.representationEnd, void 0];
      case 40:
        return d2.advanceCodePoint(), [c.OpenParen, "(", d2.representationStart, d2.representationEnd, void 0];
      case 41:
        return d2.advanceCodePoint(), [c.CloseParen, ")", d2.representationStart, d2.representationEnd, void 0];
      case 91:
        return d2.advanceCodePoint(), [c.OpenSquare, "[", d2.representationStart, d2.representationEnd, void 0];
      case 93:
        return d2.advanceCodePoint(), [c.CloseSquare, "]", d2.representationStart, d2.representationEnd, void 0];
      case 123:
        return d2.advanceCodePoint(), [c.OpenCurly, "{", d2.representationStart, d2.representationEnd, void 0];
      case 125:
        return d2.advanceCodePoint(), [c.CloseCurly, "}", d2.representationStart, d2.representationEnd, void 0];
      case 39:
      case 34:
        return consumeStringToken(p, d2);
      case 35:
        return consumeHashToken(p, d2);
      case i:
      case 46:
        return checkIfThreeCodePointsWouldStartANumber(d2) ? consumeNumericToken(p, d2) : (d2.advanceCodePoint(), [c.Delim, d2.source[d2.representationStart], d2.representationStart, d2.representationEnd, { value: d2.source[d2.representationStart] }]);
      case r:
      case t:
      case 12:
      case 9:
      case 32:
        return consumeWhiteSpace(d2);
      case o:
        return checkIfThreeCodePointsWouldStartANumber(d2) ? consumeNumericToken(p, d2) : checkIfThreeCodePointsWouldStartCDC(d2) ? (d2.advanceCodePoint(3), [c.CDC, "-->", d2.representationStart, d2.representationEnd, void 0]) : checkIfThreeCodePointsWouldStartAnIdentSequence(0, d2) ? consumeIdentLikeToken(p, d2) : (d2.advanceCodePoint(), [c.Delim, "-", d2.representationStart, d2.representationEnd, { value: "-" }]);
      case 60:
        return checkIfFourCodePointsWouldStartCDO(d2) ? (d2.advanceCodePoint(4), [c.CDO, "<!--", d2.representationStart, d2.representationEnd, void 0]) : (d2.advanceCodePoint(), [c.Delim, "<", d2.representationStart, d2.representationEnd, { value: "<" }]);
      case 64:
        if (d2.advanceCodePoint(), checkIfThreeCodePointsWouldStartAnIdentSequence(0, d2)) {
          const e2 = consumeIdentSequence(p, d2);
          return [c.AtKeyword, d2.source.slice(d2.representationStart, d2.representationEnd + 1), d2.representationStart, d2.representationEnd, { value: String.fromCodePoint(...e2) }];
        }
        return [c.Delim, "@", d2.representationStart, d2.representationEnd, { value: "@" }];
      case 92: {
        if (checkIfTwoCodePointsAreAValidEscape(d2)) return consumeIdentLikeToken(p, d2);
        d2.advanceCodePoint();
        const n3 = [c.Delim, "\\", d2.representationStart, d2.representationEnd, { value: "\\" }];
        return p.onParseError(new ParseErrorWithToken(e.InvalidEscapeSequenceAfterBackslash, d2.representationStart, d2.representationEnd, ["4.3.1. Consume a token", "U+005C REVERSE SOLIDUS (\\)", "The input stream does not start with a valid escape sequence"], n3)), n3;
      }
    }
    return d2.advanceCodePoint(), [c.Delim, d2.source[d2.representationStart], d2.representationStart, d2.representationEnd, { value: d2.source[d2.representationStart] }];
  }, endOfFile: function endOfFile() {
    return void 0 === d2.source.codePointAt(d2.cursor);
  } };
}
function noop() {
}
function mutateUnit(e2, n) {
  const t2 = [];
  for (const e3 of n) t2.push(e3.codePointAt(0));
  const o2 = serializeIdent(t2);
  101 === o2[0] && insertEscapedCodePoint(o2, 0, o2[0]);
  const r2 = String.fromCodePoint(...o2), i2 = "+" === e2[4].signCharacter ? e2[4].signCharacter : "", s2 = e2[4].value.toString();
  e2[1] = `${i2}${s2}${r2}`, e2[4].unit = n;
}
function serializeIdent(e2) {
  let n = 0;
  if (0 === e2[0]) e2.splice(0, 1, s), n = 1;
  else if (e2[0] === o && e2[1] === o) n = 2;
  else if (e2[0] === o && e2[1]) n = 2, isIdentStartCodePoint(e2[1]) || (n += insertEscapedCodePoint(e2, 1, e2[1]));
  else {
    if (e2[0] === o && !e2[1]) return [92, e2[0]];
    isIdentStartCodePoint(e2[0]) ? n = 1 : (n = 1, n += insertEscapedCodePoint(e2, 0, e2[0]));
  }
  for (let t2 = n; t2 < e2.length; t2++) 0 !== e2[t2] ? isIdentCodePoint(e2[t2]) || (t2 += insertEscapedCharacter(e2, t2, e2[t2])) : (e2.splice(t2, 1, s), t2++);
  return e2;
}
function insertEscapedCharacter(e2, n, t2) {
  return e2.splice(n, 1, 92, t2), 1;
}
function insertEscapedCodePoint(e2, n, t2) {
  const o2 = t2.toString(16), r2 = [];
  for (const e3 of o2) r2.push(e3.codePointAt(0));
  return e2.splice(n, 1, 92, ...r2, 32), 1 + r2.length;
}
const d = Object.values(c);
function isToken(e2) {
  return !!Array.isArray(e2) && (!(e2.length < 4) && (!!d.includes(e2[0]) && ("string" == typeof e2[1] && ("number" == typeof e2[2] && "number" == typeof e2[3]))));
}
function isTokenNumeric(e2) {
  if (!e2) return false;
  switch (e2[0]) {
    case c.Dimension:
    case c.Number:
    case c.Percentage:
      return true;
    default:
      return false;
  }
}
function isTokenWhiteSpaceOrComment(e2) {
  if (!e2) return false;
  switch (e2[0]) {
    case c.Whitespace:
    case c.Comment:
      return true;
    default:
      return false;
  }
}
function isTokenColon(e2) {
  return !!e2 && e2[0] === c.Colon;
}
function isTokenComma(e2) {
  return !!e2 && e2[0] === c.Comma;
}
function isTokenComment(e2) {
  return !!e2 && e2[0] === c.Comment;
}
function isTokenDelim(e2) {
  return !!e2 && e2[0] === c.Delim;
}
function isTokenDimension(e2) {
  return !!e2 && e2[0] === c.Dimension;
}
function isTokenEOF(e2) {
  return !!e2 && e2[0] === c.EOF;
}
function isTokenFunction(e2) {
  return !!e2 && e2[0] === c.Function;
}
function isTokenHash(e2) {
  return !!e2 && e2[0] === c.Hash;
}
function isTokenIdent(e2) {
  return !!e2 && e2[0] === c.Ident;
}
function isTokenNumber(e2) {
  return !!e2 && e2[0] === c.Number;
}
function isTokenPercentage(e2) {
  return !!e2 && e2[0] === c.Percentage;
}
function isTokenSemicolon(e2) {
  return !!e2 && e2[0] === c.Semicolon;
}
function isTokenWhitespace(e2) {
  return !!e2 && e2[0] === c.Whitespace;
}
function isTokenOpenParen(e2) {
  return !!e2 && e2[0] === c.OpenParen;
}
function isTokenCloseParen(e2) {
  return !!e2 && e2[0] === c.CloseParen;
}
function isTokenOpenSquare(e2) {
  return !!e2 && e2[0] === c.OpenSquare;
}
function isTokenOpenCurly(e2) {
  return !!e2 && e2[0] === c.OpenCurly;
}
export {
  isTokenSemicolon as A,
  isTokenHash as B,
  ParseError as P,
  isTokenComma as a,
  isTokenOpenParen as b,
  c,
  isTokenOpenCurly as d,
  isTokenOpenSquare as e,
  isTokenFunction as f,
  isTokenWhitespace as g,
  isTokenComment as h,
  isTokenEOF as i,
  isTokenWhiteSpaceOrComment as j,
  isTokenCloseParen as k,
  isToken as l,
  mirrorVariantType as m,
  mirrorVariant as n,
  tokenizer as o,
  isTokenNumeric as p,
  isTokenIdent as q,
  a as r,
  stringify as s,
  tokenize as t,
  isTokenDimension as u,
  isTokenDelim as v,
  isTokenPercentage as w,
  isTokenNumber as x,
  mutateUnit as y,
  isTokenColon as z
};

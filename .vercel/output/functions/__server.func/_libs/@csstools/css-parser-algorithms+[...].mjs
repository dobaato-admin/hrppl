import { i as isTokenEOF, c, a as isTokenComma, P as ParseError, b as isTokenOpenParen, d as isTokenOpenCurly, e as isTokenOpenSquare, f as isTokenFunction, g as isTokenWhitespace, h as isTokenComment, m as mirrorVariantType, j as isTokenWhiteSpaceOrComment, k as isTokenCloseParen, l as isToken, s as stringify, n as mirrorVariant } from "../csstools__css-tokenizer.mjs";
var f;
function walkerIndexGenerator(e) {
  let n = e.slice();
  return (e2, t, o) => {
    let s = -1;
    for (let i = n.indexOf(t); i < n.length && (s = e2.indexOf(n[i]), -1 === s || s < o); i++) ;
    return -1 === s || s === o && t === e2[o] && (s++, s >= e2.length) ? -1 : (n = e2.slice(), s);
  };
}
function consumeComponentValue(e, n) {
  const t = n[0];
  if (isTokenOpenParen(t) || isTokenOpenCurly(t) || isTokenOpenSquare(t)) {
    const t2 = consumeSimpleBlock(e, n);
    return { advance: t2.advance, node: t2.node };
  }
  if (isTokenFunction(t)) {
    const t2 = consumeFunction(e, n);
    return { advance: t2.advance, node: t2.node };
  }
  if (isTokenWhitespace(t)) {
    const t2 = consumeWhitespace(e, n);
    return { advance: t2.advance, node: t2.node };
  }
  if (isTokenComment(t)) {
    const t2 = consumeComment(e, n);
    return { advance: t2.advance, node: t2.node };
  }
  return { advance: 1, node: new TokenNode(t) };
}
!(function(e) {
  e.Function = "function", e.SimpleBlock = "simple-block", e.Whitespace = "whitespace", e.Comment = "comment", e.Token = "token";
})(f || (f = {}));
class ContainerNodeBaseClass {
  value = [];
  indexOf(e) {
    return this.value.indexOf(e);
  }
  at(e) {
    if ("number" == typeof e) return e < 0 && (e = this.value.length + e), this.value[e];
  }
  forEach(e, n) {
    if (0 === this.value.length) return;
    const t = walkerIndexGenerator(this.value);
    let o = 0;
    for (; o < this.value.length; ) {
      const s = this.value[o];
      let i;
      if (n && (i = { ...n }), false === e({ node: s, parent: this, state: i }, o)) return false;
      if (o = t(this.value, s, o), -1 === o) break;
    }
  }
  walk(e, n) {
    0 !== this.value.length && this.forEach((n2, t) => false !== e(n2, t) && ((!("walk" in n2.node) || !this.value.includes(n2.node) || false !== n2.node.walk(e, n2.state)) && void 0), n);
  }
}
class FunctionNode extends ContainerNodeBaseClass {
  type = f.Function;
  name;
  endToken;
  constructor(e, n, t) {
    super(), this.name = e, this.endToken = n, this.value = t;
  }
  getName() {
    return this.name[4].value;
  }
  normalize() {
    isTokenEOF(this.endToken) && (this.endToken = [c.CloseParen, ")", -1, -1, void 0]);
  }
  tokens() {
    return isTokenEOF(this.endToken) ? [this.name, ...this.value.flatMap((e) => e.tokens())] : [this.name, ...this.value.flatMap((e) => e.tokens()), this.endToken];
  }
  toString() {
    const e = this.value.map((e2) => isToken(e2) ? stringify(e2) : e2.toString()).join("");
    return stringify(this.name) + e + stringify(this.endToken);
  }
  toJSON() {
    return { type: this.type, name: this.getName(), tokens: this.tokens(), value: this.value.map((e) => e.toJSON()) };
  }
  isFunctionNode() {
    return FunctionNode.isFunctionNode(this);
  }
  static isFunctionNode(e) {
    return !!e && (e instanceof FunctionNode && e.type === f.Function);
  }
}
function consumeFunction(n, t) {
  const o = [];
  let s = 1;
  for (; ; ) {
    const i = t[s];
    if (!i || isTokenEOF(i)) return n.onParseError(new ParseError("Unexpected EOF while consuming a function.", t[0][2], t[t.length - 1][3], ["5.4.9. Consume a function", "Unexpected EOF"])), { advance: t.length, node: new FunctionNode(t[0], i, o) };
    if (isTokenCloseParen(i)) return { advance: s + 1, node: new FunctionNode(t[0], i, o) };
    if (isTokenWhiteSpaceOrComment(i)) {
      const e = consumeAllCommentsAndWhitespace(n, t.slice(s));
      s += e.advance, o.push(...e.nodes);
      continue;
    }
    const r = consumeComponentValue(n, t.slice(s));
    s += r.advance, o.push(r.node);
  }
}
class SimpleBlockNode extends ContainerNodeBaseClass {
  type = f.SimpleBlock;
  startToken;
  endToken;
  constructor(e, n, t) {
    super(), this.startToken = e, this.endToken = n, this.value = t;
  }
  normalize() {
    if (isTokenEOF(this.endToken)) {
      const e = mirrorVariant(this.startToken);
      e && (this.endToken = e);
    }
  }
  tokens() {
    return isTokenEOF(this.endToken) ? [this.startToken, ...this.value.flatMap((e) => e.tokens())] : [this.startToken, ...this.value.flatMap((e) => e.tokens()), this.endToken];
  }
  toString() {
    const e = this.value.map((e2) => isToken(e2) ? stringify(e2) : e2.toString()).join("");
    return stringify(this.startToken) + e + stringify(this.endToken);
  }
  toJSON() {
    return { type: this.type, startToken: this.startToken, tokens: this.tokens(), value: this.value.map((e) => e.toJSON()) };
  }
  isSimpleBlockNode() {
    return SimpleBlockNode.isSimpleBlockNode(this);
  }
  static isSimpleBlockNode(e) {
    return !!e && (e instanceof SimpleBlockNode && e.type === f.SimpleBlock);
  }
}
function consumeSimpleBlock(n, t) {
  const o = mirrorVariantType(t[0][0]);
  if (!o) throw new Error("Failed to parse, a mirror variant must exist for all block open tokens.");
  const s = [];
  let i = 1;
  for (; ; ) {
    const r = t[i];
    if (!r || isTokenEOF(r)) return n.onParseError(new ParseError("Unexpected EOF while consuming a simple block.", t[0][2], t[t.length - 1][3], ["5.4.8. Consume a simple block", "Unexpected EOF"])), { advance: t.length, node: new SimpleBlockNode(t[0], r, s) };
    if (r[0] === o) return { advance: i + 1, node: new SimpleBlockNode(t[0], r, s) };
    if (isTokenWhiteSpaceOrComment(r)) {
      const e = consumeAllCommentsAndWhitespace(n, t.slice(i));
      i += e.advance, s.push(...e.nodes);
      continue;
    }
    const a = consumeComponentValue(n, t.slice(i));
    i += a.advance, s.push(a.node);
  }
}
class WhitespaceNode {
  type = f.Whitespace;
  value;
  constructor(e) {
    this.value = e;
  }
  tokens() {
    return this.value;
  }
  toString() {
    return stringify(...this.value);
  }
  toJSON() {
    return { type: this.type, tokens: this.tokens() };
  }
  isWhitespaceNode() {
    return WhitespaceNode.isWhitespaceNode(this);
  }
  static isWhitespaceNode(e) {
    return !!e && (e instanceof WhitespaceNode && e.type === f.Whitespace);
  }
}
function consumeWhitespace(e, n) {
  let t = 0;
  for (; ; ) {
    const e2 = n[t];
    if (!isTokenWhitespace(e2)) return { advance: t, node: new WhitespaceNode(n.slice(0, t)) };
    t++;
  }
}
class CommentNode {
  type = f.Comment;
  value;
  constructor(e) {
    this.value = e;
  }
  tokens() {
    return [this.value];
  }
  toString() {
    return stringify(this.value);
  }
  toJSON() {
    return { type: this.type, tokens: this.tokens() };
  }
  isCommentNode() {
    return CommentNode.isCommentNode(this);
  }
  static isCommentNode(e) {
    return !!e && (e instanceof CommentNode && e.type === f.Comment);
  }
}
function consumeComment(e, n) {
  return { advance: 1, node: new CommentNode(n[0]) };
}
function consumeAllCommentsAndWhitespace(e, n) {
  const t = [];
  let o = 0;
  for (; ; ) {
    if (isTokenWhitespace(n[o])) {
      const e2 = consumeWhitespace(0, n.slice(o));
      o += e2.advance, t.push(e2.node);
      continue;
    }
    if (!isTokenComment(n[o])) return { advance: o, nodes: t };
    t.push(new CommentNode(n[o])), o++;
  }
}
class TokenNode {
  type = f.Token;
  value;
  constructor(e) {
    this.value = e;
  }
  tokens() {
    return [this.value];
  }
  toString() {
    return this.value[1];
  }
  toJSON() {
    return { type: this.type, tokens: this.tokens() };
  }
  isTokenNode() {
    return TokenNode.isTokenNode(this);
  }
  static isTokenNode(e) {
    return !!e && (e instanceof TokenNode && e.type === f.Token);
  }
}
function parseComponentValue(t, o) {
  const s = { onParseError: (() => {
  }) }, i = [...t];
  isTokenEOF(i[i.length - 1]) || i.push([c.EOF, "", i[i.length - 1][2], i[i.length - 1][3], void 0]);
  const r = consumeComponentValue(s, i);
  if (isTokenEOF(i[Math.min(r.advance, i.length - 1)])) return r.node;
  s.onParseError(new ParseError("Expected EOF after parsing a component value.", t[0][2], t[t.length - 1][3], ["5.3.9. Parse a component value", "Expected EOF"]));
}
function parseCommaSeparatedListOfComponentValues(t, o) {
  const s = { onParseError: o?.onParseError ?? (() => {
  }) }, i = [...t];
  if (0 === t.length) return [];
  isTokenEOF(i[i.length - 1]) && i.push([c.EOF, "", i[i.length - 1][2], i[i.length - 1][3], void 0]);
  const r = [];
  let a = [], c$1 = 0;
  for (; ; ) {
    if (!i[c$1] || isTokenEOF(i[c$1])) return a.length && r.push(a), r;
    if (isTokenComma(i[c$1])) {
      r.push(a), a = [], c$1++;
      continue;
    }
    const n = consumeComponentValue(s, t.slice(c$1));
    a.push(n.node), c$1 += n.advance;
  }
}
function forEach(e, n, t) {
  if (0 === e.length) return;
  const o = walkerIndexGenerator(e);
  let s = 0;
  for (; s < e.length; ) {
    const i = e[s];
    let r;
    if (false === n({ node: i, parent: { value: e }, state: r }, s)) return false;
    if (s = o(e, i, s), -1 === s) break;
  }
}
function walk(e, n, t) {
  0 !== e.length && forEach(e, (t2, o) => false !== n(t2, o) && ((!("walk" in t2.node) || !e.includes(t2.node) || false !== t2.node.walk(n, t2.state)) && void 0));
}
function replaceComponentValues(e, n) {
  for (let t = 0; t < e.length; t++) {
    walk(e[t], (e2, t2) => {
      if ("number" != typeof t2) return;
      const o = n(e2.node);
      o && (Array.isArray(o) ? e2.parent.value.splice(t2, 1, ...o) : e2.parent.value.splice(t2, 1, o));
    });
  }
  return e;
}
function isSimpleBlockNode(e) {
  return SimpleBlockNode.isSimpleBlockNode(e);
}
function isFunctionNode(e) {
  return FunctionNode.isFunctionNode(e);
}
function isWhitespaceNode(e) {
  return WhitespaceNode.isWhitespaceNode(e);
}
function isCommentNode(e) {
  return CommentNode.isCommentNode(e);
}
function isWhiteSpaceOrCommentNode(e) {
  return isWhitespaceNode(e) || isCommentNode(e);
}
function isTokenNode(e) {
  return TokenNode.isTokenNode(e);
}
function sourceIndices(e) {
  if (Array.isArray(e)) {
    const n2 = e[0];
    if (!n2) return [0, 0];
    const t2 = e[e.length - 1] || n2;
    return [sourceIndices(n2)[0], sourceIndices(t2)[1]];
  }
  const n = e.tokens(), t = n[0], o = n[n.length - 1];
  return t && o ? [t[2], o[3]] : [0, 0];
}
export {
  FunctionNode as F,
  TokenNode as T,
  WhitespaceNode as W,
  parseCommaSeparatedListOfComponentValues as a,
  isTokenNode as b,
  isSimpleBlockNode as c,
  isFunctionNode as d,
  isWhitespaceNode as e,
  isCommentNode as f,
  isWhiteSpaceOrCommentNode as i,
  parseComponentValue as p,
  replaceComponentValues as r,
  sourceIndices as s,
  walk as w
};

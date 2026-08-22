import { B as isTokenHash, q as isTokenIdent, p as isTokenNumeric, a as isTokenComma, v as isTokenDelim, x as isTokenNumber, c, r as a, u as isTokenDimension, w as isTokenPercentage } from "./csstools__css-tokenizer.mjs";
import { c as contrast_ratio_wcag_2_1, X as XYZ_D50_to_sRGB, i as inGamut, a as clip, b as XYZ_D50_to_OKLCH, g as gam_sRGB, m as mapGamutRayTrace, d as XYZ_D65_to_XYZ_D50, e as XYZ_D50_to_XYZ_D50, O as OKLCH_to_XYZ_D50, L as LCH_to_XYZ_D50, f as OKLab_to_XYZ_D50, h as Lab_to_XYZ_D50, H as HWB_to_XYZ_D50, j as HSL_to_XYZ_D50, P as ProPhoto_RGB_to_XYZ_D50, k as a98_RGB_to_XYZ_D50, r as rec_2020_to_XYZ_D50, l as lin_P3_to_XYZ_D50, n as P3_to_XYZ_D50, o as lin_sRGB_to_XYZ_D50, s as sRGB_to_XYZ_D50, p as XYZ_D50_to_XYZ_D65, q as XYZ_D50_to_OKLab, t as XYZ_D50_to_LCH, u as XYZ_D50_to_Lab, v as XYZ_D50_to_HWB, w as XYZ_D50_to_HSL, x as XYZ_D50_to_a98_RGB, y as XYZ_D50_to_ProPhoto, z as XYZ_D50_to_rec_2020, A as XYZ_D50_to_lin_P3, B as XYZ_D50_to_P3, C as XYZ_D50_to_lin_sRGB, D as d, E as OKLCH_to_OKLab, F as OKLab_to_XYZ, G as XYZ_to_lin_sRGB, I as lin_sRGB_to_XYZ, J as XYZ_to_OKLab, K as OKLab_to_OKLCH } from "./csstools__color-helpers.mjs";
import { d as isFunctionNode, b as isTokenNode, e as isWhitespaceNode, f as isCommentNode, i as isWhiteSpaceOrCommentNode, T as TokenNode, r as replaceComponentValues } from "./@csstools/css-parser-algorithms+[...].mjs";
import { Q, a as calcFromComponentValues } from "./csstools__css-calc.mjs";
var he, me;
function convertNaNToZero(e) {
  return [Number.isNaN(e[0]) ? 0 : e[0], Number.isNaN(e[1]) ? 0 : e[1], Number.isNaN(e[2]) ? 0 : e[2]];
}
function colorData_to_XYZ_D50(e) {
  switch (e.colorNotation) {
    case he.HEX:
    case he.RGB:
    case he.sRGB:
      return { ...e, colorNotation: he.XYZ_D50, channels: sRGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.Linear_sRGB:
      return { ...e, colorNotation: he.XYZ_D50, channels: lin_sRGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.Display_P3:
      return { ...e, colorNotation: he.XYZ_D50, channels: P3_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.Linear_Display_P3:
      return { ...e, colorNotation: he.XYZ_D50, channels: lin_P3_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.Rec2020:
      return { ...e, colorNotation: he.XYZ_D50, channels: rec_2020_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.A98_RGB:
      return { ...e, colorNotation: he.XYZ_D50, channels: a98_RGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.ProPhoto_RGB:
      return { ...e, colorNotation: he.XYZ_D50, channels: ProPhoto_RGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.HSL:
      return { ...e, colorNotation: he.XYZ_D50, channels: HSL_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.HWB:
      return { ...e, colorNotation: he.XYZ_D50, channels: HWB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.Lab:
      return { ...e, colorNotation: he.XYZ_D50, channels: Lab_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.OKLab:
      return { ...e, colorNotation: he.XYZ_D50, channels: OKLab_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.LCH:
      return { ...e, colorNotation: he.XYZ_D50, channels: LCH_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.OKLCH:
      return { ...e, colorNotation: he.XYZ_D50, channels: OKLCH_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.XYZ_D50:
      return { ...e, colorNotation: he.XYZ_D50, channels: XYZ_D50_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case he.XYZ_D65:
      return { ...e, colorNotation: he.XYZ_D50, channels: XYZ_D65_to_XYZ_D50(convertNaNToZero(e.channels)) };
    default:
      throw new Error("Unsupported color notation");
  }
}
!(function(e) {
  e.A98_RGB = "a98-rgb", e.Display_P3 = "display-p3", e.Linear_Display_P3 = "display-p3-linear", e.HEX = "hex", e.HSL = "hsl", e.HWB = "hwb", e.LCH = "lch", e.Lab = "lab", e.Linear_sRGB = "srgb-linear", e.OKLCH = "oklch", e.OKLab = "oklab", e.ProPhoto_RGB = "prophoto-rgb", e.RGB = "rgb", e.sRGB = "srgb", e.Rec2020 = "rec2020", e.XYZ_D50 = "xyz-d50", e.XYZ_D65 = "xyz-d65";
})(he || (he = {})), (function(e) {
  e.ColorKeyword = "color-keyword", e.HasAlpha = "has-alpha", e.HasDimensionValues = "has-dimension-values", e.HasNoneKeywords = "has-none-keywords", e.HasNumberValues = "has-number-values", e.HasPercentageAlpha = "has-percentage-alpha", e.HasPercentageValues = "has-percentage-values", e.HasVariableAlpha = "has-variable-alpha", e.Hex = "hex", e.LegacyHSL = "legacy-hsl", e.LegacyRGB = "legacy-rgb", e.NamedColor = "named-color", e.RelativeColorSyntax = "relative-color-syntax", e.ColorMix = "color-mix", e.ColorMixVariadic = "color-mix-variadic", e.ContrastColor = "contrast-color", e.RelativeAlphaSyntax = "relative-alpha-syntax", e.Experimental = "experimental";
})(me || (me = {}));
const pe = /* @__PURE__ */ new Set([he.A98_RGB, he.Display_P3, he.Linear_Display_P3, he.HEX, he.Linear_sRGB, he.ProPhoto_RGB, he.RGB, he.sRGB, he.Rec2020, he.XYZ_D50, he.XYZ_D65]);
function colorDataTo(e, a2) {
  const n = { ...e };
  if (e.colorNotation !== a2) {
    const e2 = colorData_to_XYZ_D50(n);
    switch (a2) {
      case he.HEX:
      case he.RGB:
        n.colorNotation = he.RGB, n.channels = XYZ_D50_to_sRGB(e2.channels);
        break;
      case he.sRGB:
        n.colorNotation = he.sRGB, n.channels = XYZ_D50_to_sRGB(e2.channels);
        break;
      case he.Linear_sRGB:
        n.colorNotation = he.Linear_sRGB, n.channels = XYZ_D50_to_lin_sRGB(e2.channels);
        break;
      case he.Display_P3:
        n.colorNotation = he.Display_P3, n.channels = XYZ_D50_to_P3(e2.channels);
        break;
      case he.Linear_Display_P3:
        n.colorNotation = he.Linear_Display_P3, n.channels = XYZ_D50_to_lin_P3(e2.channels);
        break;
      case he.Rec2020:
        n.colorNotation = he.Rec2020, n.channels = XYZ_D50_to_rec_2020(e2.channels);
        break;
      case he.ProPhoto_RGB:
        n.colorNotation = he.ProPhoto_RGB, n.channels = XYZ_D50_to_ProPhoto(e2.channels);
        break;
      case he.A98_RGB:
        n.colorNotation = he.A98_RGB, n.channels = XYZ_D50_to_a98_RGB(e2.channels);
        break;
      case he.HSL:
        n.colorNotation = he.HSL, n.channels = XYZ_D50_to_HSL(e2.channels);
        break;
      case he.HWB:
        n.colorNotation = he.HWB, n.channels = XYZ_D50_to_HWB(e2.channels);
        break;
      case he.Lab:
        n.colorNotation = he.Lab, n.channels = XYZ_D50_to_Lab(e2.channels);
        break;
      case he.LCH:
        n.colorNotation = he.LCH, n.channels = XYZ_D50_to_LCH(e2.channels);
        break;
      case he.OKLCH:
        n.colorNotation = he.OKLCH, n.channels = XYZ_D50_to_OKLCH(e2.channels);
        break;
      case he.OKLab:
        n.colorNotation = he.OKLab, n.channels = XYZ_D50_to_OKLab(e2.channels);
        break;
      case he.XYZ_D50:
        n.colorNotation = he.XYZ_D50, n.channels = XYZ_D50_to_XYZ_D50(e2.channels);
        break;
      case he.XYZ_D65:
        n.colorNotation = he.XYZ_D65, n.channels = XYZ_D50_to_XYZ_D65(e2.channels);
        break;
      default:
        throw new Error("Unsupported color notation");
    }
  } else n.channels = convertNaNToZero(e.channels);
  if (a2 === e.colorNotation) n.channels = carryForwardMissingComponents(e.channels, [0, 1, 2], [], n.channels, [0, 1, 2], []);
  else if (pe.has(a2) && pe.has(e.colorNotation)) n.channels = carryForwardMissingComponents(e.channels, [0, 1, 2], [], n.channels, [0, 1, 2], []);
  else switch (a2) {
    case he.HSL:
      switch (e.colorNotation) {
        case he.HWB:
          n.channels = carryForwardMissingComponents(e.channels, [0], [1, 2], n.channels, [0], [1, 2]);
          break;
        case he.Lab:
        case he.OKLab:
          n.channels = carryForwardMissingComponents(e.channels, [0], [1, 2], n.channels, [2], [0, 1]);
          break;
        case he.LCH:
        case he.OKLCH:
          n.channels = carryForwardMissingComponents(e.channels, [0, 1, 2], [], n.channels, [2, 1, 0], []);
          break;
        default:
          n.channels = carryForwardMissingComponents(e.channels, [], [], n.channels, [], []);
      }
      break;
    case he.HWB:
      switch (e.colorNotation) {
        case he.HSL:
          n.channels = carryForwardMissingComponents(e.channels, [0], [1, 2], n.channels, [0], [1, 2]);
          break;
        case he.LCH:
        case he.OKLCH:
          n.channels = carryForwardMissingComponents(e.channels, [2], [0, 1], n.channels, [0], [1, 2]);
          break;
        default:
          n.channels = carryForwardMissingComponents(e.channels, [], [], n.channels, [], []);
      }
      break;
    case he.Lab:
    case he.OKLab:
      switch (e.colorNotation) {
        case he.HSL:
          n.channels = carryForwardMissingComponents(e.channels, [2], [0, 1], n.channels, [0], [1, 2]);
          break;
        case he.Lab:
        case he.OKLab:
          n.channels = carryForwardMissingComponents(e.channels, [0, 1, 2], [], n.channels, [0, 1, 2], []);
          break;
        case he.LCH:
        case he.OKLCH:
          n.channels = carryForwardMissingComponents(e.channels, [0], [1, 2], n.channels, [0], [1, 2]);
          break;
        default:
          n.channels = carryForwardMissingComponents(e.channels, [], [], n.channels, [], []);
      }
      break;
    case he.LCH:
    case he.OKLCH:
      switch (e.colorNotation) {
        case he.HSL:
          n.channels = carryForwardMissingComponents(e.channels, [0, 1, 2], [], n.channels, [2, 1, 0], []);
          break;
        case he.HWB:
          n.channels = carryForwardMissingComponents(e.channels, [0], [1, 2], n.channels, [2], [0, 1]);
          break;
        case he.Lab:
        case he.OKLab:
          n.channels = carryForwardMissingComponents(e.channels, [0], [1, 2], n.channels, [0], [1, 2]);
          break;
        case he.LCH:
        case he.OKLCH:
          n.channels = carryForwardMissingComponents(e.channels, [0, 1, 2], [], n.channels, [0, 1, 2], []);
          break;
        default:
          n.channels = carryForwardMissingComponents(e.channels, [], [], n.channels, [], []);
      }
      break;
    default:
      n.channels = carryForwardMissingComponents(e.channels, [], [], n.channels, [], []);
  }
  return n.channels = convertPowerlessComponentsToMissingComponents(n.channels, a2), n;
}
function convertPowerlessComponentsToMissingComponents(e, a2) {
  const n = [...e];
  switch (a2) {
    case he.HSL:
      !Number.isNaN(n[1]) && n[1] <= 1e-3 && (n[0] = Number.NaN);
      break;
    case he.HWB:
      !Number.isNaN(n[1]) && !Number.isNaN(n[2]) && Math.max(0, n[1]) + Math.max(0, n[2]) >= 99.999 && (n[0] = Number.NaN);
      break;
    case he.LCH:
      !Number.isNaN(n[1]) && n[1] <= 15e-4 && (n[2] = Number.NaN);
      break;
    case he.OKLCH:
      !Number.isNaN(n[1]) && n[1] <= 4e-6 && (n[2] = Number.NaN);
  }
  return n;
}
function carryForwardMissingComponents(e, a2, n, r, o, l) {
  if (a2.length < 3 && e.every(Number.isNaN)) return [Number.NaN, Number.NaN, Number.NaN];
  const t = [...r];
  for (let n2 = 0; n2 < a2.length; n2++) Number.isNaN(e[a2[n2]]) && (t[o[n2]] = Number.NaN);
  if (n.length && n.every((a3) => Number.isNaN(e[a3]))) for (let e2 = 0; e2 < l.length; e2++) t[l[e2]] = Number.NaN;
  return t;
}
function normalizeRelativeColorDataChannels(e) {
  const a2 = /* @__PURE__ */ new Map();
  switch (e.colorNotation) {
    case he.RGB:
    case he.HEX:
      a2.set("r", dummyNumberToken(255 * e.channels[0])), a2.set("g", dummyNumberToken(255 * e.channels[1])), a2.set("b", dummyNumberToken(255 * e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case he.HSL:
      a2.set("h", dummyNumberToken(e.channels[0])), a2.set("s", dummyNumberToken(e.channels[1])), a2.set("l", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case he.HWB:
      a2.set("h", dummyNumberToken(e.channels[0])), a2.set("w", dummyNumberToken(e.channels[1])), a2.set("b", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case he.Lab:
    case he.OKLab:
      a2.set("l", dummyNumberToken(e.channels[0])), a2.set("a", dummyNumberToken(e.channels[1])), a2.set("b", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case he.LCH:
    case he.OKLCH:
      a2.set("l", dummyNumberToken(e.channels[0])), a2.set("c", dummyNumberToken(e.channels[1])), a2.set("h", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case he.sRGB:
    case he.A98_RGB:
    case he.Display_P3:
    case he.Linear_Display_P3:
    case he.Rec2020:
    case he.Linear_sRGB:
    case he.ProPhoto_RGB:
      a2.set("r", dummyNumberToken(e.channels[0])), a2.set("g", dummyNumberToken(e.channels[1])), a2.set("b", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case he.XYZ_D50:
    case he.XYZ_D65:
      a2.set("x", dummyNumberToken(e.channels[0])), a2.set("y", dummyNumberToken(e.channels[1])), a2.set("z", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
  }
  return a2;
}
function noneToZeroInRelativeColorDataChannels(e) {
  const a2 = new Map(e);
  for (const [n, r] of e) Number.isNaN(r[4].value) && a2.set(n, dummyNumberToken(0));
  return a2;
}
function dummyNumberToken(n) {
  return Number.isNaN(n) ? [c.Number, "none", -1, -1, { value: Number.NaN, type: a.Number }] : [c.Number, n.toString(), -1, -1, { value: n, type: a.Number }];
}
function normalize(e, a2, n, r) {
  return Math.min(Math.max(e / a2, n), r);
}
const Ne = /[A-Z]/g;
function toLowerCaseAZ(e) {
  return e.replace(Ne, (e2) => String.fromCharCode(e2.charCodeAt(0) + 32));
}
function normalize_Color_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(l)) {
    3 !== t && s.syntaxFlags.add(me.HasPercentageValues);
    let n = normalize(l[4].value, 100, -2147483647, 2147483647);
    return 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = normalize(l[4].value, 1, -2147483647, 2147483647);
    return 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
const be = /* @__PURE__ */ new Set(["srgb", "srgb-linear", "display-p3", "display-p3-linear", "a98-rgb", "prophoto-rgb", "rec2020", "xyz", "xyz-d50", "xyz-d65"]);
function color$1(e, a2) {
  const r = [], s = [], u = [], i = [];
  let c2, h, m = false, p = false;
  const N = { colorNotation: he.sRGB, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([]) };
  let b = r;
  for (let o = 0; o < e.value.length; o++) {
    let g2 = e.value[o];
    if (isWhitespaceNode(g2) || isCommentNode(g2)) for (; isWhitespaceNode(e.value[o + 1]) || isCommentNode(e.value[o + 1]); ) o++;
    else if (b === r && r.length && (b = s), b === s && s.length && (b = u), isTokenNode(g2) && isTokenDelim(g2.value) && "/" === g2.value[4].value) {
      if (b === i) return false;
      b = i;
    } else {
      if (isFunctionNode(g2)) {
        if (b === i && "var" === toLowerCaseAZ(g2.getName())) {
          N.syntaxFlags.add(me.HasVariableAlpha), b.push(g2);
          continue;
        }
        if (!Q.has(toLowerCaseAZ(g2.getName()))) return false;
        const [[e2]] = calcFromComponentValues([[g2]], { censorIntoStandardRepresentableValues: true, globals: h, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), g2 = e2;
      }
      if (b === r && 0 === r.length && isTokenNode(g2) && isTokenIdent(g2.value) && be.has(toLowerCaseAZ(g2.value[4].value))) {
        if (m) return false;
        m = toLowerCaseAZ(g2.value[4].value), N.colorNotation = colorSpaceNameToColorNotation(m), p && (p.colorNotation !== N.colorNotation && (p = colorDataTo(p, N.colorNotation)), c2 = normalizeRelativeColorDataChannels(p), h = noneToZeroInRelativeColorDataChannels(c2));
      } else if (b === r && 0 === r.length && isTokenNode(g2) && isTokenIdent(g2.value) && "from" === toLowerCaseAZ(g2.value[4].value)) {
        if (p) return false;
        if (m) return false;
        for (; isWhitespaceNode(e.value[o + 1]) || isCommentNode(e.value[o + 1]); ) o++;
        if (o++, g2 = e.value[o], p = a2(g2), false === p) return false;
        p.syntaxFlags.has(me.Experimental) && N.syntaxFlags.add(me.Experimental), N.syntaxFlags.add(me.RelativeColorSyntax);
      } else {
        if (!isTokenNode(g2)) return false;
        if (isTokenIdent(g2.value) && c2 && c2.has(toLowerCaseAZ(g2.value[4].value))) {
          b.push(new TokenNode(c2.get(toLowerCaseAZ(g2.value[4].value))));
          continue;
        }
        b.push(g2);
      }
    }
  }
  if (!m) return false;
  if (1 !== b.length) return false;
  if (1 !== r.length || 1 !== s.length || 1 !== u.length) return false;
  if (!isTokenNode(r[0]) || !isTokenNode(s[0]) || !isTokenNode(u[0])) return false;
  if (c2 && !c2.has("alpha")) return false;
  const g = normalize_Color_ChannelValues(r[0].value, 0, N);
  if (!g || !isTokenNumber(g)) return false;
  const v = normalize_Color_ChannelValues(s[0].value, 1, N);
  if (!v || !isTokenNumber(v)) return false;
  const f = normalize_Color_ChannelValues(u[0].value, 2, N);
  if (!f || !isTokenNumber(f)) return false;
  const y = [g, v, f];
  if (1 === i.length) if (N.syntaxFlags.add(me.HasAlpha), isTokenNode(i[0])) {
    const e2 = normalize_Color_ChannelValues(i[0].value, 3, N);
    if (!e2 || !isTokenNumber(e2)) return false;
    y.push(e2);
  } else N.alpha = i[0];
  else if (c2 && c2.has("alpha")) {
    const e2 = normalize_Color_ChannelValues(c2.get("alpha"), 3, N);
    if (!e2 || !isTokenNumber(e2)) return false;
    y.push(e2);
  }
  return N.channels = [y[0][4].value, y[1][4].value, y[2][4].value], 4 === y.length && (N.alpha = y[3][4].value), N;
}
function colorSpaceNameToColorNotation(e) {
  switch (e) {
    case "srgb":
      return he.sRGB;
    case "srgb-linear":
      return he.Linear_sRGB;
    case "display-p3":
      return he.Display_P3;
    case "display-p3-linear":
      return he.Linear_Display_P3;
    case "a98-rgb":
      return he.A98_RGB;
    case "prophoto-rgb":
      return he.ProPhoto_RGB;
    case "rec2020":
      return he.Rec2020;
    case "xyz":
    case "xyz-d65":
      return he.XYZ_D65;
    case "xyz-d50":
      return he.XYZ_D50;
    default:
      throw new Error("Unknown color space name: " + e);
  }
}
const ge = /* @__PURE__ */ new Set(["srgb", "srgb-linear", "display-p3", "display-p3-linear", "a98-rgb", "prophoto-rgb", "rec2020", "lab", "oklab", "xyz", "xyz-d50", "xyz-d65"]), ve = /* @__PURE__ */ new Set(["hsl", "hwb", "lch", "oklch"]), fe = /* @__PURE__ */ new Set(["shorter", "longer", "increasing", "decreasing"]);
function colorMix(e, a2) {
  let r = null, o = null, l = null, t = false;
  for (let u = 0; u < e.value.length; u++) {
    const i = e.value[u];
    if (!isWhiteSpaceOrCommentNode(i)) {
      if (!(r || isTokenNode(i) && isTokenIdent(i.value) && "in" === toLowerCaseAZ(i.value[4].value))) return colorMixRectangular("oklab", colorMixComponents(e.value, a2));
      if (isTokenNode(i) && isTokenIdent(i.value)) {
        if (!r && "in" === toLowerCaseAZ(i.value[4].value)) {
          r = i;
          continue;
        }
        if (r && !o) {
          o = toLowerCaseAZ(i.value[4].value);
          continue;
        }
        if (r && o && !l && ve.has(o)) {
          l = toLowerCaseAZ(i.value[4].value);
          continue;
        }
        if (r && o && l && !t && "hue" === toLowerCaseAZ(i.value[4].value)) {
          t = true;
          continue;
        }
        return false;
      }
      return !(!isTokenNode(i) || !isTokenComma(i.value)) && (!!o && (l || t ? !!(l && t && ve.has(o) && fe.has(l)) && colorMixPolar(o, l, colorMixComponents(e.value.slice(u + 1), a2)) : ge.has(o) ? colorMixRectangular(o, colorMixComponents(e.value.slice(u + 1), a2)) : !!ve.has(o) && colorMixPolar(o, "shorter", colorMixComponents(e.value.slice(u + 1), a2))));
    }
  }
  return false;
}
function colorMixComponents(e, a2) {
  const n = [];
  let o = 1, l = false, u = false;
  for (let o2 = 0; o2 < e.length; o2++) {
    let i2 = e[o2];
    if (!isWhiteSpaceOrCommentNode(i2)) {
      if (!isTokenNode(i2) || !isTokenComma(i2.value)) {
        if (!l) {
          const e2 = a2(i2);
          if (e2) {
            l = e2;
            continue;
          }
        }
        if (!u) {
          if (isFunctionNode(i2) && Q.has(toLowerCaseAZ(i2.getName()))) {
            if ([[i2]] = calcFromComponentValues([[i2]], { censorIntoStandardRepresentableValues: true, precision: -1, toCanonicalUnits: true, rawPercentages: true }), !i2 || !isTokenNode(i2) || !isTokenNumeric(i2.value)) return false;
            Number.isNaN(i2.value[4].value) && (i2.value[4].value = 0);
          }
          if (isTokenNode(i2) && isTokenPercentage(i2.value) && i2.value[4].value >= 0) {
            u = i2.value[4].value;
            continue;
          }
        }
        return false;
      }
      if (!l) return false;
      n.push({ color: l, percentage: u }), l = false, u = false;
    }
  }
  if (!l) return false;
  n.push({ color: l, percentage: u });
  let i = 0, c2 = 0;
  for (let e2 = 0; e2 < n.length; e2++) {
    const a3 = n[e2].percentage;
    if (false !== a3) {
      if (a3 < 0 || a3 > 100) return false;
      i += a3;
    } else c2++;
  }
  const h = Math.max(0, 100 - i);
  i = 0;
  for (let e2 = 0; e2 < n.length; e2++) false === n[e2].percentage && (n[e2].percentage = h / c2), i += n[e2].percentage;
  if (0 === i) return { colors: [{ color: { channels: [0, 0, 0], colorNotation: he.sRGB, alpha: 0, syntaxFlags: /* @__PURE__ */ new Set() }, percentage: 0 }], alphaMultiplier: 0 };
  if (i > 100) for (let e2 = 0; e2 < n.length; e2++) {
    let a3 = n[e2].percentage;
    a3 = a3 / i * 100, n[e2].percentage = a3;
  }
  if (i < 100) {
    o = i / 100;
    for (let e2 = 0; e2 < n.length; e2++) {
      let a3 = n[e2].percentage;
      a3 = a3 / i * 100, n[e2].percentage = a3;
    }
  }
  return { colors: n, alphaMultiplier: o };
}
function colorMixRectangular(e, a2) {
  if (!a2 || !a2.colors.length) return false;
  const n = a2.colors.slice();
  let r;
  switch (n.reverse(), e) {
    case "srgb":
      r = he.RGB;
      break;
    case "srgb-linear":
      r = he.Linear_sRGB;
      break;
    case "display-p3":
      r = he.Display_P3;
      break;
    case "display-p3-linear":
      r = he.Linear_Display_P3;
      break;
    case "a98-rgb":
      r = he.A98_RGB;
      break;
    case "prophoto-rgb":
      r = he.ProPhoto_RGB;
      break;
    case "rec2020":
      r = he.Rec2020;
      break;
    case "lab":
      r = he.Lab;
      break;
    case "oklab":
      r = he.OKLab;
      break;
    case "xyz-d50":
      r = he.XYZ_D50;
      break;
    case "xyz":
    case "xyz-d65":
      r = he.XYZ_D65;
      break;
    default:
      return false;
  }
  if (1 === n.length) {
    const e2 = colorDataTo(n[0].color, r);
    return e2.colorNotation = r, e2.syntaxFlags.add(me.ColorMixVariadic), "number" != typeof e2.alpha ? false : (e2.alpha = e2.alpha * a2.alphaMultiplier, e2);
  }
  for (; n.length >= 2; ) {
    const e2 = n.pop(), a3 = n.pop();
    if (!e2 || !a3) return false;
    const o2 = colorMixRectangularPair(r, e2.color, e2.percentage, a3.color, a3.percentage);
    if (!o2) return false;
    n.push({ color: o2, percentage: e2.percentage + a3.percentage });
  }
  const o = n[0]?.color;
  return !!o && (a2.colors.some((e2) => e2.color.syntaxFlags.has(me.Experimental)) && o.syntaxFlags.add(me.Experimental), "number" == typeof o.alpha && (o.alpha = o.alpha * a2.alphaMultiplier, 2 !== a2.colors.length && o.syntaxFlags.add(me.ColorMixVariadic), o));
}
function colorMixRectangularPair(e, a2, n, r, o) {
  const l = n / (n + o);
  let t = a2.alpha;
  if ("number" != typeof t) return false;
  let s = r.alpha;
  if ("number" != typeof s) return false;
  t = Number.isNaN(t) ? s : t, s = Number.isNaN(s) ? t : s;
  const u = colorDataTo(a2, e).channels, i = colorDataTo(r, e).channels;
  u[0] = fillInMissingComponent(u[0], i[0]), i[0] = fillInMissingComponent(i[0], u[0]), u[1] = fillInMissingComponent(u[1], i[1]), i[1] = fillInMissingComponent(i[1], u[1]), u[2] = fillInMissingComponent(u[2], i[2]), i[2] = fillInMissingComponent(i[2], u[2]), u[0] = premultiply(u[0], t), u[1] = premultiply(u[1], t), u[2] = premultiply(u[2], t), i[0] = premultiply(i[0], s), i[1] = premultiply(i[1], s), i[2] = premultiply(i[2], s);
  const c2 = interpolate(t, s, l);
  return { colorNotation: e, channels: [un_premultiply(interpolate(u[0], i[0], l), c2), un_premultiply(interpolate(u[1], i[1], l), c2), un_premultiply(interpolate(u[2], i[2], l), c2)], alpha: c2, syntaxFlags: /* @__PURE__ */ new Set([me.ColorMix]) };
}
function colorMixPolar(e, a2, n) {
  if (!n || !n.colors.length) return false;
  const r = n.colors.slice();
  let o;
  switch (r.reverse(), e) {
    case "hsl":
      o = he.HSL;
      break;
    case "hwb":
      o = he.HWB;
      break;
    case "lch":
      o = he.LCH;
      break;
    case "oklch":
      o = he.OKLCH;
      break;
    default:
      return false;
  }
  if (1 === r.length) {
    const e2 = colorDataTo(r[0].color, o);
    return e2.colorNotation = o, e2.syntaxFlags.add(me.ColorMixVariadic), "number" != typeof e2.alpha ? false : (e2.alpha = e2.alpha * n.alphaMultiplier, e2);
  }
  for (; r.length >= 2; ) {
    const e2 = r.pop(), n2 = r.pop();
    if (!e2 || !n2) return false;
    const l2 = colorMixPolarPair(o, a2, e2.color, e2.percentage, n2.color, n2.percentage);
    if (!l2) return false;
    r.push({ color: l2, percentage: e2.percentage + n2.percentage });
  }
  const l = r[0]?.color;
  return !!l && (n.colors.some((e2) => e2.color.syntaxFlags.has(me.Experimental)) && l.syntaxFlags.add(me.Experimental), "number" == typeof l.alpha && (l.alpha = l.alpha * n.alphaMultiplier, 2 !== n.colors.length && l.syntaxFlags.add(me.ColorMixVariadic), l));
}
function colorMixPolarPair(e, a2, n, r, o, l) {
  const t = r / (r + l);
  let s = 0, u = 0, i = 0, c2 = 0, h = 0, m = 0, p = n.alpha;
  if ("number" != typeof p) return false;
  let N = o.alpha;
  if ("number" != typeof N) return false;
  p = Number.isNaN(p) ? N : p, N = Number.isNaN(N) ? p : N;
  const b = colorDataTo(n, e).channels, g = colorDataTo(o, e).channels;
  switch (e) {
    case he.HSL:
    case he.HWB:
      s = b[0], u = g[0], i = b[1], c2 = g[1], h = b[2], m = g[2];
      break;
    case he.LCH:
    case he.OKLCH:
      i = b[0], c2 = g[0], h = b[1], m = g[1], s = b[2], u = g[2];
  }
  s = fillInMissingComponent(s, u), Number.isNaN(s) && (s = 0), u = fillInMissingComponent(u, s), Number.isNaN(u) && (u = 0), i = fillInMissingComponent(i, c2), c2 = fillInMissingComponent(c2, i), h = fillInMissingComponent(h, m), m = fillInMissingComponent(m, h);
  const v = u - s;
  switch (a2) {
    case "shorter":
      v > 180 ? s += 360 : v < -180 && (u += 360);
      break;
    case "longer":
      -180 < v && v < 180 && (v > 0 ? s += 360 : u += 360);
      break;
    case "increasing":
      v < 0 && (u += 360);
      break;
    case "decreasing":
      v > 0 && (s += 360);
      break;
    default:
      throw new Error("Unknown hue interpolation method");
  }
  i = premultiply(i, p), h = premultiply(h, p), c2 = premultiply(c2, N), m = premultiply(m, N);
  let f = [0, 0, 0];
  const y = interpolate(p, N, t);
  switch (e) {
    case he.HSL:
    case he.HWB:
      f = [interpolate(s, u, t), un_premultiply(interpolate(i, c2, t), y), un_premultiply(interpolate(h, m, t), y)];
      break;
    case he.LCH:
    case he.OKLCH:
      f = [un_premultiply(interpolate(i, c2, t), y), un_premultiply(interpolate(h, m, t), y), interpolate(s, u, t)];
  }
  return { colorNotation: e, channels: f, alpha: y, syntaxFlags: /* @__PURE__ */ new Set([me.ColorMix]) };
}
function fillInMissingComponent(e, a2) {
  return Number.isNaN(e) ? a2 : e;
}
function interpolate(e, a2, n) {
  return e * n + a2 * (1 - n);
}
function premultiply(e, a2) {
  return Number.isNaN(a2) ? e : Number.isNaN(e) ? Number.NaN : e * a2;
}
function un_premultiply(e, a2) {
  return 0 === a2 || Number.isNaN(a2) ? e : Number.isNaN(e) ? Number.NaN : e / a2;
}
function hex(e) {
  const a2 = toLowerCaseAZ(e[4].value);
  if (a2.match(/[^a-f0-9]/)) return false;
  const n = { colorNotation: he.HEX, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([me.Hex]) }, r = a2.length;
  if (3 === r) {
    const e2 = a2[0], r2 = a2[1], o = a2[2];
    return n.channels = [parseInt(e2 + e2, 16) / 255, parseInt(r2 + r2, 16) / 255, parseInt(o + o, 16) / 255], n;
  }
  if (6 === r) {
    const e2 = a2[0] + a2[1], r2 = a2[2] + a2[3], o = a2[4] + a2[5];
    return n.channels = [parseInt(e2, 16) / 255, parseInt(r2, 16) / 255, parseInt(o, 16) / 255], n;
  }
  if (4 === r) {
    const e2 = a2[0], r2 = a2[1], o = a2[2], l = a2[3];
    return n.channels = [parseInt(e2 + e2, 16) / 255, parseInt(r2 + r2, 16) / 255, parseInt(o + o, 16) / 255], n.alpha = parseInt(l + l, 16) / 255, n.syntaxFlags.add(me.HasAlpha), n;
  }
  if (8 === r) {
    const e2 = a2[0] + a2[1], r2 = a2[2] + a2[3], o = a2[4] + a2[5], l = a2[6] + a2[7];
    return n.channels = [parseInt(e2, 16) / 255, parseInt(r2, 16) / 255, parseInt(o, 16) / 255], n.alpha = parseInt(l, 16) / 255, n.syntaxFlags.add(me.HasAlpha), n;
  }
  return false;
}
function normalizeHue(n) {
  if (isTokenNumber(n)) return n[4].value = n[4].value % 360, n[1] = n[4].value.toString(), n;
  if (isTokenDimension(n)) {
    let r = n[4].value;
    switch (toLowerCaseAZ(n[4].unit)) {
      case "deg":
        break;
      case "rad":
        r = 180 * n[4].value / Math.PI;
        break;
      case "grad":
        r = 0.9 * n[4].value;
        break;
      case "turn":
        r = 360 * n[4].value;
        break;
      default:
        return false;
    }
    return r %= 360, [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  return false;
}
function normalize_legacy_HSL_ChannelValues(n, l, t) {
  if (0 === l) {
    const e = normalizeHue(n);
    return false !== e && (isTokenDimension(n) && t.syntaxFlags.add(me.HasDimensionValues), e);
  }
  if (isTokenPercentage(n)) {
    3 === l ? t.syntaxFlags.add(me.HasPercentageAlpha) : t.syntaxFlags.add(me.HasPercentageValues);
    let r = normalize(n[4].value, 1, 0, 100);
    return 3 === l && (r = normalize(n[4].value, 100, 0, 1)), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  if (isTokenNumber(n)) {
    if (3 !== l) return false;
    let r = normalize(n[4].value, 1, 0, 100);
    return 3 === l && (r = normalize(n[4].value, 1, 0, 1)), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  return false;
}
function normalize_modern_HSL_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (0 === t) {
    const e = normalizeHue(l);
    return false !== e && (isTokenDimension(l) && s.syntaxFlags.add(me.HasDimensionValues), e);
  }
  if (isTokenPercentage(l)) {
    3 === t ? s.syntaxFlags.add(me.HasPercentageAlpha) : s.syntaxFlags.add(me.HasPercentageValues);
    let n = l[4].value;
    return 3 === t ? n = normalize(l[4].value, 100, 0, 1) : 1 === t && (n = normalize(l[4].value, 1, 0, 2147483647)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = l[4].value;
    return 3 === t ? n = normalize(l[4].value, 1, 0, 1) : 1 === t && (n = normalize(l[4].value, 1, 0, 2147483647)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function threeChannelLegacySyntax(e, a2, n, r) {
  const l = [], u = [], i = [], c2 = [], h = { colorNotation: n, channels: [0, 0, 0], alpha: 1, syntaxFlags: new Set(r) };
  let m = l;
  for (let a3 = 0; a3 < e.value.length; a3++) {
    let n2 = e.value[a3];
    if (!isWhitespaceNode(n2) && !isCommentNode(n2)) {
      if (isTokenNode(n2) && isTokenComma(n2.value)) {
        if (m === l) {
          m = u;
          continue;
        }
        if (m === u) {
          m = i;
          continue;
        }
        if (m === i) {
          m = c2;
          continue;
        }
        if (m === c2) return false;
      }
      if (isFunctionNode(n2)) {
        if (m === c2 && "var" === n2.getName().toLowerCase()) {
          h.syntaxFlags.add(me.HasVariableAlpha), m.push(n2);
          continue;
        }
        if (!Q.has(n2.getName().toLowerCase())) return false;
        const [[e2]] = calcFromComponentValues([[n2]], { censorIntoStandardRepresentableValues: true, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), n2 = e2;
      }
      if (!isTokenNode(n2)) return false;
      m.push(n2);
    }
  }
  if (1 !== m.length) return false;
  if (1 !== l.length || 1 !== u.length || 1 !== i.length) return false;
  if (!isTokenNode(l[0]) || !isTokenNode(u[0]) || !isTokenNode(i[0])) return false;
  const p = a2(l[0].value, 0, h);
  if (!p || !isTokenNumber(p)) return false;
  const N = a2(u[0].value, 1, h);
  if (!N || !isTokenNumber(N)) return false;
  const b = a2(i[0].value, 2, h);
  if (!b || !isTokenNumber(b)) return false;
  const g = [p, N, b];
  if (1 === c2.length) if (h.syntaxFlags.add(me.HasAlpha), isTokenNode(c2[0])) {
    const e2 = a2(c2[0].value, 3, h);
    if (!e2 || !isTokenNumber(e2)) return false;
    g.push(e2);
  } else h.alpha = c2[0];
  return h.channels = [g[0][4].value, g[1][4].value, g[2][4].value], 4 === g.length && (h.alpha = g[3][4].value), h;
}
function threeChannelSpaceSeparated(e, a2, r, s, u) {
  const i = [], c2 = [], h = [], m = [];
  let p, N, b = false;
  const g = { colorNotation: r, channels: [0, 0, 0], alpha: 1, syntaxFlags: new Set(s) };
  let v = i;
  for (let a3 = 0; a3 < e.value.length; a3++) {
    let o = e.value[a3];
    if (isWhitespaceNode(o) || isCommentNode(o)) for (; isWhitespaceNode(e.value[a3 + 1]) || isCommentNode(e.value[a3 + 1]); ) a3++;
    else if (v === i && i.length && (v = c2), v === c2 && c2.length && (v = h), isTokenNode(o) && isTokenDelim(o.value) && "/" === o.value[4].value) {
      if (v === m) return false;
      v = m;
    } else {
      if (isFunctionNode(o)) {
        if (v === m && "var" === o.getName().toLowerCase()) {
          g.syntaxFlags.add(me.HasVariableAlpha), v.push(o);
          continue;
        }
        if (!Q.has(o.getName().toLowerCase())) return false;
        const [[e2]] = calcFromComponentValues([[o]], { censorIntoStandardRepresentableValues: true, globals: N, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), o = e2;
      }
      if (v === i && 0 === i.length && isTokenNode(o) && isTokenIdent(o.value) && "from" === o.value[4].value.toLowerCase()) {
        if (b) return false;
        for (; isWhitespaceNode(e.value[a3 + 1]) || isCommentNode(e.value[a3 + 1]); ) a3++;
        if (a3++, o = e.value[a3], b = u(o), false === b) return false;
        b.syntaxFlags.has(me.Experimental) && g.syntaxFlags.add(me.Experimental), g.syntaxFlags.add(me.RelativeColorSyntax), b.colorNotation !== r && (b = colorDataTo(b, r)), p = normalizeRelativeColorDataChannels(b), N = noneToZeroInRelativeColorDataChannels(p);
      } else {
        if (!isTokenNode(o)) return false;
        if (isTokenIdent(o.value) && p) {
          const e2 = o.value[4].value.toLowerCase();
          if (p.has(e2)) {
            v.push(new TokenNode(p.get(e2)));
            continue;
          }
        }
        v.push(o);
      }
    }
  }
  if (1 !== v.length) return false;
  if (1 !== i.length || 1 !== c2.length || 1 !== h.length) return false;
  if (!isTokenNode(i[0]) || !isTokenNode(c2[0]) || !isTokenNode(h[0])) return false;
  if (p && !p.has("alpha")) return false;
  const f = a2(i[0].value, 0, g);
  if (!f || !isTokenNumber(f)) return false;
  const y = a2(c2[0].value, 1, g);
  if (!y || !isTokenNumber(y)) return false;
  const d2 = a2(h[0].value, 2, g);
  if (!d2 || !isTokenNumber(d2)) return false;
  const _ = [f, y, d2];
  if (1 === m.length) if (g.syntaxFlags.add(me.HasAlpha), isTokenNode(m[0])) {
    const e2 = a2(m[0].value, 3, g);
    if (!e2 || !isTokenNumber(e2)) return false;
    _.push(e2);
  } else g.alpha = m[0];
  else if (p && p.has("alpha")) {
    const e2 = a2(p.get("alpha"), 3, g);
    if (!e2 || !isTokenNumber(e2)) return false;
    _.push(e2);
  }
  return g.channels = [_[0][4].value, _[1][4].value, _[2][4].value], 4 === _.length && (g.alpha = _[3][4].value), g;
}
function hsl(e, a2) {
  if (e.value.some((e2) => isTokenNode(e2) && isTokenComma(e2.value))) {
    const a3 = hslCommaSeparated(e);
    if (false !== a3) return a3;
  }
  {
    const n = hslSpaceSeparated(e, a2);
    if (false !== n) return n;
  }
  return false;
}
function hslCommaSeparated(e) {
  return threeChannelLegacySyntax(e, normalize_legacy_HSL_ChannelValues, he.HSL, [me.LegacyHSL]);
}
function hslSpaceSeparated(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_modern_HSL_ChannelValues, he.HSL, [], a2);
}
function normalize_HWB_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (0 === t) {
    const e = normalizeHue(l);
    return false !== e && (isTokenDimension(l) && s.syntaxFlags.add(me.HasDimensionValues), e);
  }
  if (isTokenPercentage(l)) {
    3 === t ? s.syntaxFlags.add(me.HasPercentageAlpha) : s.syntaxFlags.add(me.HasPercentageValues);
    let n = l[4].value;
    return 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = l[4].value;
    return 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function normalize_Lab_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(l)) {
    3 !== t && s.syntaxFlags.add(me.HasPercentageValues);
    let n = normalize(l[4].value, 1, 0, 100);
    return 1 === t || 2 === t ? n = normalize(l[4].value, 0.8, -2147483647, 2147483647) : 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = normalize(l[4].value, 1, 0, 100);
    return 1 === t || 2 === t ? n = normalize(l[4].value, 1, -2147483647, 2147483647) : 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function lab(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_Lab_ChannelValues, he.Lab, [], a2);
}
function normalize_LCH_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (2 === t) {
    const e = normalizeHue(l);
    return false !== e && (isTokenDimension(l) && s.syntaxFlags.add(me.HasDimensionValues), e);
  }
  if (isTokenPercentage(l)) {
    3 !== t && s.syntaxFlags.add(me.HasPercentageValues);
    let n = normalize(l[4].value, 1, 0, 100);
    return 1 === t ? n = normalize(l[4].value, 100 / 150, 0, 2147483647) : 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = normalize(l[4].value, 1, 0, 100);
    return 1 === t ? n = normalize(l[4].value, 1, 0, 2147483647) : 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function lch(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_LCH_ChannelValues, he.LCH, [], a2);
}
const ye = /* @__PURE__ */ new Map();
for (const [e, a2] of Object.entries(d)) ye.set(e, a2);
function namedColor(e) {
  const a2 = ye.get(toLowerCaseAZ(e));
  return !!a2 && { colorNotation: he.RGB, channels: [a2[0] / 255, a2[1] / 255, a2[2] / 255], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([me.ColorKeyword, me.NamedColor]) };
}
function normalize_OKLab_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(l)) {
    3 !== t && s.syntaxFlags.add(me.HasPercentageValues);
    let n = normalize(l[4].value, 100, 0, 1);
    return 1 === t || 2 === t ? n = normalize(l[4].value, 250, -2147483647, 2147483647) : 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = normalize(l[4].value, 1, 0, 1);
    return 1 === t || 2 === t ? n = normalize(l[4].value, 1, -2147483647, 2147483647) : 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function oklab(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_OKLab_ChannelValues, he.OKLab, [], a2);
}
function normalize_OKLCH_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === toLowerCaseAZ(l[4].value)) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (2 === t) {
    const e = normalizeHue(l);
    return false !== e && (isTokenDimension(l) && s.syntaxFlags.add(me.HasDimensionValues), e);
  }
  if (isTokenPercentage(l)) {
    3 !== t && s.syntaxFlags.add(me.HasPercentageValues);
    let n = normalize(l[4].value, 100, 0, 1);
    return 1 === t ? n = normalize(l[4].value, 250, 0, 2147483647) : 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = normalize(l[4].value, 1, 0, 1);
    return 1 === t ? n = normalize(l[4].value, 1, 0, 2147483647) : 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function oklch(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_OKLCH_ChannelValues, he.OKLCH, [], a2);
}
function normalize_legacy_sRGB_ChannelValues(n, l, t) {
  if (isTokenPercentage(n)) {
    3 === l ? t.syntaxFlags.add(me.HasPercentageAlpha) : t.syntaxFlags.add(me.HasPercentageValues);
    const r = normalize(n[4].value, 100, 0, 1);
    return [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  if (isTokenNumber(n)) {
    3 !== l && t.syntaxFlags.add(me.HasNumberValues);
    let r = normalize(n[4].value, 255, 0, 1);
    return 3 === l && (r = normalize(n[4].value, 1, 0, 1)), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  return false;
}
function normalize_modern_sRGB_ChannelValues(l, t, s) {
  if (isTokenIdent(l) && "none" === l[4].value.toLowerCase()) return s.syntaxFlags.add(me.HasNoneKeywords), [c.Number, "none", l[2], l[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(l)) {
    3 !== t && s.syntaxFlags.add(me.HasPercentageValues);
    let n = normalize(l[4].value, 100, -2147483647, 2147483647);
    return 3 === t && (n = normalize(l[4].value, 100, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(l)) {
    3 !== t && s.syntaxFlags.add(me.HasNumberValues);
    let n = normalize(l[4].value, 255, -2147483647, 2147483647);
    return 3 === t && (n = normalize(l[4].value, 1, 0, 1)), [c.Number, n.toString(), l[2], l[3], { value: n, type: a.Number }];
  }
  return false;
}
function rgb(e, a2) {
  if (e.value.some((e2) => isTokenNode(e2) && isTokenComma(e2.value))) {
    const a3 = rgbCommaSeparated(e);
    if (false !== a3) return (!a3.syntaxFlags.has(me.HasNumberValues) || !a3.syntaxFlags.has(me.HasPercentageValues)) && a3;
  } else {
    const n = rgbSpaceSeparated(e, a2);
    if (false !== n) return n;
  }
  return false;
}
function rgbCommaSeparated(e) {
  return threeChannelLegacySyntax(e, normalize_legacy_sRGB_ChannelValues, he.RGB, [me.LegacyRGB]);
}
function rgbSpaceSeparated(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_modern_sRGB_ChannelValues, he.RGB, [], a2);
}
function XYZ_D50_to_sRGB_Gamut(e) {
  const a2 = XYZ_D50_to_sRGB(e);
  if (inGamut(a2)) return clip(a2);
  let n = e;
  return n = XYZ_D50_to_OKLCH(n), n[0] < 1e-6 && (n = [0, 0, 0]), n[0] > 0.999999 && (n = [1, 0, 0]), gam_sRGB(mapGamutRayTrace(n, oklch_to_lin_srgb, lin_srgb_to_oklch));
}
function oklch_to_lin_srgb(e) {
  return e = OKLCH_to_OKLab(e), e = OKLab_to_XYZ(e), XYZ_to_lin_sRGB(e);
}
function lin_srgb_to_oklch(e) {
  return e = lin_sRGB_to_XYZ(e), e = XYZ_to_OKLab(e), OKLab_to_OKLCH(e);
}
function contrastColor(e, a2) {
  let n = false;
  for (let r2 = 0; r2 < e.value.length; r2++) {
    const o2 = e.value[r2];
    if (!isWhitespaceNode(o2) && !isCommentNode(o2) && (n || (n = a2(o2), !n))) return false;
  }
  if (!n) return false;
  n.channels = convertNaNToZero(n.channels), n.channels = XYZ_D50_to_sRGB_Gamut(colorData_to_XYZ_D50(n).channels), n.colorNotation = he.sRGB;
  const r = { colorNotation: he.sRGB, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([me.ContrastColor, me.Experimental]) }, o = contrast_ratio_wcag_2_1(n.channels, [1, 1, 1]), l = contrast_ratio_wcag_2_1(n.channels, [0, 0, 0]);
  return r.channels = o > l ? [1, 1, 1] : [0, 0, 0], r;
}
function alpha(e, a2) {
  let r, s, u = false, i = false, c2 = false;
  const h = { colorNotation: he.sRGB, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([]) };
  for (let m = 0; m < e.value.length; m++) {
    let p = e.value[m];
    if (isWhitespaceNode(p) || isCommentNode(p)) for (; isWhitespaceNode(e.value[m + 1]) || isCommentNode(e.value[m + 1]); ) m++;
    else if (c2 && !u && !i && isTokenNode(p) && isTokenDelim(p.value) && "/" === p.value[4].value) u = true;
    else {
      if (isFunctionNode(p) && Q.has(toLowerCaseAZ(p.getName()))) {
        const [[e2]] = calcFromComponentValues([[p]], { censorIntoStandardRepresentableValues: true, globals: s, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), p = e2;
      }
      if (u || i || !isTokenNode(p) || !isTokenIdent(p.value) || "from" !== toLowerCaseAZ(p.value[4].value)) {
        if (!u) return false;
        if (i) return false;
        if (isTokenNode(p)) {
          if (isTokenIdent(p.value) && "alpha" === toLowerCaseAZ(p.value[4].value) && r && r.has("alpha")) {
            h.alpha = r.get("alpha")[4].value, i = true;
            continue;
          }
          const e2 = normalize_Color_ChannelValues(p.value, 3, h);
          if (!e2 || !isTokenNumber(e2)) return false;
          h.alpha = new TokenNode(e2), i = true;
          continue;
        }
        if (isFunctionNode(p)) {
          const e2 = replaceComponentValues([[p]], (e3) => {
            if (isTokenNode(e3) && isTokenIdent(e3.value) && "alpha" === toLowerCaseAZ(e3.value[4].value) && r && r.has("alpha")) return new TokenNode(r.get("alpha"));
          });
          h.alpha = e2[0][0], i = true;
          continue;
        }
        return false;
      }
      if (c2) return false;
      for (; isWhitespaceNode(e.value[m + 1]) || isCommentNode(e.value[m + 1]); ) m++;
      if (m++, p = e.value[m], c2 = a2(p), false === c2) return false;
      r = normalizeRelativeColorDataChannels(c2), s = noneToZeroInRelativeColorDataChannels(r), h.syntaxFlags = new Set(c2.syntaxFlags), h.syntaxFlags.add(me.RelativeAlphaSyntax), h.channels = [...c2.channels], h.colorNotation = c2.colorNotation, h.alpha = c2.alpha;
    }
  }
  return !!r && h;
}
function color(e) {
  if (isFunctionNode(e)) {
    switch (toLowerCaseAZ(e.getName())) {
      case "rgb":
      case "rgba":
        return rgb(e, color);
      case "hsl":
      case "hsla":
        return hsl(e, color);
      case "hwb":
        return a2 = color, threeChannelSpaceSeparated(e, normalize_HWB_ChannelValues, he.HWB, [], a2);
      case "lab":
        return lab(e, color);
      case "lch":
        return lch(e, color);
      case "oklab":
        return oklab(e, color);
      case "oklch":
        return oklch(e, color);
      case "color":
        return color$1(e, color);
      case "color-mix":
        return colorMix(e, color);
      case "contrast-color":
        return contrastColor(e, color);
      case "alpha":
        return alpha(e, color);
    }
  }
  var a2;
  if (isTokenNode(e)) {
    if (isTokenHash(e.value)) return hex(e.value);
    if (isTokenIdent(e.value)) {
      const a3 = namedColor(e.value[4].value);
      return false !== a3 ? a3 : "transparent" === toLowerCaseAZ(e.value[4].value) && { colorNotation: he.RGB, channels: [0, 0, 0], alpha: 0, syntaxFlags: /* @__PURE__ */ new Set([me.ColorKeyword]) };
    }
  }
  return false;
}
export {
  color as c,
  me as m
};

var ed5 = {};
var hasRequiredEd5;
function requireEd5() {
  if (hasRequiredEd5) return ed5;
  hasRequiredEd5 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.CHAR = "	\n\r -퟿-�𐀀-􏿿";
    exports$1.S = " 	\r\n";
    exports$1.NAME_START_CHAR = ":A-Z_a-zÀ-ÖØ-öø-˿Ͱ-ͽͿ-῿‌‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�𐀀-󯿿";
    exports$1.NAME_CHAR = "-" + exports$1.NAME_START_CHAR + ".0-9·̀-ͯ‿-⁀";
    exports$1.CHAR_RE = new RegExp("^[" + exports$1.CHAR + "]$", "u");
    exports$1.S_RE = new RegExp("^[" + exports$1.S + "]+$", "u");
    exports$1.NAME_START_CHAR_RE = new RegExp("^[" + exports$1.NAME_START_CHAR + "]$", "u");
    exports$1.NAME_CHAR_RE = new RegExp("^[" + exports$1.NAME_CHAR + "]$", "u");
    exports$1.NAME_RE = new RegExp("^[" + exports$1.NAME_START_CHAR + "][" + exports$1.NAME_CHAR + "]*$", "u");
    exports$1.NMTOKEN_RE = new RegExp("^[" + exports$1.NAME_CHAR + "]+$", "u");
    var TAB = 9;
    var NL = 10;
    var CR = 13;
    var SPACE = 32;
    exports$1.S_LIST = [SPACE, NL, CR, TAB];
    function isChar(c) {
      return c >= SPACE && c <= 55295 || c === NL || c === CR || c === TAB || c >= 57344 && c <= 65533 || c >= 65536 && c <= 1114111;
    }
    exports$1.isChar = isChar;
    function isS(c) {
      return c === SPACE || c === NL || c === CR || c === TAB;
    }
    exports$1.isS = isS;
    function isNameStartChar(c) {
      return c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 58 || c === 95 || c === 8204 || c === 8205 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 767 || c >= 880 && c <= 893 || c >= 895 && c <= 8191 || c >= 8304 && c <= 8591 || c >= 11264 && c <= 12271 || c >= 12289 && c <= 55295 || c >= 63744 && c <= 64975 || c >= 65008 && c <= 65533 || c >= 65536 && c <= 983039;
    }
    exports$1.isNameStartChar = isNameStartChar;
    function isNameChar(c) {
      return isNameStartChar(c) || c >= 48 && c <= 57 || c === 45 || c === 46 || c === 183 || c >= 768 && c <= 879 || c >= 8255 && c <= 8256;
    }
    exports$1.isNameChar = isNameChar;
  })(ed5);
  return ed5;
}
var ed2 = {};
var hasRequiredEd2;
function requireEd2() {
  if (hasRequiredEd2) return ed2;
  hasRequiredEd2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.CHAR = "-퟿-�𐀀-􏿿";
    exports$1.RESTRICTED_CHAR = "-\b\v\f---";
    exports$1.S = " 	\r\n";
    exports$1.NAME_START_CHAR = ":A-Z_a-zÀ-ÖØ-öø-˿Ͱ-ͽͿ-῿‌‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�𐀀-󯿿";
    exports$1.NAME_CHAR = "-" + exports$1.NAME_START_CHAR + ".0-9·̀-ͯ‿-⁀";
    exports$1.CHAR_RE = new RegExp("^[" + exports$1.CHAR + "]$", "u");
    exports$1.RESTRICTED_CHAR_RE = new RegExp("^[" + exports$1.RESTRICTED_CHAR + "]$", "u");
    exports$1.S_RE = new RegExp("^[" + exports$1.S + "]+$", "u");
    exports$1.NAME_START_CHAR_RE = new RegExp("^[" + exports$1.NAME_START_CHAR + "]$", "u");
    exports$1.NAME_CHAR_RE = new RegExp("^[" + exports$1.NAME_CHAR + "]$", "u");
    exports$1.NAME_RE = new RegExp("^[" + exports$1.NAME_START_CHAR + "][" + exports$1.NAME_CHAR + "]*$", "u");
    exports$1.NMTOKEN_RE = new RegExp("^[" + exports$1.NAME_CHAR + "]+$", "u");
    var TAB = 9;
    var NL = 10;
    var CR = 13;
    var SPACE = 32;
    exports$1.S_LIST = [SPACE, NL, CR, TAB];
    function isChar(c) {
      return c >= 1 && c <= 55295 || c >= 57344 && c <= 65533 || c >= 65536 && c <= 1114111;
    }
    exports$1.isChar = isChar;
    function isRestrictedChar(c) {
      return c >= 1 && c <= 8 || c === 11 || c === 12 || c >= 14 && c <= 31 || c >= 127 && c <= 132 || c >= 134 && c <= 159;
    }
    exports$1.isRestrictedChar = isRestrictedChar;
    function isCharAndNotRestricted(c) {
      return c === 9 || c === 10 || c === 13 || c > 31 && c < 127 || c === 133 || c > 159 && c <= 55295 || c >= 57344 && c <= 65533 || c >= 65536 && c <= 1114111;
    }
    exports$1.isCharAndNotRestricted = isCharAndNotRestricted;
    function isS(c) {
      return c === SPACE || c === NL || c === CR || c === TAB;
    }
    exports$1.isS = isS;
    function isNameStartChar(c) {
      return c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 58 || c === 95 || c === 8204 || c === 8205 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 767 || c >= 880 && c <= 893 || c >= 895 && c <= 8191 || c >= 8304 && c <= 8591 || c >= 11264 && c <= 12271 || c >= 12289 && c <= 55295 || c >= 63744 && c <= 64975 || c >= 65008 && c <= 65533 || c >= 65536 && c <= 983039;
    }
    exports$1.isNameStartChar = isNameStartChar;
    function isNameChar(c) {
      return isNameStartChar(c) || c >= 48 && c <= 57 || c === 45 || c === 46 || c === 183 || c >= 768 && c <= 879 || c >= 8255 && c <= 8256;
    }
    exports$1.isNameChar = isNameChar;
  })(ed2);
  return ed2;
}
var ed3 = {};
var hasRequiredEd3;
function requireEd3() {
  if (hasRequiredEd3) return ed3;
  hasRequiredEd3 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.NC_NAME_START_CHAR = "A-Z_a-zÀ-ÖØ-öø-˿Ͱ-ͽͿ-῿‌-‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�𐀀-󯿿";
    exports$1.NC_NAME_CHAR = "-" + exports$1.NC_NAME_START_CHAR + ".0-9·̀-ͯ‿-⁀";
    exports$1.NC_NAME_START_CHAR_RE = new RegExp("^[" + exports$1.NC_NAME_START_CHAR + "]$", "u");
    exports$1.NC_NAME_CHAR_RE = new RegExp("^[" + exports$1.NC_NAME_CHAR + "]$", "u");
    exports$1.NC_NAME_RE = new RegExp("^[" + exports$1.NC_NAME_START_CHAR + "][" + exports$1.NC_NAME_CHAR + "]*$", "u");
    function isNCNameStartChar(c) {
      return c >= 65 && c <= 90 || c === 95 || c >= 97 && c <= 122 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 767 || c >= 880 && c <= 893 || c >= 895 && c <= 8191 || c >= 8204 && c <= 8205 || c >= 8304 && c <= 8591 || c >= 11264 && c <= 12271 || c >= 12289 && c <= 55295 || c >= 63744 && c <= 64975 || c >= 65008 && c <= 65533 || c >= 65536 && c <= 983039;
    }
    exports$1.isNCNameStartChar = isNCNameStartChar;
    function isNCNameChar(c) {
      return isNCNameStartChar(c) || (c === 45 || c === 46 || c >= 48 && c <= 57 || c === 183 || c >= 768 && c <= 879 || c >= 8255 && c <= 8256);
    }
    exports$1.isNCNameChar = isNCNameChar;
  })(ed3);
  return ed3;
}
export {
  requireEd2 as a,
  requireEd3 as b,
  requireEd5 as r
};

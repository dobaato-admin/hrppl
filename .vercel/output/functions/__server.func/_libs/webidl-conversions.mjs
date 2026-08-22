var lib = {};
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  (function(exports$1) {
    function makeException(ErrorType, message, options) {
      if (options.globals) {
        ErrorType = options.globals[ErrorType.name];
      }
      return new ErrorType(`${options.context ? options.context : "Value"} ${message}.`);
    }
    function toNumber(value, options) {
      if (typeof value === "bigint") {
        throw makeException(TypeError, "is a BigInt which cannot be converted to a number", options);
      }
      if (!options.globals) {
        return Number(value);
      }
      return options.globals.Number(value);
    }
    function evenRound(x) {
      if (x > 0 && x % 1 === 0.5 && (x & 1) === 0 || x < 0 && x % 1 === -0.5 && (x & 1) === 1) {
        return censorNegativeZero(Math.floor(x));
      }
      return censorNegativeZero(Math.round(x));
    }
    function integerPart(n) {
      return censorNegativeZero(Math.trunc(n));
    }
    function sign(x) {
      return x < 0 ? -1 : 1;
    }
    function modulo(x, y) {
      const signMightNotMatch = x % y;
      if (sign(y) !== sign(signMightNotMatch)) {
        return signMightNotMatch + y;
      }
      return signMightNotMatch;
    }
    function censorNegativeZero(x) {
      return x === 0 ? 0 : x;
    }
    function createIntegerConversion(bitLength, { unsigned }) {
      let lowerBound, upperBound;
      if (unsigned) {
        lowerBound = 0;
        upperBound = 2 ** bitLength - 1;
      } else {
        lowerBound = -(2 ** (bitLength - 1));
        upperBound = 2 ** (bitLength - 1) - 1;
      }
      const twoToTheBitLength = 2 ** bitLength;
      const twoToOneLessThanTheBitLength = 2 ** (bitLength - 1);
      return (value, options = {}) => {
        let x = toNumber(value, options);
        x = censorNegativeZero(x);
        if (options.enforceRange) {
          if (!Number.isFinite(x)) {
            throw makeException(TypeError, "is not a finite number", options);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw makeException(
              TypeError,
              `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`,
              options
            );
          }
          return x;
        }
        if (!Number.isNaN(x) && options.clamp) {
          x = Math.min(Math.max(x, lowerBound), upperBound);
          x = evenRound(x);
          return x;
        }
        if (!Number.isFinite(x) || x === 0) {
          return 0;
        }
        x = integerPart(x);
        if (x >= lowerBound && x <= upperBound) {
          return x;
        }
        x = modulo(x, twoToTheBitLength);
        if (!unsigned && x >= twoToOneLessThanTheBitLength) {
          return x - twoToTheBitLength;
        }
        return x;
      };
    }
    function createLongLongConversion(bitLength, { unsigned }) {
      const upperBound = Number.MAX_SAFE_INTEGER;
      const lowerBound = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
      const asBigIntN = unsigned ? BigInt.asUintN : BigInt.asIntN;
      return (value, options = {}) => {
        let x = toNumber(value, options);
        x = censorNegativeZero(x);
        if (options.enforceRange) {
          if (!Number.isFinite(x)) {
            throw makeException(TypeError, "is not a finite number", options);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw makeException(
              TypeError,
              `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`,
              options
            );
          }
          return x;
        }
        if (!Number.isNaN(x) && options.clamp) {
          x = Math.min(Math.max(x, lowerBound), upperBound);
          x = evenRound(x);
          return x;
        }
        if (!Number.isFinite(x) || x === 0) {
          return 0;
        }
        let xBigInt = BigInt(integerPart(x));
        xBigInt = asBigIntN(bitLength, xBigInt);
        return Number(xBigInt);
      };
    }
    exports$1.any = (value) => {
      return value;
    };
    exports$1.undefined = () => {
      return void 0;
    };
    exports$1.boolean = (value) => {
      return Boolean(value);
    };
    exports$1.byte = createIntegerConversion(8, { unsigned: false });
    exports$1.octet = createIntegerConversion(8, { unsigned: true });
    exports$1.short = createIntegerConversion(16, { unsigned: false });
    exports$1["unsigned short"] = createIntegerConversion(16, { unsigned: true });
    exports$1.long = createIntegerConversion(32, { unsigned: false });
    exports$1["unsigned long"] = createIntegerConversion(32, { unsigned: true });
    exports$1["long long"] = createLongLongConversion(64, { unsigned: false });
    exports$1["unsigned long long"] = createLongLongConversion(64, { unsigned: true });
    exports$1.double = (value, options = {}) => {
      const x = toNumber(value, options);
      if (!Number.isFinite(x)) {
        throw makeException(TypeError, "is not a finite floating-point value", options);
      }
      return x;
    };
    exports$1["unrestricted double"] = (value, options = {}) => {
      const x = toNumber(value, options);
      return x;
    };
    exports$1.float = (value, options = {}) => {
      const x = toNumber(value, options);
      if (!Number.isFinite(x)) {
        throw makeException(TypeError, "is not a finite floating-point value", options);
      }
      if (Object.is(x, -0)) {
        return x;
      }
      const y = Math.fround(x);
      if (!Number.isFinite(y)) {
        throw makeException(TypeError, "is outside the range of a single-precision floating-point value", options);
      }
      return y;
    };
    exports$1["unrestricted float"] = (value, options = {}) => {
      const x = toNumber(value, options);
      if (isNaN(x)) {
        return x;
      }
      if (Object.is(x, -0)) {
        return x;
      }
      return Math.fround(x);
    };
    exports$1.DOMString = (value, options = {}) => {
      if (options.treatNullAsEmptyString && value === null) {
        return "";
      }
      if (typeof value === "symbol") {
        throw makeException(TypeError, "is a symbol, which cannot be converted to a string", options);
      }
      const StringCtor = options.globals ? options.globals.String : String;
      return StringCtor(value);
    };
    exports$1.ByteString = (value, options = {}) => {
      const x = exports$1.DOMString(value, options);
      if (/[^\x00-\xFF]/.test(x)) {
        throw makeException(TypeError, "is not a valid ByteString", options);
      }
      return x;
    };
    exports$1.USVString = (value, options = {}) => {
      return exports$1.DOMString(value, options).toWellFormed();
    };
    exports$1.object = (value, options = {}) => {
      if (value === null || typeof value !== "object" && typeof value !== "function") {
        throw makeException(TypeError, "is not an object", options);
      }
      return value;
    };
    const abByteLengthGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
    const sabByteLengthGetter = Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get;
    function isNonSharedArrayBuffer(value) {
      try {
        abByteLengthGetter.call(value);
        return true;
      } catch {
        return false;
      }
    }
    function isSharedArrayBuffer(value) {
      try {
        sabByteLengthGetter.call(value);
        return true;
      } catch {
        return false;
      }
    }
    const abResizableGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "resizable").get;
    const sabGrowableGetter = Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "growable").get;
    function isNonSharedArrayBufferResizable(value) {
      try {
        return abResizableGetter.call(value);
      } catch {
        return false;
      }
    }
    function isSharedArrayBufferGrowable(value) {
      try {
        return sabGrowableGetter.call(value);
      } catch {
        return false;
      }
    }
    function isArrayBufferDetached(value) {
      try {
        new Uint8Array(value);
        return false;
      } catch {
        return true;
      }
    }
    exports$1.ArrayBuffer = (value, options = {}) => {
      if (!isNonSharedArrayBuffer(value)) {
        throw makeException(TypeError, "is not an ArrayBuffer", options);
      }
      if (!options.allowResizable && isNonSharedArrayBufferResizable(value)) {
        throw makeException(TypeError, "is a resizable ArrayBuffer", options);
      }
      if (isArrayBufferDetached(value)) {
        throw makeException(TypeError, "is a detached ArrayBuffer", options);
      }
      return value;
    };
    exports$1.SharedArrayBuffer = (value, options = {}) => {
      if (!isSharedArrayBuffer(value)) {
        throw makeException(TypeError, "is not a SharedArrayBuffer", options);
      }
      if (!options.allowResizable && isSharedArrayBufferGrowable(value)) {
        throw makeException(TypeError, "is a growable SharedArrayBuffer", options);
      }
      return value;
    };
    const dvByteLengthGetter = Object.getOwnPropertyDescriptor(DataView.prototype, "byteLength").get;
    exports$1.DataView = (value, options = {}) => {
      try {
        dvByteLengthGetter.call(value);
      } catch {
        throw makeException(TypeError, "is not a DataView", options);
      }
      return exports$1.ArrayBufferView(value, options);
    };
    const typedArrayNameGetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(Uint8Array).prototype,
      Symbol.toStringTag
    ).get;
    [
      Int8Array,
      Int16Array,
      Int32Array,
      Uint8Array,
      Uint16Array,
      Uint32Array,
      Uint8ClampedArray,
      Float32Array,
      Float64Array
    ].forEach((func) => {
      const { name } = func;
      const article = /^[AEIOU]/u.test(name) ? "an" : "a";
      exports$1[name] = (value, options = {}) => {
        if (!ArrayBuffer.isView(value) || typedArrayNameGetter.call(value) !== name) {
          throw makeException(TypeError, `is not ${article} ${name} object`, options);
        }
        return exports$1.ArrayBufferView(value, options);
      };
    });
    exports$1.ArrayBufferView = (value, options = {}) => {
      if (!ArrayBuffer.isView(value)) {
        throw makeException(TypeError, "is not a view on an ArrayBuffer or SharedArrayBuffer", options);
      }
      if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
        throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
      }
      if (!options.allowResizable) {
        if (isNonSharedArrayBufferResizable(value.buffer)) {
          throw makeException(TypeError, "is a view on a resizable ArrayBuffer, which is not allowed", options);
        } else if (isSharedArrayBufferGrowable(value.buffer)) {
          throw makeException(TypeError, "is a view on a growable SharedArrayBuffer, which is not allowed", options);
        }
      }
      if (isArrayBufferDetached(value.buffer)) {
        throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
      }
      return value;
    };
    exports$1.BufferSource = (value, options = {}) => {
      if (ArrayBuffer.isView(value)) {
        return exports$1.ArrayBufferView(value, options);
      }
      if (isNonSharedArrayBuffer(value)) {
        return exports$1.ArrayBuffer(value, options);
      } else if (options.allowShared && isSharedArrayBuffer(value)) {
        return exports$1.SharedArrayBuffer(value, options);
      }
      if (options.allowShared) {
        throw makeException(TypeError, "is not an ArrayBuffer, SharedArrayBuffer, or a view on one", options);
      } else {
        throw makeException(TypeError, "is not an ArrayBuffer or a view on one", options);
      }
    };
    exports$1.DOMTimeStamp = exports$1["unsigned long long"];
  })(lib);
  return lib;
}
export {
  requireLib as r
};

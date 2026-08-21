// Biometric vendors — top global + Australia-popular brands.
// Used in the device configuration dropdown.
export const BIOMETRIC_VENDORS: { code: string; label: string }[] = [
  // Top global enterprise
  { code: "zkteco", label: "ZKTeco (ZKBio / BioTime)" },
  { code: "suprema", label: "Suprema BioStar" },
  { code: "hikvision", label: "Hikvision" },
  { code: "dahua", label: "Dahua" },
  { code: "anviz", label: "Anviz" },
  { code: "fingertec", label: "FingerTec" },
  { code: "hid", label: "HID Global" },
  { code: "idemia", label: "IDEMIA (Morpho)" },
  { code: "nec", label: "NEC" },
  { code: "matrix", label: "Matrix Comsec" },
  { code: "realtime", label: "Realtime" },
  { code: "essl", label: "eSSL" },
  { code: "secugen", label: "SecuGen" },
  { code: "biomax", label: "Biomax" },
  { code: "virdi", label: "Virdi (Union Community)" },
  { code: "invixium", label: "Invixium" },
  { code: "princeton", label: "Princeton Identity" },
  { code: "iris-id", label: "Iris ID" },
  { code: "crossmatch", label: "Crossmatch / HID" },
  { code: "lumidigm", label: "Lumidigm" },

  // Australia / APAC popular
  { code: "honeywell", label: "Honeywell" },
  { code: "bosch", label: "Bosch Security" },
  { code: "gallagher", label: "Gallagher (AU)" },
  { code: "inner-range", label: "Inner Range (AU)" },
  { code: "tensor", label: "Tensor" },
  { code: "aussie-time-sheets", label: "Aussie Time Sheets (AU)" },
  { code: "ikeyless", label: "iKeyless / ASSA ABLOY" },
  { code: "kone", label: "KONE Access" },
  { code: "axis", label: "Axis Communications" },
  { code: "paxton", label: "Paxton" },

  // Software-defined / generic fallback
  { code: "kisi", label: "Kisi (cloud)" },
  { code: "openpath", label: "Openpath / Avigilon Alta" },
  { code: "generic", label: "Generic webhook / CSV" },
];

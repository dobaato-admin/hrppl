// Curated IANA timezone list, grouped by region. Covers Australia in detail
// (per primary market) plus the major global zones. Suitable for a branch
// timezone dropdown — not exhaustive, but legible.

export interface TimezoneOption {
  value: string;     // IANA name
  label: string;     // human friendly
  group: string;     // region group label
}

export const TIMEZONES: TimezoneOption[] = [
  // Australia / Pacific
  { group: "Australia & Pacific", value: "Australia/Sydney",     label: "Sydney (AEST/AEDT)" },
  { group: "Australia & Pacific", value: "Australia/Melbourne",  label: "Melbourne (AEST/AEDT)" },
  { group: "Australia & Pacific", value: "Australia/Brisbane",   label: "Brisbane (AEST)" },
  { group: "Australia & Pacific", value: "Australia/Adelaide",   label: "Adelaide (ACST/ACDT)" },
  { group: "Australia & Pacific", value: "Australia/Perth",      label: "Perth (AWST)" },
  { group: "Australia & Pacific", value: "Australia/Hobart",     label: "Hobart (AEST/AEDT)" },
  { group: "Australia & Pacific", value: "Australia/Darwin",     label: "Darwin (ACST)" },
  { group: "Australia & Pacific", value: "Pacific/Auckland",     label: "Auckland (NZST/NZDT)" },
  { group: "Australia & Pacific", value: "Pacific/Fiji",         label: "Fiji" },
  { group: "Australia & Pacific", value: "Pacific/Port_Moresby", label: "Port Moresby" },

  // Asia
  { group: "Asia",           value: "Asia/Kathmandu",   label: "Kathmandu (NPT)" },
  { group: "Asia",           value: "Asia/Kolkata",     label: "India (IST)" },
  { group: "Asia",           value: "Asia/Dhaka",       label: "Dhaka" },
  { group: "Asia",           value: "Asia/Bangkok",     label: "Bangkok / Jakarta" },
  { group: "Asia",           value: "Asia/Singapore",   label: "Singapore / Kuala Lumpur" },
  { group: "Asia",           value: "Asia/Manila",      label: "Manila" },
  { group: "Asia",           value: "Asia/Hong_Kong",   label: "Hong Kong" },
  { group: "Asia",           value: "Asia/Shanghai",    label: "Shanghai / Beijing" },
  { group: "Asia",           value: "Asia/Tokyo",       label: "Tokyo (JST)" },
  { group: "Asia",           value: "Asia/Seoul",       label: "Seoul (KST)" },
  { group: "Asia",           value: "Asia/Dubai",       label: "Dubai" },
  { group: "Asia",           value: "Asia/Riyadh",      label: "Riyadh" },
  { group: "Asia",           value: "Asia/Karachi",     label: "Karachi" },

  // Europe
  { group: "Europe",         value: "Europe/London",    label: "London (GMT/BST)" },
  { group: "Europe",         value: "Europe/Dublin",    label: "Dublin" },
  { group: "Europe",         value: "Europe/Paris",     label: "Paris" },
  { group: "Europe",         value: "Europe/Berlin",    label: "Berlin / Amsterdam" },
  { group: "Europe",         value: "Europe/Madrid",    label: "Madrid" },
  { group: "Europe",         value: "Europe/Rome",      label: "Rome" },
  { group: "Europe",         value: "Europe/Stockholm", label: "Stockholm / Oslo" },
  { group: "Europe",         value: "Europe/Athens",    label: "Athens" },
  { group: "Europe",         value: "Europe/Istanbul",  label: "Istanbul" },
  { group: "Europe",         value: "Europe/Moscow",    label: "Moscow" },

  // Africa
  { group: "Africa",         value: "Africa/Johannesburg", label: "Johannesburg" },
  { group: "Africa",         value: "Africa/Nairobi",      label: "Nairobi" },
  { group: "Africa",         value: "Africa/Lagos",        label: "Lagos" },
  { group: "Africa",         value: "Africa/Cairo",        label: "Cairo" },
  { group: "Africa",         value: "Africa/Casablanca",   label: "Casablanca" },

  // Americas
  { group: "Americas",       value: "America/New_York",    label: "New York (ET)" },
  { group: "Americas",       value: "America/Chicago",     label: "Chicago (CT)" },
  { group: "Americas",       value: "America/Denver",      label: "Denver (MT)" },
  { group: "Americas",       value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { group: "Americas",       value: "America/Anchorage",   label: "Anchorage" },
  { group: "Americas",       value: "Pacific/Honolulu",    label: "Honolulu" },
  { group: "Americas",       value: "America/Toronto",     label: "Toronto" },
  { group: "Americas",       value: "America/Vancouver",   label: "Vancouver" },
  { group: "Americas",       value: "America/Mexico_City", label: "Mexico City" },
  { group: "Americas",       value: "America/Sao_Paulo",   label: "São Paulo" },
  { group: "Americas",       value: "America/Buenos_Aires", label: "Buenos Aires" },
  { group: "Americas",       value: "America/Bogota",      label: "Bogotá / Lima" },

  // UTC
  { group: "UTC",            value: "UTC",                 label: "UTC" },
];

export const TIMEZONE_GROUPS: string[] = Array.from(
  new Set(TIMEZONES.map((t) => t.group)),
);

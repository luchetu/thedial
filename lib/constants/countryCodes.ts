import worldCountries from "world-countries";

const buildPhoneCode = (country: (typeof worldCountries)[number]) => {
  const root = country.idd?.root;
  const suffixes = country.idd?.suffixes;
  if (!root) return undefined;
  if (!suffixes || suffixes.length === 0) {
    return root;
  }
  return `${root}${suffixes[0]}`;
};

const toFlag = (code: string) => {
  if (!code || code.length !== 2) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((char) => base + char.charCodeAt(0) - 65)
  );
};

export const countryCodes = worldCountries
  .filter((country) => country.cca2 && country.cca2.length === 2)
  .map((country) => ({
    code: country.cca2.toUpperCase(),
    name: country.name.common,
    phoneCode: buildPhoneCode(country),
    flag: toFlag(country.cca2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

declare module "world-countries" {
  interface OfficialAndCommon {
    common: string;
    official: string;
  }

  interface CountryName extends OfficialAndCommon {
    native: Record<string, OfficialAndCommon>;
  }

  interface Currency {
    name: string;
    symbol: string;
  }

  interface IntlDirectDialingCode {
    root: string;
    suffixes: string[];
  }

  interface Demonyms {
    f: string;
    m: string;
  }

  export interface Country {
    name: CountryName;
    tld: string[];
    cca2: string;
    ccn3: string;
    cca3: string;
    cioc: string;
    independent: boolean;
    status: string;
    currencies: Record<string, Currency>;
    idd: IntlDirectDialingCode;
    capital: string[];
    altSpellings: string[];
    region: string;
    subregion: string;
    languages: Record<string, string>;
    translations: Record<string, OfficialAndCommon>;
    latlng: [number, number];
    demonyms: Record<string, Demonyms | undefined>;
    landlocked: boolean;
    borders: string[];
    area: number;
    flag: string;
  }

  export type Countries = Country[];

  const countries: Countries;
  export default countries;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

function buildCountry(name: string, code: string, dialCode: string): Country {
  return {
    name,
    code,
    dialCode,
    flag: `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`,
  };
}

export const COUNTRIES: Country[] = [
  // Afrique de l'Ouest (Union du Fleuve Mano)
  buildCountry('Guinee', 'GN', '+224'),
  buildCountry('Sierra Leone', 'SL', '+232'),
  buildCountry('Liberia', 'LR', '+231'),
  buildCountry("Cote d'Ivoire", 'CI', '+225'),

  // Autres pays de l'Afrique de l'Ouest
  buildCountry('Senegal', 'SN', '+221'),
  buildCountry('Mali', 'ML', '+223'),
  buildCountry('Burkina Faso', 'BF', '+226'),
  buildCountry('Niger', 'NE', '+227'),
  buildCountry('Togo', 'TG', '+228'),
  buildCountry('Benin', 'BJ', '+229'),
  buildCountry('Ghana', 'GH', '+233'),
  buildCountry('Nigeria', 'NG', '+234'),
  buildCountry('Gambie', 'GM', '+220'),
  buildCountry('Guinee-Bissau', 'GW', '+245'),
  buildCountry('Cap-Vert', 'CV', '+238'),
  buildCountry('Mauritanie', 'MR', '+222'),

  // Europe
  buildCountry('France', 'FR', '+33'),
  buildCountry('Belgique', 'BE', '+32'),
  buildCountry('Suisse', 'CH', '+41'),
  buildCountry('Luxembourg', 'LU', '+352'),

  // Amerique du Nord
  buildCountry('Canada', 'CA', '+1'),
  buildCountry('Etats-Unis', 'US', '+1'),
];

export const DEFAULT_COUNTRY_CODE = 'GN';
export const DEFAULT_DIAL_CODE = '+224';

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
}

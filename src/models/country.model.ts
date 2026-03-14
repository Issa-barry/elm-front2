export interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    { code: 'GN', name: 'Guinée',            dialCode: '+224', flag: '🇬🇳' },
    { code: 'SN', name: 'Sénégal',           dialCode: '+221', flag: '🇸🇳' },
    { code: 'ML', name: 'Mali',              dialCode: '+223', flag: '🇲🇱' },
    { code: 'CI', name: "Côte d'Ivoire",     dialCode: '+225', flag: '🇨🇮' },
    { code: 'BF', name: 'Burkina Faso',      dialCode: '+226', flag: '🇧🇫' },
    { code: 'GW', name: 'Guinée-Bissau',     dialCode: '+245', flag: '🇬🇼' },
    { code: 'GQ', name: 'Guinée équatoriale',dialCode: '+240', flag: '🇬🇶' },
    { code: 'SL', name: 'Sierra Leone',      dialCode: '+232', flag: '🇸🇱' },
    { code: 'LR', name: 'Liberia',           dialCode: '+231', flag: '🇱🇷' },
    { code: 'GH', name: 'Ghana',             dialCode: '+233', flag: '🇬🇭' },
    { code: 'NG', name: 'Nigeria',           dialCode: '+234', flag: '🇳🇬' },
    { code: 'CM', name: 'Cameroun',          dialCode: '+237', flag: '🇨🇲' },
    { code: 'GA', name: 'Gabon',             dialCode: '+241', flag: '🇬🇦' },
    { code: 'CG', name: 'Congo',             dialCode: '+242', flag: '🇨🇬' },
    { code: 'CD', name: 'Congo (RDC)',        dialCode: '+243', flag: '🇨🇩' },
    { code: 'MR', name: 'Mauritanie',        dialCode: '+222', flag: '🇲🇷' },
    { code: 'GM', name: 'Gambie',            dialCode: '+220', flag: '🇬🇲' },
    { code: 'TG', name: 'Togo',              dialCode: '+228', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin',             dialCode: '+229', flag: '🇧🇯' },
    { code: 'NE', name: 'Niger',             dialCode: '+227', flag: '🇳🇪' },
    { code: 'MA', name: 'Maroc',             dialCode: '+212', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algérie',           dialCode: '+213', flag: '🇩🇿' },
    { code: 'TN', name: 'Tunisie',           dialCode: '+216', flag: '🇹🇳' },
    { code: 'FR', name: 'France',            dialCode: '+33',  flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique',          dialCode: '+32',  flag: '🇧🇪' },
    { code: 'US', name: 'États-Unis',        dialCode: '+1',   flag: '🇺🇸' },
];

export type AppLocale = "en" | "pt-BR";
export type AppTheme = "dark" | "light";

type UiText = {
  languageLabel: string;
  themeLabel: string;
  themeDark: string;
  themeLight: string;
  tutorialBadge: string;
  title: string;
  subtitle: string;
  statusConnected: string;
  statusOffline: string;
  statusNoBackend: string;
  statusMode: string;
  modeStrict: string;
  modeAdvanced: string;
  inputTitle: string;
  outputTitle: string;
  bip39ModeLabel: string;
  standardLabel: string;
  networkLabel: string;
  wordsLabel: string;
  wordsSuffix: string;
  pbkdf2Label: string;
  pbkdf2Warning: string;
  mnemonicLabel: string;
  mnemonicPlaceholder: string;
  passphraseLabel: string;
  accountLabel: string;
  changeLabel: string;
  addressCountLabel: string;
  generateButton: string;
  deriveButton: string;
  clearButton: string;
  mnemonicStatusLabel: string;
  mnemonicStatusEmpty: string;
  mnemonicStatusValid: string;
  mnemonicStatusInvalid: string;
  showSecrets: string;
  outputHint: string;
  standardInfoLabel: string;
  addressRowsLabel: string;
  tablePath: string;
  tableType: string;
  tableAddress: string;
  tablePublicKey: string;
  tablePrivateKey: string;
  tableInternalKey: string;
  footer: string;
  strictOption: string;
  advancedOption: string;
  networkMainnet: string;
  networkTestnet: string;
  notAvailable: string;
  fallbackGenerateError: string;
  fallbackDeriveError: string;
};

export const SUPPORTED_LOCALES: readonly AppLocale[] = ["en", "pt-BR"] as const;

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  "pt-BR": "Português (Brasil)",
};

const TEXTS: Record<AppLocale, UiText> = {
  en: {
    languageLabel: "Language",
    themeLabel: "Theme",
    themeDark: "Dark",
    themeLight: "Light",
    tutorialBadge: "Tutorial + Tool • BIP39/BIP84/BIP86",
    title: "TypeScript Wallet Playground",
    subtitle:
      "Roadmap evolution implemented with modern standards: BIP86 (Taproot/Bech32m), robust derivation path validation, and strict BIP39 mode by default.",
    statusConnected: "Connected",
    statusOffline: "Offline",
    statusNoBackend: "No seed/private key sent to backend",
    statusMode: "Mode",
    modeStrict: "Strict",
    modeAdvanced: "Advanced",
    inputTitle: "Input",
    outputTitle: "Output",
    bip39ModeLabel: "BIP39 mode",
    standardLabel: "Standard",
    networkLabel: "Network",
    wordsLabel: "Word count",
    wordsSuffix: "words",
    pbkdf2Label: "PBKDF2 rounds",
    pbkdf2Warning:
      "Reduced compatibility: standard BIP39 wallets use exactly 2048 rounds.",
    mnemonicLabel: "Mnemonic (English wordlist)",
    mnemonicPlaceholder: "abandon abandon abandon ...",
    passphraseLabel: "Passphrase (optional)",
    accountLabel: "Account",
    changeLabel: "Change",
    addressCountLabel: "Addresses",
    generateButton: "Generate mnemonic",
    deriveButton: "Derive wallet",
    clearButton: "Clear sensitive data",
    mnemonicStatusLabel: "Mnemonic status:",
    mnemonicStatusEmpty: "no data",
    mnemonicStatusValid: "valid",
    mnemonicStatusInvalid: "invalid",
    showSecrets: "Show seed/private keys",
    outputHint: "Generate or enter a valid mnemonic and click Derive wallet.",
    standardInfoLabel: "Standard",
    addressRowsLabel: "Derived addresses",
    tablePath: "Path",
    tableType: "Type",
    tableAddress: "Address",
    tablePublicKey: "Public Key",
    tablePrivateKey: "Private Key",
    tableInternalKey: "Internal Key",
    footer:
      "Local/offline operation: build the app and serve it with a local static server. For real funds, use an isolated environment and verify artifact checksums.",
    strictOption: "Strict (recommended)",
    advancedOption: "Advanced",
    networkMainnet: "Bitcoin Mainnet",
    networkTestnet: "Bitcoin Testnet",
    notAvailable: "N/A",
    fallbackGenerateError: "Failed to generate mnemonic.",
    fallbackDeriveError: "Wallet derivation failed.",
  },
  "pt-BR": {
    languageLabel: "Idioma",
    themeLabel: "Tema",
    themeDark: "Escuro",
    themeLight: "Claro",
    tutorialBadge: "Tutorial + Ferramenta • BIP39/BIP84/BIP86",
    title: "Wallet Playground em TypeScript",
    subtitle:
      "Evolução do roadmap implementada com foco em padrões modernos: BIP86 (Taproot/Bech32m), validação robusta de derivation path e modo estrito BIP39 por padrão.",
    statusConnected: "Conectado",
    statusOffline: "Offline",
    statusNoBackend: "Sem envio de seed/chaves para backend",
    statusMode: "Modo",
    modeStrict: "Estrito",
    modeAdvanced: "Avançado",
    inputTitle: "Entrada",
    outputTitle: "Saída",
    bip39ModeLabel: "Modo BIP39",
    standardLabel: "Padrão",
    networkLabel: "Rede",
    wordsLabel: "Quantidade de palavras",
    wordsSuffix: "palavras",
    pbkdf2Label: "PBKDF2 rounds",
    pbkdf2Warning:
      "Compatibilidade reduzida: carteiras padrão BIP39 usam exatamente 2048 rounds.",
    mnemonicLabel: "Mnemonic (wordlist em inglês)",
    mnemonicPlaceholder: "abandon abandon abandon ...",
    passphraseLabel: "Passphrase (opcional)",
    accountLabel: "Conta",
    changeLabel: "Change",
    addressCountLabel: "Endereços",
    generateButton: "Gerar mnemonic",
    deriveButton: "Derivar carteira",
    clearButton: "Limpar dados sensíveis",
    mnemonicStatusLabel: "Status da mnemonic:",
    mnemonicStatusEmpty: "sem dados",
    mnemonicStatusValid: "válida",
    mnemonicStatusInvalid: "inválida",
    showSecrets: "Exibir seed/chaves privadas",
    outputHint:
      "Gere ou informe uma mnemonic válida e clique em Derivar carteira.",
    standardInfoLabel: "Padrão",
    addressRowsLabel: "Endereços derivados",
    tablePath: "Path",
    tableType: "Tipo",
    tableAddress: "Address",
    tablePublicKey: "Public Key",
    tablePrivateKey: "Private Key",
    tableInternalKey: "Internal Key",
    footer:
      "Operação local/offline: execute o build e rode com servidor estático local. Para valores reais, use ambiente isolado e valide checksums do artefato.",
    strictOption: "Estrito (recomendado)",
    advancedOption: "Avançado",
    networkMainnet: "Bitcoin Mainnet",
    networkTestnet: "Bitcoin Testnet",
    notAvailable: "N/A",
    fallbackGenerateError: "Falha ao gerar mnemonic.",
    fallbackDeriveError: "Falha de derivação de carteira.",
  },
};

const EN_ERROR_RULES: Array<{
  pattern: RegExp;
  transform: (...groups: string[]) => string;
}> = [
  {
    pattern: /^Quantidade de palavras inválida para modo (strict|advanced): (\d+)\.$/,
    transform: (mode, words) => `Invalid word count for ${mode} mode: ${words}.`,
  },
  {
    pattern: /^Mnemonic vazia\.$/,
    transform: () => "Mnemonic is empty.",
  },
  {
    pattern: /^Modo estrito aceita apenas 12, 15, 18, 21 ou 24 palavras\.$/,
    transform: () => "Strict mode only accepts 12, 15, 18, 21, or 24 words.",
  },
  {
    pattern: /^Modo avançado aceita apenas 12, 15, 18, 21 ou 24 palavras\.$/,
    transform: () => "Advanced mode only accepts 12, 15, 18, 21, or 24 words.",
  },
  {
    pattern: /^Mnemonic inválida para a wordlist inglesa BIP39\.$/,
    transform: () => "Invalid mnemonic for the BIP39 English wordlist.",
  },
  {
    pattern: /^Mnemonic inválida\.$/,
    transform: () => "Invalid mnemonic.",
  },
  {
    pattern: /^Modo estrito exige PBKDF2 fixo em 2048 rounds\.$/,
    transform: () => "Strict mode requires PBKDF2 fixed at 2048 rounds.",
  },
  {
    pattern: /^Falha ao derivar chave pública para (.+)\.$/,
    transform: (path) => `Failed to derive public key for ${path}.`,
  },
  {
    pattern: /^Falha ao derivar chave privada para (.+)\.$/,
    transform: (path) => `Failed to derive private key for ${path}.`,
  },
  {
    pattern: /^Tweak Taproot inválido \(chave nula\)\.$/,
    transform: () => "Invalid Taproot tweak (null key).",
  },
  {
    pattern: /^PBKDF2 rounds deve ser um número válido\.$/,
    transform: () => "PBKDF2 rounds must be a valid number.",
  },
  {
    pattern: /^PBKDF2 rounds deve ser >= 1\.$/,
    transform: () => "PBKDF2 rounds must be >= 1.",
  },
  {
    pattern: /^Caminho de derivação vazio\.$/,
    transform: () => "Derivation path is empty.",
  },
  {
    pattern: /^Primeiro caractere do caminho deve ser 'm'\.$/,
    transform: () => "First derivation path character must be 'm'.",
  },
  {
    pattern: /^Separador inválido após 'm'\. Use '\/'\.$/,
    transform: () => "Invalid separator after 'm'. Use '/'.",
  },
  {
    pattern: /^Profundidade (\d+) excede o máximo (\d+)\.$/,
    transform: (depth, maxDepth) =>
      `Depth ${depth} exceeds the maximum allowed ${maxDepth}.`,
  },
  {
    pattern: /^Segmento inválido na profundidade (\d+): "(.+)"\.$/,
    transform: (depth, segment) => `Invalid segment at depth ${depth}: "${segment}".`,
  },
  {
    pattern: /^Número ausente na profundidade (\d+)\.$/,
    transform: (depth) => `Missing number at depth ${depth}.`,
  },
  {
    pattern:
      /^Número fora do intervalo seguro em profundidade (\d+): (.+)\.$/,
    transform: (depth, value) =>
      `Number outside safe integer range at depth ${depth}: ${value}.`,
  },
  {
    pattern: /^Índice (\d+) inválido em profundidade (\d+)\. Use 0\.\.(\d+)\.$/,
    transform: (value, depth, max) =>
      `Invalid index ${value} at depth ${depth}. Use 0..${max}.`,
  },
  {
    pattern: /^Caminho hardened é inválido ao derivar a partir de xpub\.$/,
    transform: () => "Hardened path is invalid when deriving from xpub.",
  },
];

export function detectInitialLocale(): AppLocale {
  if (typeof navigator === "undefined") {
    return "en";
  }
  return navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function detectInitialTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function getUiText(locale: AppLocale): UiText {
  return TEXTS[locale];
}

export function translateCoreError(errorMessage: string, locale: AppLocale): string {
  if (locale === "pt-BR") {
    return errorMessage;
  }

  for (const rule of EN_ERROR_RULES) {
    const match = errorMessage.match(rule.pattern);
    if (match) {
      return rule.transform(...match.slice(1));
    }
  }
  return errorMessage;
}

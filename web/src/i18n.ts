export type AppLocale = "en" | "pt-BR";
export type AppTheme = "dark" | "light";

type UiText = {
  languageLabel: string;
  themeLabel: string;
  themeDark: string;
  themeLight: string;
  manual1248Button: string;
  downloadOfflineHtmlButton: string;
  downloadOfflineHtmlSuccessPrefix: string;
  downloadOfflineHtmlError: string;
  downloadOfflineHtmlDevModeHint: string;
  manual1248Title: string;
  manual1248Description: string;
  manual1248AccessHint: string;
  manual1248Close: string;
  tabsTool: string;
  tabsTheory: string;
  tabsTechnical: string;
  tabsMath: string;
  tabsBestPractices: string;
  constructionBadge: string;
  constructionTitle: string;
  constructionDescription: string;
  proposalDocLabel: string;
  theoryPlaceholder: string;
  technicalPlaceholder: string;
  mathPlaceholder: string;
  bestPracticesPlaceholder: string;
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
  mnemonicSectionTitle: string;
  derivationPathSectionTitle: string;
  derivedAddressesSectionTitle: string;
  bip39ModeLabel: string;
  sourceLabel: string;
  sourceMnemonic: string;
  sourceExtended: string;
  extendedKeyLabel: string;
  extendedKeyPlaceholder: string;
  rootKeyHint: string;
  mnemonicLanguageLabel: string;
  standardLabel: string;
  standardBip44: string;
  standardBip49: string;
  standardBip84: string;
  standardBip86: string;
  standardCustom: string;
  customPathLabel: string;
  customPathPlaceholder: string;
  customAddressTypeLabel: string;
  addressTypeP2pkh: string;
  addressTypeP2shP2wpkh: string;
  addressTypeP2wpkh: string;
  addressTypeP2tr: string;
  networkLabel: string;
  wordsLabel: string;
  wordsSuffix: string;
  wordCountLockedByEntropyHint: string;
  showEntropyDetailsLabel: string;
  entropyWarningText: string;
  entropyInputLabel: string;
  entropyValidValuesTitle: string;
  entropyTypeBinary: string;
  entropyTypeBase6: string;
  entropyTypeDice: string;
  entropyTypeBase10: string;
  entropyTypeHex: string;
  entropyTypeCard: string;
  entropyTypeBinaryTip: string;
  entropyTypeBase6Tip: string;
  entropyTypeDiceTip: string;
  entropyTypeBase10Tip: string;
  entropyTypeHexTip: string;
  entropyTypeCardTip: string;
  entropyAutoComputeLabel: string;
  entropyDetailsTitle: string;
  showBip85Label: string;
  bip85SectionTitle: string;
  bip85WarningLabel: string;
  bip85WarningText: string;
  bip85NotUsedText: string;
  bip85ReuseText: string;
  bip85ReadSpecPrefix: string;
  bip85SpecLinkLabel: string;
  bip85ApplicationLabel: string;
  bip85ApplicationBip39: string;
  bip85ApplicationWif: string;
  bip85ApplicationXprv: string;
  bip85ApplicationHex: string;
  bip85LanguageLabel: string;
  bip85WordCountLabel: string;
  bip85BytesLabel: string;
  bip85IndexLabel: string;
  bip85ChildKeyLabel: string;
  bip85ChildKeyPlaceholder: string;
  bip85PathLabel: string;
  bip85ResultHint: string;
  entropyTypeLabel: string;
  entropyFilteredLabel: string;
  entropyEventCountLabel: string;
  entropyAvgBitsPerEventLabel: string;
  entropyBitsLabel: string;
  checksumBitsLabel: string;
  totalBitsLabel: string;
  entropyHexLabel: string;
  entropyRawBinaryLabel: string;
  entropyBinaryChecksumLabel: string;
  entropyWordIndexesLabel: string;
  entropyTimeToCrackLabel: string;
  entropyRawEntropyWordsLabel: string;
  entropyInputBitsLabel: string;
  entropyMnemonicLengthLabel: string;
  entropyMnemonicLengthRawOption: string;
  entropyKeyspaceLabel: string;
  randomnessSourceLabel: string;
  randomnessSourceWebCrypto: string;
  randomnessSourceManual: string;
  entropyPreviewHint: string;
  entropyDetailsHint: string;
  entropyMnemonicCorrectedHint: string;
  pbkdf2Label: string;
  pbkdf2Warning: string;
  mnemonicLabel: string;
  mnemonicPlaceholder: string;
  mnemonicLockedByEntropyHint: string;
  splitMnemonicLabel: string;
  showSplitMnemonicCardsLabel: string;
  splitMnemonicHackTimeLabel: string;
  splitMnemonicLessThanSecond: string;
  splitMnemonicSeconds: string;
  splitMnemonicDays: string;
  splitMnemonicYears: string;
  passphraseLabel: string;
  bip39SeedLabel: string;
  coinLabel: string;
  coinBitcoinOption: string;
  coinBitcoinTestnetOption: string;
  bip32RootKeyLabel: string;
  bip32RootKeyFormatLabel: string;
  bip32RootKeyFormatXprv: string;
  bip32RootKeyFormatYprv: string;
  bip32RootKeyFormatZprv: string;
  bip32RootKeyFormatHint: string;
  seedRootHint: string;
  accountLabel: string;
  changeLabel: string;
  startIndexLabel: string;
  hardenedAddressLabel: string;
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
  tableWif: string;
  tableInternalKey: string;
  sourceInfoLabel: string;
  sourceInfoSeed: string;
  sourceInfoExtendedKey: string;
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
    manual1248Button: "Manual 1248",
    downloadOfflineHtmlButton: "Download offline HTML",
    downloadOfflineHtmlSuccessPrefix: "Offline file generated:",
    downloadOfflineHtmlError: "Failed to generate offline HTML.",
    downloadOfflineHtmlDevModeHint:
      "Offline export from dev mode is not supported. Run a production build and use preview/deployed app.",
    manual1248Title: "Method 1248 Secure Storage Manual",
    manual1248Description:
      "This section is intentionally separate from the tutorial tabs and will explain the 1248 method for secure key storage.",
    manual1248AccessHint:
      "Current status: page under construction. A proposal document is already available for review.",
    manual1248Close: "Close",
    tabsTool: "Wallet Tool",
    tabsTheory: "Theoretical Concepts",
    tabsTechnical: "Technical Concepts",
    tabsMath: "Mathematical Concepts",
    tabsBestPractices: "Bitcoin Best Practices",
    constructionBadge: "Under Construction",
    constructionTitle: "This tutorial page is in preparation",
    constructionDescription:
      "The content architecture is being designed first to keep the final material technically correct and didactically useful.",
    proposalDocLabel: "Proposal document",
    theoryPlaceholder:
      "Planned focus: Bitcoin mental models, trust minimization, custody models, and conceptual foundations.",
    technicalPlaceholder:
      "Planned focus: BIP standards, derivation paths, address formats, interoperability, and implementation details.",
    mathPlaceholder:
      "Planned focus: entropy, checksum intuition, hash functions, key-space reasoning, and risk quantification basics.",
    bestPracticesPlaceholder:
      "Planned focus: operational security, backup hygiene, device isolation, recovery drills, and common failure patterns.",
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
    mnemonicSectionTitle: "Mnemonic",
    derivationPathSectionTitle: "Derivation Path",
    derivedAddressesSectionTitle: "Derived Addresses",
    bip39ModeLabel: "BIP39 mode",
    sourceLabel: "Derivation source",
    sourceMnemonic: "Mnemonic + passphrase",
    sourceExtended: "Extended key (xprv/xpub/ypub/zpub...)",
    extendedKeyLabel: "Extended key",
    extendedKeyPlaceholder: "xprv... / xpub... / ypub... / zpub...",
    rootKeyHint:
      "Use this mode to derive addresses from an account-level extended key without typing the mnemonic.",
    mnemonicLanguageLabel: "Mnemonic language",
    standardLabel: "Standard",
    standardBip44: "BIP44 (Legacy P2PKH)",
    standardBip49: "BIP49 (Nested SegWit P2SH-P2WPKH)",
    standardBip84: "BIP84 (Native SegWit P2WPKH)",
    standardBip86: "BIP86 (Taproot P2TR)",
    standardCustom: "Custom path (BIP32/BIP141-style)",
    customPathLabel: "Custom derivation path",
    customPathPlaceholder: "m/84'/0'/0'",
    customAddressTypeLabel: "Address type for custom path",
    addressTypeP2pkh: "Legacy P2PKH (1... / m...)",
    addressTypeP2shP2wpkh: "Nested SegWit P2SH-P2WPKH (3... / 2...)",
    addressTypeP2wpkh: "Native SegWit P2WPKH (bc1q... / tb1q...)",
    addressTypeP2tr: "Taproot P2TR (bc1p... / tb1p...)",
    networkLabel: "Network",
    wordsLabel: "Word count",
    wordsSuffix: "words",
    wordCountLockedByEntropyHint:
      "Word count is controlled by entropy while entropy details are enabled.",
    showEntropyDetailsLabel: "Show entropy details",
    entropyWarningText:
      "Entropy is an advanced feature. Use only if you understand the security impact.",
    entropyInputLabel: "Entropy",
    entropyValidValuesTitle: "Valid entropy values include:",
    entropyTypeBinary: "Binary [0-1]",
    entropyTypeBase6: "Base 6 [0-5]",
    entropyTypeDice: "Dice [1-6]",
    entropyTypeBase10: "Base 10 [0-9]",
    entropyTypeHex: "Hex [0-9A-F]",
    entropyTypeCard: "Card [A2-9TJQK][CDHS]",
    entropyTypeBinaryTip: "Use only 0 and 1 (for example, coin flips).",
    entropyTypeBase6Tip: "Use digits 0-5 from a base-6 source.",
    entropyTypeDiceTip: "Use real dice rolls 1-6, one value per roll.",
    entropyTypeBase10Tip: "Use decimal digits 0-9 from random events.",
    entropyTypeHexTip: "Use hexadecimal symbols 0-9 and A-F.",
    entropyTypeCardTip: "Use playing cards like AH QS 9D TC.",
    entropyAutoComputeLabel: "Auto compute from entropy input",
    entropyDetailsTitle: "Randomness details",
    showBip85Label: "Show BIP85",
    bip85SectionTitle: "BIP85",
    bip85WarningLabel: "Warning",
    bip85WarningText:
      "This is an advanced feature and should only be used if you understand what it does.",
    bip85NotUsedText:
      "The value of the BIP85 child key shown below is not used elsewhere on this page. It can be used as a new key.",
    bip85ReuseText:
      "For BIP39 usage, you can paste it into the mnemonic field and use it as a new mnemonic.",
    bip85ReadSpecPrefix: "Read the",
    bip85SpecLinkLabel: "BIP85 spec",
    bip85ApplicationLabel: "BIP85 Application",
    bip85ApplicationBip39: "BIP39",
    bip85ApplicationWif: "WIF",
    bip85ApplicationXprv: "Xprv",
    bip85ApplicationHex: "Hex",
    bip85LanguageLabel: "BIP85 Mnemonic Language",
    bip85WordCountLabel: "BIP85 Mnemonic Length",
    bip85BytesLabel: "BIP85 Bytes",
    bip85IndexLabel: "BIP85 Index",
    bip85ChildKeyLabel: "BIP85 Child Key",
    bip85ChildKeyPlaceholder: "Waiting for a valid mnemonic to derive BIP85 output.",
    bip85PathLabel: "BIP85 Path",
    bip85ResultHint: "Provide a valid mnemonic to display the BIP85 child key.",
    entropyTypeLabel: "Entropy type",
    entropyFilteredLabel: "Filtered entropy",
    entropyEventCountLabel: "Event count",
    entropyAvgBitsPerEventLabel: "Avg bits per event",
    entropyBitsLabel: "Entropy bits",
    checksumBitsLabel: "Checksum bits",
    totalBitsLabel: "Total mnemonic bits",
    entropyHexLabel: "Entropy (hex)",
    entropyRawBinaryLabel: "Raw binary",
    entropyBinaryChecksumLabel: "Binary checksum",
    entropyWordIndexesLabel: "Word indexes",
    entropyTimeToCrackLabel: "Time to crack",
    entropyRawEntropyWordsLabel: "Raw entropy words",
    entropyInputBitsLabel: "Total input bits",
    entropyMnemonicLengthLabel: "Mnemonic length",
    entropyMnemonicLengthRawOption: "Use raw entropy (3 words per 32 bits)",
    entropyKeyspaceLabel: "Approximate keyspace",
    randomnessSourceLabel: "Randomness source",
    randomnessSourceWebCrypto: "Web Crypto API",
    randomnessSourceManual: "User-provided mnemonic (source unknown)",
    entropyPreviewHint:
      "Values update live from entropy input. Add at least 128 bits to generate a mnemonic in automatic length mode.",
    entropyDetailsHint: "Enter a valid mnemonic to display entropy and checksum details.",
    entropyMnemonicCorrectedHint:
      "Checksum-adjusted mnemonic from entered words:",
    pbkdf2Label: "PBKDF2 rounds",
    pbkdf2Warning:
      "Reduced compatibility: standard BIP39 wallets use exactly 2048 rounds.",
    mnemonicLabel: "Mnemonic (English wordlist)",
    mnemonicPlaceholder: "abandon abandon abandon ...",
    mnemonicLockedByEntropyHint:
      "Mnemonic editing is disabled while entropy details are enabled. Change entropy to update derived fields.",
    splitMnemonicLabel: "BIP39 Split Mnemonic",
    showSplitMnemonicCardsLabel: "Show split mnemonic cards",
    splitMnemonicHackTimeLabel: "Time to hack with only one card:",
    splitMnemonicLessThanSecond: "<1 second",
    splitMnemonicSeconds: "seconds",
    splitMnemonicDays: "days",
    splitMnemonicYears: "years",
    passphraseLabel: "Passphrase (optional)",
    bip39SeedLabel: "BIP39 Seed",
    coinLabel: "Coin",
    coinBitcoinOption: "BTC - Bitcoin",
    coinBitcoinTestnetOption: "BTC - Bitcoin (Testnet)",
    bip32RootKeyLabel: "BIP32 Root Key",
    bip32RootKeyFormatLabel: "Format",
    bip32RootKeyFormatXprv: "xprv (BIP32)",
    bip32RootKeyFormatYprv: "yprv (BIP49)",
    bip32RootKeyFormatZprv: "zprv (BIP84)",
    bip32RootKeyFormatHint:
      "Changing the selector only switches serialization prefix (xprv/yprv/zprv). The underlying key material is the same.",
    seedRootHint: "Provide a valid mnemonic to compute BIP39 seed and BIP32 root key.",
    accountLabel: "Account",
    changeLabel: "Change",
    startIndexLabel: "Start index",
    hardenedAddressLabel: "Use hardened address indexes (advanced)",
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
    tableWif: "WIF",
    tableInternalKey: "Internal Key",
    sourceInfoLabel: "Source",
    sourceInfoSeed: "Mnemonic/Seed",
    sourceInfoExtendedKey: "Extended Key",
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
    manual1248Button: "Manual 1248",
    downloadOfflineHtmlButton: "Baixar HTML offline",
    downloadOfflineHtmlSuccessPrefix: "Arquivo offline gerado:",
    downloadOfflineHtmlError: "Falha ao gerar HTML offline.",
    downloadOfflineHtmlDevModeHint:
      "Exportação offline no modo dev não é suportada. Faça build de produção e use preview/app publicado.",
    manual1248Title: "Manual de Armazenamento Seguro Método 1248",
    manual1248Description:
      "Esta seção fica separada das tabs de tutorial e explicará o método 1248 para armazenamento seguro de chaves.",
    manual1248AccessHint:
      "Status atual: página em construção. Um documento de proposta já está disponível para revisão.",
    manual1248Close: "Fechar",
    tabsTool: "Ferramenta",
    tabsTheory: "Conceitos Teóricos",
    tabsTechnical: "Conceitos Técnicos",
    tabsMath: "Conceitos Matemáticos",
    tabsBestPractices: "Boas Práticas Bitcoin",
    constructionBadge: "Em Construção",
    constructionTitle: "Esta página de tutorial está em preparação",
    constructionDescription:
      "A arquitetura do conteúdo está sendo desenhada primeiro para manter o material final tecnicamente correto e didático.",
    proposalDocLabel: "Documento de proposta",
    theoryPlaceholder:
      "Foco planejado: modelos mentais do Bitcoin, minimização de confiança, modelos de custódia e fundamentos conceituais.",
    technicalPlaceholder:
      "Foco planejado: padrões BIP, caminhos de derivação, formatos de endereço, interoperabilidade e detalhes de implementação.",
    mathPlaceholder:
      "Foco planejado: entropia, intuição de checksum, funções hash, espaço de chaves e noções de quantificação de risco.",
    bestPracticesPlaceholder:
      "Foco planejado: segurança operacional, higiene de backup, isolamento de dispositivos, simulações de recuperação e padrões de falha.",
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
    mnemonicSectionTitle: "Mnemônico",
    derivationPathSectionTitle: "Caminho de Derivação",
    derivedAddressesSectionTitle: "Endereços Derivados",
    bip39ModeLabel: "Modo BIP39",
    sourceLabel: "Fonte de derivação",
    sourceMnemonic: "Mnemônico + frase-senha",
    sourceExtended: "Chave estendida (xprv/xpub/ypub/zpub...)",
    extendedKeyLabel: "Chave estendida",
    extendedKeyPlaceholder: "xprv... / xpub... / ypub... / zpub...",
    rootKeyHint:
      "Use este modo para derivar endereços a partir de uma chave estendida de conta sem digitar o mnemônico.",
    mnemonicLanguageLabel: "Idioma do mnemônico",
    standardLabel: "Padrão",
    standardBip44: "BIP44 (Legado P2PKH)",
    standardBip49: "BIP49 (SegWit Encapsulado P2SH-P2WPKH)",
    standardBip84: "BIP84 (SegWit Nativo P2WPKH)",
    standardBip86: "BIP86 (Taproot P2TR)",
    standardCustom: "Caminho customizado (estilo BIP32/BIP141)",
    customPathLabel: "Caminho de derivação customizado",
    customPathPlaceholder: "m/84'/0'/0'",
    customAddressTypeLabel: "Tipo de endereço do caminho customizado",
    addressTypeP2pkh: "Legado P2PKH (1... / m...)",
    addressTypeP2shP2wpkh: "SegWit Encapsulado P2SH-P2WPKH (3... / 2...)",
    addressTypeP2wpkh: "SegWit Nativo P2WPKH (bc1q... / tb1q...)",
    addressTypeP2tr: "Taproot P2TR (bc1p... / tb1p...)",
    networkLabel: "Rede",
    wordsLabel: "Quantidade de palavras",
    wordsSuffix: "palavras",
    wordCountLockedByEntropyHint:
      "A quantidade de palavras é controlada pela entropia enquanto os detalhes de entropia estiverem ativos.",
    showEntropyDetailsLabel: "Exibir detalhes de entropia",
    entropyWarningText:
      "Entropia é um recurso avançado. Use apenas se entender o impacto de segurança.",
    entropyInputLabel: "Entropia",
    entropyValidValuesTitle: "Valores válidos de entropia incluem:",
    entropyTypeBinary: "Binário [0-1]",
    entropyTypeBase6: "Base 6 [0-5]",
    entropyTypeDice: "Dados [1-6]",
    entropyTypeBase10: "Base 10 [0-9]",
    entropyTypeHex: "Hex [0-9A-F]",
    entropyTypeCard: "Carta [A2-9TJQK][CDHS]",
    entropyTypeBinaryTip: "Use apenas 0 e 1 (por exemplo, lançamentos de moeda).",
    entropyTypeBase6Tip: "Use dígitos 0-5 de uma fonte em base 6.",
    entropyTypeDiceTip: "Use resultados reais de dado 1-6, um valor por lançamento.",
    entropyTypeBase10Tip: "Use dígitos decimais 0-9 de eventos aleatórios.",
    entropyTypeHexTip: "Use símbolos hexadecimais 0-9 e A-F.",
    entropyTypeCardTip: "Use cartas no formato AH QS 9D TC.",
    entropyAutoComputeLabel: "Auto calcular a partir da entrada de entropia",
    entropyDetailsTitle: "Detalhes de aleatoriedade",
    showBip85Label: "Exibir BIP85",
    bip85SectionTitle: "BIP85",
    bip85WarningLabel: "Aviso",
    bip85WarningText:
      "Este é um recurso avançado e só deve ser usado se você entender seu funcionamento.",
    bip85NotUsedText:
      "O valor da chave filha BIP85 exibido abaixo não é usado em outra parte desta página. Ele pode ser usado como uma nova chave.",
    bip85ReuseText:
      "Para uso com BIP39, você pode colar esse valor no campo de mnemônico e utilizá-lo como um novo mnemônico.",
    bip85ReadSpecPrefix: "Leia a",
    bip85SpecLinkLabel: "especificação BIP85",
    bip85ApplicationLabel: "Aplicação BIP85",
    bip85ApplicationBip39: "BIP39",
    bip85ApplicationWif: "WIF",
    bip85ApplicationXprv: "Xprv",
    bip85ApplicationHex: "Hex",
    bip85LanguageLabel: "Idioma do mnemônico BIP85",
    bip85WordCountLabel: "Tamanho do mnemônico BIP85",
    bip85BytesLabel: "Bytes BIP85",
    bip85IndexLabel: "Índice BIP85",
    bip85ChildKeyLabel: "Chave filha BIP85",
    bip85ChildKeyPlaceholder: "Aguardando um mnemônico válido para derivar a saída BIP85.",
    bip85PathLabel: "Caminho BIP85",
    bip85ResultHint: "Informe um mnemônico válido para exibir a chave filha BIP85.",
    entropyTypeLabel: "Tipo de entropia",
    entropyFilteredLabel: "Entropia filtrada",
    entropyEventCountLabel: "Quantidade de eventos",
    entropyAvgBitsPerEventLabel: "Média de bits por evento",
    entropyBitsLabel: "Bits de entropia",
    checksumBitsLabel: "Bits de checksum",
    totalBitsLabel: "Bits totais do mnemônico",
    entropyHexLabel: "Entropia (hex)",
    entropyRawBinaryLabel: "Binário bruto",
    entropyBinaryChecksumLabel: "Checksum binário",
    entropyWordIndexesLabel: "Índices das palavras",
    entropyTimeToCrackLabel: "Tempo para quebrar",
    entropyRawEntropyWordsLabel: "Palavras de entropia bruta",
    entropyInputBitsLabel: "Bits totais de entrada",
    entropyMnemonicLengthLabel: "Comprimento do mnemônico",
    entropyMnemonicLengthRawOption: "Usar entropia bruta (3 palavras por 32 bits)",
    entropyKeyspaceLabel: "Espaço de chaves aproximado",
    randomnessSourceLabel: "Fonte da aleatoriedade",
    randomnessSourceWebCrypto: "Web Crypto API",
    randomnessSourceManual: "Mnemônico informado pelo usuário (fonte desconhecida)",
    entropyPreviewHint:
      "Os valores são atualizados em tempo real pela entropia. Adicione pelo menos 128 bits para gerar um mnemônico no modo automático.",
    entropyDetailsHint:
      "Informe um mnemônico válido para exibir os detalhes de entropia e checksum.",
    entropyMnemonicCorrectedHint:
      "Mnemônico ajustado pelo checksum a partir das palavras informadas:",
    pbkdf2Label: "PBKDF2 rounds",
    pbkdf2Warning:
      "Compatibilidade reduzida: carteiras padrão BIP39 usam exatamente 2048 rounds.",
    mnemonicLabel: "Mnemônico (lista de palavras em inglês)",
    mnemonicPlaceholder: "abandon abandon abandon ...",
    mnemonicLockedByEntropyHint:
      "A edição do mnemônico fica desabilitada enquanto os detalhes de entropia estiverem ativos. Altere a entropia para atualizar os campos derivados.",
    splitMnemonicLabel: "Mnemônico BIP39 dividido",
    showSplitMnemonicCardsLabel: "Exibir cartões do mnemônico dividido",
    splitMnemonicHackTimeLabel: "Tempo para quebrar com apenas um cartão:",
    splitMnemonicLessThanSecond: "<1 segundo",
    splitMnemonicSeconds: "segundos",
    splitMnemonicDays: "dias",
    splitMnemonicYears: "anos",
    passphraseLabel: "Frase-senha (opcional)",
    bip39SeedLabel: "Seed BIP39",
    coinLabel: "Moeda",
    coinBitcoinOption: "BTC - Bitcoin",
    coinBitcoinTestnetOption: "BTC - Bitcoin (Testnet)",
    bip32RootKeyLabel: "Chave raiz BIP32",
    bip32RootKeyFormatLabel: "Formato",
    bip32RootKeyFormatXprv: "xprv (BIP32)",
    bip32RootKeyFormatYprv: "yprv (BIP49)",
    bip32RootKeyFormatZprv: "zprv (BIP84)",
    bip32RootKeyFormatHint:
      "Alterar a seleção muda apenas o prefixo de serialização (xprv/yprv/zprv). O material de chave subjacente é o mesmo.",
    seedRootHint: "Informe um mnemônico válido para calcular seed BIP39 e chave raiz BIP32.",
    accountLabel: "Conta",
    changeLabel: "Change",
    startIndexLabel: "Índice inicial",
    hardenedAddressLabel: "Usar índices hardened para endereços (avançado)",
    addressCountLabel: "Endereços",
    generateButton: "Gerar mnemônico",
    deriveButton: "Derivar carteira",
    clearButton: "Limpar dados sensíveis",
    mnemonicStatusLabel: "Status do mnemônico:",
    mnemonicStatusEmpty: "sem dados",
    mnemonicStatusValid: "válida",
    mnemonicStatusInvalid: "inválida",
    showSecrets: "Exibir seed/chaves privadas",
    outputHint:
      "Gere ou informe um mnemônico válido e clique em Derivar carteira.",
    standardInfoLabel: "Padrão",
    addressRowsLabel: "Endereços derivados",
    tablePath: "Path",
    tableType: "Tipo",
    tableAddress: "Address",
    tablePublicKey: "Public Key",
    tablePrivateKey: "Private Key",
    tableWif: "WIF",
    tableInternalKey: "Internal Key",
    sourceInfoLabel: "Fonte",
    sourceInfoSeed: "Mnemônico/Seed",
    sourceInfoExtendedKey: "Chave Estendida",
    footer:
      "Operação local/offline: execute o build e rode com servidor estático local. Para valores reais, use ambiente isolado e valide checksums do artefato.",
    strictOption: "Estrito (recomendado)",
    advancedOption: "Avançado",
    networkMainnet: "Bitcoin Mainnet",
    networkTestnet: "Bitcoin Testnet",
    notAvailable: "N/A",
    fallbackGenerateError: "Falha ao gerar mnemônico.",
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
    pattern: /^Mnemonic inválida para a wordlist (.+) BIP39\.$/,
    transform: (language) => `Invalid mnemonic for the BIP39 ${language} wordlist.`,
  },
  {
    pattern: /^Mnemonic inválida\.$/,
    transform: () => "Invalid mnemonic.",
  },
  {
    pattern: /^Wordlist BIP39 não suportada: (.+)\.$/,
    transform: (language) => `Unsupported BIP39 wordlist: ${language}.`,
  },
  {
    pattern: /^Web Crypto API indisponível para geração segura\.$/,
    transform: () => "Web Crypto API is unavailable for secure generation.",
  },
  {
    pattern: /^Modo estrito exige PBKDF2 fixo em 2048 rounds\.$/,
    transform: () => "Strict mode requires PBKDF2 fixed at 2048 rounds.",
  },
  {
    pattern: /^Entropia vazia\.$/,
    transform: () => "Entropy is empty.",
  },
  {
    pattern: /^Entropia insuficiente para (\d+) palavras\. Necessário >= (\d+) bits\.$/,
    transform: (words, bits) => `Insufficient entropy for ${words} words. Required >= ${bits} bits.`,
  },
  {
    pattern: /^Entropia insuficiente para mnemônico automático\. Necessário >= 128 bits\.$/,
    transform: () => "Insufficient entropy for automatic mnemonic length. Required >= 128 bits.",
  },
  {
    pattern: /^Conjunto de palavras inválido para análise de entropia\. Use múltiplos de 3\.$/,
    transform: () => "Invalid word set for entropy analysis. Use a multiple of 3 words.",
  },
  {
    pattern: /^Formato de cartas inválido\.$/,
    transform: () => "Invalid card format.",
  },
  {
    pattern: /^Entropia contém símbolo inválido para a base selecionada\.$/,
    transform: () => "Entropy contains invalid symbol for selected base.",
  },
  {
    pattern: /^Falha ao converter índice da mnemonic: (\d+)\.$/,
    transform: (index) => `Failed to convert mnemonic index: ${index}.`,
  },
  {
    pattern: /^Informe apenas um entre seedHex e extendedKey\.$/,
    transform: () => "Provide only one of seedHex or extendedKey.",
  },
  {
    pattern: /^Pelo menos um entre seedHex ou extendedKey deve ser informado\.$/,
    transform: () => "At least one of seedHex or extendedKey must be provided.",
  },
  {
    pattern: /^Chave estendida inválida ou versão não suportada\.$/,
    transform: () => "Invalid extended key or unsupported version.",
  },
  {
    pattern:
      /^A chave estendida informada pertence à rede (mainnet|testnet), mas a rede selecionada foi (mainnet|testnet)\.$/,
    transform: (sourceNetwork, selectedNetwork) =>
      `The provided extended key belongs to ${sourceNetwork}, but selected network is ${selectedNetwork}.`,
  },
  {
    pattern: /^Modo custom exige customAddressType\.$/,
    transform: () => "Custom mode requires a customAddressType.",
  },
  {
    pattern: /^Falha ao derivar chave pública para (.+)\.$/,
    transform: (path) => `Failed to derive public key for ${path}.`,
  },
  {
    pattern: /^Falha ao derivar material de chave Taproot\.$/,
    transform: () => "Failed to derive Taproot key material.",
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
    pattern: /^BIP85 exige índice inteiro >= 0\.$/,
    transform: () => "BIP85 requires an integer index >= 0.",
  },
  {
    pattern: /^BIP85 índice máximo é 2147483647\.$/,
    transform: () => "BIP85 maximum index is 2147483647.",
  },
  {
    pattern: /^BIP85 bytes deve ser um inteiro entre 16 e 64\.$/,
    transform: () => "BIP85 bytes must be an integer between 16 and 64.",
  },
  {
    pattern: /^Falha ao derivar chave privada BIP85\.$/,
    transform: () => "Failed to derive BIP85 private key.",
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

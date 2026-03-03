import { useEffect, useMemo, useRef, useState } from "react";
import {
  ADVANCED_WORD_COUNTS,
  deriveBip85FromSeed,
  computeMnemonicFromEntropyInput,
  ENTROPY_INPUT_TYPES,
  STRICT_WORD_COUNTS,
  deriveBip32RootKeyFromSeed,
  deriveWallet,
  generateMnemonicWithDetails,
  getMnemonicEntropyReport,
  mnemonicToSeedHex,
  previewEntropyInput,
  recoverMnemonicEntropy,
  sanitizeMnemonicInput,
  splitMnemonicIntoCards,
  SUPPORTED_MNEMONIC_LANGUAGES,
  type AddressType,
  type BIP32RootKeyFormat,
  type BIP85Application,
  type BIP39Mode,
  type BitcoinNetwork,
  type DerivationStandard,
  type DerivedWallet,
  type EntropyComputationResult,
  type EntropyInputType,
  type EntropyMnemonicLengthMode,
  type MnemonicRandomnessSource,
  type MnemonicLanguage,
  type SupportedWordCount,
  type TimeToCrackUnit,
  validateMnemonicByLanguage,
} from "./core/btc";
import {
  detectInitialTheme,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  detectInitialLocale,
  getUiText,
  translateCoreError,
  type AppLocale,
  type AppTheme,
} from "./i18n";

const ROW_OPTIONS = [5, 10, 20, 50] as const;
const UI_ERROR_GENERATE = "__UI_ERROR_GENERATE__";
const UI_ERROR_DERIVE = "__UI_ERROR_DERIVE__";
const MANUAL_1248_PROPOSAL_DOC = "manual-proposal-method-1248-key-storage.md";
const DEV_MODE_OFFLINE_EXPORT_ERROR = "__DEV_MODE_OFFLINE_EXPORT_ERROR__";

type AppTab = "tool" | "theory" | "technical" | "math" | "bestPractices";
type DerivationSourceMode = "mnemonic" | "extendedKey";

const TUTORIAL_PROPOSAL_DOCS: Record<Exclude<AppTab, "tool">, string> = {
  theory: "tutorial-proposal-theoretical-concepts.md",
  technical: "tutorial-proposal-technical-concepts.md",
  math: "tutorial-proposal-mathematical-concepts.md",
  bestPractices: "tutorial-proposal-bitcoin-best-practices.md",
};

const MNEMONIC_LANGUAGE_LABELS: Record<MnemonicLanguage, string> = {
  english: "English",
  portuguese: "Português",
  chinese_simplified: "简体中文",
  chinese_traditional: "繁體中文",
  czech: "Čeština",
  french: "Français",
  italian: "Italiano",
  japanese: "日本語",
  korean: "한국어",
  spanish: "Español",
};

const MNEMONIC_LANGUAGE_SELECTION_ORDER: readonly MnemonicLanguage[] = [
  "english",
  "portuguese",
  ...SUPPORTED_MNEMONIC_LANGUAGES.filter(
    (language) => language !== "english" && language !== "portuguese",
  ),
];

const ENTROPY_TYPE_EXAMPLES: Record<EntropyInputType, string> = {
  binary: "101010011",
  base6: "123434014",
  dice: "62535634",
  base10: "90834528",
  hex: "4187a8bfd9",
  card: "ahqs9dtc",
};

const PBKDF2_ROUND_OPTIONS = [2048, 4096, 8192, 16384, 32768, 65536] as const;

function getSuggestedWordCountForEntropyBits(rawBits: number): SupportedWordCount {
  if (rawBits >= 256) {
    return 24;
  }
  if (rawBits >= 224) {
    return 21;
  }
  if (rawBits >= 192) {
    return 18;
  }
  if (rawBits >= 160) {
    return 15;
  }
  return 12;
}

function sanitizeEntropyInputForType(value: string, type: EntropyInputType): string {
  switch (type) {
    case "binary":
      return value.replace(/[^01\s]/g, "");
    case "base6":
      return value.replace(/[^0-5\s]/g, "");
    case "dice":
      return value.replace(/[^1-6\s]/g, "");
    case "base10":
      return value.replace(/[^0-9\s]/g, "");
    case "hex":
      return value.replace(/[^0-9a-fA-F\s]/g, "").toLowerCase();
    case "card": {
      const normalized = value.toUpperCase().replace(/10/g, "T");
      const cards = normalized.match(/[A2-9TJQK][CDHS]/g);
      return cards ? cards.join(" ") : "";
    }
  }
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return window.btoa(binary);
}

async function fetchTextOrThrow(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.text();
}

async function inlineFaviconLinks(documentNode: Document, baseUrl: string): Promise<void> {
  const iconLinks = Array.from(
    documentNode.querySelectorAll<HTMLLinkElement>('link[rel*="icon"][href]'),
  );

  for (const iconLink of iconLinks) {
    const href = iconLink.getAttribute("href");
    if (!href) {
      continue;
    }
    try {
      const iconUrl = new URL(href, baseUrl).toString();
      const iconResponse = await fetch(iconUrl, { cache: "no-store" });
      if (!iconResponse.ok) {
        continue;
      }
      const contentType = iconResponse.headers.get("content-type") ?? "image/svg+xml";
      const data = await iconResponse.arrayBuffer();
      iconLink.setAttribute("href", `data:${contentType};base64,${toBase64(data)}`);
      iconLink.removeAttribute("crossorigin");
    } catch {
      // Best-effort only: keep original favicon href if inlining fails.
    }
  }
}

async function buildOfflineStandaloneHtml(): Promise<{ filename: string; html: string }> {
  const baseUrl = window.location.href;
  const htmlText = await fetchTextOrThrow(baseUrl);
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(htmlText, "text/html");

  const scriptsWithSource = Array.from(documentNode.querySelectorAll<HTMLScriptElement>("script[src]"));
  for (const script of scriptsWithSource) {
    const src = script.getAttribute("src") ?? "";
    if (src.includes("/@vite/") || src.includes("/src/")) {
      throw new Error(DEV_MODE_OFFLINE_EXPORT_ERROR);
    }
  }

  const stylesheetLinks = Array.from(
    documentNode.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'),
  );
  for (const stylesheetLink of stylesheetLinks) {
    const href = stylesheetLink.getAttribute("href");
    if (!href) {
      continue;
    }
    const cssUrl = new URL(href, baseUrl).toString();
    const css = await fetchTextOrThrow(cssUrl);
    const inlineStyle = documentNode.createElement("style");
    inlineStyle.setAttribute("data-inline-source", href);
    inlineStyle.textContent = css;
    stylesheetLink.replaceWith(inlineStyle);
  }

  for (const script of scriptsWithSource) {
    const src = script.getAttribute("src");
    if (!src) {
      continue;
    }
    const scriptUrl = new URL(src, baseUrl).toString();
    const scriptText = await fetchTextOrThrow(scriptUrl);
    const inlineScript = documentNode.createElement("script");
    if (script.type) {
      inlineScript.type = script.type;
    }
    inlineScript.setAttribute("data-inline-source", src);
    inlineScript.textContent = scriptText.replace(/<\/script/gi, "<\\/script");
    script.replaceWith(inlineScript);
  }

  const modulePreloadLinks = Array.from(
    documentNode.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]'),
  );
  for (const preloadLink of modulePreloadLinks) {
    preloadLink.remove();
  }

  const cspMeta = documentNode.querySelector('meta[http-equiv="Content-Security-Policy"]');
  cspMeta?.remove();

  await inlineFaviconLinks(documentNode, baseUrl);

  const generatedAt = new Date().toISOString();
  const serializedHtml = `<!doctype html>\n<!-- Offline export generated at ${generatedAt} -->\n${documentNode.documentElement.outerHTML}`;
  const filename = `bip39-offline-${generatedAt.replace(/[:.]/g, "-")}.html`;

  return {
    filename,
    html: serializedHtml,
  };
}

function triggerHtmlDownload(filename: string, html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

type HelpReference = {
  label: string;
  url: string;
};

type FieldHelpContent = {
  comment: string;
  references: HelpReference[];
};

type ToolFieldHelpKey =
  | "source"
  | "bip39Mode"
  | "mnemonicLanguage"
  | "wordCount"
  | "pbkdf2Rounds"
  | "mnemonic"
  | "splitMnemonic"
  | "passphrase"
  | "bip39Seed"
  | "bip32RootKey"
  | "showEntropyDetails"
  | "showBip85"
  | "bip85Application"
  | "bip85Language"
  | "bip85WordCount"
  | "bip85Bytes"
  | "bip85Index"
  | "bip85ChildKey"
  | "entropyInput"
  | "entropyType"
  | "entropyAutoCompute"
  | "extendedKey"
  | "standard"
  | "network"
  | "customPath"
  | "customAddressType"
  | "account"
  | "change"
  | "startIndex"
  | "addressCount"
  | "hardenedAddresses"
  | "showSecrets"
  | "deriveWallet"
  | "clearSensitive";

const BIP32_REF: HelpReference = {
  label: "BIP32",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
};
const BIP39_REF: HelpReference = {
  label: "BIP39",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
};
const BIP85_REF: HelpReference = {
  label: "BIP85",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki",
};
const BIP43_REF: HelpReference = {
  label: "BIP43",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki",
};
const BIP44_REF: HelpReference = {
  label: "BIP44",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki",
};
const BIP49_REF: HelpReference = {
  label: "BIP49",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki",
};
const BIP84_REF: HelpReference = {
  label: "BIP84",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki",
};
const BIP86_REF: HelpReference = {
  label: "BIP86",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0086.mediawiki",
};
const BIP173_REF: HelpReference = {
  label: "BIP173",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki",
};
const BIP350_REF: HelpReference = {
  label: "BIP350",
  url: "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki",
};
const SLIP132_REF: HelpReference = {
  label: "SLIP-0132",
  url: "https://github.com/satoshilabs/slips/blob/master/slip-0132.md",
};

const FIELD_HELP_BY_LOCALE: Record<AppLocale, Record<ToolFieldHelpKey, FieldHelpContent>> = {
  "pt-BR": {
    source: {
      comment:
        "Define se a derivação começa de um mnemônico BIP39 (seed) ou de uma chave estendida BIP32 já existente.",
      references: [BIP39_REF, BIP32_REF],
    },
    bip39Mode: {
      comment:
        "Modo estrito mantém compatibilidade padrão. Modo avançado permite ajustes técnicos (ex.: PBKDF2 custom).",
      references: [BIP39_REF],
    },
    mnemonicLanguage: {
      comment:
        "A validação depende da wordlist selecionada. O idioma deve corresponder exatamente às palavras usadas.",
      references: [BIP39_REF],
    },
    wordCount: {
      comment:
        "Quantidade de palavras determina bits de entropia: 12=128, 15=160, 18=192, 21=224, 24=256.",
      references: [BIP39_REF],
    },
    pbkdf2Rounds: {
      comment:
        "Carteiras BIP39 interoperáveis usam 2048 rounds. Valores diferentes reduzem compatibilidade com outras wallets.",
      references: [BIP39_REF],
    },
    mnemonic: {
      comment:
        "Frase de recuperação BIP39. Nunca compartilhe; quem tiver essa frase (e passphrase, se usada) controla os fundos.",
      references: [BIP39_REF],
    },
    splitMnemonic: {
      comment:
        "Divide o mnemônico em 3 cartões mascarados para fins didáticos. Um único cartão isolado oferece baixa segurança.",
      references: [BIP39_REF],
    },
    passphrase: {
      comment:
        "Passphrase BIP39 adiciona uma camada extra (25ª palavra). Se perder, não recupera a carteira mesmo com mnemônico.",
      references: [BIP39_REF],
    },
    bip39Seed: {
      comment:
        "Seed BIP39 derivada de mnemônico + passphrase usando PBKDF2-HMAC-SHA512. Deve ser tratada como segredo crítico.",
      references: [BIP39_REF],
    },
    bip32RootKey: {
      comment:
        "Chave raiz BIP32 derivada da seed. O seletor altera apenas o prefixo de serialização (xprv/yprv/zprv).",
      references: [BIP32_REF],
    },
    showEntropyDetails: {
      comment:
        "Exibe ferramentas avançadas para auditoria de aleatoriedade e checksum. Útil para estudo e verificação técnica.",
      references: [BIP39_REF],
    },
    showBip85: {
      comment:
        "Ativa derivação determinística de chaves filhas no padrão BIP85 a partir da seed atual.",
      references: [BIP85_REF, BIP39_REF],
    },
    bip85Application: {
      comment:
        "Seleciona o tipo de saída BIP85: BIP39, WIF, XPRV ou HEX.",
      references: [BIP85_REF],
    },
    bip85Language: {
      comment:
        "Define a wordlist usada para representar o mnemônico filho BIP85.",
      references: [BIP39_REF, BIP85_REF],
    },
    bip85WordCount: {
      comment:
        "Quantidade de palavras do mnemônico filho BIP85: 12, 15, 18, 21 ou 24.",
      references: [BIP39_REF, BIP85_REF],
    },
    bip85Bytes: {
      comment:
        "Quantidade de bytes para saída HEX no BIP85 (mínimo 16, máximo 64).",
      references: [BIP85_REF],
    },
    bip85Index: {
      comment:
        "Índice do filho BIP85 (não negativo). Índices diferentes geram segredos diferentes.",
      references: [BIP32_REF, BIP85_REF],
    },
    bip85ChildKey: {
      comment:
        "Saída derivada BIP85. Trate como segredo: quem possuir controla a carteira correspondente.",
      references: [BIP85_REF, BIP39_REF],
    },
    entropyInput: {
      comment:
        "Entrada manual de entropia para gerar mnemônico. Use somente com fonte de aleatoriedade confiável.",
      references: [BIP39_REF],
    },
    entropyType: {
      comment:
        "Seleciona como interpretar a entropia informada (binário, base6, dado, base10, hex, cartas).",
      references: [BIP39_REF],
    },
    entropyAutoCompute: {
      comment:
        "Quando ativo, o mnemônico é recalculado automaticamente a partir da entropia e configuração atual.",
      references: [BIP39_REF],
    },
    extendedKey: {
      comment:
        "Aceita xpub/xprv e variantes (ypub/zpub...). Deriva endereços sem precisar digitar o mnemônico.",
      references: [BIP32_REF, SLIP132_REF],
    },
    standard: {
      comment:
        "Escolhe o padrão de derivação e tipo de endereço (legacy, nested segwit, segwit nativo, taproot).",
      references: [BIP44_REF, BIP49_REF, BIP84_REF, BIP86_REF],
    },
    network: {
      comment:
        "Seleciona rede Bitcoin Mainnet ou Testnet. Endereços e versões de chave mudam conforme a rede.",
      references: [BIP32_REF, BIP44_REF],
    },
    customPath: {
      comment:
        "Permite caminho BIP32 customizado. Deve seguir sintaxe válida m/.. com níveis hardened quando necessário.",
      references: [BIP32_REF, BIP43_REF],
    },
    customAddressType: {
      comment:
        "Define como renderizar endereço no modo de caminho customizado (P2PKH, P2SH-P2WPKH, P2WPKH, P2TR).",
      references: [BIP173_REF, BIP350_REF],
    },
    account: {
      comment:
        "Índice da conta no path de derivação. Em BIP44/49/84/86 corresponde ao nível m / purpose' / coin_type' / account'.",
      references: [BIP44_REF, BIP84_REF],
    },
    change: {
      comment: "0 para recebimento externo e 1 para troco interno.",
      references: [BIP44_REF],
    },
    startIndex: {
      comment:
        "Índice inicial do primeiro endereço derivado dentro da cadeia selecionada (recebimento ou troco).",
      references: [BIP32_REF, BIP44_REF],
    },
    addressCount: {
      comment: "Quantidade de endereços derivar e listar a partir do índice inicial.",
      references: [BIP32_REF],
    },
    hardenedAddresses: {
      comment:
        "Aplica hardened no nível de endereço. É avançado e não é compatível com derivação a partir de xpub.",
      references: [BIP32_REF],
    },
    showSecrets: {
      comment:
        "Exibe seed e chaves privadas na tela. Use apenas em ambiente seguro e offline.",
      references: [BIP39_REF, BIP32_REF],
    },
    deriveWallet: {
      comment:
        "Executa derivação conforme os parâmetros e gera seed/conta/endereços da seção de saída.",
      references: [BIP32_REF, BIP44_REF],
    },
    clearSensitive: {
      comment:
        "Limpa dados sensíveis da sessão atual (mnemônico, passphrase, seed/chaves derivadas na interface).",
      references: [BIP39_REF],
    },
  },
  en: {
    source: {
      comment:
        "Choose whether derivation starts from a BIP39 mnemonic (seed flow) or an existing BIP32 extended key.",
      references: [BIP39_REF, BIP32_REF],
    },
    bip39Mode: {
      comment:
        "Strict mode keeps standard compatibility. Advanced mode enables technical overrides (for example custom PBKDF2).",
      references: [BIP39_REF],
    },
    mnemonicLanguage: {
      comment:
        "Validation depends on the selected wordlist. Language must match the mnemonic words exactly.",
      references: [BIP39_REF],
    },
    wordCount: {
      comment:
        "Word count defines entropy size: 12=128, 15=160, 18=192, 21=224, 24=256 bits.",
      references: [BIP39_REF],
    },
    pbkdf2Rounds: {
      comment:
        "Interoperable BIP39 wallets use 2048 rounds. Different values reduce compatibility with other wallets.",
      references: [BIP39_REF],
    },
    mnemonic: {
      comment:
        "BIP39 recovery phrase. Never share it; anyone with phrase (and passphrase, if used) controls the funds.",
      references: [BIP39_REF],
    },
    splitMnemonic: {
      comment:
        "Splits the mnemonic into 3 masked cards for educational backup workflow. A single card alone has weak security.",
      references: [BIP39_REF],
    },
    passphrase: {
      comment:
        "Optional BIP39 passphrase (often called the 25th word). Losing it means losing access to that wallet branch.",
      references: [BIP39_REF],
    },
    bip39Seed: {
      comment:
        "BIP39 seed derived from mnemonic + passphrase using PBKDF2-HMAC-SHA512. Handle as highly sensitive secret material.",
      references: [BIP39_REF],
    },
    bip32RootKey: {
      comment:
        "BIP32 root key derived from seed. The selector only changes serialization prefix (xprv/yprv/zprv).",
      references: [BIP32_REF],
    },
    showEntropyDetails: {
      comment:
        "Shows advanced randomness and checksum tools for technical review and educational use.",
      references: [BIP39_REF],
    },
    showBip85: {
      comment:
        "Enables deterministic child-key derivation using BIP85 from the current seed.",
      references: [BIP85_REF, BIP39_REF],
    },
    bip85Application: {
      comment:
        "Selects BIP85 output type: BIP39, WIF, XPRV, or HEX.",
      references: [BIP85_REF],
    },
    bip85Language: {
      comment:
        "Defines which wordlist is used to render the BIP85 child mnemonic.",
      references: [BIP39_REF, BIP85_REF],
    },
    bip85WordCount: {
      comment:
        "Word count of BIP85 child mnemonic: 12, 15, 18, 21, or 24.",
      references: [BIP39_REF, BIP85_REF],
    },
    bip85Bytes: {
      comment:
        "Byte length for BIP85 HEX output (minimum 16, maximum 64).",
      references: [BIP85_REF],
    },
    bip85Index: {
      comment:
        "BIP85 child index (non-negative). Different indexes derive different secrets.",
      references: [BIP32_REF, BIP85_REF],
    },
    bip85ChildKey: {
      comment:
        "Derived BIP85 output. Treat as secret material; anyone with it controls that wallet branch.",
      references: [BIP85_REF, BIP39_REF],
    },
    entropyInput: {
      comment:
        "Manual entropy input used to generate mnemonic phrases. Use only trusted randomness sources.",
      references: [BIP39_REF],
    },
    entropyType: {
      comment:
        "Selects how the entered entropy should be interpreted (binary, base6, dice, base10, hex, cards).",
      references: [BIP39_REF],
    },
    entropyAutoCompute: {
      comment:
        "When enabled, mnemonic is automatically recomputed from entropy and current settings.",
      references: [BIP39_REF],
    },
    extendedKey: {
      comment:
        "Accepts xpub/xprv and related prefixes (ypub/zpub...). Enables derivation without typing mnemonic.",
      references: [BIP32_REF, SLIP132_REF],
    },
    standard: {
      comment:
        "Select derivation standard and address family (legacy, nested segwit, native segwit, taproot).",
      references: [BIP44_REF, BIP49_REF, BIP84_REF, BIP86_REF],
    },
    network: {
      comment:
        "Select Bitcoin Mainnet or Testnet. Address encoding and key versions depend on network.",
      references: [BIP32_REF, BIP44_REF],
    },
    customPath: {
      comment:
        "Allows a custom BIP32 path. It must follow valid m/... syntax with hardened levels where needed.",
      references: [BIP32_REF, BIP43_REF],
    },
    customAddressType: {
      comment:
        "Defines address encoding for custom path mode (P2PKH, P2SH-P2WPKH, P2WPKH, P2TR).",
      references: [BIP173_REF, BIP350_REF],
    },
    account: {
      comment:
        "Account index in derivation path. In BIP44/49/84/86 this is m / purpose' / coin_type' / account'.",
      references: [BIP44_REF, BIP84_REF],
    },
    change: {
      comment: "Use 0 for external receiving chain and 1 for internal change chain.",
      references: [BIP44_REF],
    },
    startIndex: {
      comment:
        "Starting index of the first derived address within the selected chain.",
      references: [BIP32_REF, BIP44_REF],
    },
    addressCount: {
      comment:
        "Number of addresses to derive and list from the starting index.",
      references: [BIP32_REF],
    },
    hardenedAddresses: {
      comment:
        "Applies hardened derivation at address level. Advanced and not compatible with xpub-based derivation.",
      references: [BIP32_REF],
    },
    showSecrets: {
      comment:
        "Reveals seed and private keys on screen. Use only in a secure, offline environment.",
      references: [BIP39_REF, BIP32_REF],
    },
    deriveWallet: {
      comment:
        "Runs derivation using current parameters and builds the output wallet/address tables.",
      references: [BIP32_REF, BIP44_REF],
    },
    clearSensitive: {
      comment:
        "Clears current sensitive session data (mnemonic, passphrase, and visible derived secrets).",
      references: [BIP39_REF],
    },
  },
};

function App() {
  const [locale, setLocale] = useState<AppLocale>(detectInitialLocale);
  const [theme, setTheme] = useState<AppTheme>(detectInitialTheme);
  const [activeTab, setActiveTab] = useState<AppTab>("tool");
  const [isManual1248Open, setIsManual1248Open] = useState(false);

  const [sourceMode, setSourceMode] = useState<DerivationSourceMode>("mnemonic");
  const [network, setNetwork] = useState<BitcoinNetwork>("mainnet");
  const [standard, setStandard] = useState<DerivationStandard>("bip84");
  const [mode, setMode] = useState<BIP39Mode>("strict");
  const [mnemonicLanguage, setMnemonicLanguage] = useState<MnemonicLanguage>("english");
  const [wordCount, setWordCount] = useState<SupportedWordCount>(12);
  const [showEntropyDetails, setShowEntropyDetails] = useState(false);
  const [entropyInputType, setEntropyInputType] = useState<EntropyInputType>("hex");
  const [entropyMnemonicLengthMode, setEntropyMnemonicLengthMode] =
    useState<EntropyMnemonicLengthMode>("rawEntropy");
  const [entropyInput, setEntropyInput] = useState("");
  const [entropyAutoCompute, setEntropyAutoCompute] = useState(true);
  const [mnemonicRandomnessSource, setMnemonicRandomnessSource] =
    useState<MnemonicRandomnessSource>("manual");
  const [pbkdf2Rounds, setPbkdf2Rounds] = useState(2048);
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [showSplitMnemonicCards, setShowSplitMnemonicCards] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [bip32RootKeyFormat, setBip32RootKeyFormat] = useState<BIP32RootKeyFormat>("xprv");
  const [showBip85, setShowBip85] = useState(false);
  const [bip85Application, setBip85Application] = useState<BIP85Application>("bip39");
  const [bip85Language, setBip85Language] = useState<MnemonicLanguage>("english");
  const [bip85WordCount, setBip85WordCount] = useState<SupportedWordCount>(18);
  const [bip85Bytes, setBip85Bytes] = useState(64);
  const [bip85Index, setBip85Index] = useState(0);
  const [extendedKeyInput, setExtendedKeyInput] = useState("");

  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [rows, setRows] = useState<(typeof ROW_OPTIONS)[number]>(5);
  const [useHardenedAddresses, setUseHardenedAddresses] = useState(false);

  const [customPath, setCustomPath] = useState("m/84'/0'/0'");
  const [customAddressType, setCustomAddressType] = useState<AddressType>("p2wpkh");

  const [showSecrets, setShowSecrets] = useState(false);
  const [result, setResult] = useState<DerivedWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offlineDownloadFeedback, setOfflineDownloadFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const text = useMemo(() => getUiText(locale), [locale]);
  const fieldHelp = useMemo(() => FIELD_HELP_BY_LOCALE[locale], [locale]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const wordOptions = mode === "strict" ? STRICT_WORD_COUNTS : ADVANCED_WORD_COUNTS;
  const autoComputedMnemonic = useMemo(() => {
    if (sourceMode !== "mnemonic" || !entropyAutoCompute) {
      return null;
    }
    if (entropyInput.trim().length === 0) {
      return null;
    }
    try {
      return computeMnemonicFromEntropyInput({
        input: entropyInput,
        inputType: entropyInputType,
        wordCount,
        language: mnemonicLanguage,
        mnemonicLengthMode: entropyMnemonicLengthMode,
        allowInsufficientEntropy: true,
      }).mnemonic;
    } catch {
      return null;
    }
  }, [
    entropyAutoCompute,
    entropyInput,
    entropyInputType,
    entropyMnemonicLengthMode,
    mnemonicLanguage,
    sourceMode,
    wordCount,
  ]);

  const entropyDrivenMnemonic =
    sourceMode === "mnemonic" && entropyAutoCompute && entropyInput.trim().length > 0;

  const rawEntropyBitsForMnemonicPreview = useMemo(() => {
    if (!entropyDrivenMnemonic) {
      return 0;
    }
    try {
      return previewEntropyInput({
        input: entropyInput,
        inputType: entropyInputType,
      }).rawEntropyBits;
    } catch {
      return 0;
    }
  }, [entropyDrivenMnemonic, entropyInput, entropyInputType]);

  const autoComputedMnemonicPreview = useMemo(() => {
    if (!autoComputedMnemonic || !entropyDrivenMnemonic) {
      return autoComputedMnemonic;
    }
    const words = sanitizeMnemonicInput(autoComputedMnemonic).split(" ").filter(Boolean);
    if (words.length === 0) {
      return "";
    }
    const previewWordCount = Math.max(
      1,
      Math.min(words.length, Math.ceil(rawEntropyBitsForMnemonicPreview / 11)),
    );
    return words.slice(0, previewWordCount).join(" ");
  }, [autoComputedMnemonic, entropyDrivenMnemonic, rawEntropyBitsForMnemonicPreview]);

  const activeMnemonicInput = useMemo(
    () => (entropyDrivenMnemonic ? autoComputedMnemonicPreview ?? "" : mnemonicInput),
    [autoComputedMnemonicPreview, entropyDrivenMnemonic, mnemonicInput],
  );

  const normalizedMnemonic = useMemo(
    () => sanitizeMnemonicInput(activeMnemonicInput),
    [activeMnemonicInput],
  );
  const selectedLanguageValidation = useMemo(() => {
    if (sourceMode !== "mnemonic") {
      return { valid: true, error: null, wordCount: 0 };
    }
    return validateMnemonicByLanguage(normalizedMnemonic, mnemonicLanguage, mode);
  }, [mode, mnemonicLanguage, normalizedMnemonic, sourceMode]);

  const detectedMnemonicLanguage = useMemo(() => {
    if (sourceMode !== "mnemonic") {
      return null;
    }
    if (!normalizedMnemonic || selectedLanguageValidation.valid) {
      return null;
    }
    for (const language of SUPPORTED_MNEMONIC_LANGUAGES) {
      if (language === mnemonicLanguage) {
        continue;
      }
      if (validateMnemonicByLanguage(normalizedMnemonic, language, mode).valid) {
        return language;
      }
    }
    return null;
  }, [mnemonicLanguage, mode, normalizedMnemonic, selectedLanguageValidation.valid, sourceMode]);

  const effectiveMnemonicLanguage = detectedMnemonicLanguage ?? mnemonicLanguage;

  const mnemonicValidation = useMemo(() => {
    if (sourceMode !== "mnemonic") {
      return { valid: true, error: null, wordCount: 0 };
    }
    if (selectedLanguageValidation.valid || detectedMnemonicLanguage) {
      return {
        valid: true,
        error: null,
        wordCount: selectedLanguageValidation.wordCount,
      };
    }
    return selectedLanguageValidation;
  }, [detectedMnemonicLanguage, selectedLanguageValidation, sourceMode]);

  const localizedMnemonicValidationError = useMemo(() => {
    if (sourceMode !== "mnemonic") {
      return "";
    }
    if (!mnemonicValidation.error || activeMnemonicInput.length === 0) {
      return "";
    }
    return translateCoreError(mnemonicValidation.error, locale);
  }, [activeMnemonicInput.length, locale, mnemonicValidation.error, sourceMode]);

  const localizedError = useMemo(() => {
    if (!error) {
      return "";
    }
    if (error === UI_ERROR_GENERATE) {
      return text.fallbackGenerateError;
    }
    if (error === UI_ERROR_DERIVE) {
      return text.fallbackDeriveError;
    }
    return translateCoreError(error, locale);
  }, [error, locale, text.fallbackDeriveError, text.fallbackGenerateError]);

  const entropyComputation = useMemo<{
    result: EntropyComputationResult | null;
    error: string | null;
  }>(() => {
    if (sourceMode !== "mnemonic" || !showEntropyDetails || entropyInput.trim().length === 0) {
      return { result: null, error: null };
    }
    try {
      return {
        result: computeMnemonicFromEntropyInput({
          input: entropyInput,
          inputType: entropyInputType,
          wordCount,
          language: mnemonicLanguage,
          mnemonicLengthMode: entropyMnemonicLengthMode,
        }),
        error: null,
      };
    } catch (caught) {
      return {
        result: null,
        error: caught instanceof Error ? caught.message : "Falha ao processar entropia.",
      };
    }
  }, [
    entropyInput,
    entropyInputType,
    entropyMnemonicLengthMode,
    mnemonicLanguage,
    showEntropyDetails,
    sourceMode,
    wordCount,
  ]);

  const entropyPreview = useMemo(() => {
    if (sourceMode !== "mnemonic" || !showEntropyDetails || entropyInput.trim().length === 0) {
      return null;
    }
    try {
      return previewEntropyInput({
        input: entropyInput,
        inputType: entropyInputType,
      });
    } catch {
      return null;
    }
  }, [entropyInput, entropyInputType, showEntropyDetails, sourceMode]);

  const recoveredMnemonicEntropy = useMemo(() => {
    if (
      sourceMode !== "mnemonic" ||
      !showEntropyDetails ||
      entropyInput.trim().length > 0 ||
      !normalizedMnemonic
    ) {
      return null;
    }

    const languageCandidates: MnemonicLanguage[] = [
      effectiveMnemonicLanguage,
      ...SUPPORTED_MNEMONIC_LANGUAGES.filter(
        (language) => language !== effectiveMnemonicLanguage,
      ),
    ];

    for (const language of languageCandidates) {
      try {
        return recoverMnemonicEntropy({
          mnemonic: normalizedMnemonic,
          language,
        });
      } catch {
        continue;
      }
    }
    return null;
  }, [
    effectiveMnemonicLanguage,
    entropyInput,
    normalizedMnemonic,
    showEntropyDetails,
    sourceMode,
  ]);

  const entropyDetails = useMemo(() => {
    if (entropyComputation.result?.details) {
      return entropyComputation.result.details;
    }
    if (recoveredMnemonicEntropy) {
      return recoveredMnemonicEntropy.details;
    }
    if (sourceMode !== "mnemonic") {
      return null;
    }
    if (!normalizedMnemonic || !mnemonicValidation.valid) {
      return null;
    }

    try {
      return getMnemonicEntropyReport(normalizedMnemonic, effectiveMnemonicLanguage);
    } catch {
      return null;
    }
  }, [
    effectiveMnemonicLanguage,
    entropyComputation.result,
    mnemonicValidation.valid,
    normalizedMnemonic,
    recoveredMnemonicEntropy,
    sourceMode,
  ]);

  const localizedEntropyError = useMemo(() => {
    if (!entropyComputation.error) {
      return "";
    }
    if (entropyComputation.error.startsWith("Entropia insuficiente para")) {
      return "";
    }
    return translateCoreError(entropyComputation.error, locale);
  }, [entropyComputation.error, locale]);

  const bip85Computation = useMemo<{
    result: ReturnType<typeof deriveBip85FromSeed> | null;
    error: string | null;
  }>(() => {
    if (sourceMode !== "mnemonic" || !showBip85) {
      return { result: null, error: null };
    }
    if (!normalizedMnemonic || !mnemonicValidation.valid) {
      return { result: null, error: null };
    }

    try {
      const rounds = mode === "strict" ? 2048 : pbkdf2Rounds;
      const seedHex = mnemonicToSeedHex(
        activeMnemonicInput,
        passphrase,
        rounds,
        mode,
        effectiveMnemonicLanguage,
      );
      return {
        result: deriveBip85FromSeed({
          seedHex,
          application: bip85Application,
          language: bip85Language,
          wordCount: bip85WordCount,
          bytes: bip85Bytes,
          index: bip85Index,
        }),
        error: null,
      };
    } catch (caught) {
      return {
        result: null,
        error: caught instanceof Error ? caught.message : "Falha ao derivar chave privada BIP85.",
      };
    }
  }, [
    activeMnemonicInput,
    bip85Application,
    bip85Bytes,
    bip85Index,
    bip85Language,
    bip85WordCount,
    effectiveMnemonicLanguage,
    mnemonicValidation.valid,
    mode,
    normalizedMnemonic,
    passphrase,
    pbkdf2Rounds,
    showBip85,
    sourceMode,
  ]);

  const localizedBip85Error = useMemo(() => {
    if (!bip85Computation.error) {
      return "";
    }
    return translateCoreError(bip85Computation.error, locale);
  }, [bip85Computation.error, locale]);

  const splitMnemonicData = useMemo(() => {
    if (sourceMode !== "mnemonic" || !normalizedMnemonic) {
      return null;
    }
    try {
      return splitMnemonicIntoCards({
        mnemonic: normalizedMnemonic,
        language: effectiveMnemonicLanguage,
      });
    } catch {
      return null;
    }
  }, [effectiveMnemonicLanguage, normalizedMnemonic, sourceMode]);

  const splitMnemonicHackTimeLabel = useMemo(() => {
    if (!splitMnemonicData) {
      return "";
    }
    if (splitMnemonicData.hackTimeUnit === "lt1second") {
      return text.splitMnemonicLessThanSecond;
    }
    if (splitMnemonicData.hackTimeUnit === "seconds") {
      return `${splitMnemonicData.hackTimeValue ?? 0} ${text.splitMnemonicSeconds}`;
    }
    if (splitMnemonicData.hackTimeUnit === "days") {
      return `${splitMnemonicData.hackTimeValue ?? 0} ${text.splitMnemonicDays}`;
    }
    return `${splitMnemonicData.hackTimeValue ?? 0} ${text.splitMnemonicYears}`;
  }, [splitMnemonicData, text.splitMnemonicDays, text.splitMnemonicLessThanSecond, text.splitMnemonicSeconds, text.splitMnemonicYears]);

  const bip39SeedComputation = useMemo<{
    seedHex: string | null;
    language: MnemonicLanguage | null;
    error: string | null;
  }>(() => {
    if (sourceMode !== "mnemonic" || !normalizedMnemonic) {
      return {
        seedHex: null,
        language: null,
        error: null,
      };
    }

    const rounds = mode === "strict" ? 2048 : pbkdf2Rounds;
    try {
      const seedHex = mnemonicToSeedHex(
        activeMnemonicInput,
        passphrase,
        rounds,
        mode,
        mnemonicLanguage,
      );
      return {
        seedHex,
        language: mnemonicLanguage,
        error: null,
      };
    } catch (caught) {
      return {
        seedHex: null,
        language: null,
        error: caught instanceof Error ? caught.message : "Falha ao derivar seed BIP39.",
      };
    }
  }, [
    activeMnemonicInput,
    mode,
    mnemonicLanguage,
    normalizedMnemonic,
    passphrase,
    pbkdf2Rounds,
    sourceMode,
  ]);

  const bip39SeedPreview = bip39SeedComputation.seedHex;

  const localizedBip39SeedError = useMemo(() => {
    if (!bip39SeedComputation.error) {
      return "";
    }
    return translateCoreError(bip39SeedComputation.error, locale);
  }, [bip39SeedComputation.error, locale]);

  const bip32RootKeyPreview = useMemo(() => {
    if (sourceMode !== "mnemonic" || !bip39SeedPreview) {
      return null;
    }
    try {
      return deriveBip32RootKeyFromSeed({
        seedHex: bip39SeedPreview,
        network: "mainnet",
        format: bip32RootKeyFormat,
      });
    } catch {
      return null;
    }
  }, [bip32RootKeyFormat, bip39SeedPreview, sourceMode]);

  const mnemonicLabelByLanguage = useMemo(() => {
    const languageLabel = MNEMONIC_LANGUAGE_LABELS[mnemonicLanguage];
    if (locale === "pt-BR") {
      return `Mnemônico (lista de palavras ${languageLabel})`;
    }
    return `Mnemonic (${languageLabel} wordlist)`;
  }, [locale, mnemonicLanguage]);

  const showInternalKeyColumn = useMemo(
    () => result?.rows.some((row) => Boolean(row.internalKeyHex)) ?? false,
    [result],
  );

  const tabItems = useMemo(
    () =>
      [
        { id: "tool", label: text.tabsTool },
        { id: "theory", label: text.tabsTheory },
        { id: "technical", label: text.tabsTechnical },
        { id: "math", label: text.tabsMath },
        { id: "bestPractices", label: text.tabsBestPractices },
      ] as const,
    [text.tabsBestPractices, text.tabsMath, text.tabsTechnical, text.tabsTheory, text.tabsTool],
  );

  const pbkdf2RoundOptions = useMemo(() => {
    const unique = new Set<number>([...PBKDF2_ROUND_OPTIONS, pbkdf2Rounds]);
    return Array.from(unique).sort((left, right) => left - right);
  }, [pbkdf2Rounds]);

  function updateWordCountFromEntropy(nextInput: string, nextType: EntropyInputType) {
    if (sourceMode !== "mnemonic" || !entropyAutoCompute) {
      return;
    }
    try {
      const preview = previewEntropyInput({
        input: nextInput,
        inputType: nextType,
      });
      const suggestedWordCount = getSuggestedWordCountForEntropyBits(preview.rawEntropyBits);
      if (wordCount > suggestedWordCount) {
        setWordCount(suggestedWordCount);
      }
    } catch {
      // Ignore live-adjust failures while the user edits entropy input.
    }
  }

  function handleModeChange(newMode: BIP39Mode) {
    setMode(newMode);
    setResult(null);
    setError(null);

    if (newMode === "strict") {
      setPbkdf2Rounds(2048);
      if (!STRICT_WORD_COUNTS.includes(wordCount as (typeof STRICT_WORD_COUNTS)[number])) {
        setWordCount(12);
      }
    }
  }

  function handleGenerateMnemonic() {
    try {
      if (sourceMode !== "mnemonic") {
        setSourceMode("mnemonic");
      }
      const generated = generateMnemonicWithDetails(wordCount, mnemonicLanguage, mode);
      setMnemonicInput(generated.mnemonic);
      setEntropyInput(generated.details.entropyHex);
      setEntropyInputType("hex");
      setMnemonicRandomnessSource(generated.randomnessSource);
      setResult(null);
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : UI_ERROR_GENERATE);
    }
  }

  function handleDerive() {
    try {
      const baseArgs = {
        network,
        standard,
        account,
        change,
        count: rows,
        startIndex,
        useHardenedAddresses,
        customPath: standard === "custom" ? customPath : undefined,
        customAddressType: standard === "custom" ? customAddressType : undefined,
      } as const;

      if (sourceMode === "mnemonic") {
        const validation = validateMnemonicByLanguage(
          activeMnemonicInput,
          effectiveMnemonicLanguage,
          mode,
        );
        if (!validation.valid) {
          setResult(null);
          setError(validation.error ?? "Mnemonic inválida.");
          return;
        }

        const rounds = mode === "strict" ? 2048 : pbkdf2Rounds;
        const seedHex = mnemonicToSeedHex(
          activeMnemonicInput,
          passphrase,
          rounds,
          mode,
          effectiveMnemonicLanguage,
        );

        const wallet = deriveWallet({
          ...baseArgs,
          seedHex,
        });

        setMnemonicInput(sanitizeMnemonicInput(activeMnemonicInput));
        setResult(wallet);
        setError(null);
        return;
      }

      const keyValue = extendedKeyInput.trim();
      if (!keyValue) {
        setResult(null);
        setError("Chave estendida inválida ou versão não suportada.");
        return;
      }

      const wallet = deriveWallet({
        ...baseArgs,
        extendedKey: keyValue,
      });

      setResult(wallet);
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : UI_ERROR_DERIVE);
    }
  }

  function handleClearSensitive() {
    setMnemonicInput("");
    setShowSplitMnemonicCards(false);
    setPassphrase("");
    setExtendedKeyInput("");
    setEntropyInput("");
    setMnemonicRandomnessSource("manual");
    setResult(null);
    setError(null);
    setShowSecrets(false);
  }

  async function handleDownloadOfflineHtml() {
    try {
      const exported = await buildOfflineStandaloneHtml();
      triggerHtmlDownload(exported.filename, exported.html);
      setOfflineDownloadFeedback({
        type: "success",
        message: `${text.downloadOfflineHtmlSuccessPrefix} ${exported.filename}`,
      });
    } catch (caught) {
      const fallbackMessage =
        caught instanceof Error && caught.message === DEV_MODE_OFFLINE_EXPORT_ERROR
          ? text.downloadOfflineHtmlDevModeHint
          : text.downloadOfflineHtmlError;
      setOfflineDownloadFeedback({
        type: "error",
        message: fallbackMessage,
      });
    }
  }

  return (
    <main className="min-h-screen bg-(--app-page-bg) text-(--app-text)">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
        <header className="mb-8 rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-6 shadow-sm">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
            <p className="inline-flex rounded-full border border-(--app-chip-border) bg-(--app-chip-soft) px-3 py-1 text-xs font-semibold tracking-wide text-(--app-chip-text)">
              {text.tutorialBadge}
            </p>
            <div className="grid w-full gap-3 text-xs sm:w-3xl sm:grid-cols-4">
              <label>
                <span className="mb-1 block font-semibold text-(--app-text)">
                  {text.languageLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as AppLocale)}
                >
                  {SUPPORTED_LOCALES.map((availableLocale) => (
                    <option key={availableLocale} value={availableLocale}>
                      {LOCALE_LABELS[availableLocale]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block font-semibold text-(--app-text)">
                  {text.themeLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as AppTheme)}
                >
                  <option value="dark">{text.themeDark}</option>
                  <option value="light">{text.themeLight}</option>
                </select>
              </label>
              <button
                type="button"
                className="mt-5 h-10.5 rounded-lg border border-(--app-btn-secondary-border) bg-(--app-btn-secondary-bg) px-3 py-2 font-semibold text-(--app-btn-secondary-text) hover:bg-(--app-btn-secondary-hover)"
                onClick={() => {
                  void handleDownloadOfflineHtml();
                }}
              >
                {text.downloadOfflineHtmlButton}
              </button>
              <button
                type="button"
                className="mt-5 h-10.5 rounded-lg border border-(--app-btn-secondary-border) bg-(--app-btn-secondary-bg) px-3 py-2 font-semibold text-(--app-btn-secondary-text) hover:bg-(--app-btn-secondary-hover)"
                onClick={() => setIsManual1248Open(true)}
              >
                {text.manual1248Button}
              </button>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-(--app-text) sm:text-4xl">
            {text.title}
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-(--app-muted)">{text.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-(--app-chip-border) bg-(--app-chip-soft) px-3 py-1 text-(--app-chip-text)">
              {isOnline ? text.statusConnected : text.statusOffline}
            </span>
            <span className="rounded-full border border-(--app-chip-border) bg-(--app-chip-strong) px-3 py-1 text-(--app-chip-text)">
              {text.statusNoBackend}
            </span>
            <span className="rounded-full border border-(--app-chip-border) bg-(--app-chip-strong) px-3 py-1 text-(--app-chip-text)">
              {text.statusMode} {mode === "strict" ? text.modeStrict : text.modeAdvanced}
            </span>
          </div>
          {offlineDownloadFeedback && (
            <p
              className={`mt-3 text-xs ${offlineDownloadFeedback.type === "success"
                ? "text-success"
                : "text-danger"
                }`}
            >
              {offlineDownloadFeedback.message}
            </p>
          )}
        </header>

        <nav className="mb-6 flex flex-wrap gap-2">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${isActive
                  ? "border-(--app-chip-border) bg-(--app-chip-strong) text-(--app-chip-text)"
                  : "border-(--app-border) bg-(--app-surface-bg) text-(--app-text) hover:bg-(--app-surface-alt)"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === "tool" ? (
          <>
            <section className="space-y-6">
              <article className="rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-6 shadow-sm">
                <h2 className="font-serif text-2xl font-semibold text-(--app-text)">
                  {text.mnemonicSectionTitle}
                </h2>

                <label className="mt-4 block text-sm">
                  <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                    {text.sourceLabel}
                    <HelpHint help={fieldHelp.source} />
                  </span>
                  <select
                    className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                    value={sourceMode}
                    onChange={(event) => {
                      setSourceMode(event.target.value as DerivationSourceMode);
                      setResult(null);
                      setError(null);
                    }}
                  >
                    <option value="mnemonic">{text.sourceMnemonic}</option>
                    <option value="extendedKey">{text.sourceExtended}</option>
                  </select>
                </label>

                {sourceMode === "mnemonic" ? (
                  <>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm">
                        <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                          {text.bip39ModeLabel}
                          <HelpHint help={fieldHelp.bip39Mode} />
                        </span>
                        <select
                          className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                          value={mode}
                          onChange={(event) => handleModeChange(event.target.value as BIP39Mode)}
                        >
                          <option value="strict">{text.strictOption}</option>
                          <option value="advanced">{text.advancedOption}</option>
                        </select>
                      </label>

                      <label className="text-sm">
                        <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                          {text.mnemonicLanguageLabel}
                          <HelpHint help={fieldHelp.mnemonicLanguage} />
                        </span>
                        <select
                          className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                          value={mnemonicLanguage}
                          onChange={(event) =>
                            setMnemonicLanguage(event.target.value as MnemonicLanguage)
                          }
                        >
                          {MNEMONIC_LANGUAGE_SELECTION_ORDER.map((language) => (
                            <option key={language} value={language}>
                              {MNEMONIC_LANGUAGE_LABELS[language]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="text-sm">
                        <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                          {text.wordsLabel}
                          <HelpHint help={fieldHelp.wordCount} />
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className={`w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary sm:flex-1 ${showEntropyDetails ? "cursor-not-allowed opacity-70" : ""}`}
                            value={wordCount}
                            disabled={showEntropyDetails}
                            onChange={(event) =>
                              setWordCount(Number(event.target.value) as SupportedWordCount)
                            }
                          >
                            {wordOptions.map((option) => (
                              <option key={option} value={option}>
                                {option} {text.wordsSuffix}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="rounded-lg bg-(--app-btn-primary-bg) px-4 py-2 text-sm font-semibold text-(--app-btn-primary-text) hover:bg-(--app-btn-primary-hover)"
                            onClick={handleGenerateMnemonic}
                          >
                            {text.generateButton}
                          </button>
                        </div>
                        {showEntropyDetails && (
                          <p className="mt-1 text-xs text-(--app-muted)">
                            {text.wordCountLockedByEntropyHint}
                          </p>
                        )}
                      </div>

                    </div>

                    <label className="mt-4 block text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        {mnemonicLabelByLanguage}
                        <HelpHint help={fieldHelp.mnemonic} />
                      </span>
                      <textarea
                        className={`min-h-32 w-full resize-y rounded-lg font-mono text-sm ${showEntropyDetails ? "cursor-not-allowed" : ""}`}
                        value={activeMnemonicInput}
                        readOnly={showEntropyDetails}
                        aria-readonly={showEntropyDetails}
                        style={
                          showEntropyDetails
                            ? {
                              backgroundColor: "var(--app-surface-alt)",
                              color: "var(--app-muted)",
                            }
                            : undefined
                        }
                        onChange={(event) => {
                          if (entropyAutoCompute && entropyInput.trim().length > 0) {
                            setEntropyAutoCompute(false);
                          }
                          setMnemonicInput(event.target.value);
                          setMnemonicRandomnessSource("manual");
                        }}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        placeholder={text.mnemonicPlaceholder}
                      />
                      {showEntropyDetails && (
                        <p className="mt-1 text-xs text-(--app-muted)">
                          {text.mnemonicLockedByEntropyHint}
                        </p>
                      )}
                    </label>

                    <div className="mt-4 text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        <span>{text.splitMnemonicLabel}</span>
                        <HelpHint help={fieldHelp.splitMnemonic} />
                      </span>
                      <label className="inline-flex items-center gap-2 font-medium text-(--app-text)">
                        <input
                          type="checkbox"
                          checked={showSplitMnemonicCards}
                          onChange={(event) => setShowSplitMnemonicCards(event.target.checked)}
                        />
                        {text.showSplitMnemonicCardsLabel}
                      </label>
                    </div>

                    {showSplitMnemonicCards && (
                      <div className="mt-4">
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-(--app-text)">
                            {text.splitMnemonicLabel}
                          </span>
                          <textarea
                            className="min-h-24 w-full resize-y rounded-lg font-mono text-sm"
                            readOnly
                            value={splitMnemonicData?.cards.join("\n") ?? ""}
                          />
                        </label>
                        {splitMnemonicData && (
                          <p
                            className={`mt-2 text-sm ${splitMnemonicData.highlightRisk ? "text-danger" : "text-(--app-text)"
                              }`}
                          >
                            {text.splitMnemonicHackTimeLabel} {splitMnemonicHackTimeLabel}
                          </p>
                        )}
                      </div>
                    )}

                    <label className="mt-4 block text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        {text.passphraseLabel}
                        <HelpHint help={fieldHelp.passphrase} />
                      </span>
                      <input
                        type="text"
                        className="w-full rounded-lg font-mono text-sm"
                        value={passphrase}
                        onChange={(event) => setPassphrase(event.target.value)}
                        autoComplete="off"
                      />
                    </label>

                    <label className="mt-4 block text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        {text.bip39SeedLabel}
                        <HelpHint help={fieldHelp.bip39Seed} />
                      </span>
                      <textarea
                        className="min-h-20 w-full resize-y rounded-lg font-mono text-xs"
                        readOnly
                        value={bip39SeedPreview ?? ""}
                        placeholder={text.seedRootHint}
                      />
                      {localizedBip39SeedError && (
                        <p className="mt-2 text-xs text-danger">{localizedBip39SeedError}</p>
                      )}
                    </label>

                    <label className="mt-4 block text-sm">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-medium text-(--app-text)">
                          {text.bip32RootKeyLabel} ({bip32RootKeyFormat})
                          <HelpHint help={fieldHelp.bip32RootKey} />
                        </span>
                        <label className="inline-flex items-center gap-2 text-xs text-(--app-muted)">
                          <span>{text.bip32RootKeyFormatLabel}</span>
                          <select
                            className="rounded-lg border border-(--app-border) bg-white px-2 py-1 text-secondary"
                            value={bip32RootKeyFormat}
                            onChange={(event) =>
                              setBip32RootKeyFormat(event.target.value as BIP32RootKeyFormat)
                            }
                          >
                            <option value="xprv">{text.bip32RootKeyFormatXprv}</option>
                            <option value="yprv">{text.bip32RootKeyFormatYprv}</option>
                            <option value="zprv">{text.bip32RootKeyFormatZprv}</option>
                          </select>
                        </label>
                      </div>
                      <textarea
                        className="min-h-20 w-full resize-y rounded-lg font-mono text-xs"
                        readOnly
                        value={bip32RootKeyPreview ?? ""}
                        placeholder={text.seedRootHint}
                      />
                      <p className="mt-1 text-xs text-(--app-muted)">
                        {text.bip32RootKeyFormatHint}
                      </p>
                    </label>

                    <div className="mt-4 flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-(--app-text)">
                        <input
                          type="checkbox"
                          checked={showEntropyDetails}
                          onChange={(event) => {
                            const enabled = event.target.checked;
                            setShowEntropyDetails(enabled);

                            if (
                              !enabled ||
                              sourceMode !== "mnemonic" ||
                              entropyInput.trim().length > 0
                            ) {
                              return;
                            }

                            const normalizedInputMnemonic = sanitizeMnemonicInput(mnemonicInput);
                            if (!normalizedInputMnemonic) {
                              return;
                            }

                            const languageCandidates: MnemonicLanguage[] = [
                              mnemonicLanguage,
                              ...SUPPORTED_MNEMONIC_LANGUAGES.filter(
                                (language) => language !== mnemonicLanguage,
                              ),
                            ];

                            for (const language of languageCandidates) {
                              try {
                                const recovered = recoverMnemonicEntropy({
                                  mnemonic: normalizedInputMnemonic,
                                  language,
                                });
                                if (
                                  recovered.correctedMnemonic !== normalizedInputMnemonic
                                ) {
                                  setMnemonicInput(recovered.correctedMnemonic);
                                  setMnemonicRandomnessSource("manual");
                                }
                                break;
                              } catch {
                                continue;
                              }
                            }
                          }}
                        />
                        {text.showEntropyDetailsLabel}
                      </label>
                      <HelpHint help={fieldHelp.showEntropyDetails} />
                    </div>

                    {showEntropyDetails && (
                      <section className="mt-6 rounded-2xl border border-(--app-entropy-panel-border) bg-(--app-entropy-panel-bg) p-6 shadow-sm">

                        {/* Header */}
                        <header className="mb-6">
                          <h3 className="text-base font-semibold text-(--app-entropy-text)">
                            {text.entropyDetailsTitle}
                          </h3>
                          <p className="mt-1 text-sm text-(--app-entropy-muted)">
                            {text.entropyWarningText}
                          </p>
                        </header>

                        {/* Entropy Input */}
                        <div className="space-y-6">

                          {/* Textarea */}
                          <div>
                            <label className="block">
                              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-(--app-entropy-text)">
                                {text.entropyInputLabel}
                                <HelpHint help={fieldHelp.entropyInput} />
                              </span>
                              <textarea
                                className="min-h-28 w-full resize-y rounded-xl border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) p-3 font-mono text-sm text-(--app-entropy-field-text) placeholder:text-(--app-entropy-field-placeholder) focus:outline-none focus:ring-2 focus:ring-(--app-entropy-focus)"
                                value={entropyInput}
                                onChange={(event) => {
                                  const sanitizedEntropyInput = sanitizeEntropyInputForType(
                                    event.target.value,
                                    entropyInputType,
                                  );
                                  setEntropyInput(sanitizedEntropyInput);
                                  updateWordCountFromEntropy(
                                    sanitizedEntropyInput,
                                    entropyInputType,
                                  );
                                }}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                              />
                            </label>
                          </div>

                          {/* Entropy Types */}
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-(--app-entropy-text)">
                              {text.entropyValidValuesTitle}
                              <HelpHint help={fieldHelp.entropyType} />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {ENTROPY_INPUT_TYPES.map((type) => {
                                const selected = entropyInputType === type;

                                return (
                                  <label
                                    key={type}
                                    className={`group cursor-pointer rounded-lg border px-3 py-2 transition-all ${selected
                                      ? "border-(--app-entropy-option-selected-border) bg-(--app-entropy-option-selected-bg)"
                                      : "border-(--app-entropy-option-border) bg-(--app-entropy-option-bg) hover:border-(--app-entropy-option-hover-border)"
                                      }`}
                                  >
                                    <input
                                      type="radio"
                                      checked={selected}
                                      onChange={() => {
                                        const sanitizedEntropyInput = sanitizeEntropyInputForType(
                                          entropyInput,
                                          type,
                                        );
                                        setEntropyInputType(type);
                                        setEntropyInput(sanitizedEntropyInput);
                                        updateWordCountFromEntropy(sanitizedEntropyInput, type);
                                      }}
                                      className="hidden"
                                    />

                                    <div className="flex items-center justify-between">
                                      <div className="text-sm font-medium text-(--app-entropy-text)">
                                        {getEntropyTypeLabel(type, text)}
                                      </div>

                                      {selected && (
                                        <div className="h-2 w-2 rounded-full bg-(--app-entropy-option-selected-border)" />
                                      )}
                                    </div>

                                    <div className="mt-1 truncate font-mono text-[11px] text-(--app-entropy-muted) opacity-95">
                                      {ENTROPY_TYPE_EXAMPLES[type]}
                                    </div>
                                    <div className="mt-1 text-[11px] text-(--app-entropy-muted)">
                                      {getEntropyTypeTip(type, text)}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Auto Compute */}
                          <div className="flex items-center justify-between rounded-xl border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) px-4 py-3">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-(--app-entropy-text)">
                              <input
                                type="checkbox"
                                checked={entropyAutoCompute}
                                onChange={(event) => {
                                  const enabled = event.target.checked;
                                  setEntropyAutoCompute(enabled);
                                  if (enabled) {
                                    updateWordCountFromEntropy(entropyInput, entropyInputType);
                                  }
                                }}
                              />
                              {text.entropyAutoComputeLabel}
                            </label>
                            <HelpHint help={fieldHelp.entropyAutoCompute} />
                          </div>

                          {/* Error */}
                          {localizedEntropyError && (
                            <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                              {localizedEntropyError}
                            </div>
                          )}

                          {/* Results */}
                          <div className="border-t border-(--app-entropy-field-border) pt-6">

                            {!entropyDetails ? (
                              !entropyPreview ? (
                                <p className="text-sm text-(--app-entropy-muted)">
                                  {text.entropyDetailsHint}
                                </p>
                              ) : (
                                <>
                                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <EntropyInfoBlock
                                      label={text.entropyTimeToCrackLabel}
                                      value={getLocalizedTimeToCrack(
                                        entropyPreview.timeToCrackUnit,
                                        locale,
                                      )}
                                    />
                                    <EntropyInfoBlock
                                      label={text.entropyTypeLabel}
                                      value={getEntropyTypeLabel(entropyPreview.entropyType, text)}
                                    />
                                    <EntropyInfoBlock
                                      label={text.entropyRawEntropyWordsLabel}
                                      value={String(entropyPreview.rawEntropyWords)}
                                    />
                                    <EntropyInfoBlock
                                      label={text.entropyEventCountLabel}
                                      value={String(entropyPreview.eventCount)}
                                    />
                                    <EntropyInfoBlock
                                      label={text.entropyAvgBitsPerEventLabel}
                                      value={entropyPreview.avgBitsPerEvent.toFixed(2)}
                                    />
                                    <EntropyInfoBlock
                                      label={text.entropyInputBitsLabel}
                                      value={String(entropyPreview.rawEntropyBits)}
                                    />
                                  </div>
                                  <p className="mt-4 text-xs text-(--app-entropy-muted)">
                                    {text.entropyPreviewHint}
                                  </p>
                                  <div className="mt-4 rounded-xl border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) p-4 font-mono text-xs text-(--app-entropy-field-text)">
                                    <div className="space-y-3">
                                      <div>
                                        <span className="font-semibold">{text.entropyFilteredLabel}:</span>
                                        <div className="mt-1 break-all opacity-95">
                                          {entropyPreview.filteredInput || "-"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-semibold">{text.entropyRawBinaryLabel}:</span>
                                        <div className="mt-1 break-all opacity-95">
                                          {entropyPreview.rawBinary || "-"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )
                            ) : (
                              <>
                                {/* Stats Grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                  <EntropyInfoBlock
                                    label={text.entropyTimeToCrackLabel}
                                    value={getLocalizedTimeToCrack(entropyDetails.timeToCrackUnit, locale)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyTypeLabel}
                                    value={getEntropyTypeLabel(entropyDetails.entropyType, text)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyRawEntropyWordsLabel}
                                    value={String(entropyDetails.rawEntropyWords)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyEventCountLabel}
                                    value={String(entropyDetails.eventCount)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyAvgBitsPerEventLabel}
                                    value={entropyDetails.avgBitsPerEvent.toFixed(2)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyInputBitsLabel}
                                    value={String(entropyDetails.rawEntropyBits)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyBitsLabel}
                                    value={String(entropyDetails.entropyBits)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.checksumBitsLabel}
                                    value={String(entropyDetails.checksumBits)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.totalBitsLabel}
                                    value={String(entropyDetails.totalBits)}
                                  />
                                  <EntropyInfoBlock
                                    label={text.entropyKeyspaceLabel}
                                    value={entropyDetails.keyspaceApprox}
                                  />
                                  <EntropyInfoBlock
                                    label={text.randomnessSourceLabel}
                                    value={
                                      mnemonicRandomnessSource === "webcrypto"
                                        ? text.randomnessSourceWebCrypto
                                        : text.randomnessSourceManual
                                    }
                                  />
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                  <label className="text-sm">
                                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-entropy-text)">
                                      {text.entropyMnemonicLengthLabel}
                                      <HelpHint help={fieldHelp.wordCount} />
                                    </span>
                                    <select
                                      className="w-full rounded-lg border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) px-3 py-2 text-(--app-entropy-field-text)"
                                      value={
                                        entropyMnemonicLengthMode === "rawEntropy"
                                          ? "rawEntropy"
                                          : String(wordCount)
                                      }
                                      onChange={(event) => {
                                        const selectedValue = event.target.value;
                                        if (selectedValue === "rawEntropy") {
                                          setEntropyMnemonicLengthMode("rawEntropy");
                                          return;
                                        }
                                        setEntropyMnemonicLengthMode("fixed");
                                        setWordCount(Number(selectedValue) as SupportedWordCount);
                                      }}
                                    >
                                      <option value="rawEntropy">
                                        {text.entropyMnemonicLengthRawOption}
                                      </option>
                                      {ADVANCED_WORD_COUNTS.map((option) => (
                                        <option key={option} value={option}>
                                          {option} {text.wordsSuffix}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="text-sm">
                                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-entropy-text)">
                                      {text.pbkdf2Label}
                                      <HelpHint help={fieldHelp.pbkdf2Rounds} />
                                    </span>
                                    <select
                                      className="w-full rounded-lg border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) px-3 py-2 text-(--app-entropy-field-text)"
                                      value={pbkdf2Rounds}
                                      onChange={(event) => {
                                        const nextRounds = Number(event.target.value);
                                        setPbkdf2Rounds(nextRounds);
                                        if (mode === "strict" && nextRounds !== 2048) {
                                          setMode("advanced");
                                        }
                                      }}
                                    >
                                      {pbkdf2RoundOptions.map((round) => (
                                        <option key={round} value={round}>
                                          {round}
                                          {round === 2048
                                            ? locale === "pt-BR"
                                              ? " (compatibilidade)"
                                              : " (compatibility)"
                                            : ""}
                                        </option>
                                      ))}
                                    </select>
                                    {pbkdf2Rounds !== 2048 && (
                                      <span className="mt-2 block text-xs text-(--app-entropy-muted)">
                                        {text.pbkdf2Warning}
                                      </span>
                                    )}
                                  </label>
                                </div>

                                {/* Technical Raw Data */}
                                <div className="mt-6 rounded-xl border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) p-4 font-mono text-xs text-(--app-entropy-field-text)">
                                  <div className="space-y-3">

                                    <div>
                                      <span className="font-semibold">{text.entropyFilteredLabel}:</span>
                                      <div className="mt-1 break-all opacity-95">
                                        {entropyDetails.filteredInput}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="font-semibold">{text.entropyHexLabel}:</span>
                                      <div className="mt-1 break-all opacity-95">
                                        {entropyDetails.entropyHex}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="font-semibold">{text.entropyRawBinaryLabel}:</span>
                                      <div className="mt-1 break-all opacity-95">
                                        {entropyDetails.rawBinary}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="font-semibold">{text.entropyBinaryChecksumLabel}:</span>
                                      <div className="mt-1 break-all opacity-95">
                                        {entropyDetails.binaryChecksum}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="font-semibold">{text.entropyWordIndexesLabel}:</span>
                                      <div className="mt-1 opacity-95">
                                        {entropyDetails.wordIndexes.join(", ")}
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </section>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-(--app-text)">
                        <input
                          type="checkbox"
                          checked={showBip85}
                          onChange={(event) => setShowBip85(event.target.checked)}
                        />
                        {text.showBip85Label}
                      </label>
                      <HelpHint help={fieldHelp.showBip85} />
                    </div>

                    {showBip85 && (
                      <section className="mt-6 rounded-2xl border border-(--app-border) bg-(--app-surface-alt) p-6">
                        <h3 className="text-base font-semibold text-(--app-text)">
                          {text.bip85SectionTitle}
                        </h3>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <label className="text-sm sm:col-span-2">
                            <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                              {text.bip85ApplicationLabel}
                              <HelpHint help={fieldHelp.bip85Application} />
                            </span>
                            <select
                              className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                              value={bip85Application}
                              onChange={(event) =>
                                setBip85Application(event.target.value as BIP85Application)
                              }
                            >
                              <option value="bip39">{text.bip85ApplicationBip39}</option>
                              <option value="wif">{text.bip85ApplicationWif}</option>
                              <option value="xprv">{text.bip85ApplicationXprv}</option>
                              <option value="hex">{text.bip85ApplicationHex}</option>
                            </select>
                          </label>

                          {bip85Application === "bip39" && (
                            <>
                              <label className="text-sm">
                                <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                                  {text.bip85LanguageLabel}
                                  <HelpHint help={fieldHelp.bip85Language} />
                                </span>
                                <select
                                  className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                                  value={bip85Language}
                                  onChange={(event) =>
                                    setBip85Language(event.target.value as MnemonicLanguage)
                                  }
                                >
                                  {MNEMONIC_LANGUAGE_SELECTION_ORDER.map((language) => (
                                    <option key={language} value={language}>
                                      {MNEMONIC_LANGUAGE_LABELS[language]}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="text-sm">
                                <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                                  {text.bip85WordCountLabel}
                                  <HelpHint help={fieldHelp.bip85WordCount} />
                                </span>
                                <select
                                  className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                                  value={bip85WordCount}
                                  onChange={(event) =>
                                    setBip85WordCount(
                                      Number(event.target.value) as SupportedWordCount,
                                    )
                                  }
                                >
                                  {STRICT_WORD_COUNTS.map((option) => (
                                    <option key={option} value={option}>
                                      {option} {text.wordsSuffix}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </>
                          )}

                          {bip85Application === "hex" && (
                            <label className="text-sm sm:col-span-2">
                              <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                                {text.bip85BytesLabel}
                                <HelpHint help={fieldHelp.bip85Bytes} />
                              </span>
                              <input
                                type="number"
                                min={16}
                                max={64}
                                className="w-full rounded-lg"
                                value={bip85Bytes}
                                onChange={(event) =>
                                  setBip85Bytes(Number(event.target.value))
                                }
                              />
                            </label>
                          )}

                          <label className="text-sm sm:col-span-2">
                            <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                              {text.bip85IndexLabel}
                              <HelpHint help={fieldHelp.bip85Index} />
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={2147483647}
                              className="w-full rounded-lg"
                              value={bip85Index}
                              onChange={(event) => setBip85Index(Number(event.target.value))}
                            />
                          </label>

                          <label className="text-sm sm:col-span-2">
                            <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                              {text.bip85ChildKeyLabel}
                              <HelpHint help={fieldHelp.bip85ChildKey} />
                            </span>
                            <textarea
                              className="min-h-24 w-full resize-y rounded-lg font-mono text-sm"
                              readOnly
                              value={bip85Computation.result?.childKey ?? ""}
                              placeholder={text.bip85ChildKeyPlaceholder}
                            />
                          </label>
                        </div>

                        {bip85Computation.result && (
                          <p className="mt-3 text-xs text-(--app-muted)">
                            {text.bip85PathLabel}:{" "}
                            <span className="font-mono text-(--app-text)">
                              {bip85Computation.result.path}
                            </span>
                          </p>
                        )}
                        {!bip85Computation.result && !localizedBip85Error && (
                          <p className="mt-3 text-xs text-(--app-muted)">{text.bip85ResultHint}</p>
                        )}
                        {localizedBip85Error && (
                          <p className="mt-3 text-sm text-danger">{localizedBip85Error}</p>
                        )}
                      </section>
                    )}
                  </>
                ) : (
                  <>
                    <label className="mt-4 block text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        {text.extendedKeyLabel}
                        <HelpHint help={fieldHelp.extendedKey} />
                      </span>
                      <textarea
                        className="min-h-28 w-full resize-y rounded-lg font-mono text-sm"
                        value={extendedKeyInput}
                        onChange={(event) => setExtendedKeyInput(event.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        placeholder={text.extendedKeyPlaceholder}
                      />
                    </label>
                    <p className="mt-2 text-xs text-(--app-muted)">{text.rootKeyHint}</p>
                  </>
                )}

              </article>

              <article className="rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-6 shadow-sm">
                <h2 className="font-serif text-2xl font-semibold text-(--app-text)">
                  {text.derivationPathSectionTitle}
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                      {text.standardLabel}
                      <HelpHint help={fieldHelp.standard} />
                    </span>
                    <select
                      className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                      value={standard}
                      onChange={(event) => {
                        setStandard(event.target.value as DerivationStandard);
                        setResult(null);
                      }}
                    >
                      <option value="bip44">{text.standardBip44}</option>
                      <option value="bip49">{text.standardBip49}</option>
                      <option value="bip84">{text.standardBip84}</option>
                      <option value="bip86">{text.standardBip86}</option>
                      <option value="custom">{text.standardCustom}</option>
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                      {text.networkLabel}
                      <HelpHint help={fieldHelp.network} />
                    </span>
                    <select
                      className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                      value={network}
                      onChange={(event) => {
                        setNetwork(event.target.value as BitcoinNetwork);
                        setResult(null);
                      }}
                    >
                      <option value="mainnet">{text.networkMainnet}</option>
                      <option value="testnet">{text.networkTestnet}</option>
                    </select>
                  </label>
                </div>

                {standard === "custom" && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        {text.customPathLabel}
                        <HelpHint help={fieldHelp.customPath} />
                      </span>
                      <input
                        type="text"
                        className="w-full rounded-lg font-mono text-sm"
                        value={customPath}
                        onChange={(event) => setCustomPath(event.target.value)}
                        placeholder={text.customPathPlaceholder}
                      />
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                        {text.customAddressTypeLabel}
                        <HelpHint help={fieldHelp.customAddressType} />
                      </span>
                      <select
                        className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                        value={customAddressType}
                        onChange={(event) => setCustomAddressType(event.target.value as AddressType)}
                      >
                        <option value="p2pkh">{text.addressTypeP2pkh}</option>
                        <option value="p2sh-p2wpkh">{text.addressTypeP2shP2wpkh}</option>
                        <option value="p2wpkh">{text.addressTypeP2wpkh}</option>
                        <option value="p2tr">{text.addressTypeP2tr}</option>
                      </select>
                    </label>
                  </div>
                )}

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-sm">
                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                      {text.accountLabel}
                      <HelpHint help={fieldHelp.account} />
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={2147483647}
                      className="w-full rounded-lg"
                      value={account}
                      onChange={(event) => setAccount(Number(event.target.value))}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                      {text.changeLabel}
                      <HelpHint help={fieldHelp.change} />
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      className="w-full rounded-lg"
                      value={change}
                      onChange={(event) => setChange(Number(event.target.value))}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                      {text.startIndexLabel}
                      <HelpHint help={fieldHelp.startIndex} />
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={2147483647}
                      className="w-full rounded-lg"
                      value={startIndex}
                      onChange={(event) => setStartIndex(Number(event.target.value))}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 flex items-center gap-2 font-medium text-(--app-text)">
                      {text.addressCountLabel}
                      <HelpHint help={fieldHelp.addressCount} />
                    </span>
                    <select
                      className="w-full rounded-lg border border-(--app-border) bg-white px-3 py-2 text-secondary"
                      value={rows}
                      onChange={(event) =>
                        setRows(Number(event.target.value) as (typeof ROW_OPTIONS)[number])
                      }
                    >
                      {ROW_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-(--app-text)">
                    <input
                      type="checkbox"
                      checked={useHardenedAddresses}
                      onChange={(event) => setUseHardenedAddresses(event.target.checked)}
                    />
                    {text.hardenedAddressLabel}
                  </label>
                  <HelpHint help={fieldHelp.hardenedAddresses} />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-(--app-btn-secondary-border) bg-(--app-btn-secondary-bg) px-4 py-2 text-sm font-semibold text-(--app-btn-secondary-text) hover:bg-(--app-btn-secondary-hover)"
                    onClick={handleDerive}
                  >
                    {text.deriveButton}
                  </button>
                  <HelpHint help={fieldHelp.deriveWallet} />
                  <button
                    type="button"
                    className="rounded-lg border border-(--app-btn-ghost-border) bg-(--app-btn-ghost-bg) px-4 py-2 text-sm font-semibold text-(--app-btn-ghost-text) hover:bg-(--app-btn-ghost-hover-bg) hover:text-(--app-btn-ghost-hover-text)"
                    onClick={handleClearSensitive}
                  >
                    {text.clearButton}
                  </button>
                  <HelpHint help={fieldHelp.clearSensitive} />
                </div>

                  <div className="mt-4 rounded-lg border border-(--app-border) bg-(--app-surface-alt) p-3 text-sm">
                  {sourceMode === "mnemonic" && (
                    <p className="font-medium text-(--app-text)">
                      {text.mnemonicStatusLabel}{" "}
                      <span className={mnemonicValidation.valid ? "text-success" : "text-danger"}>
                        {activeMnemonicInput.length === 0
                          ? text.mnemonicStatusEmpty
                          : mnemonicValidation.valid
                            ? text.mnemonicStatusValid
                            : text.mnemonicStatusInvalid}
                      </span>
                    </p>
                  )}
                  {localizedMnemonicValidationError && (
                    <p className="mt-2 text-danger">{localizedMnemonicValidationError}</p>
                  )}
                  {showEntropyDetails &&
                    recoveredMnemonicEntropy &&
                    !recoveredMnemonicEntropy.checksumValid && (
                      <p className="mt-2 text-(--app-text)">
                        {text.entropyMnemonicCorrectedHint}{" "}
                        <span className="font-mono">
                          {recoveredMnemonicEntropy.correctedMnemonic}
                        </span>
                      </p>
                    )}
                  {localizedError && <p className="mt-2 text-danger">{localizedError}</p>}
                </div>

              </article>

              <article className="rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold text-(--app-text)">
                    {text.derivedAddressesSectionTitle}
                  </h2>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-(--app-text)">
                      <input
                        type="checkbox"
                        checked={showSecrets}
                        onChange={(event) => setShowSecrets(event.target.checked)}
                      />
                      {text.showSecrets}
                    </label>
                    <HelpHint help={fieldHelp.showSecrets} />
                  </div>
                </div>

                {!result && <p className="mt-4 text-sm text-(--app-muted)">{text.outputHint}</p>}

                {result && (
                  <div className="mt-4 space-y-4">
                    <InfoBlock
                      label="Seed (hex)"
                      value={
                        result.seedHex
                          ? showSecrets
                            ? result.seedHex
                            : maskSecret(result.seedHex)
                          : text.notAvailable
                      }
                    />
                    <InfoBlock label={text.sourceInfoLabel} value={getSourceTypeLabel(result, text)} />
                    <InfoBlock label={text.standardInfoLabel} value={result.standard.toUpperCase()} />
                    <InfoBlock label="Account Path" value={result.accountPath} />
                    <InfoBlock label="Account Xpub" value={result.accountXpub} />
                    <InfoBlock
                      label="Account Xprv"
                      value={
                        showSecrets
                          ? result.accountXprv ?? text.notAvailable
                          : maskSecret(result.accountXprv ?? text.notAvailable)
                      }
                    />

                    <div>
                      <p className="mb-2 text-sm font-semibold text-(--app-text)">
                        {text.addressRowsLabel}
                      </p>
                      <div className="max-h-80 overflow-auto rounded-lg border border-(--app-border)">
                        <table className="w-full min-w-270 border-collapse text-left text-xs">
                          <thead className="sticky top-0 bg-(--app-surface-alt)">
                            <tr>
                              <th className="px-3 py-2">{text.tablePath}</th>
                              <th className="px-3 py-2">{text.tableType}</th>
                              <th className="px-3 py-2">{text.tableAddress}</th>
                              <th className="px-3 py-2">{text.tablePublicKey}</th>
                              <th className="px-3 py-2">{text.tablePrivateKey}</th>
                              <th className="px-3 py-2">{text.tableWif}</th>
                              {showInternalKeyColumn && (
                                <th className="px-3 py-2">{text.tableInternalKey}</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {result.rows.map((row) => (
                              <tr key={row.path} className="border-t border-(--app-border)">
                                <td className="px-3 py-2 font-mono text-[11px]">{row.path}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">{row.addressType}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">{row.address}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">{row.publicKeyHex}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">
                                  {showSecrets
                                    ? row.privateKeyHex ?? text.notAvailable
                                    : maskSecret(row.privateKeyHex ?? text.notAvailable)}
                                </td>
                                <td className="px-3 py-2 font-mono text-[11px]">
                                  {showSecrets
                                    ? row.privateKeyWif ?? text.notAvailable
                                    : maskSecret(row.privateKeyWif ?? text.notAvailable)}
                                </td>
                                {showInternalKeyColumn && (
                                  <td className="px-3 py-2 font-mono text-[11px]">
                                    {row.internalKeyHex ?? text.notAvailable}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </section>

            <footer className="mt-6 rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-4 text-xs text-(--app-muted) shadow-sm">
              <p>{text.footer}</p>
            </footer>
          </>
        ) : (
          <TutorialPlaceholder
            text={text}
            activeTab={activeTab}
            proposalDoc={TUTORIAL_PROPOSAL_DOCS[activeTab]}
          />
        )}

        {isManual1248Open && (
          <Manual1248Modal
            text={text}
            onClose={() => setIsManual1248Open(false)}
            proposalDoc={MANUAL_1248_PROPOSAL_DOC}
          />
        )}
      </div>
    </main>
  );
}

type TutorialPlaceholderProps = {
  text: ReturnType<typeof getUiText>;
  activeTab: Exclude<AppTab, "tool">;
  proposalDoc: string;
};

function TutorialPlaceholder({ text, activeTab, proposalDoc }: TutorialPlaceholderProps) {
  return (
    <section className="rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-6 shadow-sm">
      <p className="mb-2 inline-flex rounded-full border border-(--app-chip-border) bg-(--app-chip-soft) px-3 py-1 text-xs font-semibold text-(--app-chip-text)">
        {text.constructionBadge}
      </p>
      <h2 className="font-serif text-2xl font-semibold text-(--app-text)">
        {text.constructionTitle}
      </h2>
      <p className="mt-3 text-sm text-(--app-muted)">{text.constructionDescription}</p>
      <p className="mt-4 rounded-lg border border-(--app-border) bg-(--app-surface-alt) px-4 py-3 text-sm text-(--app-text)">
        {getTutorialPlaceholderText(activeTab, text)}
      </p>
      <p className="mt-4 text-xs text-(--app-muted)">
        {text.proposalDocLabel}:{" "}
        <span className="rounded bg-(--app-surface-alt) px-2 py-1 font-mono text-(--app-text)">
          {proposalDoc}
        </span>
      </p>
    </section>
  );
}

type Manual1248ModalProps = {
  text: ReturnType<typeof getUiText>;
  proposalDoc: string;
  onClose: () => void;
};

function Manual1248Modal({ text, proposalDoc, onClose }: Manual1248ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={text.manual1248Close}
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-(--app-border) bg-(--app-surface-bg) p-6 shadow-xl">
        <p className="mb-2 inline-flex rounded-full border border-(--app-chip-border) bg-(--app-chip-soft) px-3 py-1 text-xs font-semibold text-(--app-chip-text)">
          {text.constructionBadge}
        </p>
        <h2 className="font-serif text-2xl font-semibold text-(--app-text)">
          {text.manual1248Title}
        </h2>
        <p className="mt-3 text-sm text-(--app-muted)">{text.manual1248Description}</p>
        <p className="mt-3 rounded-lg border border-(--app-border) bg-(--app-surface-alt) px-4 py-3 text-sm text-(--app-text)">
          {text.manual1248AccessHint}
        </p>
        <p className="mt-4 text-xs text-(--app-muted)">
          {text.proposalDocLabel}:{" "}
          <span className="rounded bg-(--app-surface-alt) px-2 py-1 font-mono text-(--app-text)">
            {proposalDoc}
          </span>
        </p>
        <div className="mt-5">
          <button
            type="button"
            className="rounded-lg border border-(--app-btn-secondary-border) bg-(--app-btn-secondary-bg) px-4 py-2 text-sm font-semibold text-(--app-btn-secondary-text) hover:bg-(--app-btn-secondary-hover)"
            onClick={onClose}
          >
            {text.manual1248Close}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTutorialPlaceholderText(
  activeTab: Exclude<AppTab, "tool">,
  text: ReturnType<typeof getUiText>,
): string {
  const placeholders: Record<Exclude<AppTab, "tool">, string> = {
    theory: text.theoryPlaceholder,
    technical: text.technicalPlaceholder,
    math: text.mathPlaceholder,
    bestPractices: text.bestPracticesPlaceholder,
  };
  return placeholders[activeTab];
}

function getSourceTypeLabel(
  result: DerivedWallet,
  text: ReturnType<typeof getUiText>,
): string {
  return result.sourceType === "seed" ? text.sourceInfoSeed : text.sourceInfoExtendedKey;
}

function getLocalizedTimeToCrack(unit: TimeToCrackUnit, locale: AppLocale): string {
  if (locale === "pt-BR") {
    switch (unit) {
      case "seconds":
        return "segundos";
      case "minutes":
        return "minutos";
      case "hours":
        return "horas";
      case "days":
        return "dias";
      case "months":
        return "meses";
      case "years":
        return "anos";
      case "centuries":
        return "séculos";
    }
  }

  switch (unit) {
    case "seconds":
      return "seconds";
    case "minutes":
      return "minutes";
    case "hours":
      return "hours";
    case "days":
      return "days";
    case "months":
      return "months";
    case "years":
      return "years";
    case "centuries":
      return "centuries";
  }
}

function getEntropyTypeLabel(
  entropyType: EntropyInputType,
  text: ReturnType<typeof getUiText>,
): string {
  switch (entropyType) {
    case "binary":
      return text.entropyTypeBinary;
    case "base6":
      return text.entropyTypeBase6;
    case "dice":
      return text.entropyTypeDice;
    case "base10":
      return text.entropyTypeBase10;
    case "hex":
      return text.entropyTypeHex;
    case "card":
      return text.entropyTypeCard;
  }
}

function getEntropyTypeTip(
  entropyType: EntropyInputType,
  text: ReturnType<typeof getUiText>,
): string {
  switch (entropyType) {
    case "binary":
      return text.entropyTypeBinaryTip;
    case "base6":
      return text.entropyTypeBase6Tip;
    case "dice":
      return text.entropyTypeDiceTip;
    case "base10":
      return text.entropyTypeBase10Tip;
    case "hex":
      return text.entropyTypeHexTip;
    case "card":
      return text.entropyTypeCardTip;
  }
}

type HelpHintProps = {
  help: FieldHelpContent;
};

function HelpHint({ help }: HelpHintProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const detailsElement = detailsRef.current;
      if (!detailsElement || !detailsElement.open) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && !detailsElement.contains(target)) {
        detailsElement.open = false;
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const referencesLabel =
    typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("pt")
      ? "Referências"
      : "References";

  return (
    <details ref={detailsRef} className="relative inline-block">
      <summary
        className="help-summary"
        aria-label="Field help"
      >
        ?
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-84 max-w-[85vw] rounded-lg border border-(--app-border) bg-(--app-surface-bg) p-3 text-xs shadow-xl">
        <p className="text-(--app-text)">{help.comment}</p>
        <p className="mt-2 font-semibold text-(--app-text)">{referencesLabel}</p>
        <ul className="mt-1 space-y-1">
          {help.references.map((reference) => (
            <li key={reference.url}>
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-(--app-link) underline underline-offset-2"
              >
                {reference.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

type InfoBlockProps = {
  label: string;
  value: string;
};

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--app-muted)">
        {label}
      </p>
      <p className="rounded-lg border border-(--app-border) bg-(--app-surface-alt) px-3 py-2 font-mono text-xs text-(--app-text)">
        {value}
      </p>
    </div>
  );
}

function EntropyInfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--app-entropy-muted)">
        {label}
      </p>
      <p className="rounded-lg border border-(--app-entropy-field-border) bg-(--app-entropy-field-bg) px-3 py-2 font-mono text-xs text-(--app-entropy-field-text)">
        {value}
      </p>
    </div>
  );
}

function maskSecret(value: string): string {
  if (value === "N/A") {
    return value;
  }
  if (value.length <= 16) {
    return "••••";
  }
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

export default App;

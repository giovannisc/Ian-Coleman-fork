import { bech32, bech32m, createBase58check } from "@scure/base";
import { HDKey } from "@scure/bip32";
import { schnorr, secp256k1 } from "@noble/curves/secp256k1.js";
import { hmac } from "@noble/hashes/hmac.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import {
  wordlists,
} from "bip39";
import { validateDerivationPath, validateXpubDerivationPath } from "./derivationPath";

export type BitcoinNetwork = "mainnet" | "testnet";
export type DerivationStandard = "bip44" | "bip49" | "bip84" | "bip86" | "custom";
export type AddressType = "p2pkh" | "p2sh-p2wpkh" | "p2wpkh" | "p2tr";
export type BIP39Mode = "strict" | "advanced";
export type BIP32RootKeyFormat = "xprv" | "yprv" | "zprv";

export const STRICT_WORD_COUNTS = [12, 15, 18, 21, 24] as const;
export const ADVANCED_WORD_COUNTS = [12, 15, 18, 21, 24] as const;

export type SupportedWordCount = (typeof ADVANCED_WORD_COUNTS)[number];
export type EntropyInputType = "binary" | "base6" | "dice" | "base10" | "hex" | "card";
export type EntropyMnemonicLengthMode = "fixed" | "rawEntropy";
export type TimeToCrackUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years"
  | "centuries";

export const SUPPORTED_MNEMONIC_LANGUAGES = [
  "english",
  "chinese_simplified",
  "chinese_traditional",
  "czech",
  "french",
  "italian",
  "japanese",
  "korean",
  "portuguese",
  "spanish",
] as const;

export const ENTROPY_INPUT_TYPES: readonly EntropyInputType[] = [
  "binary",
  "base6",
  "dice",
  "base10",
  "hex",
  "card",
] as const;

export type MnemonicLanguage = (typeof SUPPORTED_MNEMONIC_LANGUAGES)[number];

export type MnemonicValidationResult = {
  valid: boolean;
  error: string | null;
  wordCount: number;
};

export type MnemonicRandomnessSource = "webcrypto" | "manual";

export type MnemonicEntropyDetails = {
  entropyHex: string;
  entropyBits: number;
  checksumBits: number;
  totalBits: number;
  keyspaceApprox: string;
};

export type GeneratedMnemonic = {
  mnemonic: string;
  details: MnemonicEntropyDetails;
  randomnessSource: MnemonicRandomnessSource;
};

export type EntropyDetailsReport = MnemonicEntropyDetails & {
  entropyType: EntropyInputType;
  eventCount: number;
  avgBitsPerEvent: number;
  filteredInput: string;
  rawEntropyBits: number;
  rawEntropyWords: number;
  mnemonicWordCount: number;
  mnemonicLengthMode: EntropyMnemonicLengthMode;
  timeToCrackUnit: TimeToCrackUnit;
  rawBinary: string;
  binaryChecksum: string;
  wordIndexes: number[];
  mnemonic: string;
};

export type EntropyComputationResult = {
  mnemonic: string;
  details: EntropyDetailsReport;
};

export type MnemonicEntropyRecovery = {
  language: MnemonicLanguage;
  wordCount: number;
  entropyHex: string;
  checksumBits: number;
  providedChecksumBits: string;
  expectedChecksumBits: string;
  checksumValid: boolean;
  originalMnemonic: string;
  correctedMnemonic: string;
  details: EntropyDetailsReport;
};

export type EntropyInputPreview = {
  entropyType: EntropyInputType;
  filteredInput: string;
  eventCount: number;
  avgBitsPerEvent: number;
  rawBits: string;
  rawBinary: string;
  rawEntropyBits: number;
  rawEntropyWords: number;
  timeToCrackUnit: TimeToCrackUnit;
};

export type BIP85Application = "bip39" | "wif" | "xprv" | "hex";

export type BIP85Bip39Result = {
  application: "bip39";
  path: string;
  childKey: string;
  childEntropyHex: string;
  childMnemonic: string;
  language: MnemonicLanguage;
  wordCount: SupportedWordCount;
  index: number;
};

export type BIP85WifResult = {
  application: "wif";
  path: string;
  childKey: string;
  childWif: string;
  index: number;
};

export type BIP85XprvResult = {
  application: "xprv";
  path: string;
  childKey: string;
  childXprv: string;
  childEntropyHex: string;
  index: number;
};

export type BIP85HexResult = {
  application: "hex";
  path: string;
  childKey: string;
  childEntropyHex: string;
  bytes: number;
  index: number;
};

export type BIP85Result = BIP85Bip39Result | BIP85WifResult | BIP85XprvResult | BIP85HexResult;

export type SplitMnemonicCardsResult = {
  cards: string[];
  maskedWordCountPerCard: number;
  hackTimeSeconds: number;
  hackTimeUnit: "lt1second" | "seconds" | "days" | "years";
  hackTimeValue: number | null;
  highlightRisk: boolean;
};

export type DerivedAddressRow = {
  index: number;
  path: string;
  addressType: AddressType;
  address: string;
  publicKeyHex: string;
  privateKeyHex: string | null;
  privateKeyWif: string | null;
  internalKeyHex?: string;
};

export type DerivedWallet = {
  standard: DerivationStandard;
  seedHex: string | null;
  sourceType: "seed" | "extendedKey";
  accountPath: string;
  accountXpub: string;
  accountXprv: string | null;
  rows: DerivedAddressRow[];
};

type DeriveArgs = {
  seedHex?: string;
  extendedKey?: string;
  network: BitcoinNetwork;
  standard: DerivationStandard;
  account?: number;
  change?: number;
  count: number;
  startIndex?: number;
  useHardenedAddresses?: boolean;
  customPath?: string;
  customAddressType?: AddressType;
};

type WalletVersion = {
  private: number;
  public: number;
};

type TaprootKeyMaterial = {
  internalKey: Uint8Array;
  outputKey: Uint8Array;
  tweakedPrivateKey: Uint8Array | null;
};

type StandardConfig = {
  purpose: number;
  addressType: AddressType;
  versions: Record<BitcoinNetwork, WalletVersion>;
};

type ParsedExtendedKey = {
  node: HDKey;
  network: BitcoinNetwork;
};

const WORDLIST_BY_LANGUAGE: Record<MnemonicLanguage, string[]> = {
  english: wordlists.english,
  chinese_simplified: wordlists.chinese_simplified,
  chinese_traditional: wordlists.chinese_traditional,
  czech: wordlists.czech,
  french: wordlists.french,
  italian: wordlists.italian,
  japanese: wordlists.japanese,
  korean: wordlists.korean,
  portuguese: wordlists.portuguese,
  spanish: wordlists.spanish,
};

const BASE58CHECK = createBase58check(sha256);

const BIP32_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  mainnet: { private: 0x0488ade4, public: 0x0488b21e },
  testnet: { private: 0x04358394, public: 0x043587cf },
};

const BIP44_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  ...BIP32_VERSIONS,
};

const BIP49_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  mainnet: { private: 0x049d7878, public: 0x049d7cb2 },
  testnet: { private: 0x044a4e28, public: 0x044a5262 },
};

const BIP84_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  mainnet: { private: 0x04b2430c, public: 0x04b24746 },
  testnet: { private: 0x045f18bc, public: 0x045f1cf6 },
};

const BIP86_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  ...BIP32_VERSIONS,
};

const STANDARD_CONFIGS: Record<Exclude<DerivationStandard, "custom">, StandardConfig> = {
  bip44: { purpose: 44, addressType: "p2pkh", versions: BIP44_VERSIONS },
  bip49: { purpose: 49, addressType: "p2sh-p2wpkh", versions: BIP49_VERSIONS },
  bip84: { purpose: 84, addressType: "p2wpkh", versions: BIP84_VERSIONS },
  bip86: { purpose: 86, addressType: "p2tr", versions: BIP86_VERSIONS },
};

const SUPPORTED_EXTENDED_KEY_VERSION_CANDIDATES: Array<{
  network: BitcoinNetwork;
  versions: WalletVersion;
}> = [
  { network: "mainnet", versions: BIP32_VERSIONS.mainnet },
  { network: "testnet", versions: BIP32_VERSIONS.testnet },
  { network: "mainnet", versions: BIP49_VERSIONS.mainnet },
  { network: "testnet", versions: BIP49_VERSIONS.testnet },
  { network: "mainnet", versions: BIP84_VERSIONS.mainnet },
  { network: "testnet", versions: BIP84_VERSIONS.testnet },
];

const CURVE_ORDER = secp256k1.Point.CURVE().n;
const BIP85_LANGUAGE_CODE_BY_MNEMONIC: Record<MnemonicLanguage, number> = {
  english: 0,
  japanese: 1,
  korean: 2,
  spanish: 3,
  chinese_simplified: 4,
  chinese_traditional: 5,
  french: 6,
  italian: 7,
  czech: 8,
  portuguese: 9,
};

export function sanitizeMnemonicInput(input: string): string {
  return input.trim().split(/\s+/).join(" ");
}

export function generateMnemonicByLanguage(
  words: SupportedWordCount,
  language: MnemonicLanguage,
  mode: BIP39Mode = "strict",
): string {
  return generateMnemonicWithDetails(words, language, mode).mnemonic;
}

export function generateMnemonicWithDetails(
  words: SupportedWordCount,
  language: MnemonicLanguage,
  mode: BIP39Mode = "strict",
): GeneratedMnemonic {
  const allowed = allowedWordCounts(mode);
  if (!allowed.includes(words)) {
    throw new Error(`Quantidade de palavras inválida para modo ${mode}: ${words}.`);
  }
  const strength = (words / 3) * 32;
  const entropyBytes = getSecureRandomEntropy(strength / 8);
  const entropyHex = bytesToHex(entropyBytes);
  const mnemonic = entropyHexToMnemonic(entropyHex, language);

  return {
    mnemonic,
    details: buildEntropyDetails(entropyHex),
    randomnessSource: "webcrypto",
  };
}

export function validateMnemonicByLanguage(
  input: string,
  language: MnemonicLanguage,
  mode: BIP39Mode = "strict",
): MnemonicValidationResult {
  const phrase = sanitizeMnemonicInput(input);
  const words = phrase.length > 0 ? phrase.split(" ") : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      valid: false,
      error: "Mnemonic vazia.",
      wordCount,
    };
  }

  const allowed = allowedWordCounts(mode);
  if (!allowed.includes(wordCount as SupportedWordCount)) {
    return {
      valid: false,
      error:
        mode === "strict"
          ? "Modo estrito aceita apenas 12, 15, 18, 21 ou 24 palavras."
          : "Modo avançado aceita apenas 12, 15, 18, 21 ou 24 palavras.",
      wordCount,
    };
  }

  const wordlist = getWordlist(language);
  const wordIndex = new Map<string, number>(wordlist.map((word, index) => [word, index]));
  const bitChunks: string[] = [];
  for (const word of words) {
    const index = wordIndex.get(word);
    if (index === undefined) {
      return {
        valid: false,
        error: `Mnemonic inválida para a wordlist ${language} BIP39.`,
        wordCount,
      };
    }
    bitChunks.push(index.toString(2).padStart(11, "0"));
  }
  const bits = bitChunks.join("");

  const checksumBitsLength = wordCount / 3;
  const entropyBitsLength = bits.length - checksumBitsLength;
  const entropyBits = bits.slice(0, entropyBitsLength);
  const providedChecksumBits = bits.slice(entropyBitsLength);
  const entropyHex = binaryToHex(entropyBits).slice(0, entropyBitsLength / 4);
  const expectedChecksumBits = bytesToBinary(sha256(hexToBytes(entropyHex))).slice(
    0,
    checksumBitsLength,
  );

  if (providedChecksumBits !== expectedChecksumBits) {
    return {
      valid: false,
      error: `Mnemonic inválida para a wordlist ${language} BIP39.`,
      wordCount,
    };
  }

  return {
    valid: true,
    error: null,
    wordCount,
  };
}

export function getMnemonicEntropyDetails(
  mnemonic: string,
  language: MnemonicLanguage,
): MnemonicEntropyDetails {
  const normalized = sanitizeMnemonicInput(mnemonic);
  const entropyHex = mnemonicToEntropyHex(normalized, language);
  return buildEntropyDetails(entropyHex);
}

export function getMnemonicEntropyReport(
  mnemonic: string,
  language: MnemonicLanguage,
): EntropyDetailsReport {
  const normalized = sanitizeMnemonicInput(mnemonic);
  const entropyHex = mnemonicToEntropyHex(normalized, language);
  const entropyBits = bytesToBinary(hexToBytes(entropyHex));
  const mnemonicWordCount = normalized.split(" ").length;
  return buildEntropyDetailsReport({
    entropyHex,
    entropyType: "hex",
    eventCount: entropyHex.length,
    avgBitsPerEvent: 4,
    filteredInput: entropyHex,
    rawBits: entropyBits,
    mnemonic: normalized,
    language,
    mnemonicWordCount,
    mnemonicLengthMode: "fixed",
  });
}

export function recoverMnemonicEntropy({
  mnemonic,
  language,
}: {
  mnemonic: string;
  language: MnemonicLanguage;
}): MnemonicEntropyRecovery {
  const normalized = sanitizeMnemonicInput(mnemonic);
  if (!normalized) {
    throw new Error("Mnemonic vazia.");
  }

  const words = normalized.split(" ");
  if (words.length < 3 || words.length % 3 !== 0) {
    throw new Error("Conjunto de palavras inválido para análise de entropia. Use múltiplos de 3.");
  }

  const wordlist = getWordlist(language);
  const wordIndex = new Map<string, number>(wordlist.map((word, index) => [word, index]));
  const bits = words
    .map((word) => {
      const index = wordIndex.get(word);
      if (index === undefined) {
        throw new Error(`Mnemonic inválida para a wordlist ${language} BIP39.`);
      }
      return index.toString(2).padStart(11, "0");
    })
    .join("");

  const checksumBitLength = words.length / 3;
  const entropyBitLength = bits.length - checksumBitLength;
  const entropyBits = bits.slice(0, entropyBitLength);
  const providedChecksumBits = bits.slice(entropyBitLength);
  const entropyHex = binaryToHex(entropyBits).slice(0, entropyBitLength / 4);
  const expectedChecksumBits = bytesToBinary(sha256(hexToBytes(entropyHex))).slice(
    0,
    checksumBitLength,
  );
  const checksumValid = providedChecksumBits === expectedChecksumBits;

  const correctedBits = `${entropyBits}${expectedChecksumBits}`;
  const correctedWords: string[] = [];
  for (let offset = 0; offset < correctedBits.length; offset += 11) {
    const chunk = correctedBits.slice(offset, offset + 11);
    const index = Number.parseInt(chunk, 2);
    const word = wordlist[index];
    if (!word) {
      throw new Error(`Falha ao converter índice da mnemonic: ${index}.`);
    }
    correctedWords.push(word);
  }
  const correctedMnemonic = correctedWords.join(" ");

  return {
    language,
    wordCount: words.length,
    entropyHex,
    checksumBits: checksumBitLength,
    providedChecksumBits,
    expectedChecksumBits,
    checksumValid,
    originalMnemonic: normalized,
    correctedMnemonic,
    details: buildEntropyDetailsReport({
      entropyHex,
      entropyType: "hex",
      eventCount: entropyHex.length,
      avgBitsPerEvent: 4,
      filteredInput: entropyHex,
      rawBits: entropyBits,
      mnemonic: correctedMnemonic,
      language,
      mnemonicWordCount: words.length,
      mnemonicLengthMode: "fixed",
    }),
  };
}

export function computeMnemonicFromEntropyInput({
  input,
  inputType,
  wordCount,
  language,
  mnemonicLengthMode = "fixed",
  allowInsufficientEntropy = false,
}: {
  input: string;
  inputType: EntropyInputType;
  wordCount: SupportedWordCount;
  language: MnemonicLanguage;
  mnemonicLengthMode?: EntropyMnemonicLengthMode;
  allowInsufficientEntropy?: boolean;
}): EntropyComputationResult {
  const parsed = parseEntropyInput(input, inputType);
  if (parsed.eventCount === 0 || parsed.rawBits.length === 0) {
    throw new Error("Entropia vazia.");
  }
  const resolvedWordCount =
    allowInsufficientEntropy && mnemonicLengthMode === "rawEntropy" && parsed.rawBits.length < 128
      ? wordCount
      : resolveEntropyWordCount(parsed.rawBits.length, wordCount, mnemonicLengthMode);
  const targetEntropyBits = (resolvedWordCount / 3) * 32;
  if (parsed.rawBits.length < targetEntropyBits) {
    if (!allowInsufficientEntropy) {
      throw new Error(
        `Entropia insuficiente para ${resolvedWordCount} palavras. Necessário >= ${targetEntropyBits} bits.`,
      );
    }
  }

  let entropyBits: string;
  if (parsed.rawBits.length >= targetEntropyBits) {
    const startOffset = parsed.rawBits.length - targetEntropyBits;
    entropyBits = parsed.rawBits.slice(startOffset);
  } else {
    entropyBits = parsed.rawBits.padEnd(targetEntropyBits, "0");
  }
  const entropyHex = binaryToHex(entropyBits).slice(0, targetEntropyBits / 4);
  const mnemonic = entropyHexToMnemonic(entropyHex, language);
  return {
    mnemonic,
    details: buildEntropyDetailsReport({
      entropyHex,
      entropyType: inputType,
      eventCount: parsed.eventCount,
      avgBitsPerEvent: parsed.avgBitsPerEvent,
      filteredInput: parsed.filteredInput,
      rawBits: parsed.rawBits,
      mnemonic,
      language,
      mnemonicWordCount: resolvedWordCount,
      mnemonicLengthMode,
    }),
  };
}

export function previewEntropyInput({
  input,
  inputType,
}: {
  input: string;
  inputType: EntropyInputType;
}): EntropyInputPreview {
  const parsed = parseEntropyInput(input, inputType);
  const rawEntropyBits = parsed.rawBits.length;
  const rawEntropyWords = Math.floor(rawEntropyBits / 32) * 3;
  return {
    entropyType: inputType,
    filteredInput: parsed.filteredInput,
    eventCount: parsed.eventCount,
    avgBitsPerEvent: parsed.avgBitsPerEvent,
    rawBits: parsed.rawBits,
    rawBinary: groupBinary(parsed.rawBits),
    rawEntropyBits,
    rawEntropyWords,
    timeToCrackUnit: estimateTimeToCrackUnit(rawEntropyBits),
  };
}

export function generateEnglishMnemonic(
  words: SupportedWordCount,
  mode: BIP39Mode = "strict",
): string {
  return generateMnemonicByLanguage(words, "english", mode);
}

export function validateEnglishMnemonic(
  input: string,
  mode: BIP39Mode = "strict",
): MnemonicValidationResult {
  return validateMnemonicByLanguage(input, "english", mode);
}

export function mnemonicToSeedHex(
  mnemonic: string,
  passphrase: string,
  pbkdf2Rounds = 2048,
  mode: BIP39Mode = "strict",
  language: MnemonicLanguage = "english",
): string {
  const validation = validateMnemonicByLanguage(mnemonic, language, mode);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Mnemonic inválida.");
  }

  const normalizedMnemonic = sanitizeMnemonicInput(mnemonic).normalize("NFKD");
  const normalizedPassphrase = passphrase.normalize("NFKD");
  const rounds = normalizePbkdf2Rounds(pbkdf2Rounds);

  if (mode === "strict" && rounds !== 2048) {
    throw new Error("Modo estrito exige PBKDF2 fixo em 2048 rounds.");
  }

  const seed = pbkdf2(
    sha512,
    utf8ToBytes(normalizedMnemonic),
    utf8ToBytes(`mnemonic${normalizedPassphrase}`),
    {
      c: rounds,
      dkLen: 64,
    },
  );
  return bytesToHex(seed);
}

export function deriveWallet({
  seedHex,
  extendedKey,
  network,
  standard,
  account = 0,
  change = 0,
  count,
  startIndex = 0,
  useHardenedAddresses = false,
  customPath,
  customAddressType,
}: DeriveArgs): DerivedWallet {
  if (seedHex && extendedKey) {
    throw new Error("Informe apenas um entre seedHex e extendedKey.");
  }
  if (!seedHex && !extendedKey) {
    throw new Error("Pelo menos um entre seedHex ou extendedKey deve ser informado.");
  }

  const safeAccount = clampUInt31(account);
  const safeChange = Math.min(1, Math.max(0, Math.trunc(change)));
  const safeCount = Math.min(200, Math.max(1, Math.trunc(count)));
  const safeStartIndex = clampUInt31(startIndex);
  const addressType = resolveAddressType(standard, customAddressType);

  let sourceType: DerivedWallet["sourceType"] = "seed";
  let accountNode: HDKey;
  let accountPath: string;
  let accountXpub: string;
  let accountXprv: string | null;
  let rowPathPrefix: string;
  let relativePathPrefix: string;
  let isXpubSource = false;

  if (extendedKey) {
    sourceType = "extendedKey";
    const parsed = parseExtendedKey(extendedKey);
    if (parsed.network !== network) {
      throw new Error(
        `A chave estendida informada pertence à rede ${parsed.network}, mas a rede selecionada foi ${network}.`,
      );
    }

    accountNode = parsed.node;
    isXpubSource = accountNode.privateKey === undefined;

    const customRelativePrefix =
      standard === "custom" ? normalizeCustomPath(customPath, "m") : "m";
    relativePathPrefix = `${customRelativePrefix}/${safeChange}`;
    accountPath = customRelativePrefix;
    rowPathPrefix = `${accountPath}/${safeChange}`;

    accountXpub = accountNode.publicExtendedKey;
    accountXprv = readPrivateExtendedKey(accountNode);
  } else {
    const seedBytes = hexToBytes(seedHex ?? "");

    if (standard === "custom") {
      const normalizedCustomPath = normalizeCustomPath(customPath, "m");
      const root = HDKey.fromMasterSeed(seedBytes, BIP32_VERSIONS[network]);
      ensureValidPath(normalizedCustomPath);

      accountPath = normalizedCustomPath;
      accountNode = root.derive(accountPath);
      relativePathPrefix = `m/${safeChange}`;
      rowPathPrefix = `${accountPath}/${safeChange}`;
    } else {
      const config = STANDARD_CONFIGS[standard];
      const coinType = network === "mainnet" ? 0 : 1;
      const root = HDKey.fromMasterSeed(seedBytes, config.versions[network]);

      accountPath = `m/${config.purpose}'/${coinType}'/${safeAccount}'`;
      ensureValidPath(accountPath);

      accountNode = root.derive(accountPath);
      relativePathPrefix = `m/${safeChange}`;
      rowPathPrefix = `${accountPath}/${safeChange}`;
    }

    accountXpub = accountNode.publicExtendedKey;
    accountXprv = readPrivateExtendedKey(accountNode);
  }

  const rows: DerivedAddressRow[] = [];
  const hrp = network === "mainnet" ? "bc" : "tb";

  for (let offset = 0; offset < safeCount; offset += 1) {
    const index = safeStartIndex + offset;
    const indexSegment = useHardenedAddresses ? `${index}'` : `${index}`;
    const relativePath = `${relativePathPrefix}/${indexSegment}`;
    const fullPath = `${rowPathPrefix}/${indexSegment}`;

    if (isXpubSource) {
      ensureValidXpubPath(relativePath, useHardenedAddresses);
    } else {
      ensureValidPath(relativePath);
    }

    const child = accountNode.derive(relativePath);
    rows.push(deriveAddressRow(fullPath, index, child, addressType, network, hrp));
  }

  return {
    standard,
    seedHex: seedHex ?? null,
    sourceType,
    accountPath,
    accountXpub,
    accountXprv,
    rows,
  };
}

export function deriveBip84Wallet(
  args: Omit<DeriveArgs, "standard"> & { seedHex: string },
): DerivedWallet {
  return deriveWallet({ ...args, standard: "bip84" });
}

export function deriveBip86Wallet(
  args: Omit<DeriveArgs, "standard"> & { seedHex: string },
): DerivedWallet {
  return deriveWallet({ ...args, standard: "bip86" });
}

export function deriveBip85Bip39FromSeed({
  seedHex,
  language,
  wordCount,
  index,
}: {
  seedHex: string;
  language: MnemonicLanguage;
  wordCount: SupportedWordCount;
  index: number;
}): BIP85Bip39Result {
  const safeIndex = normalizeBip85Index(index);
  const root = buildBip85RootFromSeed(seedHex);
  const languageCode = BIP85_LANGUAGE_CODE_BY_MNEMONIC[language];
  const path = `m/83696968'/39'/${languageCode}'/${wordCount}'/${safeIndex}'`;
  const entropyMaterial = deriveBip85EntropyFromPath(root, path);
  const entropyByteLength = (wordCount / 3) * 4;
  const childEntropy = entropyMaterial.slice(0, entropyByteLength);
  const childEntropyHex = bytesToHex(childEntropy);
  const childMnemonic = entropyHexToMnemonic(childEntropyHex, language);
  return {
    application: "bip39",
    path,
    childKey: childMnemonic,
    childEntropyHex,
    childMnemonic,
    language,
    wordCount,
    index: safeIndex,
  };
}

export function deriveBip85WifFromSeed({
  seedHex,
  index,
}: {
  seedHex: string;
  index: number;
}): BIP85WifResult {
  const safeIndex = normalizeBip85Index(index);
  const root = buildBip85RootFromSeed(seedHex);
  const path = `m/83696968'/2'/${safeIndex}'`;
  const entropyMaterial = deriveBip85EntropyFromPath(root, path);
  const privateKey = entropyMaterial.slice(0, 32);
  ensureValidBip85PrivateKey(privateKey);
  const childWif = privateKeyToWif(privateKey, "mainnet");

  return {
    application: "wif",
    path,
    childKey: childWif,
    childWif,
    index: safeIndex,
  };
}

export function deriveBip85XprvFromSeed({
  seedHex,
  index,
}: {
  seedHex: string;
  index: number;
}): BIP85XprvResult {
  const safeIndex = normalizeBip85Index(index);
  const root = buildBip85RootFromSeed(seedHex);
  const path = `m/83696968'/32'/${safeIndex}'`;
  const entropyMaterial = deriveBip85EntropyFromPath(root, path);
  const chainCode = entropyMaterial.slice(0, 32);
  const privateKey = entropyMaterial.slice(32, 64);
  ensureValidBip85PrivateKey(privateKey);
  const childXprv = encodeBip32ExtendedPrivateKey({
    version: BIP32_VERSIONS.mainnet.private,
    depth: 0,
    parentFingerprint: 0,
    childNumber: 0,
    chainCode,
    privateKey,
  });

  return {
    application: "xprv",
    path,
    childKey: childXprv,
    childXprv,
    childEntropyHex: bytesToHex(entropyMaterial),
    index: safeIndex,
  };
}

export function deriveBip85HexFromSeed({
  seedHex,
  bytes,
  index,
}: {
  seedHex: string;
  bytes: number;
  index: number;
}): BIP85HexResult {
  const safeIndex = normalizeBip85Index(index);
  const safeBytes = normalizeBip85Bytes(bytes);
  const root = buildBip85RootFromSeed(seedHex);
  const path = `m/83696968'/128169'/${safeBytes}'/${safeIndex}'`;
  const entropyMaterial = deriveBip85EntropyFromPath(root, path);
  const childEntropyHex = bytesToHex(entropyMaterial.slice(0, safeBytes));

  return {
    application: "hex",
    path,
    childKey: childEntropyHex,
    childEntropyHex,
    bytes: safeBytes,
    index: safeIndex,
  };
}

export function deriveBip85FromSeed({
  seedHex,
  application,
  index,
  language = "english",
  wordCount = 12,
  bytes = 64,
}: {
  seedHex: string;
  application: BIP85Application;
  index: number;
  language?: MnemonicLanguage;
  wordCount?: SupportedWordCount;
  bytes?: number;
}): BIP85Result {
  switch (application) {
    case "bip39":
      return deriveBip85Bip39FromSeed({
        seedHex,
        language,
        wordCount,
        index,
      });
    case "wif":
      return deriveBip85WifFromSeed({
        seedHex,
        index,
      });
    case "xprv":
      return deriveBip85XprvFromSeed({
        seedHex,
        index,
      });
    case "hex":
      return deriveBip85HexFromSeed({
        seedHex,
        bytes,
        index,
      });
  }
}

export function deriveBip32RootKeyFromSeed({
  seedHex,
  network,
  format = "xprv",
}: {
  seedHex: string;
  network: BitcoinNetwork;
  format?: BIP32RootKeyFormat;
}): string {
  const seedBytes = hexToBytes(seedHex);
  const rootKeyVersionsByFormat: Record<BIP32RootKeyFormat, WalletVersion> = {
    xprv: BIP32_VERSIONS[network],
    yprv: BIP49_VERSIONS[network],
    zprv: BIP84_VERSIONS[network],
  };
  const root = HDKey.fromMasterSeed(seedBytes, rootKeyVersionsByFormat[format]);
  const privateRootKey = readPrivateExtendedKey(root);
  if (!privateRootKey) {
    throw new Error("Falha ao derivar chave privada da raiz BIP32.");
  }
  return privateRootKey;
}

export function splitMnemonicIntoCards({
  mnemonic,
  language,
}: {
  mnemonic: string;
  language: MnemonicLanguage;
}): SplitMnemonicCardsResult {
  const phrase = sanitizeMnemonicInput(mnemonic);
  if (!phrase) {
    return {
      cards: [],
      maskedWordCountPerCard: 0,
      hackTimeSeconds: 0,
      hackTimeUnit: "lt1second",
      hackTimeValue: null,
      highlightRisk: false,
    };
  }

  const words = phrase.split(" ");
  const wordCount = words.length;
  const left = Array.from({ length: wordCount }, (_, index) => index);
  const groups: number[][] = [[], [], []];
  let groupIndex = -1;

  const phraseHash = sha256(utf8ToBytes(phrase));
  const firstHashWord =
    ((phraseHash[0] << 24) | (phraseHash[1] << 16) | (phraseHash[2] << 8) | phraseHash[3]) | 0;
  let seed = Math.abs(firstHashWord) % 2147483647;

  while (left.length > 0) {
    groupIndex = (groupIndex + 1) % 3;
    seed = (seed * 16807) % 2147483647;
    const selected = Math.floor((left.length * (seed - 1)) / 2147483646);
    groups[groupIndex]?.push(left[selected] ?? 0);
    left.splice(selected, 1);
  }

  const cards = [words.slice(), words.slice(), words.slice()];
  const maskedWordCountPerCard = Math.floor(wordCount / 3);
  for (let cardIndex = 0; cardIndex < 3; cardIndex += 1) {
    for (let offset = 0; offset < maskedWordCountPerCard; offset += 1) {
      const wordIndex = groups[cardIndex]?.[offset];
      if (wordIndex !== undefined) {
        cards[cardIndex]![wordIndex] = "XXXX";
      }
    }
  }

  const renderedCards = cards.map(
    (card, index) => `Card ${index + 1}: ${wordArrayToPhrase(card, language)}`,
  );

  const triesPerSecond = 10_000_000_000;
  const hackTimeSeconds = Math.pow(2, (wordCount * 10) / 3) / triesPerSecond;
  if (hackTimeSeconds < 1) {
    return {
      cards: renderedCards,
      maskedWordCountPerCard,
      hackTimeSeconds,
      hackTimeUnit: "lt1second",
      hackTimeValue: null,
      highlightRisk: true,
    };
  }
  if (hackTimeSeconds < 86400) {
    return {
      cards: renderedCards,
      maskedWordCountPerCard,
      hackTimeSeconds,
      hackTimeUnit: "seconds",
      hackTimeValue: Math.floor(hackTimeSeconds),
      highlightRisk: true,
    };
  }
  if (hackTimeSeconds < 31557600) {
    return {
      cards: renderedCards,
      maskedWordCountPerCard,
      hackTimeSeconds,
      hackTimeUnit: "days",
      hackTimeValue: Math.floor(hackTimeSeconds / 86400),
      highlightRisk: true,
    };
  }
  return {
    cards: renderedCards,
    maskedWordCountPerCard,
    hackTimeSeconds,
    hackTimeUnit: "years",
    hackTimeValue: Math.floor(hackTimeSeconds / 31557600),
    highlightRisk: false,
  };
}

export function pubkeyFromPrivateHex(privateKeyHex: string): string {
  const compressed = secp256k1.getPublicKey(hexToBytes(privateKeyHex), true);
  return bytesToHex(compressed);
}

function deriveAddressRow(
  path: string,
  index: number,
  child: HDKey,
  addressType: AddressType,
  network: BitcoinNetwork,
  hrp: string,
): DerivedAddressRow {
  if (!child.publicKey) {
    throw new Error(`Falha ao derivar chave pública para ${path}.`);
  }

  if (addressType === "p2pkh") {
    const address = encodeP2pkhAddress(child.publicKey, network);
    return {
      index,
      path,
      addressType,
      address,
      publicKeyHex: bytesToHex(child.publicKey),
      privateKeyHex: child.privateKey ? bytesToHex(child.privateKey) : null,
      privateKeyWif: child.privateKey ? privateKeyToWif(child.privateKey, network) : null,
    };
  }

  if (addressType === "p2sh-p2wpkh") {
    const address = encodeP2shP2wpkhAddress(child.publicKey, network);
    return {
      index,
      path,
      addressType,
      address,
      publicKeyHex: bytesToHex(child.publicKey),
      privateKeyHex: child.privateKey ? bytesToHex(child.privateKey) : null,
      privateKeyWif: child.privateKey ? privateKeyToWif(child.privateKey, network) : null,
    };
  }

  if (addressType === "p2wpkh") {
    const witnessProgram = hash160(child.publicKey);
    const address = bech32.encode(hrp, [0, ...bech32.toWords(witnessProgram)], 1000);
    return {
      index,
      path,
      addressType,
      address,
      publicKeyHex: bytesToHex(child.publicKey),
      privateKeyHex: child.privateKey ? bytesToHex(child.privateKey) : null,
      privateKeyWif: child.privateKey ? privateKeyToWif(child.privateKey, network) : null,
    };
  }

  const taproot = deriveTaprootKeyMaterial(child);
  const address = bech32m.encode(hrp, [1, ...bech32m.toWords(taproot.outputKey)], 1000);

  return {
    index,
    path,
    addressType,
    address,
    publicKeyHex: bytesToHex(taproot.outputKey),
    privateKeyHex: taproot.tweakedPrivateKey ? bytesToHex(taproot.tweakedPrivateKey) : null,
    privateKeyWif: taproot.tweakedPrivateKey
      ? privateKeyToWif(taproot.tweakedPrivateKey, network)
      : null,
    internalKeyHex: bytesToHex(taproot.internalKey),
  };
}

function deriveTaprootKeyMaterial(child: HDKey): TaprootKeyMaterial {
  if (!child.publicKey) {
    throw new Error("Falha ao derivar material de chave Taproot.");
  }

  if (!child.privateKey) {
    return deriveTaprootFromPublicKey(child.publicKey);
  }

  return deriveTaprootFromPrivateKey(child.privateKey);
}

function deriveTaprootFromPrivateKey(privateKey: Uint8Array): TaprootKeyMaterial {
  const internalCompressed = secp256k1.getPublicKey(privateKey, true);
  const internalKey = internalCompressed.slice(1);

  let adjustedSecret = bytesToBigInt(privateKey);
  if (internalCompressed[0] === 0x03) {
    adjustedSecret = mod(CURVE_ORDER - adjustedSecret, CURVE_ORDER);
  }

  const tweakBytes = schnorr.utils.taggedHash("TapTweak", internalKey);
  const tweak = mod(bytesToBigInt(tweakBytes), CURVE_ORDER);
  const tweakedSecret = mod(adjustedSecret + tweak, CURVE_ORDER);

  if (tweakedSecret === 0n) {
    throw new Error("Tweak Taproot inválido (chave nula).");
  }

  const tweakedPrivateKey = bigIntTo32Bytes(tweakedSecret);
  const outputKey = schnorr.getPublicKey(tweakedPrivateKey);

  return {
    internalKey,
    outputKey,
    tweakedPrivateKey,
  };
}

function deriveTaprootFromPublicKey(publicKey: Uint8Array): TaprootKeyMaterial {
  let internalPoint = secp256k1.Point.fromHex(bytesToHex(publicKey));
  let compressedInternal = internalPoint.toBytes(true);

  if (compressedInternal[0] === 0x03) {
    internalPoint = internalPoint.negate();
    compressedInternal = internalPoint.toBytes(true);
  }

  const internalKey = compressedInternal.slice(1);
  const tweak = mod(bytesToBigInt(schnorr.utils.taggedHash("TapTweak", internalKey)), CURVE_ORDER);
  const outputPoint = internalPoint.add(secp256k1.Point.BASE.multiply(tweak));

  if (outputPoint.equals(secp256k1.Point.ZERO)) {
    throw new Error("Tweak Taproot inválido (chave nula).");
  }

  const outputKey = outputPoint.toBytes(true).slice(1);

  return {
    internalKey,
    outputKey,
    tweakedPrivateKey: null,
  };
}

function resolveAddressType(
  standard: DerivationStandard,
  customAddressType: AddressType | undefined,
): AddressType {
  if (standard === "custom") {
    if (!customAddressType) {
      throw new Error("Modo custom exige customAddressType.");
    }
    return customAddressType;
  }
  return STANDARD_CONFIGS[standard].addressType;
}

function parseExtendedKey(extendedKey: string): ParsedExtendedKey {
  const value = extendedKey.trim();

  for (const candidate of SUPPORTED_EXTENDED_KEY_VERSION_CANDIDATES) {
    try {
      const node = HDKey.fromExtendedKey(value, candidate.versions);
      return {
        node,
        network: candidate.network,
      };
    } catch {
      // continue
    }
  }

  throw new Error("Chave estendida inválida ou versão não suportada.");
}

function ensureValidXpubPath(path: string, useHardenedAddresses: boolean): void {
  const validation = validateXpubDerivationPath(path, true, useHardenedAddresses);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
}

function encodeP2pkhAddress(publicKey: Uint8Array, network: BitcoinNetwork): string {
  const version = network === "mainnet" ? 0x00 : 0x6f;
  const payload = hash160(publicKey);
  return BASE58CHECK.encode(withVersionPrefix(version, payload));
}

function encodeP2shP2wpkhAddress(publicKey: Uint8Array, network: BitcoinNetwork): string {
  const witnessProgram = hash160(publicKey);
  const redeemScript = new Uint8Array(22);
  redeemScript[0] = 0x00;
  redeemScript[1] = 0x14;
  redeemScript.set(witnessProgram, 2);

  const version = network === "mainnet" ? 0x05 : 0xc4;
  const scriptHash = hash160(redeemScript);
  return BASE58CHECK.encode(withVersionPrefix(version, scriptHash));
}

function privateKeyToWif(privateKey: Uint8Array, network: BitcoinNetwork): string {
  const prefix = network === "mainnet" ? 0x80 : 0xef;
  const payload = new Uint8Array(34);
  payload[0] = prefix;
  payload.set(privateKey, 1);
  payload[33] = 0x01;
  return BASE58CHECK.encode(payload);
}

function withVersionPrefix(prefix: number, payload: Uint8Array): Uint8Array {
  const result = new Uint8Array(1 + payload.length);
  result[0] = prefix;
  result.set(payload, 1);
  return result;
}

function normalizeCustomPath(path: string | undefined, fallback = "m"): string {
  const value = path?.trim() ?? fallback;
  if (!value) {
    return fallback;
  }
  return value;
}

function getWordlist(language: MnemonicLanguage): string[] {
  const wordlist = WORDLIST_BY_LANGUAGE[language];
  if (!wordlist) {
    throw new Error(`Wordlist BIP39 não suportada: ${language}.`);
  }
  return wordlist;
}

function getSecureRandomEntropy(byteLength: number): Uint8Array {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Web Crypto API indisponível para geração segura.");
  }
  const entropy = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(entropy);
  return entropy;
}

type ParsedEntropyInput = {
  filteredInput: string;
  rawBits: string;
  eventCount: number;
  avgBitsPerEvent: number;
};

const BASE6_EVENT_BITS: Record<string, string> = {
  "0": "00",
  "1": "01",
  "2": "10",
  "3": "11",
  "4": "0",
  "5": "1",
};

const BASE10_EVENT_BITS: Record<string, string> = {
  "0": "000",
  "1": "001",
  "2": "010",
  "3": "011",
  "4": "100",
  "5": "101",
  "6": "110",
  "7": "111",
  "8": "0",
  "9": "1",
};

const DICE_BITS_PER_EVENT = (4 * 2 + 2 * 1) / 6;
const BASE10_BITS_PER_EVENT = (8 * 3 + 2 * 1) / 10;
const CARD_BITS_PER_EVENT = (32 * 5 + 16 * 4 + 4 * 2) / 52;

const CARD_EVENT_BITS = buildCardEntropyEventBits();

function parseEntropyInput(input: string, inputType: EntropyInputType): ParsedEntropyInput {
  const source = input.trim();
  switch (inputType) {
    case "binary": {
      const filtered = source.replace(/[^01]/g, "");
      return {
        filteredInput: filtered,
        rawBits: filtered,
        eventCount: filtered.length,
        avgBitsPerEvent: 1,
      };
    }
    case "hex": {
      const filtered = source.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
      return {
        filteredInput: filtered,
        rawBits: filtered
          .split("")
          .map((digit) => Number.parseInt(digit, 16).toString(2).padStart(4, "0"))
          .join(""),
        eventCount: filtered.length,
        avgBitsPerEvent: 4,
      };
    }
    case "base6": {
      const filtered = source.replace(/[^0-5]/g, "");
      return {
        filteredInput: filtered,
        rawBits: mapEntropyEventsToBits(filtered.split(""), BASE6_EVENT_BITS),
        eventCount: filtered.length,
        avgBitsPerEvent: DICE_BITS_PER_EVENT,
      };
    }
    case "dice": {
      const dice = source.replace(/[^1-6]/g, "");
      const normalizedBase6 = dice.replace(/6/g, "0");
      return {
        filteredInput: normalizedBase6,
        rawBits: mapEntropyEventsToBits(normalizedBase6.split(""), BASE6_EVENT_BITS),
        eventCount: dice.length,
        avgBitsPerEvent: DICE_BITS_PER_EVENT,
      };
    }
    case "base10": {
      const filtered = source.replace(/[^0-9]/g, "");
      return {
        filteredInput: filtered,
        rawBits: mapEntropyEventsToBits(filtered.split(""), BASE10_EVENT_BITS),
        eventCount: filtered.length,
        avgBitsPerEvent: BASE10_BITS_PER_EVENT,
      };
    }
    case "card": {
      const cards = source
        .toLowerCase()
        .replace(/10/g, "t")
        .match(/[a2-9tjqk][cdhs]/g);
      if (!cards) {
        return {
          filteredInput: "",
          rawBits: "",
          eventCount: 0,
          avgBitsPerEvent: 0,
        };
      }
      return {
        filteredInput: cards.join(" "),
        rawBits: mapEntropyEventsToBits(cards, CARD_EVENT_BITS),
        eventCount: cards.length,
        avgBitsPerEvent: CARD_BITS_PER_EVENT,
      };
    }
  }
}

function mapEntropyEventsToBits(
  events: string[],
  eventBitsBySymbol: Record<string, string>,
): string {
  if (events.length === 0) {
    return "";
  }
  return events
    .map((event) => {
      const bits = eventBitsBySymbol[event.toLowerCase()];
      if (bits === undefined) {
        throw new Error("Entropia contém símbolo inválido para a base selecionada.");
      }
      return bits;
    })
    .join("");
}

function buildCardEntropyEventBits(): Record<string, string> {
  const ranks = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
  const suits = ["c", "d", "h", "s"];
  const cards = suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`));
  const bitsByCard: Record<string, string> = {};
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    if (!card) {
      continue;
    }
    if (index < 32) {
      bitsByCard[card] = index.toString(2).padStart(5, "0");
      continue;
    }
    if (index < 48) {
      bitsByCard[card] = (index - 32).toString(2).padStart(4, "0");
      continue;
    }
    bitsByCard[card] = (index - 48).toString(2).padStart(2, "0");
  }
  return bitsByCard;
}

function groupBinary(binary: string): string {
  const chunks: string[] = [];
  for (let offset = 0; offset < binary.length; offset += 11) {
    chunks.push(binary.slice(offset, offset + 11));
  }
  return chunks.join(" ");
}

function mnemonicToWordIndexes(mnemonic: string, language: MnemonicLanguage): number[] {
  const words = sanitizeMnemonicInput(mnemonic).split(" ");
  const wordlist = getWordlist(language);
  const indices = new Map<string, number>(wordlist.map((word, index) => [word, index]));
  return words.map((word) => {
    const index = indices.get(word);
    if (index === undefined) {
      throw new Error(`Mnemonic inválida para a wordlist ${language} BIP39.`);
    }
    return index;
  });
}

function entropyHexToMnemonic(entropyHex: string, language: MnemonicLanguage): string {
  const wordlist = getWordlist(language);
  const entropyBytes = hexToBytes(entropyHex);
  const entropyBits = bytesToBinary(entropyBytes);
  const checksumBits = bytesToBinary(sha256(entropyBytes)).slice(0, entropyBits.length / 32);
  const bits = `${entropyBits}${checksumBits}`;
  const words: string[] = [];

  for (let offset = 0; offset < bits.length; offset += 11) {
    const chunk = bits.slice(offset, offset + 11);
    const index = Number.parseInt(chunk, 2);
    const word = wordlist[index];
    if (!word) {
      throw new Error(`Falha ao converter índice da mnemonic: ${index}.`);
    }
    words.push(word);
  }

  return words.join(" ");
}

function mnemonicToEntropyHex(mnemonic: string, language: MnemonicLanguage): string {
  if (!validateMnemonicByLanguage(mnemonic, language, "advanced").valid) {
    throw new Error(`Mnemonic inválida para a wordlist ${language} BIP39.`);
  }

  const words = sanitizeMnemonicInput(mnemonic).split(" ");
  const wordlist = getWordlist(language);
  const wordIndex = new Map<string, number>(wordlist.map((word, index) => [word, index]));
  const bits = words
    .map((word) => {
      const index = wordIndex.get(word);
      if (index === undefined) {
        throw new Error(`Mnemonic inválida para a wordlist ${language} BIP39.`);
      }
      return index.toString(2).padStart(11, "0");
    })
    .join("");

  const checksumBits = Math.floor(bits.length / 33);
  const entropyBits = bits.length - checksumBits;
  const entropyBitString = bits.slice(0, entropyBits);
  return binaryToHex(entropyBitString);
}

function bytesToBinary(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join("");
}

function binaryToHex(bits: string): string {
  const paddedBits = bits.length % 4 === 0 ? bits : bits.padEnd(bits.length + (4 - (bits.length % 4)), "0");
  let output = "";
  for (let offset = 0; offset < paddedBits.length; offset += 4) {
    const nibble = paddedBits.slice(offset, offset + 4);
    output += Number.parseInt(nibble, 2).toString(16);
  }
  return output;
}

function buildEntropyDetails(entropyHex: string): MnemonicEntropyDetails {
  const entropyBits = entropyHex.length * 4;
  const checksumBits = entropyBits / 32;
  const totalBits = entropyBits + checksumBits;
  return {
    entropyHex,
    entropyBits,
    checksumBits,
    totalBits,
    keyspaceApprox: `2^${entropyBits}`,
  };
}

function buildEntropyDetailsReport({
  entropyHex,
  entropyType,
  eventCount,
  avgBitsPerEvent,
  filteredInput,
  rawBits,
  mnemonic,
  language,
  mnemonicWordCount,
  mnemonicLengthMode,
}: {
  entropyHex: string;
  entropyType: EntropyInputType;
  eventCount: number;
  avgBitsPerEvent: number;
  filteredInput: string;
  rawBits: string;
  mnemonic: string;
  language: MnemonicLanguage;
  mnemonicWordCount: number;
  mnemonicLengthMode: EntropyMnemonicLengthMode;
}): EntropyDetailsReport {
  const details = buildEntropyDetails(entropyHex);
  const checksumBits = bytesToBinary(sha256(hexToBytes(entropyHex))).slice(0, details.checksumBits);
  const rawEntropyBits = rawBits.length;
  const rawEntropyWords = Math.floor(rawEntropyBits / 32) * 3;
  return {
    ...details,
    entropyType,
    eventCount,
    avgBitsPerEvent,
    filteredInput,
    rawEntropyBits,
    rawEntropyWords,
    mnemonicWordCount,
    mnemonicLengthMode,
    timeToCrackUnit: estimateTimeToCrackUnit(rawEntropyBits),
    rawBinary: groupBinary(rawBits),
    binaryChecksum: checksumBits,
    wordIndexes: mnemonicToWordIndexes(mnemonic, language),
    mnemonic,
  };
}

function resolveEntropyWordCount(
  rawBitsLength: number,
  selectedWordCount: SupportedWordCount,
  mnemonicLengthMode: EntropyMnemonicLengthMode,
): number {
  if (mnemonicLengthMode === "fixed") {
    return selectedWordCount;
  }

  const automaticEntropyBits = Math.floor(rawBitsLength / 32) * 32;
  if (automaticEntropyBits < 128) {
    throw new Error("Entropia insuficiente para mnemônico automático. Necessário >= 128 bits.");
  }
  return (automaticEntropyBits / 32) * 3;
}

function estimateTimeToCrackUnit(bits: number): TimeToCrackUnit {
  if (bits <= 35) {
    return "seconds";
  }
  if (bits <= 41) {
    return "minutes";
  }
  if (bits <= 47) {
    return "hours";
  }
  if (bits <= 53) {
    return "days";
  }
  if (bits <= 59) {
    return "months";
  }
  if (bits <= 73) {
    return "years";
  }
  return "centuries";
}

function allowedWordCounts(mode: BIP39Mode): readonly SupportedWordCount[] {
  return mode === "strict" ? STRICT_WORD_COUNTS : ADVANCED_WORD_COUNTS;
}

function normalizePbkdf2Rounds(rounds: number): number {
  if (!Number.isFinite(rounds)) {
    throw new Error("PBKDF2 rounds deve ser um número válido.");
  }
  const value = Math.trunc(rounds);
  if (value < 1) {
    throw new Error("PBKDF2 rounds deve ser >= 1.");
  }
  return value;
}

function normalizeBip85Index(index: number): number {
  if (!Number.isFinite(index)) {
    throw new Error("BIP85 exige índice inteiro >= 0.");
  }
  const value = Math.trunc(index);
  if (value < 0) {
    throw new Error("BIP85 exige índice inteiro >= 0.");
  }
  if (value > 0x7fffffff) {
    throw new Error("BIP85 índice máximo é 2147483647.");
  }
  return value;
}

function normalizeBip85Bytes(bytes: number): number {
  if (!Number.isFinite(bytes)) {
    throw new Error("BIP85 bytes deve ser um inteiro entre 16 e 64.");
  }
  const value = Math.trunc(bytes);
  if (value < 16 || value > 64) {
    throw new Error("BIP85 bytes deve ser um inteiro entre 16 e 64.");
  }
  return value;
}

function buildBip85RootFromSeed(seedHex: string): HDKey {
  const seedBytes = hexToBytes(seedHex);
  return HDKey.fromMasterSeed(seedBytes, BIP32_VERSIONS.mainnet);
}

function deriveBip85EntropyFromPath(root: HDKey, path: string): Uint8Array {
  const child = root.derive(path);
  const privateKey = child.privateKey;
  if (!privateKey) {
    throw new Error("Falha ao derivar chave privada BIP85.");
  }
  return hmac(sha512, utf8ToBytes("bip-entropy-from-k"), privateKey);
}

function ensureValidBip85PrivateKey(privateKey: Uint8Array): void {
  const keyNumber = bytesToBigInt(privateKey);
  if (keyNumber === 0n || keyNumber >= CURVE_ORDER) {
    throw new Error("Falha ao derivar chave privada BIP85.");
  }
}

function encodeBip32ExtendedPrivateKey({
  version,
  depth,
  parentFingerprint,
  childNumber,
  chainCode,
  privateKey,
}: {
  version: number;
  depth: number;
  parentFingerprint: number;
  childNumber: number;
  chainCode: Uint8Array;
  privateKey: Uint8Array;
}): string {
  if (chainCode.length !== 32 || privateKey.length !== 32) {
    throw new Error("Falha ao derivar chave privada BIP85.");
  }

  const payload = new Uint8Array(78);
  payload.set(uint32ToBytes(version), 0);
  payload[4] = depth & 0xff;
  payload.set(uint32ToBytes(parentFingerprint), 5);
  payload.set(uint32ToBytes(childNumber), 9);
  payload.set(chainCode, 13);
  payload[45] = 0x00;
  payload.set(privateKey, 46);
  return BASE58CHECK.encode(payload);
}

function uint32ToBytes(value: number): Uint8Array {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

function readPrivateExtendedKey(node: HDKey): string | null {
  try {
    return node.privateExtendedKey;
  } catch {
    return null;
  }
}

function ensureValidPath(path: string): void {
  const validation = validateDerivationPath(path);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
}

function clampUInt31(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const intValue = Math.trunc(value);
  if (intValue < 0) {
    return 0;
  }
  if (intValue > 0x7fffffff) {
    return 0x7fffffff;
  }
  return intValue;
}

function hash160(input: Uint8Array): Uint8Array {
  return ripemd160(sha256(input));
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  return BigInt(`0x${bytesToHex(bytes)}`);
}

function bigIntTo32Bytes(value: bigint): Uint8Array {
  const hex = value.toString(16).padStart(64, "0");
  return hexToBytes(hex);
}

function wordArrayToPhrase(words: string[], language: MnemonicLanguage): string {
  if (language === "japanese") {
    return words.join("\u3000");
  }
  return words.join(" ");
}

function mod(value: bigint, modulus: bigint): bigint {
  const result = value % modulus;
  return result >= 0n ? result : result + modulus;
}

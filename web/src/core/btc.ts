import { bech32, bech32m } from "@scure/base";
import { HDKey } from "@scure/bip32";
import { schnorr, secp256k1 } from "@noble/curves/secp256k1.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
  wordlists,
} from "bip39";
import { validateDerivationPath } from "./derivationPath";

export type BitcoinNetwork = "mainnet" | "testnet";
export type DerivationStandard = "bip84" | "bip86";
export type BIP39Mode = "strict" | "advanced";

export const STRICT_WORD_COUNTS = [12, 15, 18, 21, 24] as const;
export const ADVANCED_WORD_COUNTS = [12, 15, 18, 21, 24] as const;

export type SupportedWordCount = (typeof ADVANCED_WORD_COUNTS)[number];

export type MnemonicValidationResult = {
  valid: boolean;
  error: string | null;
  wordCount: number;
};

export type DerivedAddressRow = {
  index: number;
  path: string;
  addressType: "p2wpkh" | "p2tr";
  address: string;
  publicKeyHex: string;
  privateKeyHex: string | null;
  internalKeyHex?: string;
};

export type DerivedWallet = {
  standard: DerivationStandard;
  seedHex: string;
  accountPath: string;
  accountXpub: string;
  accountXprv: string | null;
  rows: DerivedAddressRow[];
};

type DeriveArgs = {
  seedHex: string;
  network: BitcoinNetwork;
  standard: DerivationStandard;
  account: number;
  change: number;
  count: number;
};

type WalletVersion = {
  private: number;
  public: number;
};

type TaprootKeyMaterial = {
  internalKey: Uint8Array;
  outputKey: Uint8Array;
  tweakedPrivateKey: Uint8Array;
};

const BIP84_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  mainnet: { private: 0x04b2430c, public: 0x04b24746 },
  testnet: { private: 0x045f18bc, public: 0x045f1cf6 },
};

const BIP86_VERSIONS: Record<BitcoinNetwork, WalletVersion> = {
  mainnet: { private: 0x0488ade4, public: 0x0488b21e },
  testnet: { private: 0x04358394, public: 0x043587cf },
};

const CURVE_ORDER = secp256k1.Point.CURVE().n;

export function sanitizeMnemonicInput(input: string): string {
  return input.trim().split(/\s+/).join(" ");
}

export function generateEnglishMnemonic(
  words: SupportedWordCount,
  mode: BIP39Mode = "strict",
): string {
  const allowed = allowedWordCounts(mode);
  if (!allowed.includes(words)) {
    throw new Error(
      `Quantidade de palavras inválida para modo ${mode}: ${words}.`,
    );
  }
  const strength = (words / 3) * 32;
  return generateMnemonic(strength, undefined, wordlists.english);
}

export function validateEnglishMnemonic(
  input: string,
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

  const isValid = validateMnemonic(phrase, wordlists.english);
  if (!isValid) {
    return {
      valid: false,
      error: "Mnemonic inválida para a wordlist inglesa BIP39.",
      wordCount,
    };
  }

  return {
    valid: true,
    error: null,
    wordCount,
  };
}

export function mnemonicToSeedHex(
  mnemonic: string,
  passphrase: string,
  pbkdf2Rounds = 2048,
  mode: BIP39Mode = "strict",
): string {
  const validation = validateEnglishMnemonic(mnemonic, mode);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Mnemonic inválida.");
  }

  const normalizedMnemonic = sanitizeMnemonicInput(mnemonic).normalize("NFKD");
  const normalizedPassphrase = passphrase.normalize("NFKD");
  const rounds = normalizePbkdf2Rounds(pbkdf2Rounds);

  if (mode === "strict" && rounds !== 2048) {
    throw new Error("Modo estrito exige PBKDF2 fixo em 2048 rounds.");
  }

  if (rounds === 2048) {
    const seed = mnemonicToSeedSync(normalizedMnemonic, normalizedPassphrase);
    return bytesToHex(seed);
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
  network,
  standard,
  account,
  change,
  count,
}: DeriveArgs): DerivedWallet {
  const safeAccount = clampUInt31(account);
  const safeChange = Math.min(1, Math.max(0, Math.trunc(change)));
  const safeCount = Math.min(50, Math.max(1, Math.trunc(count)));

  const seedBytes = hexToBytes(seedHex);
  const versions = standard === "bip84" ? BIP84_VERSIONS[network] : BIP86_VERSIONS[network];
  const coinType = network === "mainnet" ? 0 : 1;
  const purpose = standard === "bip84" ? 84 : 86;
  const hrp = network === "mainnet" ? "bc" : "tb";

  const root = HDKey.fromMasterSeed(seedBytes, versions);
  const accountPath = `m/${purpose}'/${coinType}'/${safeAccount}'`;
  ensureValidPath(accountPath);

  const accountNode = root.derive(accountPath);
  const accountXpub = accountNode.publicExtendedKey;
  const accountXprv = readPrivateExtendedKey(accountNode);
  const rows: DerivedAddressRow[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    const path = `${accountPath}/${safeChange}/${index}`;
    ensureValidPath(path);
    const child = root.derive(path);

    if (standard === "bip84") {
      rows.push(deriveBip84Row(path, index, child, hrp));
      continue;
    }

    rows.push(deriveBip86Row(path, index, child, hrp));
  }

  return {
    standard,
    seedHex,
    accountPath,
    accountXpub,
    accountXprv,
    rows,
  };
}

export function deriveBip84Wallet(args: Omit<DeriveArgs, "standard">): DerivedWallet {
  return deriveWallet({ ...args, standard: "bip84" });
}

export function deriveBip86Wallet(args: Omit<DeriveArgs, "standard">): DerivedWallet {
  return deriveWallet({ ...args, standard: "bip86" });
}

export function pubkeyFromPrivateHex(privateKeyHex: string): string {
  const compressed = secp256k1.getPublicKey(hexToBytes(privateKeyHex), true);
  return bytesToHex(compressed);
}

function deriveBip84Row(
  path: string,
  index: number,
  child: HDKey,
  hrp: string,
): DerivedAddressRow {
  if (!child.publicKey) {
    throw new Error(`Falha ao derivar chave pública para ${path}.`);
  }

  const witnessProgram = hash160(child.publicKey);
  const address = bech32.encode(hrp, [0, ...bech32.toWords(witnessProgram)], 1000);

  return {
    index,
    path,
    addressType: "p2wpkh",
    address,
    publicKeyHex: bytesToHex(child.publicKey),
    privateKeyHex: child.privateKey ? bytesToHex(child.privateKey) : null,
  };
}

function deriveBip86Row(
  path: string,
  index: number,
  child: HDKey,
  hrp: string,
): DerivedAddressRow {
  if (!child.privateKey) {
    throw new Error(`Falha ao derivar chave privada para ${path}.`);
  }

  const taproot = deriveTaprootKeyMaterial(child.privateKey);
  const address = bech32m.encode(hrp, [1, ...bech32m.toWords(taproot.outputKey)], 1000);

  return {
    index,
    path,
    addressType: "p2tr",
    address,
    publicKeyHex: bytesToHex(taproot.outputKey),
    privateKeyHex: bytesToHex(taproot.tweakedPrivateKey),
    internalKeyHex: bytesToHex(taproot.internalKey),
  };
}

function deriveTaprootKeyMaterial(privateKey: Uint8Array): TaprootKeyMaterial {
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
    throw new Error("Tweak Taproot inválido (chave nula)." );
  }

  const tweakedPrivateKey = bigIntTo32Bytes(tweakedSecret);
  const outputKey = schnorr.getPublicKey(tweakedPrivateKey);

  return {
    internalKey,
    outputKey,
    tweakedPrivateKey,
  };
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

function mod(value: bigint, modulus: bigint): bigint {
  const result = value % modulus;
  return result >= 0n ? result : result + modulus;
}

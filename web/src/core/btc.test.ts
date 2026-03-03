import { describe, expect, it } from "vitest";
import {
  deriveBip84Wallet,
  deriveBip86Wallet,
  deriveWallet,
  generateEnglishMnemonic,
  mnemonicToSeedHex,
  pubkeyFromPrivateHex,
  sanitizeMnemonicInput,
  validateEnglishMnemonic,
} from "./btc";

const BIP39_TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const BIP39_TEST_PASSPHRASE = "TREZOR";
const BIP39_VECTOR_SEED_WITH_TREZOR =
  "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e5349553" +
  "1f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04";

describe("mnemonic utilities", () => {
  it("sanitiza espaços extras e quebras de linha", () => {
    const value = "  abandon   abandon\nabandon\tabout ";
    expect(sanitizeMnemonicInput(value)).toBe("abandon abandon abandon about");
  });

  it("gera mnemonic com quantidade de palavras solicitada", () => {
    const generated = generateEnglishMnemonic(12, "strict");
    expect(generated.split(" ")).toHaveLength(12);
    expect(validateEnglishMnemonic(generated).valid).toBe(true);
  });

  it("falha para quantidade de palavras inválida na geração", () => {
    expect(() => {
      generateEnglishMnemonic(11 as never, "strict");
    }).toThrowError(/Quantidade de palavras inválida/);
  });
});

describe("BIP39 mode behavior", () => {
  it("modo estrito rejeita word counts fora do padrão", () => {
    const strictValidation = validateEnglishMnemonic("abandon abandon abandon", "strict");
    expect(strictValidation.valid).toBe(false);
    expect(strictValidation.error).toContain("Modo estrito");
  });

  it("modo estrito bloqueia PBKDF2 custom", () => {
    expect(() => {
      mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", 4096, "strict");
    }).toThrowError(/2048/);
  });

  it("modo avançado permite PBKDF2 custom", () => {
    const seed2048 = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", 2048, "advanced");
    const seed4096 = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", 4096, "advanced");
    expect(seed2048).not.toBe(seed4096);
  });

  it("rejeita mnemonic com palavras fora da wordlist inglesa", () => {
    const validation = validateEnglishMnemonic(
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon foo",
      "strict",
    );
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("wordlist inglesa");
  });

  it("valida vetor oficial BIP39 com passphrase", () => {
    const seed = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, BIP39_TEST_PASSPHRASE);
    expect(seed).toBe(BIP39_VECTOR_SEED_WITH_TREZOR);
  });

  it("mantém saída idêntica entre modos quando PBKDF2=2048", () => {
    const strictSeed = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", 2048, "strict");
    const advancedSeed = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", 2048, "advanced");
    expect(strictSeed).toBe(advancedSeed);
  });

  it("rejeita PBKDF2 rounds não finito e inválido", () => {
    expect(() => mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", Number.NaN, "advanced")).toThrowError(
      /número válido/,
    );
    expect(() => mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "", 0, "advanced")).toThrowError(
      />= 1/,
    );
  });
});

describe("official vectors", () => {
  it("BIP84 vector: first receiving address", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(wallet.rows[0]?.address).toBe("bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu");
    expect(wallet.accountPath).toBe("m/84'/0'/0'");
  });

  it("BIP86 vector: first receiving address", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip86",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(wallet.rows[0]?.address).toBe(
      "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
    );
    expect(wallet.rows[0]?.addressType).toBe("p2tr");
    expect(wallet.rows[0]?.internalKeyHex).toBe(
      "cc8a4bc64d897bddc5fbc2f670f7a8ba0b386779106cf1223c6fc5d7cd6fc115",
    );
  });
});

describe("wallet derivation behavior", () => {
  it("normaliza limites de account/change/count", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: -10,
      change: 10,
      count: 0,
    });

    expect(wallet.accountPath).toBe("m/84'/0'/0'");
    expect(wallet.rows).toHaveLength(1);
    expect(wallet.rows[0]?.path).toBe("m/84'/0'/0'/1/0");
  });

  it("limita quantidade máxima de endereços em 50", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: 0,
      change: 0,
      count: 999,
    });
    expect(wallet.rows).toHaveLength(50);
  });

  it("gera prefixo testnet correto em BIP84 e BIP86", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const bip84 = deriveWallet({
      seedHex,
      network: "testnet",
      standard: "bip84",
      account: 0,
      change: 0,
      count: 1,
    });
    const bip86 = deriveWallet({
      seedHex,
      network: "testnet",
      standard: "bip86",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(bip84.rows[0]?.address.startsWith("tb1q")).toBe(true);
    expect(bip86.rows[0]?.address.startsWith("tb1p")).toBe(true);
  });

  it("wrappers deriveBip84Wallet/deriveBip86Wallet funcionam", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const bip84 = deriveBip84Wallet({
      seedHex,
      network: "mainnet",
      account: 0,
      change: 0,
      count: 1,
    });
    const bip86 = deriveBip86Wallet({
      seedHex,
      network: "mainnet",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(bip84.standard).toBe("bip84");
    expect(bip86.standard).toBe("bip86");
    expect(bip84.rows[0]?.addressType).toBe("p2wpkh");
    expect(bip86.rows[0]?.addressType).toBe("p2tr");
  });
});

describe("pubkey utilities", () => {
  it("deriva pubkey comprimida de private key hex", () => {
    const privateKeyHex = "0000000000000000000000000000000000000000000000000000000000000001";
    const pubKey = pubkeyFromPrivateHex(privateKeyHex);
    expect(pubKey).toBe(
      "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    );
  });
});

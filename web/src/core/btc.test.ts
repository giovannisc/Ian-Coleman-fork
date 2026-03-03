import { describe, expect, it } from "vitest";
import {
  deriveWallet,
  mnemonicToSeedHex,
  validateEnglishMnemonic,
} from "./btc";

const BIP39_TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

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

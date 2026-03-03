import { describe, expect, it } from "vitest";
import {
  computeMnemonicFromEntropyInput,
  deriveBip85FromSeed,
  deriveBip85Bip39FromSeed,
  deriveBip85HexFromSeed,
  deriveBip85WifFromSeed,
  deriveBip85XprvFromSeed,
  deriveBip32RootKeyFromSeed,
  deriveBip84Wallet,
  deriveBip86Wallet,
  deriveWallet,
  generateEnglishMnemonic,
  generateMnemonicWithDetails,
  generateMnemonicByLanguage,
  getMnemonicEntropyDetails,
  getMnemonicEntropyReport,
  mnemonicToSeedHex,
  pubkeyFromPrivateHex,
  recoverMnemonicEntropy,
  sanitizeMnemonicInput,
  splitMnemonicIntoCards,
  validateEnglishMnemonic,
  validateMnemonicByLanguage,
} from "./btc";

const BIP39_TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const BIP39_TEST_PASSPHRASE = "TREZOR";
const BIP39_VECTOR_SEED_WITH_TREZOR =
  "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e5349553" +
  "1f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04";
const USER_VECTOR_MNEMONIC =
  "address lion lend winner response little basket harsh donkey dignity awful limit quantum mercy hood";
const USER_VECTOR_SEED =
  "944f18b3ca9c783a61e82c11d30acb795644c496c03e3a15da7f3ddff04a3e38" +
  "310ba3e25bd5d2d2707aeb33c7c2e884d2bf7c540f19eb14ef998f1a38f5e24d";
const USER_VECTOR_ROOT_XPRV =
  "xprv9s21ZrQH143K2sBPP13uJV4aD81fECApLqhTkwfr62LWUrtuE6QhGsWFPGvFur84fztbA2U9JMY3Hmig59gpBnpYSJoFffG5iWigVUX6px2";
const USER_PREFIX_MNEMONIC =
  "lend toss kick silent assume squeeze unique camera lawsuit uphold please gym";
const USER_PREFIX_XPRV =
  "xprv9s21ZrQH143K2TbCkCPpzdX8hyLtykgz3DZKmHtdxqCbb293idif5isWYuJNxQBB1izrxmt4DnwHbhaXU9GqE84bNmS8SXGMgoPPPcvfq4K";
const USER_PREFIX_YPRV =
  "yprvABrGsX5C9jansknKaZBTCicdswVLvNgUxL5YYgnXLqaUe7xGyHtDhnXea7FxxJq6RN7fiFUcgTHqUzC6Bqgr2MkCF78Z2S5qxXT2nDztNVX";
const BIP85_WIF_VECTOR =
  "L5ZHSrU5auKHKJuK4KnyJM85gERCxjRnBTBe7ZTBdFmSCUjPNArr";
const BIP85_XPRV_VECTOR =
  "xprv9s21ZrQH143K378o2qoTfJeZGMSGHRkfuyoSebTPGQBH1dsMbt4tBWXVgLYbWkv7PK9C2RvYkJA3VfBjkgdS5rFSagbFicZunndqdRfmmmG";
const BIP85_HEX64_VECTOR =
  "379f3ff670bf391ca62e6fbd62359a753e89c46bcb02751066ee5897c292487a" +
  "ccbfb091d2b59002086eb13d0f9d6746e7ab74d4a60a5f4998cfba3d3687f89a";
const UI_REPORTED_VALID_MNEMONICS = [
  "drift muffin volume buyer absorb oyster boil bind artist public destroy hungry",
  "chapter admit approve bridge cream better boss fun limit improve crouch fossil",
  "wave ice fitness balance hedgehog round cricket hobby salon another north focus",
] as const;

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

  it("gera mnemonic com detalhes de entropia", () => {
    const generated = generateMnemonicWithDetails(15, "portuguese", "strict");
    expect(generated.mnemonic.split(" ")).toHaveLength(15);
    expect(generated.details.entropyBits).toBe(160);
    expect(generated.details.checksumBits).toBe(5);
    expect(generated.details.totalBits).toBe(165);
    expect(generated.details.keyspaceApprox).toBe("2^160");
    expect(generated.randomnessSource).toBe("webcrypto");
    expect(validateMnemonicByLanguage(generated.mnemonic, "portuguese", "strict").valid).toBe(true);
  });

  it("gera e valida mnemonic em japonês", () => {
    const generated = generateMnemonicByLanguage(12, "japanese", "strict");
    expect(validateMnemonicByLanguage(generated, "japanese", "strict").valid).toBe(true);
    expect(validateMnemonicByLanguage(generated, "english", "strict").valid).toBe(false);
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
    expect(validation.error).toContain("wordlist english");
  });

  it("valida vetor oficial BIP39 com passphrase", () => {
    const seed = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, BIP39_TEST_PASSPHRASE);
    expect(seed).toBe(BIP39_VECTOR_SEED_WITH_TREZOR);
  });

  it("mantém compatibilidade com vetor informado pelo usuário (seed + root key)", () => {
    const seed = mnemonicToSeedHex(USER_VECTOR_MNEMONIC, "", 2048, "strict", "english");
    const rootKey = deriveBip32RootKeyFromSeed({ seedHex: seed, network: "mainnet" });
    expect(seed).toBe(USER_VECTOR_SEED);
    expect(rootKey).toBe(USER_VECTOR_ROOT_XPRV);
  });

  it("aceita mnemônicos válidos reportados na UI e deriva seed", () => {
    for (const mnemonic of UI_REPORTED_VALID_MNEMONICS) {
      const validation = validateMnemonicByLanguage(mnemonic, "english", "strict");
      expect(validation.valid).toBe(true);
      const seed = mnemonicToSeedHex(mnemonic, "", 2048, "strict", "english");
      expect(seed).toHaveLength(128);
      expect(/^[0-9a-f]+$/.test(seed)).toBe(true);
    }
  });

  it("extrai detalhes de entropia de mnemonic válida", () => {
    const details = getMnemonicEntropyDetails(BIP39_TEST_MNEMONIC, "english");
    expect(details.entropyHex).toBe("00000000000000000000000000000000");
    expect(details.entropyBits).toBe(128);
    expect(details.checksumBits).toBe(4);
    expect(details.totalBits).toBe(132);
    expect(details.keyspaceApprox).toBe("2^128");
  });

  it("extrai relatório avançado de entropia de mnemonic válida", () => {
    const report = getMnemonicEntropyReport(BIP39_TEST_MNEMONIC, "english");
    expect(report.entropyType).toBe("hex");
    expect(report.eventCount).toBe(32);
    expect(report.avgBitsPerEvent).toBe(4);
    expect(report.filteredInput).toBe("00000000000000000000000000000000");
    expect(report.rawEntropyBits).toBe(128);
    expect(report.rawEntropyWords).toBe(12);
    expect(report.mnemonicWordCount).toBe(12);
    expect(report.mnemonicLengthMode).toBe("fixed");
    expect(report.timeToCrackUnit).toBe("centuries");
    expect(report.binaryChecksum).toBe("0011");
    expect(report.wordIndexes).toHaveLength(12);
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

describe("entropy input computation", () => {
  it("deriva mnemônico de entropia hexadecimal", () => {
    const result = computeMnemonicFromEntropyInput({
      input: "00000000000000000000000000000000",
      inputType: "hex",
      wordCount: 12,
      language: "english",
    });
    expect(result.mnemonic).toBe(BIP39_TEST_MNEMONIC);
    expect(result.details.eventCount).toBe(32);
    expect(result.details.avgBitsPerEvent).toBe(4);
    expect(result.details.binaryChecksum).toHaveLength(4);
  });

  it("aceita entropia em dados (1-6)", () => {
    const result = computeMnemonicFromEntropyInput({
      input:
        "6253563462535634625356346253563462535634625356346253563462535634" +
        "6253563462535634625356346253563462535634625356346253563462535634",
      inputType: "dice",
      wordCount: 12,
      language: "english",
    });
    expect(result.mnemonic.split(" ")).toHaveLength(12);
    expect(validateMnemonicByLanguage(result.mnemonic, "english", "strict").valid).toBe(true);
  });

  it("ajusta mnemonic length automaticamente a partir da entropia bruta", () => {
    const result = computeMnemonicFromEntropyInput({
      input: "0000000000000000000000000000000000000000",
      inputType: "hex",
      wordCount: 12,
      language: "english",
      mnemonicLengthMode: "rawEntropy",
    });
    expect(result.details.mnemonicWordCount).toBe(15);
    expect(result.mnemonic.split(" ")).toHaveLength(15);
  });

  it("rejeita entropia insuficiente para a quantidade de palavras", () => {
    expect(() =>
      computeMnemonicFromEntropyInput({
        input: "1234",
        inputType: "hex",
        wordCount: 24,
        language: "english",
      }),
    ).toThrowError(/Entropia insuficiente/);
  });

  it("gera preview de mnemônico com entropia insuficiente quando permitido", () => {
    const preview = computeMnemonicFromEntropyInput({
      input: "1234",
      inputType: "hex",
      wordCount: 12,
      language: "english",
      allowInsufficientEntropy: true,
    });
    expect(preview.mnemonic.split(" ")).toHaveLength(12);
    expect(preview.details.rawEntropyBits).toBe(16);
    expect(validateMnemonicByLanguage(preview.mnemonic, "english", "strict").valid).toBe(true);
  });

  it("em modo rawEntropy usa word count selecionado enquanto bits < 128 no preview", () => {
    const preview = computeMnemonicFromEntropyInput({
      input: "1234",
      inputType: "hex",
      wordCount: 15,
      language: "english",
      mnemonicLengthMode: "rawEntropy",
      allowInsufficientEntropy: true,
    });
    expect(preview.details.mnemonicWordCount).toBe(15);
    expect(preview.mnemonic.split(" ")).toHaveLength(15);
  });

  it("replica vetor de entropia dice do iancoleman", () => {
    const input =
      "243612312312313341345135631456324132341623451325613453251345231453256134256314523513425315362356132651345235413256124361231231231334134513563145632413234162345132561345325134523145325613425631452351342531536235613265134523541325612436123123123133413451356314563241323416234513256134532513452314532561342563145235134253153623561326513452354132562";
    const result = computeMnemonicFromEntropyInput({
      input,
      inputType: "dice",
      wordCount: 24,
      language: "english",
      mnemonicLengthMode: "rawEntropy",
    });

    expect(result.details.eventCount).toBe(345);
    expect(result.details.avgBitsPerEvent.toFixed(2)).toBe("1.67");
    expect(result.details.rawEntropyBits).toBe(585);
    expect(result.details.rawEntropyWords).toBe(54);
    expect(result.details.mnemonicWordCount).toBe(54);
    expect(result.mnemonic).toBe(
      "replace swim depend once toilet siren future jeans item rug tuna forum student slide judge swear virtual coyote replace tennis stuff stay burst ensure virtual runway repeat trophy fashion tape rookie fragile shift table permit misery replace what rubber poem wagon foot photo two remove elder onion upgrade tattoo toilet conduct tray ceiling dinner",
    );
  });

  it("recupera entropia e corrige checksum de conjunto de palavras inválido", () => {
    const recovered = recoverMnemonicEntropy({
      mnemonic: "kiwi enhance drama ensure note drum",
      language: "english",
    });

    expect(recovered.entropyHex).toBe("7b695108a5a96a87");
    expect(recovered.checksumValid).toBe(false);
    expect(recovered.correctedMnemonic).toBe("kiwi enhance drama ensure note dumb");
    expect(recovered.details.entropyType).toBe("hex");
    expect(recovered.details.mnemonicWordCount).toBe(6);
  });

  it("gera split mnemonic cards no mesmo formato do iancoleman", () => {
    const split = splitMnemonicIntoCards({
      mnemonic: "kiwi enhance drama ensure note dumb",
      language: "english",
    });

    expect(split.cards).toEqual([
      "Card 1: kiwi XXXX drama ensure note XXXX",
      "Card 2: kiwi enhance XXXX ensure XXXX dumb",
      "Card 3: XXXX enhance drama XXXX note dumb",
    ]);
    expect(split.hackTimeUnit).toBe("lt1second");
    expect(split.highlightRisk).toBe(true);
  });
});

describe("official vectors", () => {
  it("BIP44 vector: first receiving address", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip44",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(wallet.rows[0]?.address).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
    expect(wallet.rows[0]?.addressType).toBe("p2pkh");
    expect(wallet.accountPath).toBe("m/44'/0'/0'");
  });

  it("BIP49 vector: first receiving address", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip49",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(wallet.rows[0]?.address).toBe("37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf");
    expect(wallet.rows[0]?.addressType).toBe("p2sh-p2wpkh");
    expect(wallet.accountPath).toBe("m/49'/0'/0'");
  });

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

describe("BIP85 derivation", () => {
  it("deriva child mnemonic BIP39 de forma determinística", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const first = deriveBip85Bip39FromSeed({
      seedHex,
      language: "english",
      wordCount: 12,
      index: 0,
    });
    const second = deriveBip85Bip39FromSeed({
      seedHex,
      language: "english",
      wordCount: 12,
      index: 0,
    });

    expect(first.path).toBe("m/83696968'/39'/0'/12'/0'");
    expect(first.childMnemonic).toBe(second.childMnemonic);
    expect(validateMnemonicByLanguage(first.childMnemonic, "english", "strict").valid).toBe(true);
  });

  it("gera saídas diferentes para índices diferentes", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const index0 = deriveBip85Bip39FromSeed({
      seedHex,
      language: "english",
      wordCount: 12,
      index: 0,
    });
    const index1 = deriveBip85Bip39FromSeed({
      seedHex,
      language: "english",
      wordCount: 12,
      index: 1,
    });

    expect(index0.childMnemonic).not.toBe(index1.childMnemonic);
    expect(index1.path).toBe("m/83696968'/39'/0'/12'/1'");
  });

  it("permite ajustar idioma e tamanho de mnemônico filho", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const result = deriveBip85Bip39FromSeed({
      seedHex,
      language: "portuguese",
      wordCount: 24,
      index: 0,
    });

    expect(result.path).toBe("m/83696968'/39'/9'/24'/0'");
    expect(result.childMnemonic.split(" ")).toHaveLength(24);
    expect(validateMnemonicByLanguage(result.childMnemonic, "portuguese", "strict").valid).toBe(
      true,
    );
  });

  it("deriva WIF BIP85 com saída estável", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const result = deriveBip85WifFromSeed({
      seedHex,
      index: 0,
    });

    expect(result.path).toBe("m/83696968'/2'/0'");
    expect(result.childWif).toBe(BIP85_WIF_VECTOR);
    expect(result.childKey).toBe(BIP85_WIF_VECTOR);
  });

  it("deriva XPRV BIP85 com saída estável", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const result = deriveBip85XprvFromSeed({
      seedHex,
      index: 0,
    });

    expect(result.path).toBe("m/83696968'/32'/0'");
    expect(result.childXprv).toBe(BIP85_XPRV_VECTOR);
    expect(result.childKey).toBe(BIP85_XPRV_VECTOR);
  });

  it("deriva HEX BIP85 com tamanho configurável", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const result = deriveBip85HexFromSeed({
      seedHex,
      bytes: 64,
      index: 0,
    });

    expect(result.path).toBe("m/83696968'/128169'/64'/0'");
    expect(result.childEntropyHex).toBe(BIP85_HEX64_VECTOR);
    expect(result.childEntropyHex).toHaveLength(128);
  });

  it("derivador unificado seleciona aplicação corretamente", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const asWif = deriveBip85FromSeed({
      seedHex,
      application: "wif",
      index: 0,
    });
    const asHex = deriveBip85FromSeed({
      seedHex,
      application: "hex",
      index: 0,
      bytes: 64,
    });

    expect(asWif.application).toBe("wif");
    expect(asWif.childKey).toBe(BIP85_WIF_VECTOR);
    expect(asHex.application).toBe("hex");
    expect(asHex.childKey).toBe(BIP85_HEX64_VECTOR);
  });

  it("rejeita índice negativo e acima do limite UInt31", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");

    expect(() =>
      deriveBip85Bip39FromSeed({
        seedHex,
        language: "english",
        wordCount: 12,
        index: -1,
      }),
    ).toThrowError(/BIP85 exige índice inteiro >= 0/);

    expect(() =>
      deriveBip85Bip39FromSeed({
        seedHex,
        language: "english",
        wordCount: 12,
        index: 2147483648,
      }),
    ).toThrowError(/BIP85 índice máximo/);
  });

  it("rejeita tamanho de bytes fora do intervalo para aplicação HEX", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");

    expect(() =>
      deriveBip85HexFromSeed({
        seedHex,
        bytes: 8,
        index: 0,
      }),
    ).toThrowError(/BIP85 bytes/);

    expect(() =>
      deriveBip85HexFromSeed({
        seedHex,
        bytes: 65,
        index: 0,
      }),
    ).toThrowError(/BIP85 bytes/);
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

  it("limita quantidade máxima de endereços em 200", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: 0,
      change: 0,
      count: 999,
    });
    expect(wallet.rows).toHaveLength(200);
  });

  it("suporta índice inicial customizado", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const wallet = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: 0,
      change: 0,
      startIndex: 5,
      count: 2,
    });

    expect(wallet.rows[0]?.path).toBe("m/84'/0'/0'/0/5");
    expect(wallet.rows[1]?.path).toBe("m/84'/0'/0'/0/6");
  });

  it("permite derivação custom path", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const custom = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "custom",
      customPath: "m/44'/0'/0'",
      customAddressType: "p2pkh",
      change: 0,
      count: 1,
    });

    expect(custom.rows[0]?.address).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
    expect(custom.rows[0]?.path).toBe("m/44'/0'/0'/0/0");
  });

  it("deriva a partir de chave estendida e mantém endereços", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const fromSeed = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: 0,
      change: 0,
      count: 2,
    });

    const fromXpub = deriveWallet({
      extendedKey: fromSeed.accountXpub,
      network: "mainnet",
      standard: "bip84",
      change: 0,
      count: 2,
    });

    expect(fromXpub.rows[0]?.address).toBe(fromSeed.rows[0]?.address);
    expect(fromXpub.rows[1]?.address).toBe(fromSeed.rows[1]?.address);
    expect(fromXpub.rows[0]?.privateKeyHex).toBeNull();
    expect(fromXpub.rows[0]?.privateKeyWif).toBeNull();
  });

  it("rejeita hardened derivation a partir de xpub", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const fromSeed = deriveWallet({
      seedHex,
      network: "mainnet",
      standard: "bip84",
      account: 0,
      change: 0,
      count: 1,
    });

    expect(() => {
      deriveWallet({
        extendedKey: fromSeed.accountXpub,
        network: "mainnet",
        standard: "bip84",
        change: 0,
        count: 1,
        useHardenedAddresses: true,
      });
    }).toThrowError(/hardened/i);
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

  it("deriva chave raiz BIP32 da seed para mainnet e testnet", () => {
    const seedHex = mnemonicToSeedHex(BIP39_TEST_MNEMONIC, "");
    const mainnet = deriveBip32RootKeyFromSeed({ seedHex, network: "mainnet" });
    const testnet = deriveBip32RootKeyFromSeed({ seedHex, network: "testnet" });

    expect(mainnet).toBe(
      "xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu",
    );
    expect(testnet.startsWith("tprv")).toBe(true);
  });

  it("permite alternar serialização da root key entre xprv/yprv/zprv", () => {
    const seedHex = mnemonicToSeedHex(USER_PREFIX_MNEMONIC, "");
    const xprv = deriveBip32RootKeyFromSeed({
      seedHex,
      network: "mainnet",
      format: "xprv",
    });
    const yprv = deriveBip32RootKeyFromSeed({
      seedHex,
      network: "mainnet",
      format: "yprv",
    });
    const zprv = deriveBip32RootKeyFromSeed({
      seedHex,
      network: "mainnet",
      format: "zprv",
    });

    expect(xprv).toBe(USER_PREFIX_XPRV);
    expect(yprv).toBe(USER_PREFIX_YPRV);
    expect(zprv.startsWith("zprv")).toBe(true);
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

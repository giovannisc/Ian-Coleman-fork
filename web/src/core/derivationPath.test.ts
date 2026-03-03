import { describe, expect, it } from "vitest";
import {
  validateDerivationPath,
  validateXpubDerivationPath,
} from "./derivationPath";

describe("validateDerivationPath", () => {
  it("valida caminho padrão BIP84", () => {
    const result = validateDerivationPath("m/84'/0'/0'/0/0");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.depth).toBe(5);
      expect(result.segments[0]?.hardened).toBe(true);
      expect(result.segments[4]?.index).toBe(0);
    }
  });

  it("rejeita início diferente de m", () => {
    const result = validateDerivationPath("n/84'/0'/0'");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Primeiro caractere");
    }
  });

  it("rejeita caracteres inválidos no segmento", () => {
    const result = validateDerivationPath("m/84'/0x/0'");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Segmento inválido");
    }
  });

  it("rejeita índice acima de 2^31-1", () => {
    const result = validateDerivationPath("m/2147483648");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("0..2147483647");
    }
  });

  it("rejeita profundidade acima de 255", () => {
    const deepPath = `m/${new Array(256).fill("1").join("/")}`;
    const result = validateDerivationPath(deepPath);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Profundidade");
    }
  });

  it("rejeita caminho vazio", () => {
    const result = validateDerivationPath("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("vazio");
    }
  });

  it("rejeita separador inválido após m", () => {
    const result = validateDerivationPath("m84'/0'/0'");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Separador inválido");
    }
  });

  it("normaliza espaços externos e preserva caminho normalizado", () => {
    const result = validateDerivationPath("   m/84'/0'/0'/0/1   ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalizedPath).toBe("m/84'/0'/0'/0/1");
    }
  });

  it("aceita notação hardened com h e H", () => {
    const result = validateDerivationPath("m/84h/0H/0'");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.segments[0]?.hardened).toBe(true);
      expect(result.segments[1]?.hardened).toBe(true);
      expect(result.segments[2]?.hardened).toBe(true);
    }
  });

  it("respeita maxDepth customizado", () => {
    const result = validateDerivationPath("m/0/1", { maxDepth: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("excede o máximo");
    }
  });

  it("respeita maxIndex customizado", () => {
    const result = validateDerivationPath("m/2", { maxIndex: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Use 0..1");
    }
  });
});

describe("validateXpubDerivationPath", () => {
  it("permite path não hardened com xpub", () => {
    const result = validateXpubDerivationPath("m/0/1/2", true, false);
    expect(result.ok).toBe(true);
  });

  it("bloqueia path hardened com xpub", () => {
    const result = validateXpubDerivationPath("m/84'/0/0", true, false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("hardened");
    }
  });

  it("bloqueia hardened address flag com xpub", () => {
    const result = validateXpubDerivationPath("m/84/0/0", true, true);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("hardened");
    }
  });

  it("permite hardened quando não é xpub", () => {
    const result = validateXpubDerivationPath("m/84'/0'/0'", false, true);
    expect(result.ok).toBe(true);
  });
});

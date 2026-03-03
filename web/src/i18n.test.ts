import { describe, expect, it } from "vitest";
import { detectInitialLocale, detectInitialTheme, translateCoreError } from "./i18n";

describe("translateCoreError", () => {
  it("keeps portuguese text in pt-BR locale", () => {
    const message = "Mnemonic vazia.";
    expect(translateCoreError(message, "pt-BR")).toBe(message);
  });

  it("translates strict mode word-count error to english", () => {
    const message = "Modo estrito aceita apenas 12, 15, 18, 21 ou 24 palavras.";
    expect(translateCoreError(message, "en")).toBe(
      "Strict mode only accepts 12, 15, 18, 21, or 24 words.",
    );
  });

  it("translates derivation path depth error to english", () => {
    const message = "Profundidade 300 excede o máximo 255.";
    expect(translateCoreError(message, "en")).toBe(
      "Depth 300 exceeds the maximum allowed 255.",
    );
  });

  it("falls back to original text for unknown errors", () => {
    const message = "Unexpected runtime exception";
    expect(translateCoreError(message, "en")).toBe(message);
  });
});

describe("detectInitialLocale", () => {
  it("returns a supported locale", () => {
    const locale = detectInitialLocale();
    expect(locale === "en" || locale === "pt-BR").toBe(true);
  });
});

describe("detectInitialTheme", () => {
  it("returns a supported theme", () => {
    const theme = detectInitialTheme();
    expect(theme === "dark" || theme === "light").toBe(true);
  });
});

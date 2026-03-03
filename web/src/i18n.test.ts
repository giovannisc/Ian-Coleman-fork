import { afterEach, describe, expect, it, vi } from "vitest";
import {
  detectInitialLocale,
  detectInitialTheme,
  getUiText,
  translateCoreError,
} from "./i18n";

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it("translates path separator error to english", () => {
    const message = "Separador inválido após 'm'. Use '/'.";
    expect(translateCoreError(message, "en")).toBe(
      "Invalid separator after 'm'. Use '/'.",
    );
  });
});

describe("detectInitialLocale", () => {
  it("defaults to english when navigator is unavailable", () => {
    vi.stubGlobal("navigator", undefined);
    expect(detectInitialLocale()).toBe("en");
  });

  it("detects pt-BR when browser language starts with pt", () => {
    vi.stubGlobal("navigator", { language: "pt-BR" });
    expect(detectInitialLocale()).toBe("pt-BR");
  });

  it("returns a supported locale", () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    const locale = detectInitialLocale();
    expect(locale === "en" || locale === "pt-BR").toBe(true);
  });
});

describe("detectInitialTheme", () => {
  it("defaults to dark when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(detectInitialTheme()).toBe("dark");
  });

  it("detects light when prefers-color-scheme: light matches", () => {
    vi.stubGlobal("window", {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-color-scheme: light)",
      }),
    });
    expect(detectInitialTheme()).toBe("light");
  });

  it("returns a supported theme", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: false }),
    });
    const theme = detectInitialTheme();
    expect(theme === "dark" || theme === "light").toBe(true);
  });
});

describe("getUiText", () => {
  it("provides expected translations for both locales", () => {
    const en = getUiText("en");
    const ptBr = getUiText("pt-BR");

    expect(en.generateButton).toBe("Generate mnemonic");
    expect(ptBr.generateButton).toBe("Gerar mnemonic");
    expect(en.themeLight).toBe("Light");
    expect(ptBr.themeLight).toBe("Claro");
  });
});

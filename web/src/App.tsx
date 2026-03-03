import { useEffect, useMemo, useState } from "react";
import {
  ADVANCED_WORD_COUNTS,
  STRICT_WORD_COUNTS,
  deriveWallet,
  generateEnglishMnemonic,
  mnemonicToSeedHex,
  sanitizeMnemonicInput,
  type BIP39Mode,
  type BitcoinNetwork,
  type DerivationStandard,
  type DerivedWallet,
  type SupportedWordCount,
  validateEnglishMnemonic,
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

const ROW_OPTIONS = [5, 10, 20] as const;
const UI_ERROR_GENERATE = "__UI_ERROR_GENERATE__";
const UI_ERROR_DERIVE = "__UI_ERROR_DERIVE__";

function App() {
  const [locale, setLocale] = useState<AppLocale>(detectInitialLocale);
  const [theme, setTheme] = useState<AppTheme>(detectInitialTheme);
  const [network, setNetwork] = useState<BitcoinNetwork>("mainnet");
  const [standard, setStandard] = useState<DerivationStandard>("bip84");
  const [mode, setMode] = useState<BIP39Mode>("strict");
  const [wordCount, setWordCount] = useState<SupportedWordCount>(12);
  const [pbkdf2Rounds, setPbkdf2Rounds] = useState(2048);
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [rows, setRows] = useState<(typeof ROW_OPTIONS)[number]>(5);
  const [showSecrets, setShowSecrets] = useState(false);
  const [result, setResult] = useState<DerivedWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const text = useMemo(() => getUiText(locale), [locale]);

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

  const normalizedMnemonic = useMemo(
    () => sanitizeMnemonicInput(mnemonicInput),
    [mnemonicInput],
  );

  const mnemonicValidation = useMemo(
    () => validateEnglishMnemonic(normalizedMnemonic, mode),
    [mode, normalizedMnemonic],
  );

  const localizedMnemonicValidationError = useMemo(() => {
    if (!mnemonicValidation.error || mnemonicInput.length === 0) {
      return "";
    }
    return translateCoreError(mnemonicValidation.error, locale);
  }, [locale, mnemonicInput.length, mnemonicValidation.error]);

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
      const generated = generateEnglishMnemonic(wordCount, mode);
      setMnemonicInput(generated);
      setResult(null);
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : UI_ERROR_GENERATE);
    }
  }

  function handleDerive() {
    const validation = validateEnglishMnemonic(mnemonicInput, mode);
    if (!validation.valid) {
      setResult(null);
      setError(validation.error ?? "Mnemonic inválida.");
      return;
    }

    try {
      const rounds = mode === "strict" ? 2048 : pbkdf2Rounds;
      const seedHex = mnemonicToSeedHex(mnemonicInput, passphrase, rounds, mode);
      const wallet = deriveWallet({
        seedHex,
        network,
        standard,
        account,
        change,
        count: rows,
      });
      setMnemonicInput(sanitizeMnemonicInput(mnemonicInput));
      setResult(wallet);
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : UI_ERROR_DERIVE);
    }
  }

  function handleClearSensitive() {
    setMnemonicInput("");
    setPassphrase("");
    setResult(null);
    setError(null);
    setShowSecrets(false);
  }

  return (
    <main className="min-h-screen bg-[var(--app-page-bg)] text-[var(--app-text)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
        <header className="mb-8 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-bg)] p-6 shadow-sm">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
            <p className="inline-flex rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-soft)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--app-chip-text)]">
              {text.tutorialBadge}
            </p>
            <div className="grid w-full gap-3 text-xs sm:w-[28rem] sm:grid-cols-2">
              <label>
                <span className="mb-1 block font-semibold text-[var(--app-text)]">
                  {text.languageLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
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
                <span className="mb-1 block font-semibold text-[var(--app-text)]">
                  {text.themeLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as AppTheme)}
                >
                  <option value="dark">{text.themeDark}</option>
                  <option value="light">{text.themeLight}</option>
                </select>
              </label>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[var(--app-text)] sm:text-4xl">
            {text.title}
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-[var(--app-muted)]">
            {text.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-soft)] px-3 py-1 text-[var(--app-chip-text)]">
              {isOnline ? text.statusConnected : text.statusOffline}
            </span>
            <span className="rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-strong)] px-3 py-1 text-[var(--app-chip-text)]">
              {text.statusNoBackend}
            </span>
            <span className="rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-strong)] px-3 py-1 text-[var(--app-chip-text)]">
              {text.statusMode} {mode === "strict" ? text.modeStrict : text.modeAdvanced}
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-bg)] p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-[var(--app-text)]">
              {text.inputTitle}
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.bip39ModeLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
                  value={mode}
                  onChange={(event) => handleModeChange(event.target.value as BIP39Mode)}
                >
                  <option value="strict">{text.strictOption}</option>
                  <option value="advanced">{text.advancedOption}</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.standardLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
                  value={standard}
                  onChange={(event) => {
                    setStandard(event.target.value as DerivationStandard);
                    setResult(null);
                  }}
                >
                  <option value="bip84">BIP84 (Native SegWit)</option>
                  <option value="bip86">BIP86 (Taproot)</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.networkLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
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

              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.wordsLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
                  value={wordCount}
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
              </label>
            </div>

            {mode === "advanced" && (
              <label className="mt-4 block text-sm">
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.pbkdf2Label}
                </span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg"
                  value={pbkdf2Rounds}
                  onChange={(event) => setPbkdf2Rounds(Number(event.target.value))}
                />
                {pbkdf2Rounds !== 2048 && (
                  <span className="mt-2 block text-xs text-danger">
                    {text.pbkdf2Warning}
                  </span>
                )}
              </label>
            )}

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-[var(--app-text)]">
                {text.mnemonicLabel}
              </span>
              <textarea
                className="min-h-32 w-full resize-y rounded-lg font-mono text-sm"
                value={mnemonicInput}
                onChange={(event) => setMnemonicInput(event.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={text.mnemonicPlaceholder}
              />
            </label>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-[var(--app-text)]">
                {text.passphraseLabel}
              </span>
              <input
                type="password"
                className="w-full rounded-lg font-mono text-sm"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                autoComplete="new-password"
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.accountLabel}
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
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.changeLabel}
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
                <span className="mb-1 block font-medium text-[var(--app-text)]">
                  {text.addressCountLabel}
                </span>
                <select
                  className="w-full rounded-lg border border-[var(--app-border)] bg-white px-3 py-2 text-secondary"
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

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-[var(--app-btn-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-btn-primary-text)] hover:bg-[var(--app-btn-primary-hover)]"
                onClick={handleGenerateMnemonic}
              >
                {text.generateButton}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--app-btn-secondary-border)] bg-[var(--app-btn-secondary-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-btn-secondary-text)] hover:bg-[var(--app-btn-secondary-hover)]"
                onClick={handleDerive}
              >
                {text.deriveButton}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--app-btn-ghost-border)] bg-[var(--app-btn-ghost-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-btn-ghost-text)] hover:bg-[var(--app-btn-ghost-hover-bg)] hover:text-[var(--app-btn-ghost-hover-text)]"
                onClick={handleClearSensitive}
              >
                {text.clearButton}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-alt)] p-3 text-sm">
              <p className="font-medium text-[var(--app-text)]">
                {text.mnemonicStatusLabel}{" "}
                <span className={mnemonicValidation.valid ? "text-success" : "text-danger"}>
                  {mnemonicInput.length === 0
                    ? text.mnemonicStatusEmpty
                    : mnemonicValidation.valid
                      ? text.mnemonicStatusValid
                      : text.mnemonicStatusInvalid}
                </span>
              </p>
              {localizedMnemonicValidationError && (
                <p className="mt-2 text-danger">{localizedMnemonicValidationError}</p>
              )}
              {localizedError && <p className="mt-2 text-danger">{localizedError}</p>}
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-bg)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold text-[var(--app-text)]">
                {text.outputTitle}
              </h2>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--app-text)]">
                <input
                  type="checkbox"
                  checked={showSecrets}
                  onChange={(event) => setShowSecrets(event.target.checked)}
                />
                {text.showSecrets}
              </label>
            </div>

            {!result && (
              <p className="mt-4 text-sm text-[var(--app-muted)]">
                {text.outputHint}
              </p>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                <InfoBlock
                  label="Seed (hex)"
                  value={showSecrets ? result.seedHex : maskSecret(result.seedHex)}
                />
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
                  <p className="mb-2 text-sm font-semibold text-[var(--app-text)]">
                    {text.addressRowsLabel}
                  </p>
                  <div className="max-h-80 overflow-auto rounded-lg border border-[var(--app-border)]">
                    <table className="w-full min-w-[880px] border-collapse text-left text-xs">
                      <thead className="sticky top-0 bg-[var(--app-surface-alt)]">
                        <tr>
                          <th className="px-3 py-2">{text.tablePath}</th>
                          <th className="px-3 py-2">{text.tableType}</th>
                          <th className="px-3 py-2">{text.tableAddress}</th>
                          <th className="px-3 py-2">{text.tablePublicKey}</th>
                          <th className="px-3 py-2">{text.tablePrivateKey}</th>
                          {result.standard === "bip86" && (
                            <th className="px-3 py-2">{text.tableInternalKey}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row) => (
                          <tr key={row.path} className="border-t border-[var(--app-border)]">
                            <td className="px-3 py-2 font-mono text-[11px]">{row.path}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">{row.addressType}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">{row.address}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">{row.publicKeyHex}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">
                              {showSecrets
                                ? row.privateKeyHex ?? text.notAvailable
                                : maskSecret(row.privateKeyHex ?? text.notAvailable)}
                            </td>
                            {result.standard === "bip86" && (
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

        <footer className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-bg)] p-4 text-xs text-[var(--app-muted)] shadow-sm">
          <p>{text.footer}</p>
        </footer>
      </div>
    </main>
  );
}

type InfoBlockProps = {
  label: string;
  value: string;
};

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>
      <p className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-alt)] px-3 py-2 font-mono text-xs text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function maskSecret(value: string): string {
  if (value.length <= 16) {
    return "••••";
  }
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

export default App;

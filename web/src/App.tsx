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

const ROW_OPTIONS = [5, 10, 20] as const;

function App() {
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
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

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

  const wordOptions = mode === "strict" ? STRICT_WORD_COUNTS : ADVANCED_WORD_COUNTS;

  const normalizedMnemonic = useMemo(
    () => sanitizeMnemonicInput(mnemonicInput),
    [mnemonicInput],
  );

  const mnemonicValidation = useMemo(
    () => validateEnglishMnemonic(normalizedMnemonic, mode),
    [mode, normalizedMnemonic],
  );

  function handleModeChange(newMode: BIP39Mode) {
    setMode(newMode);
    setResult(null);
    setError("");

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
      setError("");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Falha ao gerar mnemonic");
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
      setError("");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Falha de derivação");
    }
  }

  function handleClearSensitive() {
    setMnemonicInput("");
    setPassphrase("");
    setResult(null);
    setError("");
    setShowSecrets(false);
  }

  return (
    <main className="min-h-screen bg-secondary text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
        <header className="mb-8 rounded-2xl border border-primary-light bg-primary-dark p-6 shadow-sm">
          <p className="mb-2 inline-flex rounded-full border border-white/35 bg-primary-light px-3 py-1 text-xs font-semibold tracking-wide text-white">
            Tutorial + Ferramenta • BIP39/BIP84/BIP86
          </p>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Wallet Playground em TypeScript
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-secondary-light">
            Evolução do roadmap implementada com foco em padrões modernos: BIP86
            (Taproot/Bech32m), validação robusta de derivation path e modo estrito
            BIP39 por padrão.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-white/35 bg-primary-light px-3 py-1">
              {isOnline ? "Conectado" : "Offline"}
            </span>
            <span className="rounded-full border border-white/35 bg-primary px-3 py-1">
              Sem envio de seed/chaves para backend
            </span>
            <span className="rounded-full border border-white/35 bg-primary px-3 py-1">
              Modo {mode === "strict" ? "Estrito" : "Avançado"}
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-primary-light bg-primary-dark p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-white">Entrada</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-white">Modo BIP39</span>
                <select
                  className="w-full rounded-lg border border-primary-light bg-white px-3 py-2 text-secondary"
                  value={mode}
                  onChange={(event) => handleModeChange(event.target.value as BIP39Mode)}
                >
                  <option value="strict">Estrito (recomendado)</option>
                  <option value="advanced">Avançado</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-white">Padrão</span>
                <select
                  className="w-full rounded-lg border border-primary-light bg-white px-3 py-2 text-secondary"
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
                <span className="mb-1 block font-medium text-white">Rede</span>
                <select
                  className="w-full rounded-lg border border-primary-light bg-white px-3 py-2 text-secondary"
                  value={network}
                  onChange={(event) => {
                    setNetwork(event.target.value as BitcoinNetwork);
                    setResult(null);
                  }}
                >
                  <option value="mainnet">Bitcoin Mainnet</option>
                  <option value="testnet">Bitcoin Testnet</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-white">
                  Quantidade de palavras
                </span>
                <select
                  className="w-full rounded-lg border border-primary-light bg-white px-3 py-2 text-secondary"
                  value={wordCount}
                  onChange={(event) =>
                    setWordCount(Number(event.target.value) as SupportedWordCount)
                  }
                >
                  {wordOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} palavras
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {mode === "advanced" && (
              <label className="mt-4 block text-sm">
                <span className="mb-1 block font-medium text-white">PBKDF2 rounds</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg"
                  value={pbkdf2Rounds}
                  onChange={(event) => setPbkdf2Rounds(Number(event.target.value))}
                />
                {pbkdf2Rounds !== 2048 && (
                  <span className="mt-2 block text-xs text-danger">
                    Compatibilidade reduzida: carteiras padrão BIP39 usam 2048 rounds.
                  </span>
                )}
              </label>
            )}

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-white">Mnemonic (inglês)</span>
              <textarea
                className="min-h-32 w-full resize-y rounded-lg font-mono text-sm"
                value={mnemonicInput}
                onChange={(event) => setMnemonicInput(event.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="abandon abandon abandon ..."
              />
            </label>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-white">Passphrase (opcional)</span>
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
                <span className="mb-1 block font-medium text-white">Conta</span>
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
                <span className="mb-1 block font-medium text-white">Change</span>
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
                <span className="mb-1 block font-medium text-white">Endereços</span>
                <select
                  className="w-full rounded-lg border border-primary-light bg-white px-3 py-2 text-secondary"
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
                className="rounded-lg bg-primary-light px-4 py-2 text-sm font-semibold text-white hover:bg-primary"
                onClick={handleGenerateMnemonic}
              >
                Gerar mnemonic
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/35 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                onClick={handleDerive}
              >
                Derivar carteira
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/35 bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary-light hover:text-white"
                onClick={handleClearSensitive}
              >
                Limpar dados sensíveis
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-primary-light bg-primary p-3 text-sm">
              <p className="font-medium text-white">
                Status da mnemonic:{" "}
                <span className={mnemonicValidation.valid ? "text-success" : "text-danger"}>
                  {mnemonicInput.length === 0
                    ? "sem dados"
                    : mnemonicValidation.valid
                      ? "válida"
                      : "inválida"}
                </span>
              </p>
              {mnemonicValidation.error && mnemonicInput.length > 0 && (
                <p className="mt-2 text-danger">{mnemonicValidation.error}</p>
              )}
              {error && <p className="mt-2 text-danger">{error}</p>}
            </div>
          </article>

          <article className="rounded-2xl border border-primary-light bg-primary-dark p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold text-white">Saída</h2>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-white">
                <input
                  type="checkbox"
                  checked={showSecrets}
                  onChange={(event) => setShowSecrets(event.target.checked)}
                />
                Exibir seed/chaves privadas
              </label>
            </div>

            {!result && (
              <p className="mt-4 text-sm text-secondary-light">
                Gere ou informe uma mnemonic válida e clique em <strong>Derivar carteira</strong>.
              </p>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                <InfoBlock
                  label="Seed (hex)"
                  value={showSecrets ? result.seedHex : maskSecret(result.seedHex)}
                />
                <InfoBlock label="Padrão" value={result.standard.toUpperCase()} />
                <InfoBlock label="Account Path" value={result.accountPath} />
                <InfoBlock label="Account Xpub" value={result.accountXpub} />
                <InfoBlock
                  label="Account Xprv"
                  value={
                    showSecrets
                      ? result.accountXprv ?? "N/A"
                      : maskSecret(result.accountXprv ?? "N/A")
                  }
                />

                <div>
                  <p className="mb-2 text-sm font-semibold text-white">Endereços derivado</p>
                  <div className="max-h-80 overflow-auto rounded-lg border border-primary-light">
                    <table className="w-full min-w-[880px] border-collapse text-left text-xs">
                      <thead className="sticky top-0 bg-primary">
                        <tr>
                          <th className="px-3 py-2">Path</th>
                          <th className="px-3 py-2">Tipo</th>
                          <th className="px-3 py-2">Address</th>
                          <th className="px-3 py-2">Public Key</th>
                          <th className="px-3 py-2">Private Key</th>
                          {result.standard === "bip86" && (
                            <th className="px-3 py-2">Internal Key</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row) => (
                          <tr key={row.path} className="border-t border-primary-light">
                            <td className="px-3 py-2 font-mono text-[11px]">{row.path}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">{row.addressType}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">{row.address}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">{row.publicKeyHex}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">
                              {showSecrets
                                ? row.privateKeyHex ?? "N/A"
                                : maskSecret(row.privateKeyHex ?? "N/A")}
                            </td>
                            {result.standard === "bip86" && (
                              <td className="px-3 py-2 font-mono text-[11px]">
                                {row.internalKeyHex ?? "N/A"}
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

        <footer className="mt-6 rounded-2xl border border-primary-light bg-primary-dark p-4 text-xs text-secondary-light shadow-sm">
          <p>
            Operação local/offline: execute o build e abra com servidor estático local. Para
            valores reais, use ambiente isolado e valide checksums do artefato.
          </p>
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
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary-light">
        {label}
      </p>
      <p className="rounded-lg border border-primary-light bg-primary px-3 py-2 font-mono text-xs text-white">
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

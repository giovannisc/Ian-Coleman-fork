# BIP39 Offline Wallet Tool (React + Vite + Tailwind)

Aplicação frontend em TypeScript para derivação de carteira com processamento 100% client-side.

## Segurança
- Nenhuma mnemonic/seed/chave é enviada para servidor.
- Não há persistência de dados sensíveis em localStorage/sessionStorage/cookies.
- Deploy é estático (S3 + CloudFront via SST), sem backend para criptografia.

## Escopo atual
- Geração de mnemonic BIP39 (wordlist inglês).
- Validação de mnemonic BIP39.
- Derivação de seed.
- Derivação Bitcoin BIP84 (SegWit nativo) para mainnet/testnet.
- Derivação Bitcoin BIP86 (Taproot/Bech32m) para mainnet/testnet.
- Modo BIP39:
- `Estrito` (padrão): 12/15/18/21/24 palavras e PBKDF2 2048.
- `Avançado`: permite PBKDF2 custom (com alerta de compatibilidade).
- Validação robusta de derivation path no core TypeScript.

## Comandos
```bash
# instalar dependências
npm install

# desenvolvimento
npm run dev

# build de produção
npm run build

# preview local do build
npm run preview

# lint
npm run lint

# testes unitários (vetores oficiais inclusos)
npm run test
```

## Uso local e offline
1. Rode `npm run build`.
2. Sirva a pasta `dist/` localmente (ex.: `npm run preview`).
3. Após carregar uma vez, o service worker mantém os assets em cache para uso offline.

Observação: para uso com valores reais, prefira ambiente isolado e valide checksum do artefato antes da execução.

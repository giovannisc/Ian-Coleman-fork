# Deploy AWS com SST

## Pré-requisitos
- Conta AWS configurada localmente (`aws configure` ou SSO).
- Node.js 20+.
- Dependências instaladas na raiz e em `web/`.

## Configuração atual
- Arquivo de infraestrutura: `sst.config.ts`
- Recurso: `sst.aws.StaticSite`
- Origem do build: `web/dist`

## Fluxo de deploy
```bash
# instalar dependências
npm install
npm run web:install

# validar frontend
npm run web:build

# deploy
npm run deploy
```

## Observações
- O deploy publica apenas assets estáticos.
- Não há API/lambda para processamento de mnemonic/seed/chaves.
- Para remover recursos de estágios não produtivos, use `sst remove --stage <stage>`.

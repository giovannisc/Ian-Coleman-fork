# Plano Técnico de Migração: React + Vite + Tailwind + SST

## Contexto
Este repositório possui uma aplicação legada em JavaScript/jQuery com lógica sensível de geração de mnemonic/seed/chaves.
O objetivo é migrar para uma stack moderna mantendo segurança, suporte offline e deploy em AWS.

## Objetivos
- Migrar frontend para **React + Vite + TypeScript + TailwindCSS**.
- Manter processamento de dados sensíveis **100% client-side**.
- Permitir execução **local e offline**.
- Fazer deploy em AWS com **SST** usando site estático.

## Requisitos de Segurança (não negociáveis)
- Nenhuma mnemonic/seed/chave deve sair do browser.
- Não usar backend para derivação/criptografia de carteira.
- Não persistir segredos em `localStorage`, `sessionStorage`, IndexedDB, cookies ou logs.
- Não incluir trackers, analytics ou scripts de terceiros.
- Garantir build reproduzível e publicar checksums dos artefatos offline.
- Informar ao usuário quando estiver em modo não padrão (ex.: PBKDF2 custom).

## Arquitetura Alvo

## Frontend (web/)
- Vite + React + TypeScript (`strict: true`).
- Tailwind para UI.
- Core de carteira em módulos TS puros (`src/core/*`) sem dependência de DOM.
- Camada de apresentação React (`src/components/*`).

## Offline
- Service Worker para cache dos assets estáticos (PWA).
- Build local (`dist/`) executável sem internet.
- Política: sem dependências de runtime externas (fonts/scripts CDN).

## Deploy AWS (SST)
- Infra de site estático em S3 + CloudFront via `sst.aws.StaticSite`.
- Deploy somente dos arquivos buildados do frontend.
- Sem APIs, sem Lambda para lógica sensível.

## Estratégia de Migração por Fases
1. **Fundação (esta entrega)**
- Scaffold React+TS+Tailwind.
- Base de segurança em memória.
- Primeiro fluxo funcional Bitcoin (BIP39 + BIP84 inicial).
- PWA offline básico.
- SST StaticSite configurado.

2. **Paridade funcional com legado**
- Migrar tabs/fluxos principais (BIP32/44/49/84/141).
- Portar validações e mensagens.
- Cobrir com testes de regressão.

3. **Padrões modernos Bitcoin**
- Adicionar BIP86/Taproot + Bech32m.
- Atualizar dependências criptográficas.
- Expandir vetores oficiais de teste.

4. **Hardening final**
- Revisão de segurança (CSP, headers, supply chain).
- Pacote offline assinável/checksum.
- Documentação de operação segura.

## Critérios de Aceite da Fase 1
- App React funcionando com TypeScript estrito e Tailwind.
- Geração/validação de mnemonic e derivação BIP84 executadas apenas no browser.
- Sem persistência de segredos em storage.
- Build estático funcionando offline.
- Deploy AWS por SST configurado e documentado.

## Riscos e Mitigações
- **Risco:** divergência de resultados com legado.
  - **Mitigação:** vetores de teste oficiais e comparação progressiva.
- **Risco:** regressão de segurança por bibliotecas/frontend.
  - **Mitigação:** dependências mínimas, auditoria periódica e travamento de versão.
- **Risco:** offline quebrar por dependência externa.
  - **Mitigação:** remover CDNs e cachear assets locais.

## Próximos Passos Imediatos
- Criar app `web/` com React+TS+Tailwind.
- Implementar módulo inicial de derivação BTC em TS.
- Configurar PWA offline.
- Configurar `sst.config.ts` para deploy estático.

# Roadmap de Melhorias (Foco em TypeScript e Padrões Bitcoin)

## Objetivo
Evoluir a base do projeto para suportar padrões modernos do ecossistema Bitcoin com maior segurança, manutenibilidade e testabilidade, adotando TypeScript como base da implementação futura.

## Resumo das Lacunas Atuais
- Ausência de suporte a Taproot (BIP86), endereços `bc1p` e Bech32m.
- Dependências de criptografia Bitcoin em versões antigas.
- Validação de derivation path com comportamento inconsistente em limites e checagens.
- Recursos fora do padrão BIP39 estrito (ex.: número de palavras muito baixo e PBKDF2 custom) sem separação clara de modo avançado.
- Trechos de documentação e UX legados para ecossistema atual.

## Prioridades

## P0. Alinhamento com padrões Bitcoin atuais
- Implementar BIP86 (`m/86'/coin_type'/account'/change/index`) para contas e derivação de endereços Taproot.
- Implementar geração de endereço P2TR (`bc1p...`) usando Bech32m.
- Adicionar suporte a chaves x-only quando aplicável no fluxo de Taproot.
- Incluir vetores oficiais de teste para BIP86/Taproot.

Critérios de aceite:
- Para mnemonics conhecidas, resultados batem com vetores de referência de BIP86.
- Endereços Taproot gerados em mainnet/testnet passam nos validadores de formato e checksums esperados.

## P0. Atualização de dependências críticas
- Atualizar stack de bibliotecas Bitcoin para versões modernas com suporte a Taproot/Bech32m.
- Revisar bibliotecas auxiliares com impacto criptográfico direto.
- Remover dependências obsoletas sem uso.

Critérios de aceite:
- Build reproduzível sem warnings críticos de dependências.
- Testes de regressão (BIP39/BIP32/BIP44/BIP49/BIP84) continuam passando.

## P1. Correções funcionais e robustez
- Corrigir validação de derivation path:
- checagem de índice inválido;
- limites de índice (`0` a `2^31 - 1` por componente antes do hardened bit);
- mensagens de erro mais precisas por profundidade.
- Revisar validação de entrada para reduzir falsos positivos/negativos.

Critérios de aceite:
- Casos de borda (índice máximo, índice inválido, hardened com xpub, profundidade) cobertos por teste unitário.

## P1. Interoperabilidade BIP39
- Introduzir `Modo Estrito BIP39` (padrão):
- apenas 12/15/18/21/24 palavras;
- PBKDF2 fixo em 2048.
- Manter recursos não padrão em `Modo Avançado`, com alertas explícitos sobre compatibilidade.

Critérios de aceite:
- Usuário entende claramente quando está fora do padrão.
- Resultados em modo estrito compatíveis com carteiras BIP39 amplamente usadas.

## P2. Atualização de UX e documentação
- Revisar textos e sugestões de derivação legadas.
- Atualizar referências externas e guias de uso.
- Incluir seção “Compatibilidade por padrão” e “Modo Avançado”.

Critérios de aceite:
- Documentação técnica e de uso refletem a implementação real.

## Estratégia de Migração para TypeScript

## Diretrizes
- Migrar de forma incremental, sem “big bang”.
- Começar por módulos de domínio (sem UI) para estabilizar lógica crítica.
- Ativar `strict` no `tsconfig` e tratar erros de tipos como bloqueantes.

## Estrutura sugerida
- `src/ts/core/bip39.ts`
- `src/ts/core/bip32.ts`
- `src/ts/core/derivation.ts`
- `src/ts/core/address.ts`
- `src/ts/core/networks.ts`
- `src/ts/ui/` para integração com DOM
- `src/ts/types/` para tipos compartilhados

## Fases
1. Preparação
- Adicionar TypeScript, configuração de build e lint.
- Definir convenções de tipos e limites de módulos.

2. Núcleo criptográfico
- Migrar derivação e validações (`bip39`, `bip32`, paths, scripts).
- Cobrir com testes de vetor.

3. Endereçamento moderno
- Implementar Taproot/BIP86 e Bech32m.
- Garantir retrocompatibilidade de BIP49/BIP84.

4. Integração com UI
- Encapsular DOM em camada de adapter.
- Substituir lógica JS legada módulo a módulo.

5. Endurecimento final
- Remover código JS duplicado.
- Ativar gates de CI (testes + lint + typecheck).

## Testes recomendados
- Unitários:
- vetores oficiais para BIP39, BIP32, BIP49, BIP84, BIP86;
- validação de derivation path.
- Integração:
- geração de xpub/xprv/ypub/zpub e equivalentes suportados;
- geração de endereços por rede.
- E2E:
- fluxo completo de frase -> seed -> root key -> contas -> endereços.

## Backlog inicial (execução)
- [x] Definir stack TypeScript (compilador, bundler e runner de testes).
- [x] Criar `tsconfig` com `strict: true`.
- [x] Migrar validação de derivation path para TS + testes.
- [x] Atualizar bibliotecas Bitcoin para versões com Taproot.
- [x] Implementar Bech32m.
- [x] Implementar BIP86 e geração P2TR.
- [x] Adicionar vetores BIP86 no pipeline de testes.
- [x] Implementar Modo Estrito BIP39 como padrão.
- [x] Isolar Modo Avançado (opções não padrão) com avisos.
- [x] Revisar documentação e mensagens de UI.

## Observações de rollout
- Fazer releases menores e frequentes por fase.
- Manter compatibilidade para usuários existentes durante a transição.
- Em cada fase, validar regressão dos fluxos já suportados antes de avançar.

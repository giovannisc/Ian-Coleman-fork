# Tutorial Guiado + Ferramenta Prática de Bitcoin

## Objetivo
Transformar a solução em uma experiência híbrida:
1. Tutorial passo a passo para ensinar fundamentos de carteira Bitcoin.
2. Ferramenta operacional para executar tarefas reais de derivação com segurança.

## Escopo Atual Implementado
- Geração de mnemonic BIP39 (wordlist inglês).
- Validação de mnemonic BIP39.
- Derivação de seed local (client-side).
- Modo BIP39 `Estrito` (padrão): 12/15/18/21/24 palavras e PBKDF2 em 2048.
- Modo BIP39 `Avançado`: PBKDF2 custom com alerta de compatibilidade.
- Derivação BIP84 (Native SegWit, `bc1q...` / `tb1q...`).
- Derivação BIP86 (Taproot, `bc1p...` / `tb1p...`) com Bech32m.
- Validação robusta de derivation path no core TypeScript.
- Exibição protegida de segredos (mascarada por padrão) e limpeza rápida da sessão.

## Conceitos que podem ser ensinados com a solução atual

## 1. Entropia e geração de mnemonic
- Conceito: por que aleatoriedade forte define a segurança inicial da carteira.
- Na prática: geração de mnemonic com tamanhos válidos do padrão BIP39.

## 2. Mnemonic, checksum e validação BIP39
- Conceito: frase de recuperação não é “senha comum”; ela segue estrutura e checksum.
- Na prática: validação com feedback de frase inválida.

## 3. Passphrase BIP39
- Conceito: mesma mnemonic com passphrase diferente gera seed e carteira diferentes.
- Na prática: comparar saídas mudando apenas a passphrase.

## 4. Seed e PBKDF2
- Conceito: seed é material criptográfico derivado da mnemonic.
- Na prática:
- modo estrito garante interoperabilidade (PBKDF2 2048);
- modo avançado mostra impacto de rounds custom.

## 5. HD Wallet e derivação por caminho
- Conceito: estrutura hierárquica de carteira (account/change/index).
- Na prática: alterar `account`, `change` e quantidade de endereços derivados.

## 6. Padrões modernos de endereçamento
- Conceito: diferença entre BIP84 (SegWit v0) e BIP86 (Taproot).
- Na prática: selecionar padrão e observar mudança de tipo de endereço (`bc1q` vs `bc1p`).

## 7. Bech32 vs Bech32m
- Conceito: formatos de codificação para witness versions diferentes.
- Na prática: BIP84 usa Bech32; BIP86 usa Bech32m.

## 8. Segurança operacional
- Conceito: uso local/offline reduz superfície de ataque.
- Na prática: ferramenta funciona localmente, sem backend para seed/chaves.

## Funcionalidades úteis para uso de Bitcoin

## A. Criação e recuperação de carteira
- Gerar mnemonic BIP39.
- Validar mnemonic existente.
- Derivar seed localmente para conferência e interoperabilidade.

## B. Derivação para recebimento e organização
- Selecionar rede (mainnet/testnet).
- Selecionar padrão (BIP84/BIP86).
- Derivar endereços por conta e trilha (`change/index`).

## C. Compatibilidade entre ferramentas
- Exibir `account xpub` para cenários watch-only.
- Exibir `account path` completo para auditoria e integração.

## D. Controles de segurança de uso diário
- Seed/chaves privadas mascaradas por padrão.
- Toggle explícito para exibição de segredos.
- Botão para limpar dados sensíveis da sessão.

## Estrutura recomendada de tutorial (passo a passo)

1. Módulo 1: Segurança básica (entropia, mnemonic, backup).
2. Módulo 2: Da mnemonic ao seed (passphrase e PBKDF2).
3. Módulo 3: Derivação HD prática (account/change/index).
4. Módulo 4: Endereços modernos (BIP84 vs BIP86, Bech32 vs Bech32m).
5. Módulo 5: Operação segura (offline-first, higiene operacional, watch-only).

## Evolução futura sugerida (não implementada nesta etapa)
- Expandir para outros padrões na UI (BIP32/BIP44/BIP49/BIP141) com guias didáticos.
- Módulo de quizzes/checkpoints por etapa do tutorial.
- Exportação didática de “relatório de derivação” sem dados sensíveis.

## Regras de segurança que devem permanecer
- Nunca enviar mnemonic/seed/chave para backend.
- Não persistir segredos em localStorage/sessionStorage/cookies.
- Evitar scripts de terceiros no runtime.
- Manter orientação explícita para uso offline em ambiente confiável.

## Resultado esperado
A solução ensina conceitos fundamentais de carteiras Bitcoin enquanto permite execução prática e auditável das tarefas mais relevantes para uso real, com foco em interoperabilidade e segurança operacional.

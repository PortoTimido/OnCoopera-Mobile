# OnCoopera Mobile Design System

Fonte principal: Figma `kGtVspQSArTDxtgA9AFF9I`, telas mobile mapeadas em `specs/design/figma-screen-map.md`.

## Observacao sobre MCP

O node de Login `24:537` foi extraido anteriormente via MCP e confirmou a base visual de autenticacao: canvas `#f5f3ee`, marca `#006b5a`, mint `#3ecfb2`, card branco com raio amplo, inputs pill, CTA gradiente, Fraunces para marca/titulos e Plus Jakarta Sans para texto/formularios. Chamadas posteriores aos nodes `24:537`, `24:611`, `24:705` e `24:779` retornaram `INVALID_ARGUMENT`, entao Cadastro, Esqueci senha e Redefinir senha foram derivados do padrao validado de Login e do mapa local.

## Escopo mobile observado

As telas mobile canonicas usam baseline de `390px` de largura e cobrem:

- onboarding e autenticacao;
- inicio e plano do dia;
- medicamentos, cronograma e alertas de interacao;
- diario de sintomas;
- radar de apoio;
- artigos e leitura;
- relatorio medico;
- configuracoes.

## Principios visuais

- O produto e assistivo e clinico: usar hierarquia calma, alto contraste e linguagem acolhedora.
- Alertas clinicos nao dependem so de cor: sempre combinar tom, titulo e texto explicativo.
- A malha de espacamento segue multiplos de 4, com `20` como margem horizontal padrao do canvas mobile.
- Tocar deve ser confortavel: controles interativos partem de `44px` de altura minima.
- Componentes recorrentes devem viver em `src/components/ui`; composicoes especificas de tela permanecem junto da feature.

## Tokens implementados

A fonte unica do design system mobile esta em `src/global.css`, usando Tailwind v4 CSS-first e NativeWind v5.

- cores: `auth-*`, `brand-*` e `feedback-*`;
- fontes: `font-display`, `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`;
- raios: `rounded-card-auth` e `rounded-pill`;
- sombras: `shadow-card-auth`, `shadow-control` e `shadow-soft`;
- largura de composicao: `max-w-auth`.

## Primitivas implementadas

- `AppText`: texto tokenizado por classes NativeWind.
- `FormMessage`: avisos de erro, sucesso, informacao e alerta.
- Componentes de autenticacao em `src/features/auth/components`: `AuthShell`, `AuthHeader`, `AuthCard`, `AuthTextField`, `PasswordField`, `AuthButton`, `AuthLink` e `PasswordChecklist`.

## Mapeamento de uso por fluxo

- Autenticacao: `AuthShell`, `AuthHeader`, `AuthCard`, `AuthTextField`, `PasswordField`, `AuthButton`, `AuthLink`, `PasswordChecklist` e `FormMessage`.
- Demais fluxos mobile devem promover novos primitivos para `src/components/ui` apenas quando houver repeticao entre features.
- Tokens visuais devem ser consumidos por classes NativeWind geradas a partir de `src/global.css`.

## Regras de evolucao

- Quando uma tela precisar repetir uma composicao em duas ou mais features, promover para `src/components/ui`.
- Evitar hexadecimais em classes/componentes; novos tons devem entrar primeiro em `src/global.css`.
- Evitar tamanhos de fonte soltos fora das classes padronizadas do fluxo.
- Antes de criar biblioteca visual nova, validar necessidade em design tecnico e manter compatibilidade com Expo SDK 54.
- Quando o MCP do Figma estiver acessivel, revisar cores, tipografia, raios e sombras contra variaveis reais do arquivo.

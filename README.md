# OnCoopera — Aplicação Mobile

Este repositório contém a aplicação mobile do ecossistema OnCoopera. O projeto é desenvolvido com Expo, React Native e TypeScript, utilizando Expo Router para navegação e uma organização centrada nos fluxos públicos de autenticação e cadastro de pacientes.

A aplicação consome uma API HTTP do OnCoopera para autenticação, sessão e cadastro de pacientes. Também utiliza uma integração externa com o ViaCEP para preenchimento automático de endereço a partir do CEP.

## Sobre o OnCoopera

O OnCoopera é uma solução desenvolvida como Trabalho de Conclusão de Curso voltada ao apoio de pacientes oncológicos.

Pelo estado atual deste repositório, a aplicação mobile contempla fluxos iniciais de acesso do paciente, criação de conta, tratamento de senha temporária e preparação de recuperação de senha, integrando-se à API do ecossistema para operações persistentes.

## Responsabilidade deste repositório

Este repositório representa a aplicação mobile do OnCoopera. Sua responsabilidade é fornecer a interface de acesso do paciente em dispositivos móveis, com rotas públicas para login, cadastro, troca de senha temporária e redefinição de senha.

O app se comunica com a API OnCoopera por meio de requisições HTTP configuradas em `src/lib/api/client.ts`. O cadastro de paciente envia os dados para o endpoint mobile da API e consulta o ViaCEP diretamente para auxiliar o preenchimento de endereço.

## Tecnologias

| Tecnologia | Finalidade |
| ---------- | ---------- |
| TypeScript | Linguagem principal do projeto |
| Expo SDK 54 | Plataforma de desenvolvimento e execução do app React Native |
| React Native | Construção da interface mobile |
| React 19 | Biblioteca de UI utilizada pelo Expo/React Native |
| Expo Router | Roteamento baseado em arquivos no diretório `app/` |
| NativeWind | Estilização com classes utilitárias integradas ao React Native |
| Tailwind CSS 4 | Tokens e utilitários de estilo usados pelo NativeWind |
| react-native-css | Componentes e suporte de CSS no React Native |
| Expo SecureStore | Armazenamento local do token de acesso quando o usuário escolhe lembrar sessão |
| Jest e jest-expo | Execução de testes unitários e de componentes |
| Testing Library React Native | Testes de componentes React Native |
| Docker | Ambiente base de desenvolvimento via `Dockerfile.dev` |

## Arquitetura

O projeto utiliza Expo Router para organizar rotas no diretório `app/` e mantém a maior parte da implementação reutilizável em `src/`.

A estrutura atual combina organização por feature e módulos técnicos:

- `src/features/auth` concentra telas, componentes e validações do fluxo de autenticação;
- `src/lib/api` centraliza o cliente HTTP, contratos de autenticação e integração com ViaCEP;
- `src/lib/auth` isola a persistência de sessão em memória e no `SecureStore`;
- `src/components/ui` contém componentes de UI compartilhados.

Não há diretórios nativos `ios/` ou `android/` versionados, portanto o projeto está organizado como uma aplicação Expo gerenciada no estado atual do repositório.

## Estrutura do projeto

```text
.
├── app/
│   ├── (public)/
│   │   ├── cadastro.tsx
│   │   ├── esqueci-senha.tsx
│   │   ├── login.tsx
│   │   ├── redefinir-senha/
│   │   └── trocar-senha-temporaria.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── assets/
├── specs/
│   ├── architecture/
│   └── design/
├── src/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── types/
│   └── global.css
├── app.json
├── Dockerfile.dev
├── jest.config.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

O diretório `app/` define as rotas da aplicação. O diretório `src/` contém componentes, features, integrações, utilitários e tipos. O diretório `assets/` armazena ícones e imagens de splash. O diretório `specs/` reúne documentação de arquitetura e design do ecossistema OnCoopera.

## Pré-requisitos

- Node.js 20.19.x, conforme referência do Expo SDK 54.
- npm, indicado pelo `package-lock.json` e pelos scripts do projeto.
- Expo CLI via `npx expo`, usado pelos scripts do `package.json`.
- Docker, apenas se for utilizado o ambiente baseado em `Dockerfile.dev`.

## Instalação

Instale as dependências com npm:

```bash
npm install
```

## Configuração do ambiente

Não há arquivo `.env.example` neste repositório. A variável de ambiente identificada no código é:

| Variável | Descrição |
| -------- | --------- |
| `EXPO_PUBLIC_API_URL` | URL base da API OnCoopera consumida pelo app mobile. Quando não definida, o app tenta usar `http://localhost:3000/api` no web ou inferir o host LAN do Expo em dispositivos móveis. |

Exemplo de configuração local:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Arquivos `*.env` são ignorados pelo Docker conforme `.dockerignore`.

## Executando o projeto

Inicie o servidor de desenvolvimento do Expo:

```bash
npm run start
```

Também existem scripts específicos por plataforma:

```bash
npm run android
npm run ios
npm run web
```

Esses comandos executam, respectivamente, `expo start --android`, `expo start --ios` e `expo start --web`.

## Build

O `package.json` não define um script de build. O repositório contém scripts de execução em desenvolvimento para Expo, mas não documenta um fluxo de build local ou EAS no estado atual.

## Testes

Execute os testes com:

```bash
npm test
```

A configuração em `jest.config.js` utiliza `jest-expo` e procura testes em:

```text
src/**/*.test.ts
src/**/*.test.tsx
```

O repositório possui testes para validações de autenticação, cliente de API, endpoints de autenticação, consulta ViaCEP, geocodificação pendente e componentes do fluxo de autenticação.

## Qualidade de código

O projeto utiliza TypeScript com `strict: true` em `tsconfig.json`, o que habilita validação estática de tipos durante o desenvolvimento.

Não há scripts de lint ou formatter definidos no `package.json` no estado atual do repositório.

## Integração com o ecossistema OnCoopera

```text
Aplicação Mobile ─────> API OnCoopera ─────> Persistência do ecossistema
        │
        └─────────────> ViaCEP
```

A aplicação mobile envia credenciais e dados de cadastro para a API OnCoopera. A API é responsável pelas regras de negócio, autenticação e persistência. O app também consulta o ViaCEP para buscar dados de endereço pelo CEP durante o cadastro.

## Principais funcionalidades

- Redirecionamento da rota inicial para a tela de login.
- Login com e-mail ou login de usuário.
- Opção de lembrar sessão com armazenamento de token via Expo SecureStore.
- Tratamento de troca obrigatória de senha temporária.
- Cadastro de paciente com dados pessoais, contato, senha e endereço.
- Preenchimento automático de endereço por CEP usando ViaCEP.
- Validações locais para campos obrigatórios, e-mail, CEP, UF, confirmação de senha e senha mínima.
- Fluxo visual de redefinição de senha com tela de sucesso.

## Status do projeto

O projeto está em desenvolvimento. O estado atual concentra a aplicação mobile em fluxos públicos de autenticação, cadastro e recuperação/troca de senha.

## Contribuição

Este é um projeto acadêmico desenvolvido pela equipe responsável pelo OnCoopera. Alterações devem seguir os padrões técnicos existentes no repositório e a documentação em `specs/` quando aplicável.

## Projeto acadêmico

O OnCoopera está sendo desenvolvido como Trabalho de Conclusão de Curso, com foco no apoio a pacientes oncológicos.

## Licença

Este projeto possui finalidade acadêmica. Consulte os responsáveis pelo projeto sobre condições de utilização e distribuição.

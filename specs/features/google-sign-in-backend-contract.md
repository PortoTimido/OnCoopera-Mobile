# Contrato pendente — autenticação de paciente com Google

## Estado

O aplicativo mobile está preparado para este contrato, mas o endpoint ainda não
existe no backend. A feature flag `EXPO_PUBLIC_GOOGLE_SIGN_IN_ENABLED` deve
permanecer desabilitada nos ambientes sem essa implementação.

## Endpoint

`POST /api/auth/google`

Corpo:

```json
{
  "idToken": "<Google ID Token>"
}
```

O aplicativo não envia access token do Google, authorization code, Client Secret
ou dados de perfil como fonte confiável.

## Resposta de sucesso

Status `200`, com os mesmos cookies de refresh/CSRF e o mesmo corpo de
`POST /api/auth/login`:

```json
{
  "accessToken": "<OnCoopera access token>",
  "usuario": {
    "id": "<uuid>",
    "nome": "Paciente",
    "email": "paciente@example.com",
    "login": "paciente",
    "telefone": "11999999999",
    "dataNascimento": "1990-01-01",
    "status": "ATIVO",
    "tipo": "PACIENTE",
    "perfisAdministrativos": [],
    "trocaSenhaObrigatoria": false,
    "ultimoAcesso": null
  }
}
```

## Responsabilidades do backend

- Validar assinatura, emissor, expiração e audience do ID Token contra o Web
  Client ID configurado no servidor.
- Exigir e-mail verificado e não confiar nos dados de perfil enviados pelo
  cliente.
- Localizar primeiro o vínculo pelo `sub` estável do Google. No primeiro acesso,
  localizar um paciente ativo pelo e-mail normalizado e verificado e persistir o
  vínculo entre paciente, provedor `GOOGLE` e `sub`.
- Rejeitar usuários inexistentes, inativos ou que não sejam pacientes.
- Criar a mesma sessão revogável do login tradicional, atualizar o último acesso
  e emitir access token, refresh cookie HttpOnly e CSRF cookie existentes.
- Não criar paciente automaticamente: telefone, nascimento, senha e endereço
  continuam obrigatórios no modelo atual e não estão presentes no ID Token.

## Erros esperados

- `400`: payload ausente ou malformado.
- `401`: ID Token inválido, expirado, com issuer/audience incorretos ou sem e-mail
  verificado.
- `403`: usuário inativo ou identidade pertencente a outro tipo de usuário.
- `409`: paciente não encontrado, com `error` igual a
  `GOOGLE_ACCOUNT_NOT_REGISTERED` e mensagem segura para o usuário.
- `5xx`: falha interna sem incluir token ou detalhes sensíveis na resposta/log.

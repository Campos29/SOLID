# ADR-005: Notificacoes assincronas com Observer e EventEmitter

## Status

Accepted

## Contexto

Mudancas de status em agendamentos podem disparar notificacoes para usuarios. O envio de e-mail nao deve ficar acoplado ao caso de uso de cancelamento, confirmacao ou conclusao de appointment.

O projeto tambem precisa evidenciar o padrao GoF Observer e manter abertura para novos canais de notificacao.

## Decisao

Modelar notificacoes de status de appointment com Observer. O dominio define contratos como `IAppointmentStatusObserver` e `IAppointmentStatusPublisher`; a aplicacao publica eventos por meio de `AppointmentStatusNotifier`; a infraestrutura registra observadores concretos, como notificacao por e-mail via Nodemailer.

## Consequencias

- Casos de uso nao chamam Nodemailer diretamente.
- Novos observers podem ser adicionados sem alterar a regra principal de appointment.
- Falhas de notificacao precisam ser tratadas com cuidado para nao corromper o estado do agendamento.
- O fluxo fica mais indireto, exigindo testes para garantir ordem de salvamento e publicacao.

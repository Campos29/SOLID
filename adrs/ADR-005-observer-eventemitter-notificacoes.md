# ADR-005: Notificações assíncronas com Observer e EventEmitter

## Status

Accepted

## Contexto

Mudanças de status em agendamentos podem disparar notificações para usuários. O envio de e-mail não deve ficar acoplado ao caso de uso de cancelamento, confirmação ou conclusão de appointment.

O projeto também precisa evidenciar o padrão GoF Observer e manter abertura para novos canais de notificação.

## Decisão

Modelar notificações de status de appointment com Observer. O domínio define contratos como `IAppointmentStatusObserver` e `IAppointmentStatusPublisher`; a aplicação publica eventos por meio de `AppointmentStatusNotifier`; a infraestrutura registra observadores concretos, como notificação por e-mail via Nodemailer.

## Consequências

- Casos de uso não chamam Nodemailer diretamente.
- Novos observers podem ser adicionados sem alterar a regra principal de appointment.
- Falhas de notificação precisam ser tratadas com cuidado para não corromper o estado do agendamento.
- O fluxo fica mais indireto, exigindo testes para garantir ordem de salvamento e publicação.

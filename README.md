# 🗓️ SlotWise — Sistema de Agendamento Inteligente

SlotWise é uma plataforma modular de agendamento de serviços, projetada especificamente para pequenos prestadores (como barbearias, clínicas e estúdios) e seus clientes. O projeto foi desenvolvido com foco estrito em **Clean Architecture**, **princípios SOLID**, **padrões de projeto GoF** e práticas de **Clean Code**.


---

## 🏗️ Decisões Arquiteturais (Plano Macro e Interno)

### Plano Macro: Monolito Modular
Adotamos a abordagem de **Monolito Modular** para acomodar o desenvolvimento ágil em uma equipe pequena. Cada módulo do sistema é isolado fisicamente dentro de pastas autocontidas, possuindo suas próprias rotas, controladores, regras de domínio e casos de uso, evitando o acoplamento cruzado excessivo e garantindo alta manutenibilidade.

### Plano Interno: Clean Architecture
A estrutura interna de código segue a **Arquitetura Limpa** dividida em camadas, com a direção de dependências sempre apontando para dentro:

```
src/
├── domain/            # Camada de Domínio (Entidades puras e Contratos/Interfaces)
│   ├── entities/      # Ex: Appointment.ts, Provider.ts
│   └── interfaces/    # Ex: IAppointmentRepository.ts (Contrato)
├── application/       # Camada de Casos de Uso (Lógica e orquestração de negócio)
│   └── use-cases/     # Ex: CreateAppointmentUseCase.ts
├── infrastructure/    # Camada de Detalhes Técnicos (Frameworks e Drivers)
│   ├── database/      # Pool pg, helpers de transações e migrações
│   ├── mail/          # Driver Nodemailer
│   └── repositories/  # Implementações dos repositórios (PgAppointmentRepository)
└── interfaces/        # Camada de Exposição (HTTP Controllers e Validadores)
    ├── http/          # Rotas Fastify e Controladores
    └── schemas/       # Schemas de validação Zod (geração OpenAPI automática)
```

> [!IMPORTANT]
> A camada de `domain/` é 100% isolada e livre de dependências externas ou drivers de banco de dados.

---

## 🧩 Princípios SOLID Aplicados

* **SRP (Single Responsibility):** O `AppointmentService` ou caso de uso gerencia apenas a orquestração do fluxo. A validação complexa de choque de horários é encapsulada exclusivamente na classe dedicada `SlotConflictChecker`.
* **OCP (Open-Closed):** A classe `NotificationFactory` permite estender o envio de notificações para novos canais (ex: SMS, Push) apenas registrando novos criadores, sem alterar o código original da Factory.
* **LSP (Liskov Substitution):** `EmailNotification` e `SMSNotification` implementam a mesma interface `INotification` e podem ser trocadas sem gerar efeitos colaterais.
* **ISP (Interface Segregation):** A interface de agendamentos é segregada em `IAppointmentReader` (métodos de leitura) e `IAppointmentWriter` (métodos de gravação), de forma que use cases leitores não dependem de lógica de escrita.
* **DIP (Dependency Inversion):** Os Casos de Uso interagem exclusivamente com interfaces (ex: `IAppointmentRepository`), cujas implementações concretas (`PgAppointmentRepository`) são injetadas em tempo de execução.

---

## 🎨 Padrões de Projeto GoF

1. **Factory Method (Criação):** `NotificationFactory` encapsula a decisão de instanciar a classe concreta de notificação (`EmailNotification` ou `SMSNotification`) com base nas configurações da aplicação.
2. **Observer (Comportamento):** Utiliza o `EventEmitter` nativo do Node.js. Mudanças de status de um agendamento disparam eventos ouvidos por múltiplos observers registrados (como o `EmailObserver` e o `LogObserver`), desacoplando o fluxo de e-mails do fluxo de negócio do agendamento.
3. **Strategy (Comportamento):** As regras de cancelamento e cálculo de reembolsos são isoladas por trás da interface `ICancellationStrategy`, com implementações intercambiáveis: `FreeCancellationStrategy` e `PaidCancellationStrategy`.

---

## 🛠️ Tecnologias e Ferramentas

### Backend
* **Runtime:** Node.js (v20+)
* **Framework:** Fastify (Alta performance e integração OpenAPI)
* **Banco de Dados:** PostgreSQL (sem ORM, usando SQL Puro com o driver `pg`)
* **Validação:** Zod
* **Notificação:** Nodemailer (SMTP)
* **Testes:** Vitest (Testes Unitários e E2E)

### Frontend (Pasta `/client`)
* **Framework:** React + TypeScript
* **Build:** Vite
* **Estilização:** Tailwind CSS
* **Estado Global:** Zustand
* **Cliente HTTP:** Axios

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js instalado (versão 20 ou superior)
* Docker e Docker Compose (ou Colima no macOS)
* Utilitário `make` instalado (opcional, mas recomendado)

### 1. Inicializando o Ambiente (Setup Completo)
Para instalar dependências, configurar os arquivos `.env` e subir a base de dados PostgreSQL:

```bash
# Execute o setup inicial das dependências e configuração de ambiente:
make setup
```

### 2. Rodando as Migrações do Banco de Dados
Para criar as tabelas no PostgreSQL utilizando as migrações SQL puras na ordem numérica correta:

```bash
make migrate
```

### 3. Executando os Servidores de Desenvolvimento
Para iniciar simultaneamente o Backend (porta `3000`) e o Frontend React (porta `5173`):

```bash
make run
```

### 4. Executando os Testes Automatizados
O projeto conta com testes de suite unitários e end-to-end (E2E) robustos.

```bash
# Executa os testes unitários (Vitest):
npm test

# Executa especificamente os testes de integração e ponta a ponta:
npx vitest run tests/e2e
```

---

## 📄 Documentação e Anexos

* **ADRs (Architecture Decision Records):** Disponíveis na pasta `/adrs` (`ADR-001` a `ADR-006`).
* **Diagramas Mermaid:** Fontes dos diagramas arquiteturais em texto disponíveis na pasta `/diagrams` (C4 Container, Diagrama de Classes GoF e Diagrama de Sequência).

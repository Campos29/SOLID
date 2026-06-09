# SlotWise — atalhos de desenvolvimento
# Uso: `make <alvo>`. Rode `make help` para ver a lista completa.
# `make up` faz tudo: Colima + deps + .env + banco + migrations + backend e client.

# docker compose v2 não está disponível em todas as máquinas; usamos o binário v1.
COMPOSE      ?= docker-compose
DB_SERVICE   ?= database
DB_USER      ?= postgres
DB_NAME      ?= slotwise
MIGRATIONS   := $(sort $(wildcard migrations/*.sql))

# Runtime de containers no macOS. O daemon do Docker só responde com o Colima ativo.
COLIMA       ?= colima
COLIMA_CPU   ?= 2
COLIMA_MEM   ?= 4

.DEFAULT_GOAL := help
.PHONY: help up stop install env setup colima-up colima-down \
        db-up db-down db-logs db-wait migrate dev client run build start \
        test test-watch reset

help: ## Lista os alvos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: colima-up install env db-up migrate run ## TUDO: Colima + deps + env + banco + migrations + backend e client

stop: db-down colima-down ## Para o banco e o Colima

install: ## Instala as dependências do backend e do client
	npm install
	cd client && npm install

env: ## Cria os .env a partir dos exemplos (não sobrescreve)
	@test -f .env || cp .env.example .env
	@test -f client/.env || cp client/.env.example client/.env
	@echo "Arquivos .env prontos."

colima-up: ## Sobe o Colima se ainda não estiver rodando
	@if ! $(COLIMA) status >/dev/null 2>&1; then \
		echo "Iniciando o Colima..."; \
		$(COLIMA) start --cpu $(COLIMA_CPU) --memory $(COLIMA_MEM); \
	else \
		echo "Colima já está rodando."; \
	fi

colima-down: ## Para o Colima
	-$(COLIMA) stop

db-up: ## Sobe o PostgreSQL via Docker
	$(COMPOSE) up -d

db-down: ## Para e remove o container do PostgreSQL
	-$(COMPOSE) down

db-logs: ## Acompanha os logs do PostgreSQL
	$(COMPOSE) logs -f $(DB_SERVICE)

db-wait: ## Aguarda o PostgreSQL ficar pronto para conexões
	@echo "Aguardando o banco ficar disponível..."
	@until $(COMPOSE) exec -T $(DB_SERVICE) pg_isready -U $(DB_USER) -d $(DB_NAME) >/dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "Banco pronto."

migrate: db-wait ## Aplica todas as migrations SQL na ordem numérica
	@for f in $(MIGRATIONS); do \
		echo "Aplicando $$f..."; \
		$(COMPOSE) exec -T $(DB_SERVICE) psql -v ON_ERROR_STOP=1 -U $(DB_USER) -d $(DB_NAME) -f - < "$$f" || exit 1; \
	done
	@echo "Migrations aplicadas."

run: ## Roda backend (porta 3000) e client (porta 5173) juntos
	@echo "Subindo backend + client (Ctrl+C encerra ambos)..."
	@trap 'kill 0' INT TERM EXIT; \
	npm run dev & \
	(cd client && npm run dev) & \
	wait

dev: ## Roda apenas a API em modo desenvolvimento (tsx watch)
	npm run dev

client: ## Roda apenas o frontend (Vite)
	cd client && npm run dev

build: ## Compila o backend para dist/
	npm run build

start: ## Roda a versão compilada do backend
	npm start

test: ## Roda os testes (Vitest)
	npm test

test-watch: ## Roda os testes em watch mode
	npm run test:watch

setup: colima-up install env db-up migrate ## Prepara tudo, sem iniciar os servidores
	@echo "Setup concluído. Rode 'make run' para iniciar backend e client."

reset: ## Recria o banco do zero (apaga volume) e reaplica migrations
	$(COMPOSE) down -v
	$(COMPOSE) up -d
	@$(MAKE) migrate

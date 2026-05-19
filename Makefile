.PHONY: up down build dev logs clean reset help

# ─── COLORS ─────────────────────────────────────────────────────────────────
GREEN  := \033[0;32m
YELLOW := \033[0;33m
CYAN   := \033[0;36m
RESET  := \033[0m

help:
	@echo "$(CYAN)╔════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║         FitForge - Makefile Help        ║$(RESET)"
	@echo "$(CYAN)╚════════════════════════════════════════╝$(RESET)"
	@echo "$(GREEN)make up$(RESET)         - Start all services (production)"
	@echo "$(GREEN)make dev$(RESET)        - Start all services (development)"
	@echo "$(GREEN)make down$(RESET)       - Stop all services"
	@echo "$(GREEN)make build$(RESET)      - Build all Docker images"
	@echo "$(GREEN)make logs$(RESET)       - Follow logs from all services"
	@echo "$(GREEN)make logs s=api$(RESET) - Follow logs from a specific service"
	@echo "$(GREEN)make clean$(RESET)      - Remove containers and volumes"
	@echo "$(GREEN)make reset$(RESET)      - Full reset (clean + rebuild)"
	@echo "$(GREEN)make migrate$(RESET)    - Run database migrations"
	@echo "$(GREEN)make seed$(RESET)       - Seed the database"
	@echo "$(GREEN)make test$(RESET)       - Run all tests"
	@echo "$(GREEN)make lint$(RESET)       - Run linters on all services"

up:
	@echo "$(YELLOW)Starting FitForge services...$(RESET)"
	cp -n .env.example .env 2>/dev/null || true
	docker compose up -d
	@echo "$(GREEN)✓ FitForge is running at http://localhost$(RESET)"

dev:
	@echo "$(YELLOW)Starting FitForge in development mode...$(RESET)"
	cp -n .env.example .env 2>/dev/null || true
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

down:
	docker compose down

build:
	docker compose build --parallel

logs:
	@if [ -n "$(s)" ]; then \
		docker compose logs -f fitforge-$(s); \
	else \
		docker compose logs -f; \
	fi

clean:
	docker compose down -v --remove-orphans
	docker system prune -f

reset: clean build up

migrate:
	docker compose exec api-service npx prisma migrate deploy
	docker compose exec diet-service php artisan migrate

seed:
	docker compose exec api-service npx prisma db seed
	docker compose exec diet-service php artisan db:seed

test:
	@echo "$(YELLOW)Running frontend tests...$(RESET)"
	cd frontend && npm test -- --run
	@echo "$(YELLOW)Running API service tests...$(RESET)"
	cd services/api-service && npm test
	@echo "$(YELLOW)Running Auth service tests...$(RESET)"
	cd services/auth-service && ./mvnw test
	@echo "$(YELLOW)Running AI service tests...$(RESET)"
	cd services/ai-service && pytest

lint:
	cd frontend && npm run lint
	cd services/api-service && npm run lint
	cd services/ai-service && flake8 app/

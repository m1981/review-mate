# Colors for help system
BLUE := \033[36m
YELLOW := \033[33m
GREEN := \033[32m
RESET := \033[0m

.DEFAULT_GOAL := help

##@ General
.PHONY: help
help: ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\n$(BLUE)Usage:$(RESET)\n  make $(YELLOW)<target>$(RESET)\n"} \
		/^[a-zA-Z0-9_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 } \
		/^##@/ { printf "\n$(GREEN)%s$(RESET)\n", substr($$0, 5) }' $(MAKEFILE_LIST)

##@ Development
.PHONY: dev stop restart logs
dev: ## Start development server
	docker compose up web

stop: ## Stop all services
	docker compose down

restart: ## Restart development environment
	docker compose down && docker compose up web

logs: ## View development logs
	docker compose logs -f

##@ Testing
.PHONY: test test-watch coverage
test: ## Run tests once
	docker compose run --rm test npm run test

test-watch: ## Run tests in watch mode
	docker compose up test

coverage: ## Run tests with coverage
	docker compose run --rm test npm run test:coverage

##@ Dependencies
.PHONY: install update-lock check-updates audit audit-fix
install: ## Clean install of dependencies
	docker compose run --rm web sh -c 'rm -rf node_modules/* package-lock.json && npm install'

update-lock: ## Update package-lock.json
	docker compose run --rm web npm install --package-lock-only

check-updates: ## Check for outdated packages
	docker compose run --rm web npm outdated

audit: ## Run security audit
	docker compose run --rm web npm audit

audit-fix: ## Fix security issues
	docker compose run --rm web npm audit fix

##@ Security
.PHONY: decrypt-env rotate-keys
decrypt-env: ## Decrypt environment variables
	export SOPS_AGE_KEY_FILE=~/.sops/keys.txt && \
	sops -d secrets/development.yaml > secrets/development.local.yaml && \
	yq eval '.reviewmate.firebase | to_entries | .[] | "VITE_FIREBASE_" + (.key | upcase) + "=\"" + .value + "\""' \
		secrets/development.local.yaml > .env

rotate-keys: ## Rotate AGE keys
	sops updatekeys secrets/development.yaml

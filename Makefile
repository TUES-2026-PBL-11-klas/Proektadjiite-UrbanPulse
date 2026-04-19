# ──────────────────────────────────────────────────────────────
# UrbanPulse — local Kubernetes dev
# ──────────────────────────────────────────────────────────────
# Requirements: Docker (running), kind, kubectl
#   brew install kind kubectl
#
# Usage:
#   make up    — build images, spin up cluster, deploy everything
#   make down  — delete the cluster
#   make dev   — local docker compose (no Kubernetes)
#   make build — rebuild Docker images only
# ──────────────────────────────────────────────────────────────

-include .env
export

KIND    := $(shell command -v kind    2>/dev/null || echo /opt/homebrew/bin/kind)
KUBECTL := $(shell command -v kubectl 2>/dev/null || echo /usr/local/bin/kubectl)

CLUSTER  := urbanpulse
TAG      := local
BACKEND  := ghcr.io/tues-2026-pbl-11-klas/proektadjiite-urbanpulse/backend:$(TAG)
FRONTEND := ghcr.io/tues-2026-pbl-11-klas/proektadjiite-urbanpulse/frontend:$(TAG)

INGRESS_URL := https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/kind/deploy.yaml

.PHONY: up down dev build _cluster _ingress _load _apply

# ── Public targets ──────────────────────────────────────────────

## Build images + spin up kind cluster + deploy everything → http://localhost:8080
up:
	@docker info > /dev/null 2>&1 || (echo "ERROR: Docker is not running. Start Docker Desktop first." && exit 1)
	@$(MAKE) --no-print-directory _cluster
	@$(MAKE) --no-print-directory _ingress
	@$(MAKE) --no-print-directory build
	@$(MAKE) --no-print-directory _load
	@$(MAKE) --no-print-directory _apply
	@echo "Waiting for pods to be ready..."
	@$(KUBECTL) wait pod -l 'app.kubernetes.io/name in (backend,frontend)' \
		-n $(CLUSTER) --for=condition=Ready --timeout=180s --context kind-$(CLUSTER)
	@echo ""
	@echo "  App      →  http://localhost:8080"
	@echo "  API      →  http://localhost:8080/api/stats"
	@echo "  Run 'make down' to tear everything down."
	@echo ""

## Delete the kind cluster and all its data
down:
	$(KIND) delete cluster --name $(CLUSTER)

## Run locally with docker compose (no Kubernetes needed)
dev:
	docker compose up --build

## Build backend and frontend Docker images
build:
	docker build -t $(BACKEND) ./backend
	docker build --build-arg NEXT_PUBLIC_API_URL= -t $(FRONTEND) ./frontend

# ── Internal targets ────────────────────────────────────────────

_cluster:
	@if $(KIND) get clusters 2>/dev/null | grep -q "^$(CLUSTER)$$"; then \
		echo "kind cluster '$(CLUSTER)' already running — skipping create"; \
	else \
		echo "Creating kind cluster '$(CLUSTER)'..."; \
		$(KIND) create cluster --name $(CLUSTER) --config k8s/kind-config.yaml; \
		$(KUBECTL) label node $(CLUSTER)-control-plane ingress-ready=true \
			--context kind-$(CLUSTER); \
	fi

_ingress:
	@if $(KUBECTL) get deploy ingress-nginx-controller -n ingress-nginx \
			--context kind-$(CLUSTER) > /dev/null 2>&1; then \
		echo "NGINX ingress already installed — skipping"; \
	else \
		echo "Installing NGINX ingress controller..."; \
		$(KUBECTL) apply -f $(INGRESS_URL) --context kind-$(CLUSTER); \
		$(KUBECTL) rollout status deployment/ingress-nginx-controller \
			-n ingress-nginx --context kind-$(CLUSTER) --timeout=90s; \
	fi

_load:
	@echo "Loading images into kind cluster..."
	@$(KIND) load docker-image $(BACKEND) $(FRONTEND) --name $(CLUSTER)

_apply:
	@echo "Applying manifests..."
	@$(KUBECTL) apply -f k8s/namespace.yaml  --context kind-$(CLUSTER)
	@$(KUBECTL) apply -f k8s/configmap.yaml  --context kind-$(CLUSTER)
	@if $(KUBECTL) get secret urbanpulse-secrets -n $(CLUSTER) \
			--context kind-$(CLUSTER) > /dev/null 2>&1; then \
		echo "Secret already exists — skipping"; \
	else \
		$(KUBECTL) create secret generic urbanpulse-secrets \
			--namespace=$(CLUSTER) --context kind-$(CLUSTER) \
			--from-literal=DB_PASSWORD="" \
			--from-literal=DATABASE_URL="$(DATABASE_URL)" \
			--from-literal=JWT_SECRET="$(JWT_SECRET)" \
			--from-literal=SMTP_USER="$(SMTP_USER)" \
			--from-literal=SMTP_PASS="$(SMTP_PASS)"; \
	fi
	@for f in k8s/database.yaml k8s/backend.yaml k8s/frontend.yaml k8s/ingress.yaml; do \
		sed 's/IMAGE_TAG/$(TAG)/g' "$$f" | $(KUBECTL) apply -f - --context kind-$(CLUSTER); \
	done

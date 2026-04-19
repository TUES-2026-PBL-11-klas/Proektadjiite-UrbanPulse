terraform {
  required_version = ">= 1.6"
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.6"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.17"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.19"
    }
  }
}

# ─── Locals ───────────────────────────────────────────────────────────────────

locals {
  cluster_name    = "urbanpulse"
  kubeconfig_path = pathexpand("~/.kube/config")  # kind merges context into default kubeconfig
}

# ─── Providers ────────────────────────────────────────────────────────────────

provider "kind" {}

# kubernetes/helm/kubectl all read from the kubeconfig kind writes at apply time.
# They connect lazily — only when their first resource is being applied, by which
# point kind_cluster.urbanpulse has already written the file.

provider "kubernetes" {
  config_path    = local.kubeconfig_path
  config_context = "kind-${local.cluster_name}"
}

provider "helm" {
  kubernetes {
    config_path    = local.kubeconfig_path
    config_context = "kind-${local.cluster_name}"
  }
}

provider "kubectl" {
  config_path      = local.kubeconfig_path
  config_context   = "kind-${local.cluster_name}"
  load_config_file = true
}

# ─── 1. Kind cluster ──────────────────────────────────────────────────────────

resource "kind_cluster" "urbanpulse" {
  name            = local.cluster_name
  kubeconfig_path = local.kubeconfig_path
  wait_for_ready  = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      kubeadm_config_patches = [
        yamlencode({
          kind = "InitConfiguration"
          nodeRegistration = {
            kubeletExtraArgs = {
              "node-labels" = "ingress-ready=true"
            }
          }
        })
      ]

      extra_port_mappings {
        container_port = 80
        host_port      = 8080
        protocol       = "TCP"
      }

      extra_port_mappings {
        container_port = 443
        host_port      = 8443
        protocol       = "TCP"
      }
    }
  }
}

# ─── 2. NGINX Ingress Controller (Helm) ───────────────────────────────────────

resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true
  timeout          = 120
  wait             = true
  depends_on       = [kind_cluster.urbanpulse]

  values = [
    yamlencode({
      controller = {
        hostPort     = { enabled = true }
        service      = { type = "NodePort" }
        nodeSelector = { "ingress-ready" = "true" }
        tolerations = [
          {
            key      = "node-role.kubernetes.io/control-plane"
            operator = "Equal"
            effect   = "NoSchedule"
          }
        ]
      }
    })
  ]
}

# ─── 3. Namespace ─────────────────────────────────────────────────────────────

data "kubectl_file_documents" "namespace" {
  content = file("${path.module}/../k8s/namespace.yaml")
}

resource "kubectl_manifest" "namespace" {
  for_each   = data.kubectl_file_documents.namespace.manifests
  yaml_body  = each.value
  depends_on = [kind_cluster.urbanpulse]
}

# ─── 4. ConfigMap ─────────────────────────────────────────────────────────────

data "kubectl_file_documents" "configmap" {
  content = file("${path.module}/../k8s/configmap.yaml")
}

resource "kubectl_manifest" "configmap" {
  for_each   = data.kubectl_file_documents.configmap.manifests
  yaml_body  = each.value
  depends_on = [kubectl_manifest.namespace]
}

# ─── 5. Secret (Terraform-managed; real values from variables, never hardcoded) ─

resource "kubernetes_secret" "urbanpulse_secrets" {
  metadata {
    name      = "urbanpulse-secrets"
    namespace = "urbanpulse"
  }

  data = {
    DB_PASSWORD  = var.db_password
    DATABASE_URL = var.database_url
    JWT_SECRET   = var.jwt_secret
    SMTP_USER    = var.smtp_user
    SMTP_PASS    = var.smtp_pass
  }

  depends_on = [kubectl_manifest.namespace]
}

# ─── 6. kube-prometheus-stack (Helm) ──────────────────────────────────────────

resource "helm_release" "kube_prometheus_stack" {
  name             = "kube-prometheus-stack"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true
  timeout          = 300
  wait             = true
  depends_on       = [helm_release.ingress_nginx, kubectl_manifest.namespace]

  values = [
    yamlencode({
      grafana = {
        "grafana.ini" = {
          server = {
            root_url            = "http://localhost:8080/grafana"
            serve_from_sub_path = true
          }
        }
      }
      alertmanager = {
        config = {
          global = { resolve_timeout = "5m" }
          route = {
            receiver = "discord"
            routes = [
              { match = { alertname = "Watchdog" }, receiver = "null" }
            ]
          }
          receivers = [
            { name = "null" },
            {
              name = "discord"
              webhook_configs = [
                {
                  url           = var.discord_webhook_url
                  send_resolved = true
                }
              ]
            }
          ]
        }
      }
    })
  ]
}

# ─── 7. Database (StatefulSet + Headless Service) ─────────────────────────────

data "kubectl_file_documents" "database" {
  content = file("${path.module}/../k8s/database.yaml")
}

resource "kubectl_manifest" "database" {
  for_each   = data.kubectl_file_documents.database.manifests
  yaml_body  = each.value
  depends_on = [kubectl_manifest.configmap, kubernetes_secret.urbanpulse_secrets]
}

# ─── 8. Backend (PVC + Deployment + Service) ──────────────────────────────────

data "kubectl_file_documents" "backend" {
  content = replace(
    file("${path.module}/../k8s/backend.yaml"),
    "IMAGE_TAG",
    var.image_tag
  )
}

resource "kubectl_manifest" "backend" {
  for_each   = data.kubectl_file_documents.backend.manifests
  yaml_body  = each.value
  depends_on = [kubectl_manifest.database, kubernetes_secret.urbanpulse_secrets, kubectl_manifest.configmap]
}

# ─── 9. Frontend (Deployment + Service) ───────────────────────────────────────

data "kubectl_file_documents" "frontend" {
  content = replace(
    file("${path.module}/../k8s/frontend.yaml"),
    "IMAGE_TAG",
    var.image_tag
  )
}

resource "kubectl_manifest" "frontend" {
  for_each   = data.kubectl_file_documents.frontend.manifests
  yaml_body  = each.value
  depends_on = [kubectl_manifest.configmap]
}

# ─── 10. Ingress (ExternalName Service + NGINX Ingress) ───────────────────────

data "kubectl_file_documents" "ingress" {
  content = file("${path.module}/../k8s/ingress.yaml")
}

resource "kubectl_manifest" "ingress" {
  for_each   = data.kubectl_file_documents.ingress.manifests
  yaml_body  = each.value
  depends_on = [kubectl_manifest.backend, kubectl_manifest.frontend, helm_release.kube_prometheus_stack]
}

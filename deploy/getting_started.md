#Kubeos Setup MVP

## Setup Kubernetes cluster

### Create a Kind cluster.
- We will use config defined in the deploy/kind/kind-config.yaml to spin up the cluster

```bash
kind create cluster --config deploy/kind/kind-config.yaml
```

## Setup Hashicorp Vault

### Install Vault in the cluster
```bash
kubectl create ns vault-backend

helm repo add hashicorp https://helm.releases.hashicorp.com

helm repo update

helm install vault hashicorp/vault --namespace=vault-backend #--dry-run=client
 
helm install vault vault --repo https://helm.releases.hashicorp.com \
  --namespace=vault-backend \
  --set server.enabled=false \
  --set injector.enabled=true \

```

### Unseal Vault and Initialize

- unseal vault and setup root keys and copy to kubeos
```bash
kubectl exec vault-0 -n vault-backend -- vault operator init -key-shares=1 -key-threshold=1 -format=json > keys.json

VAULT_UNSEAL_KEY=$(cat keys.json | jq -r ".unseal_keys_b64[]")

VAULT_ROOT_KEY=$(cat keys.json | jq -r ".root_token")

kubectl exec vault-0 -n vault-backend -- vault operator unseal $VAULT_UNSEAL_KEY

echo $VAULT_ROOT_KEY

###################################
# Copy this key in kubeos config
###################################

```
- Initialize Vault and setup K8s Auth, secrets engines, policies and roles for 

```bash
kubectl exec vault-0 -it -n vault-backend -- sh 

$ vault login $VAULT_ROOT_KEY

# Setup Authentication 
vault auth enable kubernetes

vault write auth/kubernetes/config token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Secret Engine Setup
vault secrets enable -version=2 -path="kubeos" kv

vault kv put kubeos/dev/vault-test name=vault-test
vault kv get kubeos/dev/vault-test

vault policy write kubeos-policy - <<EOH
path "kubeos/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
EOH

vault policy list


# Create Service Account
vault write auth/kubernetes/role/kubeos \
        bound_service_account_names=kubeos \
        bound_service_account_namespaces=default \
        policies=kubeos-policy \
        ttl=72h


```

## Setup Kubeos related rbac to use Vault, Flux, Kubernetes
- Setup Service Account and rbac for Kubeos to access vault and kubernetes resources



```bash

kubectl apply -f deploy/kubernetes-auth-setup.yaml

kubectl apply -f deploy/flux-auth-setup.yaml

kubectl get secret kubeos -o go-template='{{.data.token | base64decode}}'

##########################################
# Copy this output secret in kubeos config
##########################################

```

### Sync your k8 cluster using kubeos-cluster repo

- Setup flux to sync flux repo with cluster
```bash
#linux
brew install fluxcd/tap/flux

export GITHUB_TOKEN=ghp
export GITHUB_USER=kubeosx

flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=kubeos-cluster \
  --branch=main \
  --path=./clusters/dev \
  --personal

#Windows

set GITHUB_TOKEN=ghp
set GITHUB_USER=kubeosx

flux check --pre

flux bootstrap github --owner=kubeosx --repository=kubeos-cluster --branch=main --path=./clusters/dev --personal

```       
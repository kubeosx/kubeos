```
brew install fluxcd/tap/flux

export GITHUB_TOKEN=ghp
export GITHUB_USER=kubeosx


flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=kubeos-cluster \
  --branch=main \
  --path=./clusters/dev \
  --personal

--- Windwos:

set GITHUB_TOKEN=ghp
set GITHUB_USER=kubeosx


flux check --pre

flux bootstrap github --owner=kubeosx --repository=kubeos-cluster --branch=main --path=./clusters/dev --personal

  kubectl apply -f kubernetes-auth-setup.yaml

  kubectl get secret kubeos -o go-template='{{.data.token | base64decode}}'

```       
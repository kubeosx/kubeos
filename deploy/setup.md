brew install fluxcd/tap/flux

export GITHUB_TOKEN=<your-token>
export GITHUB_USER=<your-username>

flux check --pre

flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=cloud-cluster \
  --branch=main \
  --path=./clusters/dev \
  --personal
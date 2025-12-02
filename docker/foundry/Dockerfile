FROM ghcr.io/foundry-rs/foundry:stable AS foundry
FROM node:20.17-slim AS runner
COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge
RUN apt-get update && apt-get install -y curl git openssh-client && rm -rf /var/lib/apt/lists/*
RUN curl -o solc-linux-amd64-v0.8.28+commit.7893614a -sL https://github.com/ethereum/solc-bin/raw/refs/heads/gh-pages/linux-amd64/solc-linux-amd64-v0.8.28+commit.7893614a
RUN mkdir -p ~/.svm/0.8.28
RUN cp solc-linux-amd64-v0.8.28+commit.7893614a ~/.svm/0.8.28/solc-0.8.28

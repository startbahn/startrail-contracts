FROM ghcr.io/foundry-rs/foundry:nightly-75fc63be4fc9241a1981a55c12b6e300fd82a51b AS foundry
FROM node:20.17-alpine AS runner
COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge
RUN apk add curl git openssh-client libc6-compat
RUN curl -o solc-linux-amd64-v0.8.28+commit.7893614a -sL https://github.com/ethereum/solc-bin/raw/refs/heads/gh-pages/linux-amd64/solc-linux-amd64-v0.8.28+commit.7893614a
RUN mkdir -p ~/.svm/0.8.28
RUN cp solc-linux-amd64-v0.8.28+commit.7893614a ~/.svm/0.8.28/solc-0.8.28
RUN chmod +x ~/.svm/0.8.28/solc-0.8.28
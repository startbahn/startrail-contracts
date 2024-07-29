# foundry doesn't have a stable tag so lock at a specific commit here.
FROM ghcr.io/foundry-rs/foundry:nightly-03aa926203e6dabdcf9b7e59219271294717c2eb as foundry
RUN apk add --update bash curl git openssh-client sudo yarn libstdc++
RUN wget  https://nodejs.org/download/release/v18.15.0/node-v18.15.0-linux-x64.tar.gz
RUN mkdir -p /opt/nodejs && tar -zxvf *.tar.gz --directory /opt/nodejs --strip-components=1 && rm *.tar.gz
RUN ln -s /opt/nodejs/bin/node /usr/local/bin/node && ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
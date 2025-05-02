FROM node:23-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable &&\
    yarn install && yarn build &&\
    yarn workspaces focus --production

FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app/dist dist
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml .
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/.yarn /app/.yarn
RUN corepack enable && corepack install
ENTRYPOINT ["yarn", "node", "dist/src/main.js"]

FROM node:23-alpine AS builder
WORKDIR /app
COPY . /app
RUN corepack enable &&\
    yarn install && yarn build &&\
    yarn workspaces focus --production

FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app/dist dist
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml .
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/static static
COPY --from=builder /app/.yarn .yarn
RUN corepack enable && corepack install

ENTRYPOINT ["yarn", "node", "dist/src/main.js"]
ENV APP_PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

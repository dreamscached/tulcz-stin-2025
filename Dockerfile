FROM node:23-alpine AS builder
WORKDIR /app/backend
COPY backend .
COPY frontend static
RUN corepack enable &&\
    yarn install && yarn build &&\
    yarn workspaces focus --production

FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist dist
COPY --from=builder /app/backend/package.json /app/backend/yarn.lock /app/backend/.yarnrc.yml .
COPY --from=builder /app/backend/node_modules node_modules
COPY --from=builder /app/backend/static static
COPY --from=builder /app/backend/.yarn .yarn
RUN corepack enable && corepack install
ENTRYPOINT ["yarn", "node", "dist/src/main.js"]

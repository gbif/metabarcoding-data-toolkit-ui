FROM node:24.19.0-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY public ./public
COPY src ./src

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

FROM node:24.19.0-bookworm-slim AS runtime

WORKDIR /app

RUN npm install --global --omit=dev --no-audit --no-fund serve@14.2.4

COPY --from=build /app/build ./build

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/', response => process.exit(response.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["serve", "-s", "build", "-l", "8080"]

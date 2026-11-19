FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
RUN mkdir -p .data/workspaces
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
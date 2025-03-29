# ---- BUILD STAGE ----

FROM node:22.12.0-alpine AS build

RUN npm install -g pnpm@9.15.1

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install

COPY . .

RUN apk add --no-cache openssl

RUN npx prisma generate

RUN pnpm build

# ---- PRODUCTION STAGE ----

FROM node:22.12.0-alpine

ENV NODE_ENV production

RUN apk add --no-cache openssl

RUN npm install -g pnpm@9.15.1

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

# Copy compiled build
COPY --from=build /usr/src/app/dist ./dist

USER node

EXPOSE 3000

# Run the application
CMD ["node", "dist/main"]

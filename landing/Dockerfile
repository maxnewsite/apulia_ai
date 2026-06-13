FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# npm install (not ci) tolerates the rare lockfile drift that creeps in
# when developers use different npm minor versions. We still get a clean,
# reproducible install because the Dockerfile starts from a fixed base.
RUN npm install --no-audit --no-fund --prefer-offline

FROM node:20-alpine AS builder
WORKDIR /app
# Build-time env vars so generateStaticParams() can prerender editions
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 8080
CMD ["node", "server.js"]

# Production image for the OnCoopera Mobile Expo web application.
# Dockerfile.dev remains the local-development image (Expo dev server).

FROM node:24-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# EXPO_PUBLIC_* variables are embedded into the web bundle at build time.
ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npx expo export --platform web


FROM nginx:1.27-alpine AS runtime

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

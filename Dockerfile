FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_APP_VERSION=dev
ARG VITE_OMDB_API_KEY=
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_OMDB_API_KEY=$VITE_OMDB_API_KEY
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/movie-search-app
EXPOSE 80

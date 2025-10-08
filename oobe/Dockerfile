FROM node:24.8.0 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM nginx:1
COPY --from=builder /app/dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/conf.d/default.conf

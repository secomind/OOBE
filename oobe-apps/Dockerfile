FROM node:24.8.0 AS builder

WORKDIR /app
ADD . .

RUN cd industrial-app && \
    npm ci && \
    npm run build

RUN cd medical-app && \
    npm ci && \
    npm run build

RUN cd smart-building-app && \
    npm ci && \
    npm run build


FROM nginx:1
COPY --from=builder /app/industrial-app/dist/app.js /usr/share/nginx/html/industrial-app/main.js
COPY --from=builder /app/medical-app/dist/app.js /usr/share/nginx/html/medical-app/main.js
COPY --from=builder /app/smart-building-app/dist/app.js /usr/share/nginx/html/smart-building-app/main.js
ADD nginx.conf /etc/nginx/conf.d/default.conf

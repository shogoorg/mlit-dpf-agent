FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Explicit build environment variables
ENV VITE_A2A_SERVER_URL="https://mlit-dpf-agent-h3ix2jg73a-uw.a.run.app/a2a/app"
ENV VITE_GOOGLE_MAPS_API_KEY="AIzaSyCekxwAgPzkLzio8EHDyg4tFORWBmI9XSg"
ENV NODE_ENV="production"

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

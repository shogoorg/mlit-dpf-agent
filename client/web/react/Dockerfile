FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Explicit build environment variables
ENV VITE_A2A_SERVER_URL="https://mlit-dpf-agent-607705566012.us-west1.run.app/a2a/app"
ENV NODE_ENV="production"

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

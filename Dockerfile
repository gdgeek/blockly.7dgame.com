FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install pnpm -g
RUN pnpm install --frozen-lockfile
COPY . .    
RUN pnpm run build

FROM nginx:1.19.0-alpine AS prod-stage
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

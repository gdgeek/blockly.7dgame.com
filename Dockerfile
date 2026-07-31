FROM node:24.18.1-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install pnpm@11.18.0 -g
RUN pnpm install --frozen-lockfile
COPY . .    
RUN pnpm run build

FROM nginx:alpine AS prod-stage
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

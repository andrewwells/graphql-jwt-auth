FROM node:12-alpine AS build

WORKDIR /app

COPY ./web/package.json .

# Note that we're installing all dependencies, unlike the buildpack
RUN npm install

# Copy the rest of the application
COPY ./web .

RUN npm run build

# ---------------

# production stage
FROM nginx:1.17.6-alpine as production-stage
COPY --from=build /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
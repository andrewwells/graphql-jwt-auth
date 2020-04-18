FROM node:12-alpine AS build

# Set up the working directory
WORKDIR /app

# Copy our package.json file first, then run `npm install`.
# This is an optimization we can make, as this layer will be
# cached, meaning that if we don't change the package.json file,
# this step doesn't need to be performed again
COPY ./server/package.json .

# Note that we're installing all dependencies, unlike the buildpack
RUN npm install

# Copy the rest of the application
COPY ./server .

# Build the typescript files
# Into the /dist folder
RUN npm run build

# ---------------

FROM node:12-alpine

WORKDIR /app

COPY ./server/package.json .

# Only install non-devDependencies
RUN npm install --production

# Copy the built artifacts from the build stage
COPY --from=build /app/dist /app

# Set the startup command
CMD ["npm", "run", "start"]
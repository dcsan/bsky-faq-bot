FROM node:18-alpine as build-image
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
#   COPY [".env"] ./
COPY .env ./

COPY ./src ./src

RUN npm ci
RUN npx tsc
EXPOSE 8080
CMD [ "node", "./build/index.js" ]

# FROM node:18-alpine
# WORKDIR /usr/src/app
# COPY package*.json ./
# COPY --from=build-image ./usr/src/app/dist ./dist
# RUN npm ci --production
# COPY . .
# EXPOSE 8080
# CMD [ "node", "./build/index.js" ]

# EXPOSE 7001

FROM node:14-alpine
WORKDIR /app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install
ENV NODE_ENV production
COPY ./ ./
RUN yarn build
EXPOSE 3000
CMD yarn start

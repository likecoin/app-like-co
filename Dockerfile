FROM node:14
# for crawler chrome 
RUN apt-get update && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 libgbm-dev lsb-release xdg-utils wget
WORKDIR /app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install
ARG IS_TESTNET
ENV IS_TESTNET ${IS_TESTNET}
ARG GA_TRACKING_ID
ENV GA_TRACKING_ID ${GA_TRACKING_ID}
ARG SENTRY_DSN
ENV SENTRY_DSN ${SENTRY_DSN}
ENV NODE_ENV production
COPY ./ ./
RUN yarn build
EXPOSE 3000
CMD yarn start

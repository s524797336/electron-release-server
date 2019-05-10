FROM node:alpine
ARG NPM_REGISTRY=http://127.0.0.1:5399
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python python-dev py-pip make

# Create app directory
RUN mkdir -p /usr/src/electron-release-server
WORKDIR /usr/src/electron-release-server

# Install app dependencies
COPY package.json .bowerrc bower.json package-lock.json checkDeps.js /usr/src/electron-release-server/
RUN NPM_PROXY_HOST=${NPM_REGISTRY} node /usr/src/electron-release-server/checkDeps.js
RUN npm install --registry=${NPM_REGISTRY} --proxy=${NPM_REGISTRY} --https-proxy=${NPM_REGISTRY} --strict-ssl=false --ignore-scripts --no-audit
RUN npm rebuild \
  && ./node_modules/.bin/bower install --allow-root \
  && npm cache clean -f
RUN rm -rf /usr/src/electron-release-server/checkDeps.js

EXPOSE 80

CMD [ "./scripts/wait.sh", "db:5432", "--", "npm", "start" ]

# Bundle app source
COPY . /usr/src/electron-release-server

COPY config/docker.js config/local.js

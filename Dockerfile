FROM node
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN NPM clean cache
RUN npm install -g grunt
RUN npm install -g grunt-cli
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
EXPOSE 5000
CMD [ "grunt" ]

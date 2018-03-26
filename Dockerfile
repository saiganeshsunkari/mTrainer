FROM node
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm cache clean --force
RUN npm install -g grunt
RUN npm install -g grunt-cli
RUN npm install -g bower
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
EXPOSE 5000
CMD [ "grunt" ]

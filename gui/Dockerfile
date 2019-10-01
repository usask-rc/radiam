FROM node:8.15

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Add version file to container filesystem
COPY VERSION /etc/version

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Set node.js upper memory limits (in GB)
ENV NODE_OPTIONS=--max_old_space_size=4096

# install and cache app dependencies
COPY package.json /usr/src/app/package.json

RUN npm install
RUN npm install react-scripts@1.1.1 -g

COPY ./ /usr/src/app
 
RUN npm run build

# start app
CMD ["npm", "start"]
EXPOSE 3000

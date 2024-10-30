FROM node:22
WORKDIR /usr/src/collaboration-service
COPY package.json /usr/src/collaboration-service/package.json
COPY package-lock.json /usr/src/collaboration-service/package-lock.json
RUN npm install
COPY . /usr/src/collaboration-service
EXPOSE 3001
CMD ["npm", "run", "dev"]

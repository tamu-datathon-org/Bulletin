# Build
# docker build -t td-bulletin .

# Spin Up Image
# docker run -it -p 9000:3000 td-bulletin

FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "npm", "start" ]
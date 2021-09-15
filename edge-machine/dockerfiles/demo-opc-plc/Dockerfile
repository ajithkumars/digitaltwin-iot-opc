#Dockerfile to create opc ua server using :
#https://github.com/node-opcua/node-opcua
FROM node:16-alpine3.12

CMD mkdir -p /demo-opc-plc
WORKDIR /demo-opc-plc

RUN apk --no-cache add git
RUN npm install -g npm@7.20.0

RUN export NODE_OPTIONS=--max_old_space_size=4096

RUN git clone https://github.com/node-opcua/node-opcua.git

WORKDIR /demo-opc-plc/node-opcua

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm recursive install
RUN pnpm build

#A custom demo-opc-plc example is in the custom folder
#It is run to form a OPC UA Server with simulated plc values
#Help: https://github.com/node-opcua/node-opcua/blob/master/documentation/creating_a_server.md

#The folder where different opc server java script files will be put in and run from via docker-compose.yml
RUN mkdir -p /demo-opc-plc/node-opcua/packages/node-opcua-samples/bin/custom

#Uncomment to have a default demo opc plc created out of choco_server.js
#COPY ./custom/choco_server.js /demo-opc-plc/node-opcua/packages/node-opcua-samples/bin/custom

EXPOSE 12000

RUN apk add openssl

#Uncomment to have a default demo opc plc created out of choco_server.js
#CMD ["node","/demo-opc-plc/node-opcua/packages/node-opcua-samples/bin/custom/choco_server"]
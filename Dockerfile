FROM node:slim

COPY . .

LABEL "com.github.actions.icon"="cloud"
LABEL "com.github.actions.color"="orange"

RUN npm install --production

ENTRYPOINT ["node", "/lib/main.js"]
FROM node:slim

COPY . .

LABEL "com.github.actions.icon"="cloud"
LABEL "com.github.actions.color"="orange"

RUN yarn
RUN yarn run build

ENTRYPOINT ["node", "/lib/main.js"]
#!/bin/bash

az group create --name dockerbot --location "westus"

az appservice plan create --name dockerbot \
--resource-group dockerbot --sku S1 --is-linux

az webapp create --resource-group dockerbot \
--plan dockerbot --name dockerbot --deployment-container-image-name user1m/dockerbot

### https://docs.microsoft.com/en-us/cli/azure/webapp/config/appsettings?view=azure-cli-latest#az_webapp_config_appsettings_set
az webapp config appsettings set --resource-group dockerbot \
--name dockerbot \
--settings WEBSITES_PORT=80 \
PORT=80 \
WEBSITE_NODE_DEFAULT_VERSION=9.4 \
MICROSOFT_APP_ID=$DOCKERBOT_ID \
MICROSOFT_APP_PASSWORD=$DOCKERBOT_PW

### Add extenstion if not already installed
# az extension add -n botservice

az bot create --kind registration -n dockerbot -g dockerbot \
--appid $DOCKERBOT_ID --password $DOCKERBOT_PW \
--display-name  DockerBot \
--description "Demo bot running on docker" \
-e https://dockerbot.azurewebsites.net/api/messages \
--msbot true

## CI/CD
### https://docs.microsoft.com/en-us/azure/app-service/containers/app-service-linux-ci-cd
echo "Take this URL and create a Docker Hub WebHook..."
az webapp deployment container config --name dockerbot --resource-group dockerbot --enable-cd true
# az webapp deployment container show-cd-url --name dockerbot --resource-group dockerbot

az webapp restart --resource-group dockerbot  --name dockerbot

### SSH LOCALLY
# https://docs.microsoft.com/en-us/azure/app-service/containers/app-service-linux-ssh-support
# az webapp remote-connection create --resource-group dockerbot -n dockerbot -p 21382 &
# ssh root@127.0.0.1 -p 21382

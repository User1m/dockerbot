#!/bin/bash

UUID=$(echo $RANDOM | tr '[0-9]' '[a-zA-Z]')
DOCKER_IMAGE=user1m/dockerbot

echo "Your bot endpoint is: $(dockerbot-$UUID)..."

az group create --name dockerbot-$UUID --location "westus"

az appservice plan create --name dockerbot-$UUID \
--resource-group dockerbot-$UUID --sku S1 --is-linux

az webapp create --resource-group dockerbot-$UUID \
--plan dockerbot-$UUID --name dockerbot-$UUID --deployment-container-image-name $DOCKER_IMAGE

### https://docs.microsoft.com/en-us/cli/azure/webapp/config/appsettings?view=azure-cli-latest#az_webapp_config_appsettings_set
az webapp config appsettings set --resource-group dockerbot-$UUID \
--name dockerbot-$UUID \
--settings WEBSITES_PORT=80 \
PORT=80 \
WEBSITE_NODE_DEFAULT_VERSION=9.4 \
MICROSOFT_APP_ID=$DOCKERBOT_ID \
MICROSOFT_APP_PASSWORD=$DOCKERBOT_PW

### Add extenstion if not already installed
# az extension add -n botservice

az bot create --kind registration -n dockerbot-$UUID -g dockerbot-$UUID \
--appid $DOCKERBOT_ID --password $DOCKERBOT_PW \
--display-name 'DockerBot' \
--description "Demo bot running on docker" \
-e https://dockerbot-$UUID.azurewebsites.net/api/messages \
--msbot true

## CI/CD
### https://docs.microsoft.com/en-us/azure/app-service/containers/app-service-linux-ci-cd
echo "Take this URL and create a Docker Hub WebHook..."
az webapp deployment container config --name dockerbot-$UUID --resource-group dockerbot-$UUID --enable-cd true
# az webapp deployment container show-cd-url --name dockerbot-$UUID --resource-group dockerbot-$UUID

az webapp restart --resource-group dockerbot-$UUID  --name dockerbot-$UUID

### SSH LOCALLY
# https://docs.microsoft.com/en-us/azure/app-service/containers/app-service-linux-ssh-support
# az webapp remote-connection create --resource-group dockerbot-$UUID -n dockerbot-$UUID -p 21382 &
# ssh root@127.0.0.1 -p 21382

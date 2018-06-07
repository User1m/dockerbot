# DockerBot


## Learning outcomes

In this repo you'll learn the following:

1. Dockerizing a Microsoft Bot Framework v4 Bot
*  Deploying DockerBot to Azure App Service (Web Apps for Containers)
*  Connecting to deployed Bot


## Build

Run the following commands:

```
> export DOCKERBOT_ID=					# Required: Bot's MICROSOFT_APP_ID
> export DOCKERBOT_PW=  				# Required: Bot's MICROSOFT_APP_PASSWORD
```

```
> ./docker/scripts/build.sh
```

## Running

```
> ./docker/scripts/run.dev.sh
```


## Deploying

```
> ./docker/scripts/deploy.sh
```

### _Script explained_

```
# Create azure resource group
az group create --name dockerbot --location "westus"
```
```
# Create azure app service
az appservice plan create --name dockerbot \
--resource-group dockerbot --sku S1 --is-linux
```
```
# Create azure webapp
az webapp create --resource-group dockerbot \
--plan dockerbot --name dockerbot \
--deployment-container-image-name user1m/dockerbot
```
```
# Config azure webapp
az webapp config appsettings set --resource-group dockerbot \
--name dockerbot \
--settings WEBSITES_PORT=80 \
PORT=80 \
WEBSITE_NODE_DEFAULT_VERSION=9.4 \
MICROSOFT_APP_ID=$DOCKERBOT_ID \
MICROSOFT_APP_PASSWORD=$DOCKERBOT_PW
```
```
# Create azure bot service registration
az bot create --kind registration -n dockerbot -g dockerbot \
--appid $DOCKERBOT_ID --password $DOCKERBOT_PW \
--display-name DockerBot \
--description "Demo bot running on docker" \
-e https://dockerbot.azurewebsites.net/api/messages \
--msbot true
```
```
# Create CD endpoint for Docker
echo "Take this URL and create a Docker Hub WebHook..."
az webapp deployment container config --name dockerbot \
--resource-group dockerbot --enable-cd true
```
```
# Restart Website
az webapp restart --resource-group dockerbot  --name dockerbot
```


## Conclusion

Your bot messaging endpoint will be avilable at: `https://dockerbot.azurewebsites.net/api/messages`

Open your [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases) and connect to that endpoint with the bot's `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD`
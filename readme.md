# DockerBot


## Learning outcomes

In this repo you'll learn the following:

1. Dockerizing a Microsoft Bot Framework v4 Bot
2. Deploying DockerBot to Azure App Service (Web Apps for Containers)
3. Connecting to deployed Bot


## Build

Run the following commands:

**NOTE:** You can generate an APP ID and PASSWORD [here](http://apps.dev.microsoft.com/)


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
# Sudo unique ID to make your app service name unqiue
UUID=$(echo $RANDOM | tr '[0-9]' '[a-zA-Z]')
```
```
# Your docker image - UPDATE TO POINT TO YOUR OWN IMAGE
DOCKER_IMAGE=user1m/dockerbot
```

```
# Create azure resource group
az group create --name dockerbot-$UUID --location "westus"
```
```
# Create azure app service
az appservice plan create --name dockerbot-$UUID \
--resource-group dockerbot-$UUID --sku S1 --is-linux
```
```
# Create azure webapp
az webapp create --resource-group dockerbot-$UUID \
--plan dockerbot-$UUID --name dockerbot-$UUID \
--deployment-container-image-name $DOCKER_IMAGE
```
```
# Config azure webapp
az webapp config appsettings set --resource-group dockerbot-$UUID \
--name dockerbot-$UUID \
--settings WEBSITES_PORT=80 \
PORT=80 \
WEBSITE_NODE_DEFAULT_VERSION=9.4 \
MICROSOFT_APP_ID=$DOCKERBOT_ID \
MICROSOFT_APP_PASSWORD=$DOCKERBOT_PW
```
```
# Create azure bot service registration
az bot create --kind registration -n dockerbot-$UUID -g dockerbot-$UUID \
--appid $DOCKERBOT_ID --password $DOCKERBOT_PW \
--display-name DockerBot \
--description "Demo bot running on docker" \
-e https://dockerbot.azurewebsites.net/api/messages \
--msbot true
```
```
# Create CD endpoint for Docker
echo "Take this URL and create a Docker Hub WebHook..."
az webapp deployment container config --name dockerbot-$UUID \
--resource-group dockerbot-$UUID --enable-cd true
```
```
# Restart Website
az webapp restart --resource-group dockerbot-$UUID  --name dockerbot-$UUID
```


## Conclusion

Your bot messaging endpoint will be available at: `https://dockerbot-$UUID.azurewebsites.net/api/messages`

Open your [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases) and connect to that endpoint with the bot's `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD`
#!/bin/bash

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
PROJECT_DIR=$PWD/$SCRIPT_DIR/../../

docker run --rm -itd \
-e PORT=80 \
-e MICROSOFT_APP_ID=$DOCKERBOT_ID \
-e MICROSOFT_APP_PASSWORD=$DOCKERBOT_PW \
-p 3978:80 \
--name dockerbot \
dockerbot



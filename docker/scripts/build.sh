#!/bin/bash

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
PROJECT_DIR=$SCRIPT_DIR/../../

# --no-cache \

docker build -t dockerbot \
-f $PROJECT_DIR/docker/Dockerfile \
$PROJECT_DIR/.
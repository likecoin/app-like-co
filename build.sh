#!/usr/bin/env bash

PWD=`pwd`
WD=`cd $(dirname "$0") && pwd -P`

cd "${WD}"

docker build . -t app-like-co
docker tag app-like-co:latest us.gcr.io/likecoin-foundation/app-like-co:latest
docker -- push us.gcr.io/likecoin-foundation/app-like-co:latest

cd "${PWD}"

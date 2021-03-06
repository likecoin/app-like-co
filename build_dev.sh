#!/usr/bin/env bash

PWD=`pwd`
WD=`cd $(dirname "$0") && pwd -P`

cd "${WD}"

docker build . -t app-like-co --build-arg IS_TESTNET='TRUE'
docker tag app-like-co:latest us.gcr.io/likecoin-develop/app-like-co:latest
docker -- push us.gcr.io/likecoin-develop/app-like-co:latest

cd "${PWD}"

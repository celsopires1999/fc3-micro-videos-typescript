#!/bin/bash

if [ ! -f "./envs/.env" ]; then
    cp ./envs/.env.example ./envs/.env
fi


if [ ! -f "./envs/.env.test" ]; then
    cp ./envs/.env.test.example ./envs/.env.test
fi

if [ ! -f "./envs/.env.e2e" ]; then
    cp ./envs/.env.e2e.example ./envs/.env.e2e
fi

npm install

tail -f /dev/null

# npm run start:dev

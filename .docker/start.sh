#!/bin/bash

if [ ! -f "./envs/.env.test" ]; then
    cp ./envs/.env.test.example ./envs/.env.test
fi

npm install

tail -f /dev/null

# npm run start:dev

#!/usr/bin/env bash

while true; do
  # npx artillery run misc/benchmark/artillery-local-extreme.yml &
  npx artillery run misc/benchmark/artillery-droplet.yml &
  npx artillery run misc/benchmark/artillery-azure.yml &
  npx artillery run misc/benchmark/artillery-gooi.yml &
  npx artillery run misc/benchmark/artillery-droplet-4010.yml &

  killall -9 node

  sleep 400
done

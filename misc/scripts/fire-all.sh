#!/usr/bin/env bash

while true; do
  # npx artillery run misc/benchmark/artillery-local-extreme.yml &
  npx artillery run misc/benchmark/artillery-droplet.yml &
  npx artillery run misc/benchmark/artillery-azure.yml &
  npx artillery run misc/benchmark/artillery-gooi.yml &

  killall -9 artillery

  sleep 350
done

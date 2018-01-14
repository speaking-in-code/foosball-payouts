#!/bin/bash

set -e
ng build \
  --prod \
  --base-href=/ \
  --aot \
  --build-optimizer \
  --environment=prod

firebase deploy --only hosting

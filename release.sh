#!/bin/bash

set -e
VERSION=${1}
PROJECT=
if [[ "${VERSION}" = "prod" ]]; then
  PROJECT=foosball-payouts
else
  PROJECT=payouts-beta
fi

ng build \
  --base-href=/

firebase deploy \
  --only hosting \
  --project ${PROJECT}

#!/bin/bash

set -e
VERSION=${1}
PROJECT=
if [[ "${VERSION}" = "prod" ]]; then
  BASE=/payouts/
else
  BASE=/payouts-beta/
fi

ng build \
  --base-href="${BASE}"

rsync -avz \
    dist/browser/ \
    "dh_nptkcr@pdx1-shared-a1-11.dreamhost.com:/home/dh_nptkcr/bayfoos.com/${BASE}"

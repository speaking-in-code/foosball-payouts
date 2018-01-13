#!/bin/bash

ng build \
  --prod \
  --base-href=/payouts \
  --aot \
  --build-optimizer \
  --environment=prod

WORK=$(mktemp -d)
function finish {
  rm -rf ${WORK}
}
trap finish EXIT
mv dist ${WORK}/payouts
tar -C ${WORK} -v -c -z -f payouts.tgz payouts
echo "Output in payouts.tgz"

#!/bin/bash
#
# Sets up permanent redirect from original app url to new prod url.

set -e

firebase deploy \
  --only hosting \
  --project payouts

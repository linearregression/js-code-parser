#!/bin/bash

run_all=true

if [ "$1" != "" ]; then
  run_all=$1
fi

# itsi
[[ $run_all = true || $run_all = itsi ]] && run.sh ~/workspace/app-itsi/apps/itsi/appserver/static/js "*.js" ~/workspace/app-itsi/apps/itsi/appserver/static/js/pages/built

#dbx
[[ $run_all = true || $run_all = dbx ]] && run.sh ~/workspace/app-dbx/package/appserver/static/js "*.js" 


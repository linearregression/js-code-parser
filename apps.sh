#!/bin/bash

run_all=true

if [ "$1" != "" ]; then
  run_all=$1
fi

run_x_js() {
  if [[ $# -eq 3 ]]; then
    find "$1" -path "$3" -prune -o -name "$2" | xargs node x.js
  else
    find "$1" -name "$2" | xargs node x.js
  fi
}

# remove all out files
rm db.sqlite

# itsi
[[ ${run_all} = true || ${run_all} = itsi ]] && run_x_js ~/workspace/app-itsi/apps/itsi/appserver/static/js "*.js" ~/workspace/app-itsi/apps/itsi/appserver/static/js/pages/built

#dbx
[[ ${run_all} = true || ${run_all} = dbx ]] && run_x_js ~/workspace/app-dbx/package/appserver/static/js "*.js"

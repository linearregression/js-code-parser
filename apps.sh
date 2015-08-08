#!/bin/bash

run_all=true

if [ "$1" != "" ]; then
  run_all=$1
fi

run_x_js() {
  if [[ $# -eq 3 ]]; then
    find "$2" -path "$4" -prune -o -name "$3" | xargs node x.js -a $1 -s /Users/sumeet/workspace
  else
    find "$2" -name "$3" | xargs node x.js -a $1 -s /Users/sumeet/workspace
  fi
}

# remove all out files
rm db.sqlite

# itsi
[[ ${run_all} = true || ${run_all} = itsi ]] && run_x_js itsi ~/workspace/app-itsi/apps/itsi/appserver/static/js "*.js" ~/workspace/app-itsi/apps/itsi/appserver/static/js/pages/built

#dbx
[[ ${run_all} = true || ${run_all} = dbx ]] && run_x_js dbx ~/workspace/app-dbx/package/appserver/static/js "*.js"

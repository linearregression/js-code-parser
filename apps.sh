#!/bin/bash

run_all=true

if [ "$1" != "" ]; then
  run_all=$1
fi

run_x_js() {
  local mode=$1
  local app=$2
  local path=$3
  local pattern=$4
  local exclude=${5:-notset}

  if [ "$exclude" = "notset" ]; then
    find "$path" -name "$pattern" | xargs node x.js -a "$app" -s /Users/sumeet/workspace -m "$mode"
  else
    find "$path" -path "$exclude" -prune -o -name "$pattern" | xargs node x.js -a "$app" -s /Users/sumeet/workspace -m "$mode"
  fi
}

# remove all out files
rm db.sqlite

# itsi
if [[ ${run_all} = true || ${run_all} = itsi ]]; then
  run_x_js define itsi ~/workspace/app-itsi/apps/itsi/appserver/static/js "*.js" ~/workspace/app-itsi/apps/itsi/appserver/static/js/pages/built
  #run_x_js html itsi ~/workspace/app-itsi/apps/itsi/appserver/templates "*.html"
fi

#dbx
if [[ ${run_all} = true || ${run_all} = dbx ]]; then
  run_x_js define dbx ~/workspace/app-dbx/package/appserver/static/js "*.js"
fi

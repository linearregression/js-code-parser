#!/bin/bash

if [[ $# -lt 2 ]]; then
  echo "usage: $(basename $0) <search-path> <file-pattern> [<exclude-path>]"
  exit 1
fi

if [[ $# -eq 3 ]]; then
  find "$1" -path "$3" -prune -o -name "$2" | xargs node x.js 
else
  find "$1" -name "$2" | xargs node x.js 
fi

# js-code-parser #

A program to statistically calculate dependencies among amd js applications.

## sample usage ##

    $ find <js-file-path> -path <ignore-directory> -prune -o -name '*.js' | xargs node x.js | sort | uniq

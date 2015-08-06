# js-code-parser #
use it for finding define dependencies.

## sample usage ##

    $ find <js-file-path> -path <ignore-directory> -prune -o -name '*.js' | xargs node x.js | sort | uniq

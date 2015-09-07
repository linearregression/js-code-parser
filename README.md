# js-code-parser #

A program to calculate & visualize dependencies among amd js applications.

## configure ##

in `src/python/analyzer/app-conf.json`:

```json
    {
      "program": "code visualizer",
      "applications": [
        {
          "name": "itsi",
          "js": "js",
          "html": "templates",
          "shared": "shared",
          "stem": "machine specific path prefix"
        } 
      ]
    }
```

## build ##

checkout various applications

    $ grunt clean analyzer
    
## visualize ##

    $ cd build/website; node server.js
    $ open http://localhost:3000


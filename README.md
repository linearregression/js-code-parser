# js-code-parser #

A program to calculate & visualize dependencies among amd js applications.

## generate data ##

checkout various applications

    $ node x.js -c app-conf.json
    
## visualize ##

    $ node d.js

## config file format ##

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

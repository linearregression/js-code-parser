__author__ = 'sumeet'

import os
import fnmatch

def find(pattern, path, skip_dirs):
    result = []
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if root + '/' + d not in skip_dirs]
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))

    return result

if __name__ == '__main__':
    print len(find("*.js", "/Users/sumeet/workspace/app-dbx", ['/Users/sumeet/workspace/app-dbx/build',
                                                           '/Users/sumeet/workspace/app-dbx/node_modules',
                                                           '/Users/sumeet/workspace/app-dbx/test']))

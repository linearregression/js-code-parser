import fnmatch
import os

def find(pattern, path, skip_dirs):
    # logging.debug("pattern: {pattern} path: {path} skip_dirs: {skip_dirs}"
    #              .format(pattern=pattern, path=path, skip_dirs=skip_dirs))

    result = []
    for root, dirs, files in os.walk(path):
        # prune directories that need to be skipped
        dirs[:] = [d for d in dirs if os.path.join(root, d) not in skip_dirs]

        for name in files:
            full_path = os.path.join(root, name)
            if fnmatch.fnmatch(name, pattern):
                result.append(full_path)
            elif full_path.endswith(pattern):
                result.append(full_path)

    return result

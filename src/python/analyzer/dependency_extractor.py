
import logging
import subprocess
from find import find
import json

class DependencyExtractor:
    def __init__(self, app_name, js_loc, ignored_locs, parser):
        self.ignored_locs = ignored_locs
        self.js_loc = js_loc
        self.app_name = app_name
        self.parser = parser

    def extract(self):
        js_files = find("*.js", self.js_loc, self.ignored_locs)
        file_info = {}
        for js_file in js_files:
            info = self._parse_file_using_node(js_file)
            file_info[js_file] = info
            msg = "parsed file: {file} includes: {num}".format(file=js_file, num=len(info))
            if len(info) == 0:
                logging.warn(msg)
            else:
                pass
                # logging.debug(msg)

        # logging.debug("info: {file_info}".format(file_info=file_info))

        return file_info

    def _parse_file_using_node(self, filename):
        jsp = subprocess.Popen(["node", self.parser, filename], stdout=subprocess.PIPE)
        return_code = jsp.wait()
        if return_code != 0:
            logging.error("UNABLE to parse {filename}".format(filename=filename))
            return dict()

        p = ''.join([line.rstrip() for line in jsp.stdout.readlines()])

        # logging.debug("filename: {filename} parsed json: {p}".format(filename=filename, p=p))

        return json.loads(p)

    def conf_entries(self, app_modules, shared_loc):
        shared_files = []
        for module in app_modules:
            files = find("{module}.js".format(module=module), shared_loc, self.ignored_locs)
            if len(files) == 1:
                shared_files.append({
                    'app': self.app_name,
                    'conffile': 'null',
                    'shortcut': module,
                    'filename': files[0]
                })

        return shared_files


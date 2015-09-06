__author__ = 'sumeet'

import logging
import json
import os
import fnmatch
import subprocess
import db_saver
import sys


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


class UsingHeuristic:
    graph = {}

    def __init__(self, apps, db_handle):
        self.apps = apps

        self.graph['core'] = set()

        for app in apps:
            self.graph[app['name']] = set(db_handle.fetch_shortcuts(app['name']))
            self.graph['core'] |= self.graph[app['name']]

        self.graph['common'] = set(self.graph['core'])

        for app in apps:
            self.graph['common'] &= self.graph[app['name']]

    @staticmethod
    def list_by_position(edge_list, graph):
        # logging.debug("edge_list: {edge_list}".format(edge_list=edge_list))
        return [(graph[edge.keys()[0]]['position'], edge.values()[0]) for edge in edge_list]

    @staticmethod
    def group(remaining):
        return remaining

    def create_viz(self, viz_file, code_file):

        groups = {'common': [],
                  'core': [{'common': len(self.graph['common'])}]}

        for group in self.graph.keys():
            if group != 'core' and group != 'common':
                edges = [{'common': len(self.graph['common'])},
                         {'remaining_{name}'.format(name=group): len(self.graph[group] - self.graph['common'])}]

                groups[group] = edges

                groups['remaining_{name}'.format(name=group)] = []

                groups['core'].append(edges[1])

        groups['core'] = list(groups['core'])

        # logging.debug("auto coded groups: {groups}".format(groups=groups))

        # pin the nodes in an array
        nodes = groups.keys()

        sankey = {'nodes': [{'name': node} for node in nodes],
                  'links': []}

        # logging.debug("nodes = {nodes}".format(nodes=nodes))

        # add a position attribute for each node
        for i in range(0, len(nodes)):
            i_node = nodes[i]
            # logging.debug("yes {i} {i_node}".format(i=i, i_node=i_node))
            groups[i_node] = {'edges': groups[i_node], 'position': i}

        # start creating edges by position
        for i in range(0, len(nodes)):
            i_node = nodes[i]
            for (j, value) in self.list_by_position(groups[i_node]['edges'], groups):
                # logging.debug("j = {j}, value={value}".format(j=j, value=value))
                sankey['links'].append({'source': i, 'target': j, 'value': value})

        with open(viz_file, 'w') as outfile:
            json.dump(sankey, outfile)

        graph_json = {}
        for node in self.graph.keys():
            graph_json[node] = list(self.graph[node])
            graph_json[node].sort()

        with open(code_file, 'w') as outfile:
            json.dump(graph_json, outfile)


def usage(message=None):
    code = 0
    if message:
        print message
        code = 1
    print "usage: build_graph.py [-h] -c|--config <app-conf.json> -l|--log <debug|info|warn|error> -p <parser> -o <dir>"
    sys.exit(code)


def main():
    import getopt

    opts = None
    try:
        opts, args = getopt.getopt(sys.argv[1:],
                                   "hc:l:p:o:",
                                   ["help", "config=", "log=", "parser=", "output="])
    except getopt.GetoptError as err:
        usage(err)

    config_file = 'app-conf.json'
    loglevel = 'INFO'
    parser = 'parser.js'
    output_dir = 'resources'

    for option, argument in opts:
        if option in ('-c', '--config'):
            config_file = argument
        elif option in ('-o', '--output'):
            output_dir = argument
        elif option in ('-l', '--log'):
            loglevel = argument
        elif option in ('-p', '--parser'):
            parser = argument
        elif option in ('-h', '--help'):
            usage()
        else:
            assert False, "unhandled option"

    numeric_level = getattr(logging, loglevel.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError('Invalid log level: %s' % loglevel)

    logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        # filename='run.log',
                        # filemode='a',
                        level=numeric_level)

    logging.debug("config: {config}, parser: {parser}".format(config=config_file, parser=parser))

    app_config = {}

    with open(config_file) as data_file:
        app_config = json.load(data_file)

    db = db_saver.DbSaver(app_config['db-name'])

    # apps = [app for app in app_config['applications'] if app['name'] == 'stream']
    apps = [app for app in app_config['applications']]

    for app in apps:
        # extract defines and configs from js files
        extractor = DependencyExtractor(app['name'], app['js'], app['skip'], parser)
        info = extractor.extract()
        db.save_dependencies(app['name'], info)

        # find module coverage from shared
        modules = db.fetch_modules(app['name'])
        conf_entries = extractor.conf_entries(modules, app['shared'])
        db.save_conf(conf_entries)

    # build visualization
    code_file = os.path.join(output_dir, app_config['code-json'])
    viz_file = os.path.join(output_dir, app_config['sankey-json'])

    UsingHeuristic(apps, db).create_viz(viz_file=viz_file, code_file=code_file)


if __name__ == '__main__':
    main()

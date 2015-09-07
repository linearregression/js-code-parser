__author__ = 'sumeet'

import logging
import json
import os
import db_saver
import sys
import dependency_extractor
from using_hueristic import UsingHeuristic

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
        extractor = dependency_extractor.DependencyExtractor(app['name'], app['js'], app['skip'], parser)
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

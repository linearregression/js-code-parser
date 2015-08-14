__author__ = 'sumeet'

import sqlite3 as lite
import logging
import json
import os
from sets import Set

def version(name):
    con = lite.connect(name)

    with con:

        cur = con.cursor()
        cur.execute('SELECT SQLITE_VERSION()')

        data = cur.fetchone()

        print "SQLite version: %s" % data


def app_config(config):

    with open(config) as data_file:
        return json.load(data_file)


def my_walker(root_dir, suffix, skip_dirs, callback):

    for dirName, subdirList, fileList in os.walk(root_dir):

        print('Found directory: %s' % dirName)
        for fname in fileList:
            print('\t%s' % fname)


def read_data(db, app, graph):
    """
    reading data from db
    :type db: name of db
    """
    con = lite.connect(db)

    with con:

        cur = con.cursor()
        cur.execute("SELECT DISTINCT shortcut FROM conf f WHERE f.app = '{app_name}' AND conffile = 'null'"
                    .format(app_name=app['name']))

        rows = cur.fetchall()

        #for row in rows:
        #    print row

        logging.debug(rows[0]);

        a = [node[0] for node in rows]

        graph[app['name']] = a

        if 'core' in graph:
            s = set(graph['core']) | set(a)
            graph['core'] = [node for node in s]
        else:
            graph['core'] = a

        for node in rows:
            graph[node[0]] = []

        return graph


def list_by_position(node_list, graph):
    return [graph[node]['position'] for node in node_list]


def write_graph(name, graph):

    json_dict = {}

    nodes = graph.keys()

    json_dict = {'nodes': [{'name': node} for node in nodes],
                 'links': []}

    for i in range(0, len(nodes)):
        graph[nodes[i]] = {'list': graph[nodes[i]], 'position': i}

    for i in range(0, len(nodes)):
        for j in list_by_position(graph[nodes[i]]['list'], graph):
            json_dict['links'].append({'source': i, 'target': j, 'value': 1})

    with open(name, 'w') as outfile:
        json.dump(json_dict, outfile)


if __name__ == '__main__':
    from pprint import pprint

    logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        filename='run.log',
                        filemode='a',
                        level=logging.DEBUG)

    db = 'db.sqlite'

    version(db)

    appConfig = app_config('app-conf.json')

    #pprint(appConfig)

    graph = {}

    for app in appConfig['applications']:
        #pprint(app)
        read_data(db, app, graph)

    logging.debug("graph: {}".format(graph))

    write_graph('viz.json', graph)

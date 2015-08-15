__author__ = 'sumeet'

import sqlite3 as lite
import logging
import json
import os

def version(name):
    con = lite.connect(name)

    with con:

        cur = con.cursor()
        cur.execute('SELECT SQLITE_VERSION()')

        data = cur.fetchone()

        print "SQLite version: %s" % data


def my_walker(root_dir, suffix, skip_dirs, callback):

    for dirName, subdirList, fileList in os.walk(root_dir):

        print('Found directory: %s' % dirName)
        for fname in fileList:
            print('\t%s' % fname)


class UsingHeuristic:

    graph = {}

    def __init__(self, apps, db_name):
        self.apps = apps
        self.db_name = db_name

        con = lite.connect(self.db_name)

        with con:
            for app in self.apps:
                self.populate(con, app)

    def populate(self, con, app):
        """
        reading data from db
        """

        cur = con.cursor()
        cur.execute("SELECT DISTINCT shortcut FROM conf f WHERE f.app = '{app_name}' AND conffile = 'null'"
                    .format(app_name=app['name']))

        rows = cur.fetchall()

            #for row in rows:
            #    print row

            # logging.debug(rows[0])

        # get all shortcuts
        a = [node[0] for node in rows]

        self.graph[app['name']] = a

        if 'core' in self.graph:
            s = set(self.graph['core']) | set(a)
            self.graph['core'] = [node for node in s]
        else:
            self.graph['core'] = a

        for node in rows:
            self.graph[node[0]] = []

    @staticmethod
    def list_by_position(node_list, graph):
        return [graph[node]['position'] for node in node_list]

    def create_sankey(self, filename):
        json_dict = {}

        # pin the nodes in an array
        nodes = self.graph.keys()

        json_dict = {'nodes': [{'name': node} for node in nodes],
                     'links': []}

        # mark position for each node
        for i in range(0, len(nodes)):
            self.graph[nodes[i]] = {'list': self.graph[nodes[i]], 'position': i}

        # start creating edges by position
        for i in range(0, len(nodes)):
            for j in self.list_by_position(self.graph[nodes[i]]['list'], self.graph):
                json_dict['links'].append({'source': i, 'target': j, 'value': 1})

        with open(filename, 'w') as outfile:
            json.dump(json_dict, outfile)


if __name__ == '__main__':

    logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        filename='run.log',
                        filemode='a',
                        level=logging.DEBUG)

    appConfig = {}

    with open('app-conf.json') as data_file:
        appConfig = json.load(data_file)

    version(appConfig['db-name'])

    heuristic = UsingHeuristic(appConfig['applications'], appConfig['db-name'])

    heuristic.create_sankey(appConfig['sankey-json'])

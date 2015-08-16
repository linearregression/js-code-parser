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

        logging.info("SQLite version: {version}".format(version=data))


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

        self.graph['core'] = set()
        with con:
            for app in apps:
                self.populate(con, app)
                self.graph['core'] = self.graph[app['name']] | self.graph['core']

    def populate(self, con, app):
        """
        reading data from db
        """

        cur = con.cursor()
        cur.execute("SELECT DISTINCT shortcut FROM conf f "
                    "WHERE conffile = 'null' "
                    "AND app = '{app_name}'"
                    "ORDER BY shortcut "
                    .format(app_name=app['name']))

        rows = cur.fetchall()

        l = [row[0] for row in rows]

        self.graph[app['name']] = set(l)

    @staticmethod
    def list_by_position(edge_list, graph):
        logging.debug("edge_list: {edge_list}".format(edge_list=edge_list))
        return [(graph[edge.keys()[0]]['position'], edge.values()[0]) for edge in edge_list]

    @staticmethod
    def group(remaining):
        return remaining

    def create_viz(self, filename):

        core = self.graph['core']

        # lets start by top folder name
        common = self.graph['itsi'] & self.graph['dbx']

        itsi = self.graph['itsi'] - common
        dbx = self.graph['dbx'] - common

        remaining = itsi | dbx

        remaining = self.group(remaining)

        # lets build the graph
        groups = {
            'core': [{'common': len(common)}, {'remaining_itsi': len(itsi)}, {'remaining_dbx': len(dbx)}],
            'itsi': [{'common': len(common)}, {'remaining_itsi': len(itsi)}],
            'dbx': [{'common': len(common)}, {'remaining_dbx': len(dbx)}],
            'common': [],
            'remaining_itsi': [],
            'remaining_dbx': []
        }

        # pin the nodes in an array
        nodes = groups.keys()

        sankey = {'nodes': [{'name': node} for node in nodes],
                  'links': []}

        logging.debug("nodes = {nodes}".format(nodes=nodes))

        # add a position attribute for each node
        for i in range(0, len(nodes)):
            i_node = nodes[i]
            logging.debug("yes {i} {i_node}".format(i=i, i_node=i_node))
            groups[i_node] = {'edges': groups[i_node], 'position': i}

        # start creating edges by position
        for i in range(0, len(nodes)):
            i_node = nodes[i]
            for (j, value) in self.list_by_position(groups[i_node]['edges'], groups):
                logging.debug("j = {j}, value={value}"
                              .format(j=j, value=value))
                sankey['links'].append({'source': i, 'target': j, 'value': value})

        with open(filename, 'w') as outfile:
            json.dump(sankey, outfile)


if __name__ == '__main__':

    logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        #filename='run.log',
                        #filemode='a',
                        level=logging.DEBUG)

    appConfig = {}

    with open('app-conf.json') as data_file:
        appConfig = json.load(data_file)

    version(appConfig['db-name'])

    heuristic = UsingHeuristic(appConfig['applications'], appConfig['db-name'])

    heuristic.create_viz(appConfig['sankey-json'])

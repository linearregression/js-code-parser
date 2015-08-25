__author__ = 'sumeet'

import sqlite3 as lite
import logging
import json
import os
import fnmatch

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
                self.graph['core'] |= self.graph[app['name']]

        self.graph['common'] = set(self.graph['core'])
        for app in apps:
            self.graph['common'] &= self.graph[app['name']]

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

        logging.debug("auto coded groups: {groups}".format(groups=groups))

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

        graph_json = {}
        for node in self.graph.keys():
            graph_json[node] = list(self.graph[node])
            graph_json[node].sort()

        with open('resources/public/code-list.json', 'w') as outfile:
            json.dump(graph_json, outfile)

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

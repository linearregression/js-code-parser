
import json
import logging

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


#!/usr/bin/env python

import argparse
from cncocr import graph, parser
from cncocr.events.eventgraph import EventGraph
from cncocr.inverse import find_step_inverses, filter_blame_candidates, find_blame_candidates
from pprint import pprint

def pprint_inverses(graphData):
    for (step, func) in graphData.stepFunctions.iteritems():
        print "Step {}:".format(step)
        pprint(find_step_inverses(func))

def blame(arg_blame, graph_data, event_graph = None):
    candidates = find_blame_candidates(arg_blame, graph_data)
    # we have our candidates, now we can filter them if log is provided
    if event_graph:
        candidates = filter_blame_candidates(candidates,
                                             graph_data.stepFunctions,
                                             event_graph)
    return candidates

def main():
    argParser = argparse.ArgumentParser(prog="cncocr_inv",
            description="Compute inverse output functions from CnC-OCR graph spec.")
    argParser.add_argument('specfile', help="CnC-OCR graph spec file")
    argParser.add_argument('--log', nargs='?', default=None, help="CnC-OCR debug log file")
    argParser.add_argument('--blame', nargs='?', default=None, help="collection@tag or step@tag to blame")
    args = argParser.parse_args()

    # Parse graph spec
    graphAst = parser.cncGraphSpec.parseFile(args.specfile, parseAll=True)
    graphData = graph.CnCGraph("_", graphAst)

    # Construct the event graph if they give us a log file.
    event_graph = None
    if args.log:
        with open(args.log, 'r') as log:
            event_graph = EventGraph(log.readlines(), False, False)

    if not args.blame and not args.log:
        # nothing to blame and no log given, just print out the inverse functions
        return pprint_inverses(graphData)
    if args.blame:
        print "Steps that could be blamed for {}:".format(args.blame)
        pprint(blame(args.blame, graphData, event_graph))
    else:
        # user gives us log without blame, do an "auto-blame"
        # i.e. we perform a blame on the set of all items with a get without a put
        to_blame = event_graph.gotten_without_put()
        # write a item@tag string for each item
        blame_strings = ["{}@{}".format(event_graph.property(i, "name"),
                                       event_graph.property(i, "tag")) for i in to_blame]
        print "Performing blame on these nodes: {}".format(blame_strings)
        for blame_str in blame_strings:
            print "Blaming {}:".format(blame_str)
            pprint(blame(blame_str, graphData))

if __name__ == '__main__':
    main()

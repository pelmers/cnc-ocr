#!/usr/bin/env python

import argparse
from cncocr import graph, parser
from cncocr.events.eventgraph import EventGraph
from cncocr.inverse import find_step_inverses, filter_blame_candidates
from pprint import pprint
from sympy.core import sympify
from sympy import Symbol, solve

def pprint_inverses(graphData):
    for (step, func) in graphData.stepFunctions.iteritems():
        print "step:", step
        pprint(find_step_inverses(func))

def main():
    argParser = argparse.ArgumentParser(prog="cncocr_inv",
            description="Compute inverse output functions from CnC-OCR graph spec.")
    argParser.add_argument('specfile', nargs='?', default="", help="CnC-OCR graph spec file")
    argParser.add_argument('--log', nargs='?', default=None, help="CnC-OCR debug log file")
    argParser.add_argument('--blame', nargs='?', default=None, help="collection@tag or step@tag to blame")
    args = argParser.parse_args()

    # Parse graph spec
    graphAst = parser.cncGraphSpec.parseFile(args.specfile, parseAll=True)
    graphData = graph.CnCGraph("_", graphAst)

    if not args.blame:
        # nothing to blame, just print out the inverse functions
        return pprint_inverses(graphData)
    coll_name, coll_tag = args.blame.split("@")
    # turn coll_tag into a tuple representing a point in tagspace
    coll_tag = tuple(coll_tag.split(","))
    # turn coll_tag into dict of substitutions tk: coll_tag[k]
    coll_tag_system = {Symbol("t{}".format(i+1)): v for i,v in enumerate(coll_tag)}
    # {s: {in_tag: value for each input tag of s} for each step s}
    candidates = {}
    for (step, func) in graphData.stepFunctions.iteritems():
        func_inverses = find_step_inverses(func)
        if coll_name in func_inverses:
            candidates[step] = {}
            for out_tag in func_inverses[coll_name]:
                for (in_tag, expr) in out_tag.iteritems():
                    # evaluate inv_p(t)
                    candidates[step][str(in_tag)] = expr.subs(coll_tag_system)
    # we have our candidates, now we can filter them if log is provided
    if args.log:
        with open(args.log, 'r') as log:
            event_graph = EventGraph(log.readlines(), False, False)
            candidates = filter_blame_candidates(candidates,
                                                 graphData.stepFunctions,
                                                 event_graph)
    pprint(candidates)

if __name__ == '__main__':
    main()

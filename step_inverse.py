#!/usr/bin/env python

import argparse
from cncocr import graph, parser
from cncocr.inverse import find_step_inverses
from pprint import pprint

argParser = argparse.ArgumentParser(prog="cncocr_inv",
        description="Compute inverse output functions from CnC-OCR graph spec.")
argParser.add_argument('specfile', nargs='?', default="", help="CnC-OCR graph spec file")
args = argParser.parse_args()

# Parse graph spec
graphAst = parser.cncGraphSpec.parseFile(args.specfile, parseAll=True)
graphData = graph.CnCGraph("_", graphAst)

if __name__ == '__main__':
    for (step, func) in graphData.stepFunctions.iteritems():
        print "step:", step
        pprint(find_step_inverses(func))

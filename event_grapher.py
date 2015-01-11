#!/usr/bin/env python2
# -*- coding: utf-8 -*-

import argparse
from cncocr.events.eventgraph import EventGraph

def main():
    arg_parser = argparse.ArgumentParser(prog="cncocr_eg", description="Turn CnC-OCR event logs into graphs.")
    arg_parser.add_argument('logfile', help="CnC-OCR log file to process")
    args = arg_parser.parse_args()

    with open(args.logfile, 'r') as log:
        graph = EventGraph(log.readlines())
        print graph.dump_graph_dot()

if __name__ == '__main__':
    main()

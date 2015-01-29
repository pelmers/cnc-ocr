#!/usr/bin/env python2
# -*- coding: utf-8 -*-

import argparse, subprocess
from cncocr.events.eventgraph import EventGraph
from jinja2 import Environment, PackageLoader

templateEnv = Environment(loader=PackageLoader('cncocr.events.eventgraph'))

def main():
    arg_parser = argparse.ArgumentParser(prog="cncocr_eg",
            description="Turn CnC-OCR event logs into graphs.")
    arg_parser.add_argument('logfile', help="CnC-OCR log file to process")
    arg_parser.add_argument('--html', action="store_true",
            help="Save as an html file with javascript animations. Requires dot to be installed.")
    args = arg_parser.parse_args()

    with open(args.logfile, 'r') as log:
        graph = EventGraph(log.readlines())
        if args.html:
            template = templateEnv.get_template("index.html")
            gv = subprocess.Popen(['dot', '-Tsvg'], stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE)
            gv.stdin.write(graph.dump_graph_dot())
            data = gv.communicate()[0]
            print template.render({
                    'image_data' : data
                }).encode('utf-8')
        else:
            print graph.dump_graph_dot()

if __name__ == '__main__':
    main()

#!/usr/bin/env python2
# -*- coding: utf-8 -*-

import subprocess
from argparse import ArgumentParser
from base64 import b64encode
from os.path import join, dirname
from jinja2 import Environment, PackageLoader, Markup
from cncocr.events.eventgraph import EventGraph
from inspect import getfile

loader = PackageLoader('cncocr.events.eventgraph')
templateEnv = Environment(loader = loader)

# Add a base64-encoding filter to Jinja (for embedding icons)
def embed_b64(name):
    basepath = join(dirname(getfile(EventGraph)), 'templates')
    with open(join(basepath, name), "rb") as f:
        return b64encode(f.read())
templateEnv.globals['embed_b64'] = embed_b64

def main():
    arg_parser = ArgumentParser(prog="cncocr_eg",
            description="Turn CnC-OCR event logs into graphs.")
    arg_parser.add_argument('logfile', help="CnC-OCR log file to process")
    arg_parser.add_argument('--html', action="store_true",
            help="Write to stdout as HTML. Requires dot to be installed.")
    arg_parser.add_argument('--no-prescribe', action="store_true",
            help="Do not add prescribe edges to the graph produced.")
    args = arg_parser.parse_args()

    with open(args.logfile, 'r') as log:
        graph = EventGraph(log.readlines(), not args.no_prescribe)
        if args.html:
            template = templateEnv.get_template("index.html")
            gv = subprocess.Popen(['dot', '-Tsvg'], stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE)
            gv.stdin.write(graph.dump_graph_dot())
            data = gv.communicate()[0]
            print template.render({
                    'graph_title': args.logfile,
                    'image_data' : data,
                }).encode('utf-8')
        else:
            print graph.dump_graph_dot()

if __name__ == '__main__':
    main()

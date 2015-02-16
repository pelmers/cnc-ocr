function DAG(graph) {
    "use strict";
    if (graph === undefined) {
        graph = {};
    }
    var g = graph,
        nprops = {}, // map node id -> {properties}
        eprops = {}; // map edge id -> {properties}

    function _graph() {
        return g;
    }

    function transpose() {
        // Return the transpose (reverse edges) of the graph
        var p = {};
        for (var n in g) {
            if (!g.hasOwnProperty(n)) continue;
            p[n] = [];
        }
        for (var n in g) {
            if (!g.hasOwnProperty(n)) continue;
            for (var c = 0; c < g[n].length; c++) {
                p[g[n][c]].push(n);
            }
        }
        return DAG(p);
    }

    function numNodes() {
        // Return the number of nodes in the graph.
        var total = 0;
        for (var n in g) {
            if (!g.hasOwnProperty(n)) continue;
            total++;
        }
        return total;
    }

    function children(node) {
        // Return an array of the children of the given node
        return g[node];
    }

    function addNode(id, children) {
        // Add node with given id and optional children to the graph
        if (children === undefined) {
            children = [];
        }
        g[id] = children;
    }

    function hasNode(id) {
        // Return whether id is defined.
        return g[id] !== undefined;
    }

    function addEdge(from, to) {
        // Add an edge from one node to another
        g[from].push(to);
    }

    function setProperty(node, prop, val) {
        // Set property prop of node to val
        if (nprops[node] === undefined) {
            nprops[node] = {};
        }
        nprops[node][prop] = val;
    }

    function property(node, prop) {
        // Return the value of prop for given node
        return nprops[node][prop];
    }

    function setEdgeProperty(fr, to, prop, val) {
        // Set given property of edge fr->to to val
        if (eprops[[fr,to]] === undefined) {
            eprops[[fr,to]] = {};
        }
        eprops[[fr,to]][prop] = val;
    }

    function edgeProperty(fr, to, prop) {
        // Return given property of the edge fr->to
        return eprops[[fr,to]][prop];
    }

    function dfs(start_node, visitor, visit_all) {
        // Perform dfs starting at start_node, applying visitor at each node visited
        // If visit_all is truthy, all nodes will be visited even if they can't be reached
        // from the start node.
        var history = {};
        var to_visit = (visit_all)?numNodes():0;
        if (typeof visitor !== "function") {
            visitor = function(n) {};
        }
        function visit(n) {
            if (history[n] === undefined) {
                history[n] = true;
                to_visit--;
                for (var i = 0; i < g[n].length; i++) {
                    visit(g[n][i]);
                }
                visitor(n);
            }
        }
        visit(start_node);
        // return here if we don't need to visit all the nodes
        if (!visit_all)
            return;
        // gotta catch em all
        while (to_visit > 0) {
            for (var n in g) {
                if (!g.hasOwnProperty(n)) continue;
                if (history[n] === undefined) {
                    start_node = n;
                    break;
                }
            }
            visit(start_node);
        }
    }

    function topsort() {
        // Return a topological ordering of all the nodes in the graph
        var start_node = null;
        var o = [];
        for (var n in g) {
            if (!g.hasOwnProperty(n)) continue;
            start_node = n;
            break;
        }
        dfs(start_node, function(n) { o.push(n); }, true);
        o.reverse();
        return o;
    }

    function bfs(start_node, visitor) {
        // Perform breadth-first search starting at start_node and
        // apply visitor function at each node.
        // Return a mapping of {node: distance} for each node visited
        // Unreachable nodes are not included
        var d = {};
        var que = [];
        var cur = null;
        if (typeof visitor !== "function") {
            visitor = function(n) {};
        }
        d[start_node] = 0;
        que.push(start_node);
        while (que.length > 0) {
            cur = que.shift();
            for (var c = 0; c < g[cur].length; c++) {
                if (d[g[cur][c]] === undefined) {
                    que.push(g[cur][c]);
                    d[g[cur][c]] = d[cur] + 1;
                    visitor(g[cur][c]);
                }
            }
        }
        return d;
    }

    function layers(start) {
        // Return the mapping {distance: [array of nodes this distance from start]}
        // Unreachable nodes are not included
        var d = bfs(start);
        var layers = {};
        for (var i in d) {
            if (!d.hasOwnProperty(i)) continue;
            if (layers[d[i]] === undefined) {
                layers[d[i]] = [];
            }
            layers[d[i]].push(i);
        }
        return layers;
    }

    function constrained_maximum(mapping, nodes, value) {
        // mapping: {node ids -> ℤ}
        // if value: Return the maximum value of the mapping across the domain of nodes
        // else: Return the maximums of the mapping across the domain of nodes
        var val = 0;
        var key = [];
        for (var i = 0; i < nodes.length; i++) {
            if (mapping[nodes[i]] > val) {
                val = mapping[nodes[i]];
                key = [nodes[i]];
            } else if (mapping[nodes[i]] === val) {
                key.push(nodes[i]);
            }
        }
        return (value)?val:key;
    }

    function cpl(prop) {
        // Calculate the critical path length to each node based on prop.
        // Return a mapping {node: CPL}
        var ts = topsort(),
            pl = {},
            tpose = transpose();
        for (var i = 0; i < ts.length; i++) {
            var weight = property(ts[i], prop);
            var incoming = constrained_maximum(pl, tpose.children(ts[i]), true);
            pl[ts[i]] = ((weight === undefined)?0:weight) + ((incoming === undefined)?0:incoming);
        }
        return pl;
    }

    function crit_paths(prop, backtrack_criterion) {
        // Calculate the critical paths using given property on the graph
        // by backtracking on the leaf nodes in the graph that make optional
        // backtrack_criterion evaluate to true.
        // Return {length: CPL, paths: [[node id's] for each critical path]}
        var ts = topsort(),
            pl = cpl(prop),
            tpose = transpose(),
            paths = [];
        function backtrack(current_path) {
            // Backtrack up the graph and build critical paths
            // Append each completed path to paths
            var phead = current_path[current_path.length - 1];
            if (tpose.children(phead).length > 0) {
                var heads = constrained_maximum(pl, tpose.children(phead));
                // if heads is undefined or length 0, then all parents have critlength = 0
                heads = heads?heads:tpose.children(phead);
                for (var h = 0; h < heads.length; h++)
                    // continue backtracking with the new head at the end of the path
                    backtrack(current_path.concat(heads[h]));
            } else {
                // no more parents to go up, so we're done with the path
                current_path.reverse();
                paths.push(current_path);
            }
        }
        // backtrack up the DAG to get the path
        var heads = [];
        backtrack_criterion = (backtrack_criterion !== undefined)?backtrack_criterion:function(id) {return true};
        // find the leaf nodes
        for (var i = 0; i < ts.length; i++)
            if (children(ts[i]).length === 0 && backtrack_criterion(ts[i]))
                heads.push(ts[i]);
        // start backtracking to get paths
        for (var h = 0; h < heads.length; h++)
            backtrack([heads[h]]);
        // reverse the path to switch from bottom-up to top-down
        return {
            'length': pl[heads[heads.length-1]],
            'paths': paths,
        };
    }

    function sum(prop) {
        // Return the sum of the value of given property for each node.
        var r = 0;
        for (var n in g) {
            if (!g.hasOwnProperty(n)) continue;
            var v = property(n, prop);
            r += (v)?v:0;
        }
        return r;
    }

    // module exports
    return {
        // edge creation and retrieval
        graph: _graph,
        addNode: addNode,
        addEdge: addEdge,
        hasNode: hasNode,
        children: children,

        // properties
        property: property,
        setProperty: setProperty,
        edgeProperty: edgeProperty,
        setEdgeProperty: setEdgeProperty,

        // graph tools
        dfs: dfs,
        topsort: topsort,
        transpose: transpose,
        bfs: bfs,
        layers: layers,
        cpl: cpl,
        crit_paths: crit_paths,
        sum: sum,
        numNodes: numNodes,
    };
}


/**
 * Return an object with methods to provide animations for the dag.
 * Assumes that the node id's are distinct nonnegative numbers.
 */
function Animate(dag) {
    "use strict";
    var start_id = 0, end_id = 0;
    while (dag.graph()[end_id] !== undefined) {
        end_id++;
    }
    // we overcounted by 1.
    end_id -= 1;
    // set a property _weight of each node to 1, so we can get crit paths
    onAll(function(n) { dag.setProperty(n, '_weight', 1); });

    function nodeDom(node_id) {
        // Return the DOM node for the given graph node.
        return dag.property(node_id, '_dom');
    }
    function edgeDom(from, to) {
        // Return the DOM node for the given graph node.
        return dag.edgeProperty(from, to, '_dom');
    }

    function hide(node1, node2) {
        // Set node or edge style to display:none
        // If one arg given, hide node. If two, hide edge.
        if (node2 === undefined)
            nodeDom(node1).style.display = 'none';
        else
            edgeDom(node1, node2).style.display = 'none'
    }

    function show(node1, node2) {
        // Set node or edge style to display:block
        // If one arg given, show node. If two, show edge.
        if (node2 === undefined)
            nodeDom(node1).style.display = 'block';
        else
            edgeDom(node1, node2).style.display = 'block'
    }

    function onAll(onNodes, onEdges) {
        // Call onNodes(n) on each node n, onEdges(f,t) on each edge (f->t).
        onNodes = (onNodes)?onNodes:function() {};
        onEdges = (onEdges)?onEdges:function() {};
        for (var n in dag.graph()) {
            if (!dag.graph().hasOwnProperty(n))
                continue;
            onNodes(n);
            var edges = dag.graph()[n];
            for (var i = 0; i < edges.length; i++)
                onEdges(n, edges[i]);
        }
    }

    function hideAll() {
        // Hide all nodes and edges.
        onAll(hide, hide);
    }
    function showAll() {
        // Show all nodes and edges.
        onAll(show, show);
    }
    function showInOrder(timestep, atEnd) {
        // Show the nodes and induced edges in order at timestep intervals (ms).
        // Call atEnd when the entire graph is shown.
        atEnd = (atEnd)?atEnd:function() {};
        // pre-compute the times at which to show each edge (O(m))
        // map of time -> [{from:n1, to:n2}] for each edge at given time
        var show_timings = (function() {
            var m = {};
            onAll(null, function(f, t) {
                var time = Math.max(f, t);
                if (!m[time])
                    m[time] = [];
                m[time].push({from: f, to: t});
            });
            return m;
        }());
        // recur sets itself on a timeout using given timestep
        function recur(n) {
            if (n <= end_id) {
                show(n);
                if (show_timings[n])
                    for (var i = 0; i < show_timings[n].length; i++)
                        show(show_timings[n][i].from, show_timings[n][i].to);
                setTimeout(function() {recur(n+1);}, timestep);
            } else {
                atEnd();
            }
        }
        recur(start_id);
    }

    return {
        show: show,
        hide: hide,
        onAll: onAll,
        hideAll: hideAll,
        showAll: showAll,
        showInOrder: showInOrder,
    };
}

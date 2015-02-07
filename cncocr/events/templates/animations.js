/**
 * Animations for the dag.
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

    // Return the DOM node for the given graph node.
    function nodeDom(node_id) {
        return dag.property(node_id, '_dom');
    }
    // Return the DOM node for the given graph node.
    function edgeDom(from, to) {
        return dag.edgeProperty(from, to, '_dom');
    }

    // Set node or edge style to display:none
    // If one arg given, hide node. If two, hide edge.
    function hide(node1, node2) {
        if (node2 === undefined)
            nodeDom(node1).style.display = 'none';
        else
            edgeDom(node1, node2).style.display = 'none'
    }

    // Set node or edge style to display:block
    // If one arg given, show node. If two, show edge.
    function show(node1, node2) {
        if (node2 === undefined)
            nodeDom(node1).style.display = 'block';
        else
            edgeDom(node1, node2).style.display = 'block'
    }

    function onAll(onNodes, onEdges) {
        for (var n in dag.graph()) {
            if (!dag.graph().hasOwnProperty(n))
                continue;
            onNodes(n);
            var edges = dag.graph()[n];
            for (var i = 0; i < edges.length; i++)
                onEdges(n, edges[i]);
        }
    }
    // Hide all nodes and edges.
    function hideAll() {
        onAll(hide, hide);
    }
    // Show all nodes and edges.
    function showAll() {
        onAll(show, show);
    }
    // Show the nodes and induced edges in order at timestep intervals (ms).
    function showInOrder(timestep) {
        function recur(n) {
            if (n > end_id)
                return;
            show(n);
            // find all edges with both endpoints <= n and show them
            for (var i = 0; i <= n; i++) {
                var edges = dag.children(i);
                for (var e = 0; e < edges.length; e++)
                    if (edges[e] <= n)
                        show(i, edges[e]);
            }
            setTimeout(function() {recur(n+1);}, timestep);
        }
        recur(start_id);
    }

    return {
        hideAll: hideAll,
        showAll: showAll,
        showInOrder: showInOrder,
    };
}

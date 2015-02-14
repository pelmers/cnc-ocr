/**
 * Return an object with methods to provide animations for the dag.
 * Assumes that the node id's are distinct nonnegative numbers.
 */
function Animate(dag) {
    "use strict";
    // time between showing nodes (milliseconds)
    var timestep = 100;
    // The node id's are monotonic increasing in order of appearance, but they
    // are not necessarily sequential, so here we establish a sequential
    // ordering by sorting an array of id's
    var ordering = (function() {
        var arr = [];
        onAll(function(n) {
            arr.push(n);
        });
        arr.sort(function(a,b) { return a-b; });
        return arr;
    })();
    // map node id -> ordering
    var reverse_ordering = (function() {
        var o = {};
        for (var i = 0; i < ordering.length; i++)
            o[ordering[i]] = i;
        return o;
    })();
    // the index in ordering array of the next node to show
    var next_node = 0;
    // flag to determine whether we are paused
    var paused = false;
    // pre-compute the times at which to show each edge in (O(M))
    // map of time -> [{from:n1, to:n2}] for each edge at given time
    var show_timings = (function() {
        var m = {};
        onAll(null, function(f, t) {
            var time = reverse_ordering[Math.max(f, t)];
            if (!m[time])
                m[time] = [];
            m[time].push({from: f, to: t});
        });
        return m;
    }());

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
        // Hide all nodes and edges. Set next_node to first node.
        onAll(hide, hide);
        next_node = 0;
    }
    function showAll() {
        // Show all nodes and edges. Set next_node to last node + 1.
        onAll(show, show);
        next_node = ordering.length;
    }
    function showNext() {
        // Show the next node and any induced edges.
        // Increment next_node.
        show(ordering[next_node]);
        if (show_timings[next_node])
            for (var i = 0; i < show_timings[next_node].length; i++)
                show(show_timings[next_node][i].from, show_timings[next_node][i].to);
        next_node++;
    }
    function hidePrev() {
        // Hide the last node shown, and decrement next_node.
        next_node--;
        hide(ordering[next_node]);
        if (show_timings[next_node])
            for (var i = 0; i < show_timings[next_node].length; i++)
                hide(show_timings[next_node][i].from, show_timings[next_node][i].to);
    }
    function showInOrder() {
        // Show the nodes and induced edges in order at predefined intervals (ms).
        // Stop if the pause() method is called.
        function recur() {
            // show next while we're not paused and not at the end
            if (next_node < ordering.length && !paused) {
                showNext();
                // recur sets itself on a timeout using given timestep
                setTimeout(recur, getTimestep());
            }
        }
        recur();
    }
    function pause() {
        // Pause current animations.
        paused = true;
    }
    function unpause() {
        // Unset the pause flag. Note: Does not resume animations.
        paused = false;
    }
    // underscore to avoid name conflict. we remove _ on export.
    function _paused() {
        // Return whether animation is paused.
        return paused;
    }
    function getTimestep() {
        // Return current timestep in node playback.
        return timestep;
    }
    function setTimestep(ts) {
        // Set timestep between showing nodes to given value in milliseconds.
        timestep = ts;
    }

    return {
        show: show,
        hide: hide,
        onAll: onAll,
        hideAll: hideAll,
        showAll: showAll,
        showInOrder: showInOrder,
        showNext: showNext,
        hidePrev: hidePrev,
        paused: _paused,
        pause: pause,
        unpause: unpause,
        getTimestep: getTimestep,
        setTimestep: setTimestep,
    };
}

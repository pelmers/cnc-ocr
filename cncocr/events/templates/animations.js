/**
 * Return an object with methods to provide animations for the dag.
 * Assumes that the node id's are distinct nonnegative numbers.
 */
function Animate(dag) {
    "use strict";
    // time between showing nodes (milliseconds)
    var timestep = 100;
    var max_time = (function() {
        var m = 0;
        onAll(function(n) {
            m = Math.max(m,n);
        });
        return m;
    })();
    // the current time we are at, in range [0, max time]
    var current_time = 0;
    // flag to determine whether we are paused
    var paused = false;

    // map of node id -> time connected (i.e. to turn opaque)
    var time_connected = (function() {
        var c = {};
        // steps turn opaque when they "run"
        onAll(function(n) {
            var r = dag.property(n, "running");
            c[n] = (r)?r:max_time;
        });
        // items turn opaque when their in-degree exceeds 0 from a running step
        onAll(null, function(f, t) {
            if (dag.property(t, "type") === "item")
                c[t] = Math.min(c[t], c[f]);
        });
        return c;
    })();
    // map of time -> [nodes that turn opaque at this time]
    // one-to-many inverse map of time_connected
    var connect_timings = (function() {
        var ic = {}
        for (var n in time_connected) {
            if (!time_connected.hasOwnProperty(n)) continue;
            if (ic[time_connected[n]] === undefined)
                ic[time_connected[n]] = [];
            ic[time_connected[n]].push(n);
        }
        return ic;
    })();

    // pre-compute the times at which to show each edge in (O(M))
    // map of time -> [{from:n1, to:n2}] for each edge at given time
    // At each time we display the induced subgraph of
    // {visible item nodes + run step nodes}
    var show_timings = (function() {
        var m = {};
        onAll(null, function(f, t) {
            // for items go by shown time, for steps go by running time
            var tf = (dag.property(f, "type") === "item")?f:time_connected[f];
            var tt = (dag.property(t, "type") === "item")?t:time_connected[t];
            var time = Math.max(tf, tt);
            if (!m[time])
                m[time] = [];
            m[time].push({from: f, to: t});
        });
        return m;
    })();

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

    function connect(node) {
        // Set the opacity of the node to 1.
        nodeDom(node).style.opacity = '1';
    }

    function disconnect(node) {
        // Set the opacity of the node to 0.4.
        nodeDom(node).style.opacity = '0.4';
    }

    function onAll(onNodes, onEdges) {
        // Call onNodes(n) on each node n, onEdges(f,t) on each edge (f->t).
        for (var n in dag.graph()) {
            if (!dag.graph().hasOwnProperty(n))
                continue;
            if (onNodes)
                onNodes(n);
            var edges = dag.graph()[n];
            if (onEdges)
                for (var i = 0; i < edges.length; i++)
                    onEdges(n, edges[i]);
        }
    }

    function hideAll() {
        // Hide and disconnect all nodes and edges. Set current_time to 0.
        onAll(hide, hide);
        // initially disconnect everything except the source
        onAll(disconnect);
        connect(0);
        current_time = 0;
    }
    function showAll() {
        // Show and connect all nodes and edges. Set current_time to max_time.
        onAll(show, show);
        onAll(connect);
        current_time = max_time;
    }
    function showNext() {
        // Show the next node and any induced edges.
        // Increment current_time.
        if (dag.hasNode(current_time))
            show(current_time);
        if (show_timings[current_time])
            for (var i = 0; i < show_timings[current_time].length; i++)
                show(show_timings[current_time][i].from, show_timings[current_time][i].to);
        if (connect_timings[current_time])
            for (var i = 0; i < connect_timings[current_time].length; i++)
                connect(connect_timings[current_time][i]);
        current_time++;
    }
    function hidePrev() {
        // Hide the last node shown, and decrement current_time.
        current_time--;
        if (dag.hasNode(current_time))
            hide(current_time);
        if (show_timings[current_time])
            for (var i = 0; i < show_timings[current_time].length; i++)
                hide(show_timings[current_time][i].from, show_timings[current_time][i].to);
        if (connect_timings[current_time])
            for (var i = 0; i < connect_timings[current_time].length; i++)
                disconnect(connect_timings[current_time][i]);
    }
    function showInOrder() {
        // Show the nodes and induced edges in order at predefined intervals (ms).
        // Stop if the pause() method is called.
        function recur() {
            // show next while we're not paused and not at the end
            if (current_time < max_time && !paused) {
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

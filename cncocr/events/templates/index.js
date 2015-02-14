(function() {
    "use strict";

    /**
     * Reconstruct the graph from the svg so we can do fancy stuff on it.
     * svgHandle: Selector for the svg element containing the graph.
     * Return a DAG object representing the computation graph.
     */
    function svgToDAG(svgHandle) {
        var edges = svgHandle.querySelectorAll(".edge"),
            nodes = svgHandle.querySelectorAll(".node"),
            g = DAG();
        for (var i = 0; i < nodes.length; i++) {
            var id = parseInt(nodes[i].id),
                shape = nodes[i].querySelector("ellipse");
            g.addNode(id);
            if (shape === null) {
                // try polygon
                shape = nodes[i].querySelector("polygon");
            }
            if (shape != null) {
                g.setProperty(id, "color",
                        shape.getAttributeNS(null, "stroke"));
            }
            g.setProperty(id, "label", nodes[i].querySelector("text").innerHTML);
            g.setProperty(id, "_dom", nodes[i]);
        }
        for (var i = 0; i < edges.length; i++) {
            var id = edges[i].id,
                path = edges[i].querySelector("path"),
                split = id.split("->"),
                from = parseInt(split[0]),
                to = parseInt(split[1]);
            g.addEdge(from, to);
            g.setEdgeProperty(from, to, "color",
                              path.getAttributeNS(null, "stroke"));
            g.setEdgeProperty(from, to, "_dom", edges[i]);
        }
        return g;
    }

    // export for debugging
    window.dag = svgToDAG(document.querySelector("#image_data > svg"));

    var animator = Animate(window.dag);
    animator.hideAll();
    // We want showing to take no longer than 10000 ms
    var maxTotalTime = 10000;
    animator.setTimestep(Math.min(maxTotalTime / window.dag.numNodes(), 100));
    animator.showInOrder();
    // Attach controls to the animations.
    Control(animator, window.dag);
    // set the speed slider's width to same as the table
    document.querySelector("#timestep").style.width =
        document.querySelector("#controls").getBoundingClientRect().width + 'px';
})();

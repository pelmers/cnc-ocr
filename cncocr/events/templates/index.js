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
            g.addNode(nodes[i].id);
            var shape = nodes[i].querySelector("ellipse");
            if (shape === null) {
                // try polygon
                shape = nodes[i].querySelector("polygon");
            }
            if (shape != null) {
                g.setProperty(nodes[i].id, "color",
                        shape.getAttributeNS(null, "stroke"));
            }
        }
        for (var i = 0; i < edges.length; i++) {
            var id = edges[i].id,
                path = edges[i].querySelector("path"),
                split = id.split("->"),
                from = split[0],
                to = split[1];
            g.addEdge(from, to);
            g.setEdgeProperty(from, to, "color",
                              path.getAttributeNS(null, "stroke"));
        }
        return g;
    }

    // export for debugging
    window.dag = svgToDAG(document.querySelector("#image_data > svg"));
})();

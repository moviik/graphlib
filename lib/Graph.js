/*!
 * This file is organized with in the following order:
 *
 * Exports
 * Graph constructors
 * Graph queries (e.g. nodes(), edges()
 * Graph mutators
 * Helper functions
 */

var util = require("./util");

module.exports = Graph;

/*
 * Constructor to create a new directed multi-graph.
 */
function Graph() {
  /*! The value assigned to the graph itself */
  this._value = undefined;

  /*! Map of nodeId -> {id, value} */
  this._nodes = {};

  /*! Map of nodeId -> { edgeId -> true } */
  this._incidentEdges = {};

  /*! Map of edgeId -> {id, u, v, value} */
  this._edges = {};

  /*! Used to generate anonymous edge ids */
  this._nextEdgeId = 0;
}

/*
 * Constructs and returns a new graph that includes only the nodes in `us`. Any
 * edges that have both their source and target in the set `us` are also
 * included in the subgraph.
 * 
 * Changes to the graph itself are not reflected in the original graph.
 * However, the values for nodes and edges are not copied. If the values are
 * objects then their changes will be reflected in the original graph and the
 * subgraph.
 *
 * If any of the nodes in `us` are not in this graph this function raises an
 * Error.
 *
 * @param {String[]} us the node ids to include in the subgraph
 */
Graph.prototype.subgraph = function(us) {
  var g = new Graph();
  var self = this;

  us.forEach(function(u) { g.addNode(u, self.node(u)); });
  util.values(this._edges).forEach(function(e) {
    if (g.hasNode(e.source) && g.hasNode(e.target)) {
      g.addEdge(e.id, e.source, e.target, self.edge(e.id));
    }
  });

  return g;
};

/*
 * Returns the number of nodes in this graph.
 */
Graph.prototype.order = function() {
  return Object.keys(this._nodes).length;
};

/*
 * Returns the number of edges in this graph.
 */
Graph.prototype.size = function() {
  return Object.keys(this._edges).length;
};

/*
 * Accessor for a graph-level value. If called with no arguments this function
 * returns the graph value object. If called with the **value** argument this
 * function sets the value for the graph, replacing the previous value.
 *
 * @param {Object} [value] optional value to set for this graph.
 */
Graph.prototype.graph = function(value) {
  if (arguments.length === 0) {
    return this._value;
  }
  this._value = value;
};

/*
 * Returns `true` if this graph contains a node with the id `u`. Otherwise
 * returns false.
 *
 * @param {String} u a node id
 */
Graph.prototype.hasNode = function(u) {
  return u in this._nodes;
};

/*
 * Accessor for node values. If called with a single argument this function
 * returns the value for the node **u**. If called with two arguments, this
 * function assigns **value** as the value for node **u**.
 *
 * If no such node is in the graph this function will throw an Error.
 *
 * @param {String} u a node id
 * @param {Object} [value] option value to set for this node
 */
Graph.prototype.node = function(u, value) {
  var node = this._strictGetNode(u);
  if (arguments.length === 1) {
    return node.value;
  }
  node.value = value;
};

/*
 * Returns the ids of all nodes in this graph. Use `graph.node(u)` to get the
 * value for a specific node.
 */
Graph.prototype.nodes = function() {
  var nodes = [];
  this.eachNode(function(id) { nodes.push(id); });
  return nodes;
};

/*
 * Applies a function that takes the parameters (`id`, `value`) to each node in
 * the graph in arbitrary order.
 *
 * @param {Function} func the function to apply to each node
 */
Graph.prototype.eachNode = function(func) {
  for (var k in this._nodes) {
    var node = this._nodes[k];
    func(node.id, node.value);
  }
};

/*
 * Returns all nodes that are adjacent to the node with the id `u`. In other
 * words, this function returns the set of all successors and predecessors of
 * node `u`.
 *
 * @param {String} u a node id
 */
Graph.prototype.neighbors = function(u) {
  this._strictGetNode(u);
  var vs = {};

  Object.keys(this._outEdges[u])
        .map(function(v) { vs[v] = true; });

  Object.keys(this._inEdges[u])
        .map(function(v) { vs[v] = true; });

  return Object.keys(vs)
               .map(function(v) { return this._nodes[v].id; }, this);
};

/*
 * Returns `true` if this graph has an edge with the id `e`. Otherwise this
 * function returns `false`.
 *
 * @param {String} e an edge id
 */
Graph.prototype.hasEdge = function(e) {
  return e in this._edges;
};

/*
 * Accessor for edge values. If called with a single argument this function
 * returns the value for the edge **e**. If called with two arguments, this
 * function assigns **value** as the value for edge **e**.
 *
 * If no such edge is in the graph this function will throw an Error.
 *
 * @param {String} e an edge id
 * @param {Object} [value] option value to set for this node
 */
Graph.prototype.edge = function(e, value) {
  var edge = this._strictGetEdge(e);
  if (arguments.length === 1) {
    return edge.value;
  }
  edge.value = value;
};

/*
 * Returns the ids of all edges in the graph.
 */
Graph.prototype.edges = function() {
  var es = [];
  this.eachEdge(function(id) { es.push(id); });
  return es;
};

/*
 * Applies a function that takes the parameters (`id`, `source`, `target`,
 * `value`) to each edge in this graph in arbitrary order.
 *
 * @param {Function} func a function to apply to each edge
 */
Graph.prototype.eachEdge = function(func) {
  for (var k in this._edges) {
    var edge = this._edges[k];
    func(edge.id, edge.u, edge.v, edge.value);
  }
};

Graph.prototype.incidentNodes = function(e) ...;

/*
 * Returns an array of ids for all edges in the graph that are incident on `u`.
 * If the node `u` is not in the graph this function raises an Error.
 *
 * Optionally a `v` node may also be specified. This causes the results to be
 * filtered such that only edges between `u` and `v` are included. If the node
 * `v` is specified but not in the graph then this function raises an Error.
 *
 * @param {String} u the node for which to find incident edges
 * @param {String} [v] option node that must be adjacent to `u`
 */
Graph.prototype.incidentEdges = function(u, v) {
  if (arguments.length > 1) {
    return util.mergeKeys([this.outEdges(u, v), this.outEdges(v, u)]);
  } else {
    return util.mergeKeys([this.inEdges(u), this.outEdges(u)]);
  }
};

/*
 * Returns `true` if the values of all nodes and all edges are equal (===)
 *
 * @param {Graph} other the graph to test for equality with this graph
 */
Graph.prototype.equals = function(other) {
  var self = this;

  return self.order() === other.order() &&
         self.size() === other.size() &&
         util.all(self.nodes(), function(x) { return other.hasNode(x) && self.node(x) === other.node(x); }) &&
         util.all(self.edges(), function(x) { return other.hasEdge(x) && self.edge(x) === other.edge(x); });
};

/*
 * Returns a string representation of this graph.
 */
Graph.prototype.toString = function() {
  var self = this;
  var str = "GRAPH: " + JSON.stringify(self._value) + "\n";
  str += "    Nodes:\n";
  Object.keys(this._nodes)
        .forEach(function(u) {
          str += "        " + u + ": " + JSON.stringify(self._nodes[u].value) + "\n";
        });

  str += "    Edges:\n";
  Object.keys(this._edges)
        .forEach(function(e) {
          var edge = self._edges[e];
          str += "        " + e + " (" + edge.source + " -- " + edge.target + "): " +
                 JSON.stringify(self._edges[e].value) + "\n";
        });

  return str;
};

/*
 * Adds a new node with the id `u` to the graph and assigns it the value
 * `value`. If a node with the id is already a part of the graph this function
 * throws an Error.
 *
 * @param {String} u a node id
 * @param {Object} [value] an optional value to attach to the node
 */
Graph.prototype.addNode = function(u, value) {
  if (this.hasNode(u)) {
    throw new Error("Graph already has node '" + u + "':\n" + this.toString());
  }
  this._nodes[u] = { id: u, value: value };
  this._inEdges[u] = {};
  this._outEdges[u] = {};
};

/*
 * Removes a node from the graph that has the id `u`. Any edges incident on the
 * node are also removed. If the graph does not contain a node with the id this
 * function will throw an Error.
 *
 * @param {String} u a node id
 */
Graph.prototype.delNode = function(u) {
  this._strictGetNode(u);

  var self = this;
  this.incidentEdges(u).forEach(function(e) { self.delEdge(e); });

  delete this._inEdges[u];
  delete this._outEdges[u];
  delete this._nodes[u];
};

/*
 * Adds a new edge to the graph with the id `e` from a node with the id `source`
 * to a noce with an id `target` and assigns it the value `value`. This graph
 * allows more than one edge from `source` to `target` as long as the id `e`
 * is unique in the set of edges. If `e` is `null` the graph will assign a
 * unique identifier to the edge.
 *
 * If `source` or `target` are not present in the graph this function will
 * throw an Error.
 *
 * @param {String} [e] an edge id
 * @param {String} source the source node id
 * @param {String} target the target node id
 * @param {Object} [value] an optional value to attach to the edge
 */
Graph.prototype.addEdge = function(e, source, target, value) {
  this._strictGetNode(source);
  this._strictGetNode(target);

  if (e === null) {
    e = "_ANON-" + (++this._nextEdgeId);
  }
  else if (this.hasEdge(e)) {
    throw new Error("Graph already has edge '" + e + "':\n" + this.toString());
  }

  this._edges[e] = { id: e, source: source, target: target, value: value };
  addEdgeToMap(this._inEdges[target], source, e);
  addEdgeToMap(this._outEdges[source], target, e);
};

/*
 * Removes an edge in the graph with the id `e`. If no edge in the graph has
 * the id `e` this function will throw an Error.
 *
 * @param {String} e an edge id
 */
Graph.prototype.delEdge = function(e) {
  var edge = this._strictGetEdge(e);
  delEdgeFromMap(this._inEdges[edge.target], edge.source, e);
  delEdgeFromMap(this._outEdges[edge.source], edge.target, e);
  delete this._edges[e];
};

Graph.prototype._strictGetNode = function(u) {
  var node = this._nodes[u];
  if (node === undefined) {
    throw new Error("Node '" + u + "' is not in graph:\n" + this.toString());
  }
  return node;
};

Graph.prototype._strictGetEdge = function(e) {
  var edge = this._edges[e];
  if (edge === undefined) {
    throw new Error("Edge '" + e + "' is not in graph:\n" + this.toString());
  }
  return edge;
};

Graph.prototype._filterNodes = function(pred) {
  var filtered = [];
  this.eachNode(function(u) {
    if (pred(u)) {
      filtered.push(u);
    }
  });
  return filtered;
};

function addEdgeToMap(map, v, e) {
  var vEntry = map[v];
  if (!vEntry) {
    vEntry = map[v] = { count: 0, edges: {} };
  }
  vEntry.count++;
  vEntry.edges[e] = true;
}

function delEdgeFromMap(map, v, e) {
  var vEntry = map[v];
  if (--vEntry.count === 0) {
    delete map[v];
  } else {
    delete vEntry.edges[e];
  }
}

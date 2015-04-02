from sympy import Symbol, solve
from sympy.core import sympify

def tag_expr(tag, out_var):
    """Return out_var = tag as a SymPy expression."""
    # since sympify will automatically equate to zero, we convert it to:
    # tag_expr - o_n, and solve for s, some variable in the tagspace
    return sympify(str.format("{} - {}", tag.expr, out_var))

def find_step_inverses(stepFunction):
    """
    Given a StepFunction, read the expressions for each output and return a map
    {c: [f: tagspace -> t for each output tag t] for each output collection or
    step c} where the tagspace is enumerated (t1,t2,...,tn).
    """
    tag_space = [Symbol(t) for t in stepFunction.tag]
    outputs = {s.collName: [] for s in stepFunction.outputs}
    for output in stepFunction.outputs:
        # either an itemref or a stepref
        tag_list = output.key if output.kind == "ITEM" else output.tag
        # iterate over taglist, but filter out range types
        for (i, t) in enumerate([i for i in tag_list if not i.isRanged]):
            # name the tag variable
            out_var = "t{}".format(i+1)
            expr = tag_expr(t, out_var)
            solution = solve(expr, tag_space, dict=True)
            outputs[output.collName].append(solution[0] if solution else {})
    return outputs

def find_blame_candidates(arg_blame, graph_data):
    """
    Given arg_blame in format coll@tag and graph_data from specfile, find the
    possible steps@tag that could be responsible for putting or prescribing
    arg_blame.
    """
    coll_name, coll_tag = arg_blame.split("@")
    # turn coll_tag into a tuple representing a point in tagspace
    coll_tag = tuple(coll_tag.split(","))
    # turn coll_tag into dict of substitutions tk: coll_tag[k]
    coll_tag_system = {Symbol("t{}".format(i+1)): v for i,v in enumerate(coll_tag)}
    # {s: {in_tag: value for each input tag of s} for each step s}
    candidates = {}
    # steps that contain the collection in output but have no valid solution
    rejected_steps = set()
    for (step, func) in graph_data.stepFunctions.iteritems():
        func_inverses = find_step_inverses(func)
        if coll_name in func_inverses:
            candidates[step] = {}
            for out_tag in func_inverses[coll_name]:
                for (in_tag, expr) in out_tag.iteritems():
                    in_tag = str(in_tag)
                    # evaluate inv_p(t)
                    inv = expr.subs(coll_tag_system)
                    if in_tag in candidates[step]:
                        if inv != candidates[step][in_tag]:
                            # then the solution is inconsistent, reject the step
                            rejected_steps.add(step)
                    else:
                        candidates[step][in_tag] = inv
    for s in rejected_steps:
        del candidates[s]
    return candidates

def filter_blame_candidates(candidates, step_functions, event_graph):
    """
    Filter blame candidates given the execution graph of a program.

    Remove all steps that have not run, as they cannot be blamed.
    Return new candidates dict.
    """
    filtered = {}
    for step_name in candidates:
        # if any of the points is not a number, we can't evaluate it
        if any((not expr.is_number) for expr in candidates[step_name].values()):
            continue
        # put the tag tuple in canonical order (same as in spec file)
        tag_tuple = tuple([int(candidates[step_name][tag]) for tag in
                           step_functions[step_name].tag])
        # now we go through graph and see if we have such a step that ran
        for node in event_graph:
            n_name = event_graph.property(node, "name")
            n_tag = event_graph.property(node, "tag")
            if n_name == step_name:
                # turn the tag into a tuple in same order as tag_tuple
                n_tag = tuple(map(int, n_tag.split(',')))
                if n_tag == tag_tuple and event_graph.property(node,
                                                               "run_time", 0) > 0:
                    filtered[step_name] = candidates[step_name]
    return filtered

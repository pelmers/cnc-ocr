from sympy import Symbol, solve
from sympy.core import sympify

def find_step_inverses(stepFunction):
    """
    Given a StepFunction, read the expressions for each output and return a map
    {c: [f: tagspace -> t for each output tag t] for each output collection or step c}.
    """
    tag_space = [Symbol(t) for t in stepFunction.tag]
    outputs = {s.collName: [] for s in stepFunction.outputs}
    for output in stepFunction.outputs:
        # either an itemref or a stepref
        taglist = output.key if output.kind == "ITEM" else output.tag
        # iterate over taglist, but filter out range types
        for (i, t) in enumerate([i for i in taglist if not i.isRanged]):
            # name the tag variable
            out_var = "t{}".format(i+1)
            # so current expression is o_n = tag_expr
            # since sympify will automatically zero, we convert it to:
            # tag_expr - o_n, and solve for s, some variable in the tagspace
            expr = sympify(str.format("{} - {}", t.expr, out_var))
            outputs[output.collName].append(solve(expr, tag_space))
    return outputs

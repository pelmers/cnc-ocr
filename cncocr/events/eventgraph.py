import sys, re
from collections import defaultdict
from cncocr.events.dag import DAG
import cncocr.events.actions as actions

class EventGraph(DAG):
    '''
    Directed acyclic graph for a CnC-OCR event log. Assumes that execution is
    serialized, i.e. no two activities can be running at the same time.
    '''
    def __init__(self, event_log):
        '''
        Create a DAG representing the event log given by list of lines event_log.
        '''
        super(EventGraph, self).__init__()
        # (id, label) of an activity last running tag
        self._last_running_activity_tag = ("init", "init")
        # put init on the graph and make it blue
        self.add_node("init")
        self.style_step("init")
        # [node_ids for get events on the next activity prescribed]
        self._activity_gets = []
        for event in event_log:
            self.process_event(event)

    def process_event(self, event):
        '''
        Add event, a line from the event log, to the DAG.
        '''
        # skip anything without an @
        if "@" not in event:
            return
        # action is one of the things defined in actions
        # label is either the collection or the step name, depending on action
        # tag is the tag of the step or collection
        # format: ACTION  LABEL @ TAG
        pattern = re.compile(r'([^\s]+) ([^\s]+) @ (.+)')
        match = pattern.match(event)
        action, label, tag = [match.group(i+1) for i in range(3)]
        # make sure that cncPrescribe_StepName and StepName are treated the same
        node_id = self.create_node_id(action, label, tag)
        node_label = self.create_node_label(action, label, tag)
        if action == actions.PRESCRIBED:
            # add node for activity, adding any recorded gets
            self.add_get_edges(node_id, node_label, self._activity_gets)
            self.add_prescribe_edge(self._last_running_activity_tag[0], node_id)
            # make a step blue
            self.style_step(node_id)
            # clear out the activity get list to prepare for next prescribe
            self._activity_gets = []
        elif action == actions.RUNNING:
            # record this tag as being the currently running activity
            self._last_running_activity_tag = (node_id, node_label)
        elif action == actions.DONE:
            # no new node here
            pass
        elif action == actions.GET_DEP:
            # happens before a step is prescribed, so we keep track of these items
            self._activity_gets.append((node_id, node_label))
        elif action == actions.PUT:
            self.add_put_edges(node_id, node_label, [self._last_running_activity_tag])
        else:
            print >>sys.stderr, "Unrecognized action %s" % action

    def create_node_id(self, action, label, tag):
        '''
        Return a node id for the given action, label, tag
        '''
        # graphviz does not like spaces in node id
        tag = tag.replace(", ", "_")
        return "%s_%s" % (label, tag)

    def create_node_label(self, action, label, tag):
        '''
        Return human-readable label for given action, label, tag
        '''
        return "%s: %s" % (label, tag.replace(", ", ","))

    def style_step(self, step_id):
        '''
        Style the node for a step.
        '''
        self.set_property(step_id, 'color', 'blue')

    def add_get_edges(self, step, step_label, items):
        '''
        Add get edges from item node (id, label) to step node id.
        '''
        self.add_node_with_parents(step, [i[0] for i in items])
        self.set_property(step, "label", step_label)
        # these are collection nodes, so make them green boxes
        for n, label in self._activity_gets:
            self.set_property(n, "shape", "box")
            self.set_property(n, "color", "green")
            self.set_property(n, "label", label)

    def add_put_edges(self, step, step_label, items):
        '''
        Add put edges from step node id to item (id, label).
        '''
        self.add_node_with_parents(step, [i[0] for i in items])
        self.set_property(step, "label", step_label)
        self.set_property(step, "shape", "box")
        self.set_property(step, "color", "green")
        for n, label in items:
            self.set_property(n, "label", label)

    def add_prescribe_edge(self, parent, child):
        '''
        Add a prescribe edge from the parent step to the child step node id.
        '''
        self.add_child(parent, child)
        self.set_edge_property(parent, child, "style", "dashed")


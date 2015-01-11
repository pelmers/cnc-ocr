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
        # name of an activity last running tag
        self._last_running_activity_tag = "init"
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
        if action == actions.PRESCRIBED:
            # add node for activity, adding any recorded gets
            self.add_node_with_parents(node_id, self._activity_gets)
            self._activity_gets = []
        elif action == actions.RUNNING:
            # record this tag as being the currently running activity
            self._last_running_activity_tag = node_id
        elif action == actions.DONE:
            # no new node here
            pass
        elif action == actions.GET_DEP:
            # edge from get to current activity
            # however gets actually happen before the prescribe event
            self._activity_gets.append(node_id)
        elif action == actions.PUT:
            # edge from current activity to put
            try:
                self.add_node_with_parents(node_id, [self._last_running_activity_tag])
            except KeyError:
                # probably from the init activity
                # self.add_node_with_parents(node_id, [location])
                print >>sys.stderr, "No tag found putting %s @ %s" % (label, tag)
        else:
            print >>sys.stderr, "Unrecognized action %s" % action

    def create_node_id(self, action, label, tag):
        '''
        Return a node id for the given action, label, tag
        '''
        # graphviz does not like spaces in node id
        tag = tag.replace(", ", "_")
        return "%s_%s" % (label, tag)


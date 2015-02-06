# -*- coding: utf-8 -*-
import random

# here we define some colors as a map
_colors = (
{
    'step': 'blue',
    'item': ['seagreen', 'green', 'springgreen', 'turquoise', 'limegreen', 'lawngreen'],
    'get_without_put': 'firebrick',
    'put_without_get': 'orchid',
    'prescribe_without_run': 'hotpink',
})

# make sure we always return same color for given key
_color_key_cache = {}
def color(event, key=None):
    '''
    Return the color for the requested event or node type.
    Key is required for events with multiple possible colors.
    '''
    c = _colors[event]
    if type(c) == str:
        return c
    if not key:
        raise KeyError("Expected a key to choose color.")
    # randomly pick a color if we haven't seen this event,key pair
    # otherwise return what we saw last time
    choice = _color_key_cache.get((event,key), random.choice(c))
    _color_key_cache[(event,key)] = choice
    return choice

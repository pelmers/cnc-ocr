/**
 * Attach controls to given dag animator.
 */
function Control(animator, dag) {
    "use strict";
    document.querySelector("#start").addEventListener('click', function() {
        animator.pause();
        animator.hideAll();
    });
    document.querySelector("#prev").addEventListener('click', function() {
        animator.pause();
        animator.hidePrev();
    });
    document.querySelector("#pause").addEventListener('click', animator.pause);
    document.querySelector("#play").addEventListener('click', function() {
        animator.unpause();
        animator.showInOrder();
    });
    document.querySelector("#next").addEventListener('click', function() {
        animator.pause();
        animator.showNext();
    });
    document.querySelector("#end").addEventListener('click', function() {
        animator.pause();
        animator.showAll();
    });
    // the timestep slider is labeled "speed" but we want "delay"
    // so we take max-slider to get the timestep value
    var ts = document.querySelector("#timestep");
    ts.addEventListener('change', function() {
        animator.setTimestep(parseInt(ts.max)+1-parseInt(ts.value));
    });
}

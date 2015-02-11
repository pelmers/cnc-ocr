/**
 * Attach controls to given dag animator.
 */
function Control(animator, dag) {
    "use strict";
    var play_src = document.querySelector("#hidden_icon > img").src,
        playpause_img = document.querySelector("#playpause > img"),
        pause_src = playpause_img.src;
    document.querySelector("#start").addEventListener('click', function() {
        playpause_img.src = play_src;
        animator.pause();
        animator.hideAll();
    });
    document.querySelector("#prev").addEventListener('click', function() {
        playpause_img.src = play_src;
        animator.pause();
        animator.hidePrev();
    });
    document.querySelector("#playpause").addEventListener('click', function() {
        if (animator.paused()) {
            animator.unpause();
            animator.showInOrder();
            playpause_img.src = pause_src;
        } else {
            playpause_img.src = play_src;
            animator.pause();
        }
    });
    document.querySelector("#next").addEventListener('click', function() {
        playpause_img.src = play_src;
        animator.pause();
        animator.showNext();
    });
    document.querySelector("#end").addEventListener('click', function() {
        playpause_img.src = play_src;
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

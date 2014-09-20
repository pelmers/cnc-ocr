#include "Rician.h"

ocrGuid_t mainEdt(u32 paramc, u64 paramv[], u32 depc, ocrEdtDep_t depv[]) {

    // Create a new graph context
    RicianCtx *context = Rician_create();

    // Exit when the graph execution completes
    CNC_SHUTDOWN_ON_FINISH(context);
    
    // Set up arguments for new graph instantiation
    RicianArgs args = {
        /* TODO: initialize custom arguments
         * Note that you should define the members of
         * this struct by editing Rician_defs.h.
         */
    };

    // Launch the graph for execution
    Rician_launch(&args, context);

    return NULL_GUID;
}
#include "Rician.h"

/*
 * typeof conv is int 
 */
void beginIteration(cncTag_t totalRows, cncTag_t totalColumns, cncTag_t totalDepth, cncTag_t t, convItem ***conv, RicianCtx *ctx) {

    //
    // INPUTS
    //

    printf("beginning iteration %d\n", (int)t);
    { // Access "conv" inputs
        s64 _i, _j, _k;
        int converged = 1;
        for (_i = 0; _i < ((totalRows-2)-(1)); _i++) {
            for (_j = 0; _j < ((totalColumns-2)-(1)); _j++) {
                for (_k = 0; _k < ((totalColumns-2)-(1)); _k++) {
                    converged = (conv[_i][_j][_k].item)?converged:0;
                }
            }
        }
        // if we have converged, jump to t = maxT
        if (converged)
            t = ctx->maxT;
    }
    printf("checked convergence for t = %d\n", (int)t);


    //
    // OUTPUTS
    //

    { // Prescribe "gradientStep" steps
        s64 _i, _j, _k;
        for (_i = 0; _i < ((totalRows-2)-(1)); _i++) {
            for (_j = 0; _j < ((totalColumns-2)-(1)); _j++) {
                for (_k = 0; _k < ((totalDepth-2)-(1)); _k++) {
                    cncPrescribe_gradientStep(_i, _j, _k, t, ctx);
                }
            }
        }
    }
}

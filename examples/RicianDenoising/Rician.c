#include "Rician.h"

void Rician_init(RicianArgs *args, RicianCtx *ctx) {

    // Prescribe "SX" steps
    cncPrescribe_SX(10, ctx);

    // Prescribe "SY" steps
    cncPrescribe_SY(500, ctx);

    // Set finalizer function's tag
    Rician_await(ctx);

}

/*
 * typeof X is int 
 * typeof Y is int 
 */
void Rician_finalize(XItem X, YItem Y, RicianCtx *ctx) {
    // Print results
    PRINTF("X = %d\nY = %d\n", X.item, Y.item);
}

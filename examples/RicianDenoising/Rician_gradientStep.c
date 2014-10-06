#include "Rician.h"

/*
 * typeof u is double 
 */
void gradientStep(cncTag_t i, cncTag_t j, cncTag_t k, cncTag_t t, uItem u0, uItem u1, uItem u2, uItem u3, uItem u4, uItem u5, uItem u6, RicianCtx *ctx) {

    //
    // OUTPUTS
    //

    // Put "g" items
    double *g;
    cncHandle_t gHandle = cncCreateItem_g(&g);
    /* TODO: Initialize g */
    cncPut_g(gHandle, i, j, k, t, ctx);

    // Prescribe "updateStep" steps
    cncPrescribe_updateStep(i, j, k, t, ctx);


}
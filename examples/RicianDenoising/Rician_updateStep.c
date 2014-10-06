#include "Rician.h"

/*
 * typeof u is double 
 * typeof g is double 
 */
void updateStep(cncTag_t i, cncTag_t j, cncTag_t k, cncTag_t t, uItem u0, uItem u1, uItem u2, uItem u3, uItem u4, uItem u5, uItem u6, gItem g0, gItem g1, gItem g2, gItem g3, gItem g4, gItem g5, gItem g6, RicianCtx *ctx) {

    //
    // OUTPUTS
    //

    // Put "u7" items
    double *u7;
    cncHandle_t u7Handle = cncCreateItem_u(&u7);
    /* TODO: Initialize u7 */
    cncPut_u(u7Handle, i, j, k, t, ctx);

    // Prescribe "checkConvergence" steps
    cncPrescribe_checkConvergence(i, j, k, t, ctx);


}
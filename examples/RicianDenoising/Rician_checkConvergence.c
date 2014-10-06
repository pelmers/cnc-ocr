#include "Rician.h"

/*
 * typeof u is double 
 */
void checkConvergence(cncTag_t i, cncTag_t j, cncTag_t k, cncTag_t t, uItem u0, uItem u1, RicianCtx *ctx) {

    //
    // OUTPUTS
    //

    // Put "conv" items
    int *conv;
    cncHandle_t convHandle = cncCreateItem_conv(&conv);
    /* TODO: Initialize conv */
    cncPut_conv(convHandle, i, j, k, t, ctx);


}
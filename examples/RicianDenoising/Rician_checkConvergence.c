#include "Rician.h"
#include "math.h"

static const double Tol = 2e-2;
/*
 * typeof u is double 
 */
void checkConvergence(cncTag_t i, cncTag_t j, cncTag_t k, cncTag_t t, uItem u_prev, uItem u_new, RicianCtx *ctx) {
    // converged if difference between iterations <= tol
    int *conv;
    cncHandle_t convHandle = cncCreateItem_conv(&conv);
    *conv = (fabs(u_prev.item - u_new.item) > Tol);
    cncPut_conv(convHandle, i, j, k, t, ctx);
}

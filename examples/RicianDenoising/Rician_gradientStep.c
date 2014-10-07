#include "Rician.h"
#include "math.h"

#define SQR(x) ((x)*(x))

static const double EPSILON=5e-5;

/*
 * typeof u is double 
 */
void gradientStep(cncTag_t i, cncTag_t j, cncTag_t k, cncTag_t t, uItem center, uItem up, uItem down, uItem right, uItem left, uItem zout, uItem zin, RicianCtx *ctx) {

    //
    // OUTPUTS
    //

    // Put "g" items
    double *g;
    cncHandle_t gHandle = cncCreateItem_g(&g);
    *g = 1.0/sqrt(EPSILON
        + SQR(center.item - right.item)
        + SQR(center.item - left.item)
        + SQR(center.item - down.item)
        + SQR(center.item - up.item)
        + SQR(center.item - zout.item)
        + SQR(center.item - zin.item));
    cncPut_g(gHandle, i, j, k, t, ctx);
    printf("put g at (%d,%d,%d)\n", (int)i,(int)j,(int)k);
    
    // Prescribe "updateStep" steps
    cncPrescribe_updateStep(i, j, k, t, ctx);
}

#undef SQR
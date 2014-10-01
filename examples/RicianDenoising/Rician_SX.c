#include "Rician.h"

/* Put an item to the X collection */
void SX(cncTag_t x, RicianCtx *ctx) {
    int *X;
    cncHandle_t XHandle = cncCreateItem_X(&X);
    *X = x;
    cncPut_X(XHandle, x+1, ctx);
}

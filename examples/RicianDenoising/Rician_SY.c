#include "Rician.h"

/* Put an item to the Y collection */
void SY(cncTag_t y, RicianCtx *ctx) {
    int *Y;
    cncHandle_t YHandle = cncCreateItem_Y(&Y);
    *Y = y;
    cncPut_Y(YHandle, ctx);
}

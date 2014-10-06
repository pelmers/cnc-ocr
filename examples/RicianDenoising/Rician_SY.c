#include "Rician.h"

/* Put an item to the Y collection */
void SY(cncTag_t y, XItem x, RicianCtx *ctx) {
    int *Y;
    cncHandle_t YHandle = cncCreateItem_Y(&Y);
    *Y = x.item+1;
    printf("Put %d in Y collection at tag %d\n", x.item+1, (int)y);
    cncPut_Y(YHandle, y+1, ctx);
}

#include "Rician.h"
#include "math.h"

#define SQR(x) ((x)*(x))

static const double sigma = 0.05;
static const double DT = 5.0;
static const double lambda = 0.065;

/*
 * typeof u is double 
 * typeof g is double 
 */
void updateStep(cncTag_t i, cncTag_t j, cncTag_t k, cncTag_t t, uItem f_center, uItem u_center, uItem u_up, uItem u_down, uItem u_right, uItem u_left, uItem u_zout, uItem u_zin, gItem g_center, gItem g_up, gItem g_down, gItem g_right, gItem g_left, gItem g_zout, gItem g_zin, RicianCtx *ctx) {
    double sigma2 = SQR(sigma);
    double gamma = lambda/sigma2;
    double r = u_center.item*f_center.item/sigma2;
    r = ( r*(2.38944 + r*(0.950037 + r)) )
        / ( 4.65314 + r*(2.57541 + r*(1.48937 + r)) );
    double *u;
    cncHandle_t uHandle = cncCreateItem_u(&u);
    *u = ( u_center.item + DT*(u_right.item*g_right.item
                + u_left.item*g_left.item + u_down.item*g_down.item + u_up.item*g_up.item
                + u_zout.item*g_zout.item + u_zin.item*g_zin.item
                + gamma*f_center.item*r) ) /
        (1.0 + DT*(g_right.item + g_left.item
                    + g_down.item + g_up.item 
                    + g_zout.item + g_zin.item + gamma));
    cncPut_u(uHandle, i, j, k, t, ctx);
    printf("put u at (%d,%d,%d)\n", (int)i,(int)j,(int)k);

    // Prescribe "checkConvergence" steps
    cncPrescribe_checkConvergence(i, j, k, t, ctx);
}

#undef SQR
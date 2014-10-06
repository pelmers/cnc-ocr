#include "Rician.h"

/*
 * typeof conv is int 
 */
void prescribeIteration(cncTag_t totalRows, cncTag_t totalColumns, cncTag_t totalDepth, cncTag_t t, convItem ***conv, RicianCtx *ctx) {

    //
    // INPUTS
    //

    { // Access "conv" inputs
        s64 _i, _j, _k;
        for (_i = 0; _i < ((totalRows)-(1)); _i++) {
            for (_j = 0; _j < ((totalColumns)-(1)); _j++) {
                for (_k = 0; _k < ((totalColumns)-(1)); _k++) {
                    /* TODO: Do something with conv[_i][_j][_k].item */
                }
            }
        }
    }


    //
    // OUTPUTS
    //

    { // Put "u0" items
        s64 _i, _j;
        for (_i = 0; _i < ((totalRows+1)-(0)); _i++) {
            for (_j = 0; _j < ((totalColumns+1)-(0)); _j++) {
                double *u0;
                cncHandle_t u0Handle = cncCreateItem_u(&u0);
                /* TODO: Initialize u0 */
                cncPut_u(u0Handle, _i, _j, 0, t, ctx);
            }
        }
    }

    { // Put "u1" items
        s64 _i, _j;
        for (_i = 0; _i < ((totalRows+1)-(0)); _i++) {
            for (_j = 0; _j < ((totalColumns+1)-(0)); _j++) {
                double *u1;
                cncHandle_t u1Handle = cncCreateItem_u(&u1);
                /* TODO: Initialize u1 */
                cncPut_u(u1Handle, _i, _j, totalDepth+1, t, ctx);
            }
        }
    }

    { // Put "u2" items
        s64 _j, _k;
        for (_j = 0; _j < ((totalColumns+1)-(0)); _j++) {
            for (_k = 0; _k < ((totalDepth+1)-(0)); _k++) {
                double *u2;
                cncHandle_t u2Handle = cncCreateItem_u(&u2);
                /* TODO: Initialize u2 */
                cncPut_u(u2Handle, 0, _j, _k, t, ctx);
            }
        }
    }

    { // Put "u3" items
        s64 _j;
        for (_j = 0; _j < ((totalColumns+1)-(0)); _j++) {
            double *u3;
            cncHandle_t u3Handle = cncCreateItem_u(&u3);
            /* TODO: Initialize u3 */
            cncPut_u(u3Handle, totalRows+1, _j, totalDepth+1, t, ctx);
        }
    }

    { // Put "u4" items
        s64 _i, _k;
        for (_i = 0; _i < ((totalRows+1)-(0)); _i++) {
            for (_k = 0; _k < ((totalDepth+1)-(0)); _k++) {
                double *u4;
                cncHandle_t u4Handle = cncCreateItem_u(&u4);
                /* TODO: Initialize u4 */
                cncPut_u(u4Handle, _i, 0, _k, t, ctx);
            }
        }
    }

    { // Put "u5" items
        s64 _i, _k;
        for (_i = 0; _i < ((totalRows+1)-(0)); _i++) {
            for (_k = 0; _k < ((totalDepth+1)-(0)); _k++) {
                double *u5;
                cncHandle_t u5Handle = cncCreateItem_u(&u5);
                /* TODO: Initialize u5 */
                cncPut_u(u5Handle, _i, totalColumns+1, _k, t, ctx);
            }
        }
    }

    { // Prescribe "gradientStep" steps
        s64 _i, _j, _k;
        for (_i = 0; _i < ((totalRows)-(1)); _i++) {
            for (_j = 0; _j < ((totalColumns)-(1)); _j++) {
                for (_k = 0; _k < ((totalDepth)-(1)); _k++) {
                    cncPrescribe_gradientStep(_i, _j, _k, t, ctx);
                }
            }
        }
    }


}
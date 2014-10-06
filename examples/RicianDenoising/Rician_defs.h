#ifndef _CNCOCR_RICIAN_TYPES_H_
#define _CNCOCR_RICIAN_TYPES_H_

typedef struct RicianArguments {
    /* TODO: Add struct members.
     * Use this struct to pass all arguments for
     * graph initialization. This should not contain any
     * pointers (unless you know you'll only be executing
     * in shared memory and thus passing pointers is safe).
     */
} RicianArgs;

// Structure to hold image data
typedef struct {
    s32 rows, cols, depth;
    float* f;
} ImageData;

#endif /*_CNCOCR_RICIAN_TYPES_H_*/
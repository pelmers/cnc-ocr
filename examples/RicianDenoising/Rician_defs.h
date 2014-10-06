#ifndef _CNCOCR_RICIAN_TYPES_H_
#define _CNCOCR_RICIAN_TYPES_H_

typedef struct RicianArguments {
    char* filename;
} RicianArgs;

// Structure to hold image data
typedef struct {
    s32 rows, cols, depth;
} ImageData;

#endif /*_CNCOCR_RICIAN_TYPES_H_*/
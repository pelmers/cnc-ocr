#include "Rician.h"

static FILE* open_file(const char *fileName) {
    FILE *f = fopen(fileName, "rb");
    CNC_REQUIRE(f, "Could not open file: %s\n", fileName);
    return f;
}

/**
 * Read binary img file to array of floats
 */
static void read_file(FILE* fileHandle, float* buffer, int M, int N, int P) {
    float Tmax = 8180.0;
    unsigned short* T_short = calloc(M*N*P, sizeof(unsigned short)); /* Allocate temporary work array */
    fread(T_short,sizeof(unsigned short),M*N*P,fileHandle);
    int i,j,k;
    for(i = 0; i < M; i++)
        for(j = 0; j < N; j++)
            for(k = 0; k < P; k++) {
                float t = (float)T_short[(i*N+j)*P+k] /Tmax*255.0f;
                buffer[(i*N+j)*P+k] = t;
            }
    fclose(fileHandle);
}

void Rician_init(RicianArgs *args, RicianCtx *ctx) {
    // local copy of context variables
    int M = ctx->imageData->rows;
    int N = ctx->imageData->cols;
    int P = ctx->imageData->depth;
    
    FILE *inputFile = open_file(args->filename);
    float* f = malloc(sizeof(float)*M*N*P);
    read_file(inputFile, f, M, N, P);
    printf("starting iteration\n");
    int i,j,k;
    for (i = 0; i < M; i++) {
        for (j = 0; j < N; j++) {
            for (k = 0; k < P; k++) {
                // put `false (0)` in all of conv[t=0]
                int* c;
                cncHandle_t cHandle = cncCreateItem_conv(&c);
                *c = 0;
                cncPut_conv(cHandle, i, j, k, 0, ctx);
                // put ctx->imageData->f in u[t=0]
                double* u;
                int index = (i*M+j)*N+k;
                cncHandle_t uHandle = cncCreateItem_u(&u);
                *u = f[index];
                cncPut_u(uHandle, i, j, k, 0, ctx);
            }
        }
        printf("row %d\n", i);
    }
    printf("prescribing\n");
    
    
    cncPrescribe_beginIteration(ctx->imageData->rows, ctx->imageData->cols, ctx->imageData->depth, 1, ctx);
    
    // Set finalizer function's tag
    Rician_await(ctx->imageData->rows, ctx->imageData->cols, ctx->imageData->depth, ctx->maxT, ctx);

}

/*
 * typeof X is int 
 * typeof Y is int 
 */
void Rician_finalize(cncTag_t maxRows, cncTag_t maxCols, cncTag_t maxDepth, cncTag_t maxIter,
                     uItem u, RicianCtx *ctx) {
    // Print results
    PRINTF("DONE\n");
}

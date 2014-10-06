#include "Rician.h"

static FILE* open_file(const char *fileName) {
    FILE *f = fopen(fileName, "r");
    CNC_REQUIRE(f, "Could not open file: %s\n", fileName);
    return f;
}

/**
 * Free double array allocated by read_file.
 */
static void free_data(float* data) {
    free(data);
}

/**
 * Read file and return an array of double arrays representing its data.
 * Write row and column counts to numRows and numColumns addresses.
 * Remember to free() the array at the end.
 */
static float* read_file(FILE* fileHandle, int* numRows, int* numColumns, int* depth) {
    *numRows = *numColumns = *depth = 256;
    int M, N, P;
    M = N = P = 256; // shorthand
    float Tmax = 8180.0;
    float* T = calloc(M*N*P, sizeof(float)); /* Allocate temporary work array */
    unsigned short* T_short = calloc(M*N*P, sizeof(unsigned short)); /* Allocate temporary work array */
    fread(T_short,sizeof(unsigned short),M*N*P,fileHandle);
    for(int i = 0; i < M; i++)
        for(int j = 0; j < N; j++)
            for(int k = 0; k < P; k++)
            {
                //      fread(&num, 2, 1, T_ptr);
                float t = (float)T_short[(i*N+j)*P+k] /Tmax*255.0f;
                T[(i*N+j)*P+k] = t;
            }
    fclose(fileHandle);
    return T;
}

ocrGuid_t mainEdt(u32 paramc, u64 paramv[], u32 depc, ocrEdtDep_t depv[]) {
    CNC_REQUIRE(OCR_MAIN_ARGC == 2, "Usage: %s inputFile\n", OCR_MAIN_ARGV(0));
    int numRows, numColumns, depth;
    FILE *inputFile = open_file(OCR_MAIN_ARGV(1));
    float* data = read_file(inputFile, &numRows, &numColumns, &depth);

    // Create a new graph context
    RicianCtx *context = Rician_create();
    setvbuf(stdout, NULL, _IONBF, 0); 

    // Exit when the graph execution completes
    CNC_SHUTDOWN_ON_FINISH(context);
    
    ImageData* iData = malloc(sizeof(ImageData));
    iData->rows = numRows;
    iData->depth = depth;
    iData->cols = numColumns;
    iData->f = data;
    RicianArgs args = {
	
    };
    
    // Launch the graph for execution
    Rician_launch(&args, context);
    
    // dealloc the data
    free_data(data);

    return NULL_GUID;
}
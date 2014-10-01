#include "Rician.h"

static FILE* open_file(const char *fileName) {
    FILE *f = fopen(fileName, "r");
    CNC_REQUIRE(f, "Could not open file: %s\n", fileName);
    return f;
}

/**
 * Free double array allocated by read_file.
 */
static void free_data(double** data, int numRows) {
    int i;
    for (i = 0; i < numRows; i++) {
	free(data[i]);
    }
    free(data);
}

/**
 * Read file and return an array of double arrays representing its data.
 * Write row and column counts to numRows and numColumns addresses.
 * Remember to free() the array at the end.
 */
static double** read_file(FILE* fileHandle, int* numRows, int* numColumns) {
    // the first line is in the form ROWS COLUMNS
    fscanf(fileHandle, "%d %d", numRows, numColumns);
    double** data = malloc(sizeof(double*) * (size_t) *numRows);
    int i, j;
    for (i = 0; i < *numRows; i++) {
        data[i] = malloc(sizeof(double) * (size_t) *numColumns);
        for (j = 0; j < *numColumns; j++) {
            fscanf(fileHandle, "%lf", &data[i][j]);
        }
    }
    fclose(fileHandle);
    return data;
}

ocrGuid_t mainEdt(u32 paramc, u64 paramv[], u32 depc, ocrEdtDep_t depv[]) {
    CNC_REQUIRE(OCR_MAIN_ARGC == 2, "Usage: %s inputFile\n", OCR_MAIN_ARGV(0));
    int numRows, numColumns;
    FILE *inputFile = open_file(OCR_MAIN_ARGV(1));
    double** data = read_file(inputFile, &numRows, &numColumns);

    // Create a new graph context
    RicianCtx *context = Rician_create();
    setvbuf(stdout, NULL, _IONBF, 0); 

    // Exit when the graph execution completes
    CNC_SHUTDOWN_ON_FINISH(context);
    
    RicianArgs args = {
	
    };
    
    // Launch the graph for execution
    Rician_launch(&args, context);
    
    // dealloc the data
    free_data(data, numRows);

    return NULL_GUID;
}
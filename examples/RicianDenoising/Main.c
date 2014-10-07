#include "Rician.h"

ocrGuid_t mainEdt(u32 paramc, u64 paramv[], u32 depc, ocrEdtDep_t depv[]) {
    setvbuf(stdout, NULL, _IONBF, 0); 
    CNC_REQUIRE(OCR_MAIN_ARGC == 5, "Usage: %s filename rows columns depth\n", OCR_MAIN_ARGV(0));
    int numRows = atoi(OCR_MAIN_ARGV(2));
    int numColumns = atoi(OCR_MAIN_ARGV(3));
    int depth = atoi(OCR_MAIN_ARGV(4));

    // Create a new graph context
    RicianCtx *context = Rician_create();

    // Exit when the graph execution completes
    CNC_SHUTDOWN_ON_FINISH(context);
    
    ImageData* iData = malloc(sizeof(ImageData));
    iData->cols = numColumns; iData->rows = numRows; iData->depth = depth;
    context->imageData = iData;
    context->maxT = 1;
    RicianArgs args = { OCR_MAIN_ARGV(1) };
    
    // Launch the graph for execution
    Rician_launch(&args, context);
    
    return NULL_GUID;
}
////////////////////////////////////////////////////////////////////////////////
// Author: Peter Elmers (peter.elmers@rice.edu)
////////////////////////////////////////////////////////////////////////////////

/* Rician denoising in CnC.
 * Port of Sagnak's version targeting habanero-C to cnc-ocr.
 */

[ int rowsOfTiles : i ];
//[ int columnsOfTiles: i ];
//[ int depthOfTiles : i ];
//[ int *padding : i ];

[ double* someFactorIJKT : i,j,k,t ];
//[ double* gradientIJKT : i,j,k,t ];
//[ double* imageTimesGradientIJKT : i,j,k,t ];
//[ double* imageIJKT : i,j,k,t ];

[ int X: i ];
[ int Y: () ];

( $init: () );

( paddingStep : t )
    <- [ rowsOfTiles : 0 ]
    -> [ someFactorIJKT : { 0..rowsOfTiles }, {0..columnsOfTiles }, k, t ];

( SX: x ) -> [ X: x+1 ];
( SY: y ) -> [ Y: () ];

( $finalize: () ) <- [ X: 2 ], [ Y: () ];


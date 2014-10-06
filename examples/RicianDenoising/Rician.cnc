////////////////////////////////////////////////////////////////////////////////
// Author: Peter Elmers (peter.elmers@rice.edu)
////////////////////////////////////////////////////////////////////////////////

/* Rician denoising in CnC.
 */

$context {
    int maxT;
    ImageData imageData;
}

[ double u : i,j,k,t ];
[ double g : i,j,k,t ];
[ int conv : i,j,k,t ];

[ int X: i ];
[ int Y: i ];

// Init sets u[i,j,k,0] and conv[t=0] and prescribes the first iteration t=1.
( $init: () );

// pad the edges and prescribe gradientStep
// if everything converges, finalize
( prescribeIteration : totalRows, totalColumns, totalDepth, t )
        // Make sure the last iteration completed
    <-  [ conv : {1..totalRows}, {1..totalColumns}, {1..totalColumns}, t - 1 ]
        // Picture u as a box:
        // then we need to add a layer to front and back, top and bottom, left and right
        // front and back
    ->  [ u : {0..totalRows+1}, {0..totalColumns+1}, 0, t],
        [ u : {0..totalRows+1}, {0..totalColumns+1}, totalDepth+1, t],
        // top and bottom
        [ u : 0, {0..totalColumns+1}, {0..totalDepth+1 }, t],
        [ u : totalRows+1, {0..totalColumns+1}, totalDepth+1, t],
        // left and right
        [ u : {0..totalRows+1}, 0, {0..totalDepth+1}, t],
        [ u : {0..totalRows+1}, totalColumns+1, {0..totalDepth+1}, t],
        ( gradientStep : {1..totalRows}, {1..totalColumns}, {1..totalDepth}, t );

// calculate gradient for each location and prescribe checkConvergence
( gradientStep : i,j,k,t )
        // gradient step needs i,j,k,t-1 and all of its neighbors
    <-  [ u : i,j,k,t-1 ],
        [ u : i+1,j,k,t-1 ], // UP
        [ u : i-1,j,k,t-1 ], // DOWN
        [ u : i,j+1,k,t-1 ], // RIGHT
        [ u : i,j-1,k,t-1 ], // LEFT
        [ u : i,j,k+1,t-1 ], // ZOUT
        [ u : i,j,k-1,t-1 ]  // ZIN
    ->  [ g : i,j,k,t ],
        ( updateStep : i,j,k,t );

// update u by adding approximation of gradient * dt
( updateStep : i,j,k,t )
    <-  [ u : i,j,k,t-1 ],
        [ u : i+1,j,k,t-1 ], // UP
        [ u : i-1,j,k,t-1 ], // DOWN
        [ u : i,j+1,k,t-1 ], // RIGHT
        [ u : i,j-1,k,t-1 ], // LEFT
        [ u : i,j,k+1,t-1 ], // ZOUT
        [ u : i,j,k-1,t-1 ], // ZIN
        
        [ g : i,j,k,t ],
        [ g : i+1,j,k,t ],   // UP
        [ g : i-1,j,k,t ],   // DOWN
        [ g : i,j+1,k,t ],   // RIGHT
        [ g : i,j-1,k,t ],   // LEFT
        [ g : i,j,k+1,t ],   // ZOUT
        [ g : i,j,k-1,t ]    // ZIN
    ->  [ u : i,j,k,t ],
        ( checkConvergence : i,j,k,t );

// check convergence on each location
( checkConvergence : i,j,k,t )
    <-  [ u : i,j,k,t-1 ],
        [ u : i,j,k,t ]
    ->  [ conv : i,j,k,t ];

( SX: x )
    -> [ X: x+1 ], ( SY: x-1 );
    
( SY: y )
    <- [ X: 2 ]
    -> [ Y: y+1 ];

( $finalize: () ) <- [ X: 2 ], [ Y: 3 ];


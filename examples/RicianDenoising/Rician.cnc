////////////////////////////////////////////////////////////////////////////////
// Author: Peter Elmers (peter.elmers@rice.edu)
////////////////////////////////////////////////////////////////////////////////

/* Rician denoising in CnC.
 */

$context {
    int maxT;
    ImageData* imageData;
};

[ double u : i,j,k,t ];
[ double g : i,j,k,t ];
[ int conv : i,j,k,t ];

// Init sets u[t=0] and conv[t=0] and prescribes the first iteration t=1.
( $init: () );

// Pad the edges and prescribe gradientStep
// if everything converges, finalize
( beginIteration : totalRows, totalColumns, totalDepth, t )
        // Make sure the last iteration completed
    //<-  [ conv : {1..totalRows-2}, {1..totalColumns-2}, {1..totalDepth-2}, t - 1 ]
        // Pad borders of u and g
    ->  ( paddingStep : totalRows, totalColumns, totalDepth, t ),
        // compute gradient at each internal point
        ( gradientStep : {1..totalRows-2}, {1..totalColumns-2}, {1..totalDepth-2}, t ),
        // prescribe the next iteration
        ( beginIteration : totalRows, totalColumns, totalDepth, t+1 );
        
// pad the outside of the u and g boxes
( paddingStep : M, N, P, t )
        // front-back, then bottom-top, then left-right
    ->  [ u : {0..M-1}, {0..N-1}, 0, t ], [ u : {0..M-1}, {0..N-1}, P-1, t ],
        [ u : {0..M-1}, 0, {1..P-2}, t ], [ u : {0..M-1}, N-1, {1..P-2}, t ],
        [ u : 0, {1..N-2}, {1..P-2}, t ], [ u : M-1, {1..N-2}, {1..P-2}, t ],
        // do the same for g
        [ g : {0..M-1}, {0..N-1}, 0, t ], [ g : {0..M-1}, {0..N-1}, P-1, t ],
        [ g : {0..M-1}, 0, {1..P-2}, t ], [ g : {0..M-1}, N-1, {1..P-2}, t ],
        [ g : 0, {1..N-2}, {1..P-2}, t ], [ g : M-1, {1..N-2}, {1..P-2}, t ];

// Calculate gradient for each location
( gradientStep : i,j,k,t )
        // gradient step needs i,j,k,t-1 and all of its neighbors
    <-  [ center @ u : i,  j,  k,  t-1 ],
        [ up @ u     : i+1,j,  k,  t-1 ],
        [ down @ u   : i-1,j,  k,  t-1 ],
        [ right @ u  : i,  j+1,k,  t-1 ],
        [ left @ u   : i,  j-1,k,  t-1 ],
        [ zout @ u   : i,  j,  k+1,t-1 ],
        [ zin @ u    : i,  j,  k-1,t-1 ]
    ->  [ g : i,j,k,t ],
        ( updateStep : i,j,k,t );

// Update u by adding approximation of gradient * dt
( updateStep : i,j,k,t )
    <-  [ f_center @ u : i,  j,  k,  0 ],
        [ u_center @ u : i,  j,  k,  t-1 ],
        [ u_up @ u     : i+1,j,  k,  t-1 ],
        [ u_down @ u   : i-1,j,  k,  t-1 ],
        [ u_right @ u  : i,  j+1,k,  t-1 ],
        [ u_left @ u   : i,  j-1,k,  t-1 ],
        [ u_zout @ u   : i,  j,  k+1,t-1 ],
        [ u_zin @ u    : i,  j,  k-1,t-1 ],
        
        [ g_center @ g : i,  j,  k,  t ],
        [ g_up @ g     : i+1,j,  k,  t ],
        [ g_down @ g   : i-1,j,  k,  t ],
        [ g_right @ g  : i,  j+1,k,  t ],
        [ g_left @ g   : i,  j-1,k,  t ],
        [ g_zout @ g   : i,  j,  k+1,t ],
        [ g_zin @ g    : i,  j,  k-1,t ]
    ->  [ u : i,j,k,t ],
        ( checkConvergence : i,j,k,t );

// Check convergence on each location
( checkConvergence : i,j,k,t )
    <-  [ u_prev @ u : i,j,k,t-1 ],
        [ u_new @ u : i,j,k,t ]
    ->  [ conv : i,j,k,t ];

( $finalize: totalRows, totalColumns, totalDepth, maxIter )
    <-  [ u : totalRows-2, totalColumns-2, totalDepth-2, maxIter ];

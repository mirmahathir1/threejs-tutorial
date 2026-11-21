// Fundamentals with animation
// Source: https://threejs.org/manual/#fundamentals
// Local: http://localhost:5173/threejsmanual/11_fundamentals/2_rotating_cube/

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

  const material = new THREE.MeshBasicMaterial( { color: 0x44aa88 } ); // greenish blue

  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  // Let's animate it spinning and hopefully that will make it clear it's being
  // drawn in 3D. To animate it we'll render inside a render loop using
  // requestAnimationFrame
  // (https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).
  //
  // Here's our loop
  //
  // requestAnimationFrame is a request to the browser that you want to animate
  // something. You pass it a function to be called. In our case that function
  // is render. The browser will call your function and if you update anything
  // related to the display of the page the browser will re-render the page. In
  // our case we are calling three's renderer.render function which will draw
  // our scene.

  function render( time ) {

    // requestAnimationFrame passes the time since the page loaded to our
    // function. That time is passed in milliseconds. I find it's much easier
    // to work with seconds so here we're converting that to seconds.

    time *= 0.001; // convert time to seconds

    // We then set the cube's X and Y rotation to the current time. These
    // rotations are in radians (https://en.wikipedia.org/wiki/Radian). There
    // are 2 pi radians in a circle so our cube should turn around once on each
    // axis in about 6.28 seconds.

    cube.rotation.x = time;
    cube.rotation.y = time;

    // We then render the scene and request another animation frame to
    // continue our loop.

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  // Outside the loop we call requestAnimationFrame one time to start the loop.

  requestAnimationFrame( render );

}

main();

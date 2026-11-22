// Responsive
// Source: https://threejs.org/manual/#responsive
// Local: http://localhost:5173/threejsmanual/12_responsive/3_fix_blockiness/

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

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( - 1, 2, 4 );
    scene.add( light );

  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

  function makeInstance( geometry, color, x ) {

    const material = new THREE.MeshPhongMaterial( { color } );

    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    cube.position.x = x;

    return cube;

  }

  const cubes = [
    makeInstance( geometry, 0x44aa88, 0 ),
    makeInstance( geometry, 0x8844aa, - 2 ),
    makeInstance( geometry, 0xaa8844, 2 ),
  ];

  // Now let's fix the blockiness.
  //
  // Canvas elements have 2 sizes. One size is the size the canvas is
  // displayed on the page. That's what we set with CSS. The other size is the
  // number of pixels in the canvas itself. This is no different than an image.
  // For example we might have a 128x64 pixel image and using CSS we might
  // display as 400x200 pixels.
  //
  //   <img src="some128x64image.jpg" style="width:400px; height:200px">
  //
  // A canvas's internal size, its resolution, is often called its
  // drawingbuffer size. In three.js we can set the canvas's drawingbuffer size
  // by calling renderer.setSize. What size should we pick? The most obvious
  // answer is "the same size the canvas is displayed". Again, to do that we
  // can look at the canvas's clientWidth and clientHeight properties.
  //
  // Let's write a function that checks if the renderer's canvas is not already
  // the size it is being displayed as and if so set its size.

  function resizeRendererToDisplaySize( renderer ) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    // Notice we check if the canvas actually needs to be resized. Resizing the
    // canvas is an interesting part of the canvas spec and it's best not to
    // set the same size if it's already the size we want.
    //
    // Once we know if we need to resize or not we then call renderer.setSize
    // and pass in the new width and height. It's important to pass false at
    // the end. renderer.setSize by default sets the canvas's CSS size but doing
    // so is not what we want. We want the browser to continue to work how it
    // does for all other elements which is to use CSS to determine the display
    // size of the element. We don't want canvases used by three to be
    // different than other elements.

    if ( needResize ) {

      renderer.setSize( width, height, false );

    }

    return needResize;

  }

  // Note that our function returns true if the canvas was resized. We can use
  // this to check if there are other things we should update. Let's modify our
  // render loop to use the new function

  function render( time ) {

    time *= 0.001;

    // Since the aspect is only going to change if the canvas's display size
    // changed we only set the camera's aspect if resizeRendererToDisplaySize
    // returns true.

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    cubes.forEach( ( cube, ndx ) => {

      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// It should now render with a resolution that matches the display size of the
// canvas.

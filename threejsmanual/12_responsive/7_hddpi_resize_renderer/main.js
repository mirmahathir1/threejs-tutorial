// Responsive HD-DPI
// Source: https://threejs.org/manual/#responsive
// Local: http://localhost:5173/threejsmanual/12_responsive/7_hddpi_resize_renderer/

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

  // The other way is to do it yourself when you resize the canvas.

  function resizeRendererToDisplaySize( renderer ) {

    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor( canvas.clientWidth * pixelRatio );
    const height = Math.floor( canvas.clientHeight * pixelRatio );
    const needResize = canvas.width !== width || canvas.height !== height;
    if ( needResize ) {

      renderer.setSize( width, height, false );

    }

    return needResize;

  }

  // This second way is objectively better. Why? Because it means I get what I
  // ask for. There are many cases when using three.js where we need to know the
  // actual size of the canvas's drawingBuffer. For example when making a post
  // processing filter, or if we are making a shader that accesses
  // gl_FragCoord, if we are making a screenshot, or reading pixels for GPU
  // picking, for drawing into a 2D canvas, etc... There are many cases where if
  // we use setPixelRatio then our actual size will be different than the size
  // we requested and we'll have to guess when to use the size we asked for and
  // when to use the size three.js is actually using. By doing it ourselves we
  // always know the size being used is the size we requested. There is no
  // special case where magic is happening behind the scenes.

  function render( time ) {

    time *= 0.001;

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

// Here's an example using the code above.
//
// It might be hard to see the difference but if you have an HD-DPI display and
// you compare this sample to those above you should notice the edges are more
// crisp.

// Handling HD-DPI displays
// Source: https://threejs.org/manual/#responsive
// Local: http://localhost:5173/threejsmanual/12_responsive/6_hddpi_setpixel/
//
// HD-DPI stands for high-density dot per inch displays. That's most Macs
// nowadays and many Windows machines as well as pretty much all smartphones.
//
// The way this works in the browser is they use CSS pixels to set the sizes
// which are supposed to be the same regardless of how high res the display is.
// The browser will just render text with more detail but the same physical
// size.
//
// There are various ways to handle HD-DPI with three.js.
//
// The first one is just not to do anything special. This is arguably the most
// common. Rendering 3D graphics takes a lot of GPU processing power. Mobile
// GPUs have less power than desktops, at least as of 2018, and yet mobile
// phones often have very high resolution displays. The current top of the line
// phones have an HD-DPI ratio of 3x meaning for every one pixel from a
// non-HD-DPI display those phones have 9 pixels. That means they have to do 9x
// the rendering.
//
// Computing 9x the pixels is a lot of work so if we just leave the code as it
// is we'll compute 1x the pixels and the browser will just draw it at 3x the
// size (3x by 3x = 9x pixels).
//
// For any heavy three.js app that's probably what you want otherwise you're
// likely to get a slow framerate.
//
// That said if you actually do want to render at the resolution of the device
// there are a couple of ways to do this in three.js.

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  // One is to tell three.js a resolution multiplier using
  // renderer.setPixelRatio. You ask the browser what the multiplier is from
  // CSS pixels to device pixels and pass that to three.js

  renderer.setPixelRatio( window.devicePixelRatio );

  // After that any calls to renderer.setSize will magically use the size you
  // request multiplied by whatever pixel ratio you passed in. This is strongly
  // NOT RECOMMENDED. See below

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

  function resizeRendererToDisplaySize( renderer ) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if ( needResize ) {

      renderer.setSize( width, height, false );

    }

    return needResize;

  }

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

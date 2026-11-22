// Responsive no resize
// Source: https://threejs.org/manual/#responsive
// Local: http://localhost:5173/threejsmanual/12_responsive/1_basic/
//
// This is the second article in a series of articles about three.js. The
// first article was about fundamentals
// (https://threejs.org/manual/#fundamentals). If you haven't read that yet you
// might want to start there.
//
// This article is about how to make your three.js app be responsive to any
// situation. Making a webpage responsive generally refers to the page
// displaying well on different sized displays from desktops to tablets to
// phones.
//
// For three.js there are even more situations to consider. For example, a 3D
// editor with controls on the left, right, top, or bottom is something we
// might want to handle. A live diagram in the middle of a document is another
// example.
//
// The last sample we had used a plain canvas with no CSS and no size
//
// That canvas defaults to 300x150 CSS pixels in size.
//
// In the web platform the recommended way to set the size of something is to
// use CSS.
//
// Let's make the canvas fill the page by adding CSS
//
// In HTML the body has a margin of 5 pixels by default so setting the margin
// to 0 removes the margin. Setting the html and body height to 100% makes them
// fill the window. Otherwise they are only as large as the content that fills
// them.
//
// Next we tell the id=c element to be 100% the size of its container which in
// this case is the body of the document.
//
// Finally we set its display mode to block. A canvas's default display mode is
// inline. Inline elements can end up adding whitespace to what is displayed.
// By setting the canvas to block that issue goes away.

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

  function render( time ) {

    time *= 0.001;

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

// Here's the result
//
// You can see the canvas is now filling the page but there are 2 problems. One
// our cubes are stretched. They are not cubes they are more like boxes. Too
// tall or too wide. Open the example in its own window and resize it. You'll
// see how the cubes get stretched wide and tall.
//
// The second problem is they look low resolution or blocky and blurry. Stretch
// the window really large and you'll really see the issue.

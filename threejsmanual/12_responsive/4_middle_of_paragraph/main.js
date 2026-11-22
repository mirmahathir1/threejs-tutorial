// Responsive in Paragraph
// Source: https://threejs.org/manual/#responsive
// Local: http://localhost:5173/threejsmanual/12_responsive/4_middle_of_paragraph/
//
// To make the point about letting CSS handle the resizing let's take our code
// and put it in a separate .js file
// (https://threejs.org/manual/examples/threejs-responsive.js). Here then are a
// few more examples where we let CSS choose the size and notice we had to
// change zero code for them to work.
//
// Let's put our cubes in the middle of a paragraph of text.

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

// Fundamentals 3 cubes
// Source: https://threejs.org/manual/#fundamentals
// Local: http://localhost:5173/threejsmanual/11_fundamentals/4_three_cubes/

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

  // Just for the fun of it let's add 2 more cubes.
  //
  // We'll use the same geometry for each cube but make a different material so
  // each cube can be a different color.
  //
  // First we'll make a function that creates a new material with the
  // specified color. Then it creates a mesh using the specified geometry and
  // adds it to the scene and sets its X position.

  function makeInstance( geometry, color, x ) {

    const material = new THREE.MeshPhongMaterial( { color } );

    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    cube.position.x = x;

    return cube;

  }

  // Then we'll call it 3 times with 3 different colors and X positions saving
  // the Mesh instances in an array.

  const cubes = [
    makeInstance( geometry, 0x44aa88, 0 ),
    makeInstance( geometry, 0x8844aa, - 2 ),
    makeInstance( geometry, 0xaa8844, 2 ),
  ];

  // Finally we'll spin all 3 cubes in our render function. We compute a
  // slightly different rotation for each one.

  function render( time ) {

    time *= 0.001; // convert time to seconds

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

// and here's that.
//
// If you compare it to the top down diagram above you can see it matches our
// expectations. With cubes at X = -2 and X = +2 they are partially outside our
// frustum. They are also somewhat exaggeratedly warped since the field of view
// across the canvas is so extreme.
//
// Our program now has this structure
//
// As you can see we have 3 Mesh objects each referencing the same
// BoxGeometry. Each Mesh references a unique MeshPhongMaterial so that each
// cube can have a different color.
//
// I hope this short intro helps to get things started. Next up we'll cover
// making our code responsive so it is adaptable to multiple situations
// (https://threejs.org/manual/#responsive).

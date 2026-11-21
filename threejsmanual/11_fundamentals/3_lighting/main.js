// Fundamentals with light
// Source: https://threejs.org/manual/#fundamentals
// Local: http://localhost:5173/threejsmanual/11_fundamentals/3_lighting/

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

  // It's a little better but it's still hard to see the 3d. What would help is
  // to add some lighting so let's add a light. There are many kinds of lights
  // in three.js which we'll go over in a future article
  // (https://threejs.org/manual/#lights). For now let's create a directional
  // light.

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( - 1, 2, 4 );
    scene.add( light );

  }

  // Directional lights have a position and a target. Both default to 0, 0, 0.
  // In our case we're setting the light's position to -1, 2, 4 so it's
  // slightly on the left, above, and behind our camera. The target is still
  // 0, 0, 0 so it will shine toward the origin.

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

  // We also need to change the material. The MeshBasicMaterial is not affected
  // by lights. Let's change it to a MeshPhongMaterial which is affected by
  // lights.

  const material = new THREE.MeshPhongMaterial( { color: 0x44aa88 } ); // greenish blue

  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  function render( time ) {

    time *= 0.001; // convert time to seconds

    cube.rotation.x = time;
    cube.rotation.y = time;

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// Here is our new program structure
//
// And here it is working.
//
// It should now be pretty clearly 3D.

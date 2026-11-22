// Textures - Six Textures
// Source: https://threejs.org/manual/#textures
// Local: http://localhost:5173/threejsmanual/16_textures/2_six_textures/
//
// 6 Textures, a different one on each face of a cube
//
// How about 6 textures, one on each face of a cube?
// (https://threejs.org/manual/examples/resources/images/flower-1.jpg)
// (https://threejs.org/manual/examples/resources/images/flower-2.jpg)
// (https://threejs.org/manual/examples/resources/images/flower-3.jpg)
// (https://threejs.org/manual/examples/resources/images/flower-4.jpg)
// (https://threejs.org/manual/examples/resources/images/flower-5.jpg)
// (https://threejs.org/manual/examples/resources/images/flower-6.jpg)

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

  const cubes = []; // just an array we can use to rotate the cubes
  const loader = new THREE.TextureLoader();

  // We just make 6 materials and pass them as an array when we create the Mesh

  const materials = [
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-1.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-2.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-3.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-4.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-5.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-6.jpg' ) } ),
  ];
  const cube = new THREE.Mesh( geometry, materials );
  scene.add( cube );
  cubes.push( cube ); // add to our list of cubes to rotate

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

  function loadColorTexture( path ) {

    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;

  }

  function render( time ) {

    time *= 0.001;

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    cubes.forEach( ( cube, ndx ) => {

      const speed = .2 + ndx * .1;
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

// It works!
//
// It should be noted though that not all geometry types supports multiple
// materials. BoxGeometry can use 6 materials one for each face. ConeGeometry
// can use 2 materials, one for the bottom and one for the cone.
// CylinderGeometry can use 3 materials, bottom, top, and side. For other cases
// you will need to build or load custom geometry and/or modify texture
// coordinates.
//
// It's far more common in other 3D engines and far more performant to use a
// Texture Atlas (https://en.wikipedia.org/wiki/Texture_atlas) if you want to
// allow multiple images on a single geometry. A Texture atlas is where you put
// multiple images in a single texture and then use texture coordinates on the
// vertices of your geometry to select which parts of a texture are used on
// each triangle in your geometry.
//
// What are texture coordinates? They are data added to each vertex of a piece
// of geometry that specify what part of the texture corresponds to that
// specific vertex. We'll go over them when we start building custom geometry
// (https://threejs.org/manual/#custom-buffergeometry).

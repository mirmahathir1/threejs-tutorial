// Textures - Hello Texture
// Source: https://threejs.org/manual/#textures
// Local: http://localhost:5173/threejsmanual/16_textures/1_hello_texture/
//
// This article is one in a series of articles about three.js. The first
// article was about three.js fundamentals
// (https://threejs.org/manual/#fundamentals). The previous article
// (https://threejs.org/manual/#setup) was about setting up for this article.
// If you haven't read that yet you might want to start there.
//
// Textures are a kind of large topic in Three.js and I'm not 100% sure at what
// level to explain them but I will try. There are many topics and many of them
// interrelate so it's hard to explain them all at once. Here's quick table of
// contents for this article.
//
//   - Hello Texture
//   - 6 textures, a different one on each face of a cube
//   - Loading textures
//     - The easy way
//     - Waiting for a texture to load
//     - Waiting for multiple textures to load
//     - Loading textures from other origins
//   - Memory usage
//   - JPG vs PNG
//   - Filtering and mips
//   - Repeating, offseting, rotating, wrapping
//
// Hello Texture
//
// Textures are generally images that are most often created in some 3rd party
// program like Photoshop or GIMP. For example let's put this image on cube.
// (https://threejs.org/manual/examples/resources/images/wall.jpg)

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

  // We'll modify one of our first samples. All we need to do is create a
  // TextureLoader. Call its load method with the URL of an image and set the
  // material's map property to the result instead of setting its color.

  const loader = new THREE.TextureLoader();

  const texture = loader.load( '../resources/images/wall.jpg' );
  texture.colorSpace = THREE.SRGBColorSpace;

  // Note that we're using MeshBasicMaterial so no need for any lights.

  const material = new THREE.MeshBasicMaterial( {
    map: texture
  } );
  const cube = new THREE.Mesh( geometry, material );
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

// Textures - Loading Multiple Textures
// Source: https://threejs.org/manual/#textures
// Local: http://localhost:5173/threejsmanual/16_textures/3_loading_multiple_textures/
//
// Loading Textures
//
// The Easy Way
//
// Most of the code on this site uses the easiest method of loading textures.
// We create a TextureLoader and then call its load method. This returns a
// Texture object.
//
//   const texture = loader.load('resources/images/flower-1.jpg');
//
// It's important to note that using this method our texture will be
// transparent until the image is loaded asynchronously by three.js at which
// point it will update the texture with the downloaded image.
//
// This has the big advantage that we don't have to wait for the texture to load
// and our page will start rendering immediately. That's probably okay for a
// great many use cases but if we want we can ask three.js to tell us when the
// texture has finished downloading.
//
// Waiting for a texture to load
//
// To wait for a texture to load the load method of the texture loader takes a
// callback that will be called when the texture has finished loading. Going
// back to our top example we can wait for the texture to load before creating
// our Mesh and adding it to scene like this
//
//   const loader = new THREE.TextureLoader();
//   loader.load('resources/images/wall.jpg', (texture) => {
//     texture.colorSpace = THREE.SRGBColorSpace;
//     const material = new THREE.MeshBasicMaterial({
//       map: texture,
//     });
//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);
//     cubes.push(cube);  // add to our list of cubes to rotate
//   });
//
// Unless you clear your browser's cache and have a slow connection you're
// unlikely to see the any difference but rest assured it is waiting for the
// texture to load.
//
// Waiting for multiple textures to load

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

  // To wait until all textures have loaded you can use a LoadingManager. Create
  // one and pass it to the TextureLoader then set its onLoad property to a
  // callback.

  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader( loadManager );

  const materials = [
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-1.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-2.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-3.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-4.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-5.jpg' ) } ),
    new THREE.MeshBasicMaterial( { map: loadColorTexture( '../resources/images/flower-6.jpg' ) } ),
  ];

  // The LoadingManager also has an onProgress property we can set to another
  // callback to show a progress indicator.
  //
  // Then in the code we'll update the scale of the progressbar in our
  // onProgress callback. It gets called with the URL of the last item loaded,
  // the number of items loaded so far, and the total number of items loaded.

  const loadingElem = document.querySelector( '#loading' );
  const progressBarElem = loadingElem.querySelector( '.progressbar' );

  loadManager.onLoad = () => {

    loadingElem.style.display = 'none';
    const cube = new THREE.Mesh( geometry, materials );
    scene.add( cube );
    cubes.push( cube ); // add to our list of cubes to rotate

  };

  loadManager.onProgress = ( urlOfLastItemLoaded, itemsLoaded, itemsTotal ) => {

    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;

  };

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

// Unless you clear your cache and have a slow connection you might not see the
// loading bar.
//
// Loading textures from other origins
//
// To use images from other servers those servers need to send the correct
// headers. If they don't you cannot use the images in three.js and will get an
// error. If you run the server providing the images make sure it sends the
// correct headers (https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). If
// you don't control the server hosting the images and it does not send the
// permission headers then you can't use the images from that server.
//
// For example imgur (https://imgur.com), flickr (https://flickr.com), and
// github (https://github.com) all send headers allowing you to use images
// hosted on their servers in three.js. Most other websites do not.

// Textures - Repeating, Offsetting, Rotating
// Source: https://threejs.org/manual/#textures
// Local: http://localhost:5173/threejsmanual/16_textures/5_repeating_offsetting_rotating/
//
// Repeating, offseting, rotating, wrapping a texture
//
// Textures have settings for repeating, offseting, and rotating a texture.
//
// By default textures in three.js do not repeat. To set whether or not a
// texture repeats there are 2 properties, wrapS for horizontal wrapping and
// wrapT for vertical wrapping.
//
// They can be set to one of:
//
//   - THREE.ClampToEdgeWrapping
//     the last pixel on each edge is repeated forever
//   - THREE.RepeatWrapping
//     the texture is repeated
//   - THREE.MirroredRepeatWrapping
//     the texture is mirrored and repeated
//
// For example to turn on wrapping in both directions:
//
//   someTexture.wrapS = THREE.RepeatWrapping;
//   someTexture.wrapT = THREE.RepeatWrapping;
//
// Repeating is set with the [repeat] repeat property.
//
//   const timesToRepeatHorizontally = 4;
//   const timesToRepeatVertically = 2;
//   someTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
//
// Offseting the texture can be done by setting the offset property. Textures
// are offset with units where 1 unit = 1 texture size. On other words 0 = no
// offset and 1 = offset one full texture amount.
//
//   const xOffset = .5;   // offset by half the texture
//   const yOffset = .25;  // offset by 1/4 the texture
//   someTexture.offset.set(xOffset, yOffset);
//
// Rotating the texture can be set by setting the rotation property in radians
// as well as the center property for choosing the center of rotation. It
// defaults to 0,0 which rotates from the bottom left corner. Like offset these
// units are in texture size so setting them to .5, .5 would rotate around the
// center of the texture.
//
//   someTexture.center.set(.5, .5);
//   someTexture.rotation = THREE.MathUtils.degToRad(45);
//
// Let's modify the top sample above to play with these values
//
// Then we'll use lil-gui (https://github.com/georgealways/lil-gui) again to
// provide a simple interface.

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

  // First we'll keep a reference to the texture so we can manipulate it

  const texture = loader.load( '../resources/images/wall.jpg' );
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial( {
    map: texture,
  } );
  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cubes.push( cube ); // add to our list of cubes to rotate

  // As we did in previous lil-gui examples we'll use a simple class to give
  // lil-gui an object that it can manipulate in degrees but that will set a
  // property in radians.

  class DegRadHelper {

    constructor( obj, prop ) {

      this.obj = obj;
      this.prop = prop;

    }
    get value() {

      return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );

    }
    set value( v ) {

      this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );

    }

  }

  // We also need a class that will convert from a string like "123" into a
  // number like 123 since three.js requires numbers for enum settings like
  // wrapS and wrapT but lil-gui only uses strings for enums.

  class StringToNumberHelper {

    constructor( obj, prop ) {

      this.obj = obj;
      this.prop = prop;

    }
    get value() {

      return this.obj[ this.prop ];

    }
    set value( v ) {

      this.obj[ this.prop ] = parseFloat( v );

    }

  }

  // Using those classes we can setup a simple GUI for the settings above

  const wrapModes = {
    'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
    'RepeatWrapping': THREE.RepeatWrapping,
    'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
  };

  // The last thing to note about the example is that if you change wrapS or
  // wrapT on the texture you must also set texture.needsUpdate so three.js
  // knows to apply those settings. The other settings are automatically
  // applied.

  function updateTexture() {

    texture.needsUpdate = true;

  }

  const gui = new GUI();
  gui.add( new StringToNumberHelper( texture, 'wrapS' ), 'value', wrapModes )
    .name( 'texture.wrapS' )
    .onChange( updateTexture );
  gui.add( new StringToNumberHelper( texture, 'wrapT' ), 'value', wrapModes )
    .name( 'texture.wrapT' )
    .onChange( updateTexture );
  gui.add( texture.repeat, 'x', 0, 5, .01 ).name( 'texture.repeat.x' );
  gui.add( texture.repeat, 'y', 0, 5, .01 ).name( 'texture.repeat.y' );
  gui.add( texture.offset, 'x', - 2, 2, .01 ).name( 'texture.offset.x' );
  gui.add( texture.offset, 'y', - 2, 2, .01 ).name( 'texture.offset.y' );
  gui.add( texture.center, 'x', - .5, 1.5, .01 ).name( 'texture.center.x' );
  gui.add( texture.center, 'y', - .5, 1.5, .01 ).name( 'texture.center.y' );
  gui.add( new DegRadHelper( texture, 'rotation' ), 'value', - 360, 360 )
    .name( 'texture.rotation' );

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

// This is only one step into the topic of textures. At some point we'll go
// over texture coordinates as well as 9 other types of textures that can be
// applied to materials.
//
// For now let's move on to lights (https://threejs.org/manual/#lights).

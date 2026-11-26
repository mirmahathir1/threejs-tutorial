// Lights - AmbientLight
// Source: https://threejs.org/manual/#lights
// Local: http://localhost:5173/threejsmanual/17_lights/1_ambient_light/
//
// This article is part of a series of articles about three.js. The first
// article is three.js fundamentals (https://threejs.org/manual/#fundamentals).
// If you haven't read that yet and you're new to three.js you might want to
// consider starting there and also the article on setting up your environment
// (https://threejs.org/manual/#setup). The previous article was about textures
// (https://threejs.org/manual/#textures).
//
// Let's go over how to use the various kinds of lights in three.

// Next let's add OrbitControls. OrbitControls let the user spin or orbit the
// camera around some point. The OrbitControls are an optional feature of
// three.js so first we need to include them in our page

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import checkerUrl from '../resources/images/checker.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  // Starting with one of our previous samples let's update the camera. We'll
  // set the field of view to 45 degrees, the far plane to 100 units, and we'll
  // move the camera 10 units up and 20 units back from the origin

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 10, 20 );

  // Then we can use them. We pass the OrbitControls a camera to control and the
  // DOM element to use to get input events

  const controls = new OrbitControls( camera, canvas );
  controls.target.set( 0, 5, 0 );
  controls.update();

  // We also set the target to orbit around to 5 units above the origin and then
  // call controls.update so the controls will use the new target.

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 'black' );

  // Next up let's make some things to light up. First we'll make ground plane.
  // We'll apply a tiny 2x2 pixel checkerboard texture that looks like this
  // (https://threejs.org/manual/examples/resources/images/checker.png)

  {

    // First we load the texture, set it to repeating, set the filtering to
    // nearest, and set how many times we want it to repeat. Since the texture
    // is a 2x2 pixel checkerboard, by repeating and setting the repeat to half
    // the size of the plane each check on the checkerboard will be exactly 1
    // unit large;

    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load( checkerUrl );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set( repeats, repeats );

    // We then make a plane geometry, a material for the plane, and a mesh to
    // insert it in the scene. Planes default to being in the XY plane but the
    // ground is in the XZ plane so we rotate it.

    const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
    const planeMat = new THREE.MeshPhongMaterial( {
      map: texture,
      side: THREE.DoubleSide,
    } );
    const mesh = new THREE.Mesh( planeGeo, planeMat );
    mesh.rotation.x = Math.PI * - .5;
    scene.add( mesh );

  }

  // Let's add a cube and a sphere so we have 3 things to light including the
  // plane

  {

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
    const mesh = new THREE.Mesh( cubeGeo, cubeMat );
    mesh.position.set( cubeSize + 1, cubeSize / 2, 0 );
    scene.add( mesh );

  }

  {

    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
    const sphereMat = new THREE.MeshPhongMaterial( { color: '#CA8' } );
    const mesh = new THREE.Mesh( sphereGeo, sphereMat );
    mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
    scene.add( mesh );

  }

  // Now that we have a scene to light up let's add lights!
  //
  // AmbientLight
  //
  // Let's also make it so we can adjust the light's parameters. We'll use
  // lil-gui (https://github.com/georgealways/lil-gui) again. To be able to
  // adjust the color via lil-gui we need a small helper that presents a
  // property to lil-gui that looks like a CSS hex color string (eg: #FF8844).
  // Our helper will get the color from a named property, convert it to a hex
  // string to offer to lil-gui. When lil-gui tries to set the helper's property
  // we'll assign the result back to the light's color.
  //
  // Here's the helper:

  class ColorGUIHelper {

    constructor( object, prop ) {

      this.object = object;
      this.prop = prop;

    }
    get value() {

      return '#' + this.object[ this.prop ].getHexString();

    }
    set value( hexString ) {

      this.object[ this.prop ].set( hexString );

    }

  }

  {

    // First let's make an AmbientLight

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight( color, intensity );
    scene.add( light );

    // And here's our code setting up lil-gui

    const gui = new GUI();
    gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
    gui.add( light, 'intensity', 0, 5, 0.01 );

  }

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

  function render() {

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// Click and drag in the scene to orbit the camera.
//
// Notice there is no definition. The shapes are flat. The AmbientLight
// effectively just multiplies the material's color by the light's color times
// the intensity.
//
//   color = materialColor * light.color * light.intensity;
//
// That's it. It has no direction. This style of ambient lighting is actually
// not all that useful as lighting as it's 100% even so other than changing the
// color of everything in the scene it doesn't look much like lighting. What it
// does help with is making the darks not too dark.

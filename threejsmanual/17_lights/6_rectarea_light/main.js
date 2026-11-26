// Lights - RectAreaLight
// Source: https://threejs.org/manual/#lights
// Local: http://localhost:5173/threejsmanual/17_lights/6_rectarea_light/
//
// RectAreaLight
//
// There's one more type of light, the RectAreaLight, which represents exactly
// what it sounds like, a rectangular area of light like a long fluorescent
// light or maybe a frosted sky light in a ceiling.
//
// To use the RectAreaLight we need to include some extra three.js optional data
// and we'll include the RectAreaLightHelper to help us visualize the light

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import checkerUrl from '../resources/images/checker.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  // and we need to call RectAreaLightUniformsLib.init

  RectAreaLightUniformsLib.init();

  // If you forget the data the light will still work but it will look funny so
  // be sure to remember to include the extra data.

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 10, 20 );

  const controls = new OrbitControls( camera, canvas );
  controls.target.set( 0, 5, 0 );
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 'black' );

  // The RectAreaLight only works with the MeshStandardMaterial and the
  // MeshPhysicalMaterial so let's change all our materials to
  // MeshStandardMaterial

  {

    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load( checkerUrl );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set( repeats, repeats );

    const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
    const planeMat = new THREE.MeshStandardMaterial( {
      map: texture,
      side: THREE.DoubleSide,
    } );
    const mesh = new THREE.Mesh( planeGeo, planeMat );
    mesh.rotation.x = Math.PI * - .5;
    scene.add( mesh );

  }

  {

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    const cubeMat = new THREE.MeshStandardMaterial( { color: '#8AC' } );
    const mesh = new THREE.Mesh( cubeGeo, cubeMat );
    mesh.position.set( cubeSize + 1, cubeSize / 2, 0 );
    scene.add( mesh );

  }

  {

    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
    const sphereMat = new THREE.MeshStandardMaterial( { color: '#CA8' } );
    const mesh = new THREE.Mesh( sphereGeo, sphereMat );
    mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
    scene.add( mesh );

  }

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

  function makeXYZGUI( gui, vector3, name, onChangeFn ) {

    const folder = gui.addFolder( name );
    folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
    folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
    folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
    folder.open();

  }

  {

    // Now we can create the light

    const color = 0xFFFFFF;
    const intensity = 5;
    const width = 12;
    const height = 4;
    const light = new THREE.RectAreaLight( color, intensity, width, height );
    light.position.set( 0, 10, 0 );
    light.rotation.x = THREE.MathUtils.degToRad( - 90 );
    scene.add( light );

    const helper = new RectAreaLightHelper( light );
    light.add( helper );

    // One thing to notice is that unlike the DirectionalLight and the
    // SpotLight, the RectAreaLight does not use a target. It just uses its
    // rotation. Another thing to notice is the helper needs to be a child of
    // the light. It is not a child of the scene like other helpers.
    //
    // Let's also adjust the GUI. We'll make it so we can rotate the light and
    // adjust its width and height

    const gui = new GUI();
    gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
    gui.add( light, 'intensity', 0, 10, 0.01 );
    gui.add( light, 'width', 0, 20 );
    gui.add( light, 'height', 0, 20 );
    gui.add( new DegRadHelper( light.rotation, 'x' ), 'value', - 180, 180 ).name( 'x rotation' );
    gui.add( new DegRadHelper( light.rotation, 'y' ), 'value', - 180, 180 ).name( 'y rotation' );
    gui.add( new DegRadHelper( light.rotation, 'z' ), 'value', - 180, 180 ).name( 'z rotation' );

    makeXYZGUI( gui, light.position, 'position' );

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

// It's important to note each light you add to the scene slows down how fast
// three.js renders the scene so you should always try to use as few as possible
// to achieve your goals.
//
// Next up let's go over dealing with cameras
// (https://threejs.org/manual/#cameras).

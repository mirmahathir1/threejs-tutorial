// Lights - SpotLight
// Source: https://threejs.org/manual/#lights
// Local: http://localhost:5173/threejsmanual/17_lights/5_spot_light/
//
// SpotLight
//
// Spotlights are effectively a point light with a cone attached where the light
// only shines inside the cone. There's actually 2 cones. An outer cone and an
// inner cone. Between the inner cone and the outer cone the light fades from
// full intensity to zero.
//
// To use a SpotLight we need a target just like the directional light. The
// light's cone will open toward the target.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import checkerUrl from '../resources/images/checker.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

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
    const planeMat = new THREE.MeshPhongMaterial( {
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

  // The spotlight's cone's angle is set with the angle property in radians.
  // We'll use our DegRadHelper from the texture article
  // (https://threejs.org/manual/#textures) to present a UI in degrees.

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

    // Modifying our DirectionalLight with helper from above

    const color = 0xFFFFFF;
    const intensity = 150;
    const light = new THREE.SpotLight( color, intensity );
    light.position.set( 0, 10, 0 );
    light.target.position.set( - 5, 0, 0 );
    scene.add( light );
    scene.add( light.target );

    const helper = new THREE.SpotLightHelper( light );
    scene.add( helper );

    function updateLight() {

      light.target.updateMatrixWorld();
      helper.update();

    }

    updateLight();

    const gui = new GUI();
    gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
    gui.add( light, 'intensity', 0, 250, 1 );
    gui.add( light, 'distance', 0, 40 ).onChange( updateLight );
    gui.add( new DegRadHelper( light, 'angle' ), 'value', 0, 90 ).name( 'angle' ).onChange( updateLight );

    // The inner cone is defined by setting the penumbra property as a
    // percentage from the outer cone. In other words when penumbra is 0 then
    // the inner cone is the same size (0 = no difference) from the outer cone.
    // When the penumbra is 1 then the light fades starting in the center of the
    // cone to the outer cone. When penumbra is .5 then the light fades starting
    // from 50% between the center of the outer cone.

    gui.add( light, 'penumbra', 0, 1, 0.01 );

    makeXYZGUI( gui, light.position, 'position', updateLight );
    makeXYZGUI( gui, light.target.position, 'target', updateLight );

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

// Notice with the default penumbra of 0 the spotlight has a very sharp edge
// whereas as you adjust the penumbra toward 1 the edge blurs.
//
// It might be hard to see the cone of the spotlight. The reason is it's below
// the ground. Shorten the distance to around 5 and you'll see the open end of
// the cone.

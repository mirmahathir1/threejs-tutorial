// Lights - DirectionalLight
// Source: https://threejs.org/manual/#lights
// Local: http://localhost:5173/threejsmanual/17_lights/3_directional_light/
//
// DirectionalLight
//
// Let's switch the code to a DirectionalLight. A DirectionalLight is often used
// to represent the sun.

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

  // While we're at it let's make it so we can set both the position of the
  // light and the target. To do this we'll make a function that given a Vector3
  // will adjust its x, y, and z properties using lil-gui.

  function makeXYZGUI( gui, vector3, name, onChangeFn ) {

    const folder = gui.addFolder( name );
    folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
    folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
    folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
    folder.open();

  }

  {

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( 0, 10, 0 );
    light.target.position.set( - 5, 0, 0 );
    scene.add( light );
    scene.add( light.target );

    // Notice that we had to add the light and the light.target to the scene. A
    // three.js DirectionalLight will shine in the direction of its target.
    //
    // Let's make it so we can move the target by adding it to our GUI.
    //
    //   gui.add(light.target.position, 'x', -10, 10);
    //   gui.add(light.target.position, 'z', -10, 10);
    //   gui.add(light.target.position, 'y', 0, 10);
    //
    // It's kind of hard to see what's going on. Three.js has a bunch of helper
    // objects we can add to our scene to help visualize invisible parts of a
    // scene. In this case we'll use the DirectionalLightHelper which will draw
    // a plane, to represent the light, and a line from the light to the
    // target. We just pass it the light and add it to the scene.

    const helper = new THREE.DirectionalLightHelper( light );
    scene.add( helper );

    // Note that we need to call the helper's update function anytime we change
    // something so the helper knows to update itself. As such we pass in an
    // onChangeFn function to get called anytime lil-gui updates a value.
    //
    // Then we can use that for both the light's position and the target's
    // position like this

    function updateLight() {

      light.target.updateMatrixWorld();
      helper.update();

    }

    updateLight();

    const gui = new GUI();
    gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
    gui.add( light, 'intensity', 0, 5, 0.01 );

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

// Now we can move the light, and its target
//
// Orbit the camera and it gets easier to see. The plane represents a
// DirectionalLight because a directional light computes light coming in one
// direction. There is no point the light comes from, it's an infinite plane of
// light shooting out parallel rays of light.

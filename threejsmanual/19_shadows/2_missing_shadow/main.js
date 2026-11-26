// Shadows - Missing Shadow
// Source: https://threejs.org/manual/#shadows
// Local: http://localhost:5173/threejsmanual/19_shadows/2_missing_shadow/
//
// So, moving on to shadow maps, there are 3 lights which can cast shadows. The
// DirectionalLight, the PointLight, and the SpotLight.
//
// Let's start with the DirectionalLight with the helper example from the
// lights article (https://threejs.org/manual/#lights).

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import checkerUrl from '../resources/images/checker.png';

function main() {

  const canvas = document.querySelector( '#c' );

  // The first thing we need to do is turn on shadows in the renderer.

  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
  renderer.shadowMap.enabled = true;

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

  // We also need to go to each mesh in the scene and decide if it should both
  // cast shadows and/or receive shadows.
  //
  // Let's make the plane (the ground) only receive shadows since we don't
  // really care what happens underneath.

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
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * - .5;
    scene.add( mesh );

  }

  // For the cube and the sphere let's have them both receive and cast shadows

  {

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
    const mesh = new THREE.Mesh( cubeGeo, cubeMat );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
    scene.add( mesh );

  }

  class ColorGUIHelper {

    constructor( object, prop ) {

      this.object = object;
      this.prop = prop;

    }
    get value() {

      return `#${this.object[ this.prop ].getHexString()}`;

    }
    set value( hexString ) {

      this.object[ this.prop ].set( hexString );

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

    // Then we also need to tell the light to cast a shadow

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.castShadow = true;
    light.position.set( 0, 10, 0 );
    light.target.position.set( - 4, 0, - 4 );
    scene.add( light );
    scene.add( light.target );

    const helper = new THREE.DirectionalLightHelper( light );
    scene.add( helper );

    const onChange = () => {

      light.target.updateMatrixWorld();
      helper.update();

    };

    onChange();

    const gui = new GUI();
    gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
    gui.add( light, 'intensity', 0, 10, 0.01 );

    makeXYZGUI( gui, light.position, 'position', onChange );
    makeXYZGUI( gui, light.target.position, 'target', onChange );

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

    resizeRendererToDisplaySize( renderer );

    {

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

// And then we run it.
//
// What happened? Why are parts of the shadows missing?
//
// The reason is shadow maps are created by rendering the scene from the point
// of view of the light. In this case there is a camera at the DirectionalLight
// that is looking at its target. Just like the camera's we previously covered
// (https://threejs.org/manual/#cameras) the light's shadow camera defines an
// area inside of which the shadows get rendered. In the example above that
// area is too small.

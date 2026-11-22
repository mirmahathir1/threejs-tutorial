// Materials - MeshNormalMaterial
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/8_normal_material/
//
// The MeshNormalMaterial will show you the normals of geometry. Normals are the
// direction a particular triangle or pixel faces. MeshNormalMaterial draws the
// view space normals (the normals relative to the camera). x is red, y is
// green, and z is blue so things facing to the right will be pink, to the left
// will be aqua, up will be light green, down will be purple, and toward the
// screen will be lavender.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas, alpha: true } );

  function makeScene() {

    const scene = new THREE.Scene();

    const fov = 60;
    const aspect = 1;
    const near = 0.1;
    const far = 50;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 15;
    scene.add( camera );

    // add the lights as children of the camera.
    // this is because TrackballControls move the camera.
    // We really want to rotate the object itself but there's no
    // controls for that so we fake it by putting all the lights
    // on the camera so they move with it.
    camera.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444, .5 ) );
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( - 1, 2, 4 - 15 );
    camera.add( light );

    return { scene, camera };

  }

  function makeDiagram( selector, obj3D, trackball = true ) {

    const elem = document.querySelector( selector );
    const { scene, camera } = makeScene();
    const targetFOVDeg = camera.fov;

    const root = new THREE.Object3D();
    scene.add( root );
    root.add( obj3D );

    if ( trackball ) {

      const controls = new OrbitControls( camera, elem );
      controls.rotateSpeed = 1 / 6;
      controls.enableZoom = false;
      controls.enablePan = false;

    }

    function render( time ) {

      root.rotation.x = time * .1;
      root.rotation.y = time * .11;

      const rect = elem.getBoundingClientRect();
      const width = rect.right - rect.left;
      const height = rect.bottom - rect.top;
      const left = rect.left;
      const bottom = renderer.domElement.clientHeight - rect.bottom;

      const aspect = width / height;
      camera.fov = aspect >= 1
        ? targetFOVDeg
        : THREE.MathUtils.radToDeg( 2 * Math.atan( Math.tan( THREE.MathUtils.degToRad( targetFOVDeg ) * .5 ) / aspect ) );
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.setViewport( left, bottom, width, height );
      renderer.setScissor( left, bottom, width, height );
      renderer.render( scene, camera );

    }

    return { camera, render };

  }

  const diagram = function () {

    const radius = 4;
    const tube = 1.5;
    const radialSegments = 8;
    const tubularSegments = 64;
    const p = 2;
    const q = 3;
    const geometry = new THREE.TorusKnotGeometry( radius, tube, tubularSegments, radialSegments, p, q );
    const material = new THREE.MeshNormalMaterial();
    return makeDiagram( '#normal', new THREE.Mesh( geometry, material ) );

  }();

  const diagrams = [
    diagram,
  ];

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

    resizeRendererToDisplaySize( renderer );

    renderer.setScissorTest( false );
    renderer.clear( true, true );
    renderer.setScissorTest( true );

    diagrams.forEach( ( diagram ) => {

      diagram.render( time );

    } );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// ShaderMaterial is for making custom materials using the three.js shader
// system. RawShaderMaterial is for making entirely custom shaders with no help
// from three.js. Both of these topics are large and will be covered later.

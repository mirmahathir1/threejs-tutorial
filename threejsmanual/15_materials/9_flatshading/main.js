// Materials - flatShading
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/9_flatshading/
//
// Most materials share a bunch of settings all defined by Material. See the
// docs (https://threejs.org/docs/#api/en/materials/Material) for all of them
// but let's go over two of the most commonly used properties.
//
// flatShading: whether or not the object looks faceted or smooth. default =
// false.

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

  function smoothOrFlat( flatShading, radius = 7 ) {

    const widthDivisions = 12;
    const heightDivisions = 9;
    const geometry = new THREE.SphereGeometry( radius, widthDivisions, heightDivisions );
    const material = new THREE.MeshPhongMaterial( {
      flatShading,
      color: 'hsl(300,50%,50%)',
    } );
    return new THREE.Mesh( geometry, material );

  }

  const diagrams = [
    makeDiagram( '#smooth', smoothOrFlat( false ) ),
    makeDiagram( '#flat', smoothOrFlat( true ) ),
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

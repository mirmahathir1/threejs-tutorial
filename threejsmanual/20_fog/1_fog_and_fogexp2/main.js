// Fog - Fog and FogExp2
// Source: https://threejs.org/manual/#fog
// Local: http://localhost:5173/threejsmanual/20_fog/1_fog_and_fogexp2/
//
// This article is part of a series of articles about three.js. The first
// article is three.js fundamentals (https://threejs.org/manual/#fundamentals).
// If you haven't read that yet and you're new to three.js you might want to
// consider starting there. If you haven't read about cameras you might want to
// start with this article (https://threejs.org/manual/#cameras).
//
// Fog in a 3D engine is generally a way of fading to a specific color based on
// the distance from the camera. In three.js you add fog by creating Fog or
// FogExp2 object and setting it on the scene's fog property.
//
// Fog lets you choose near and far settings which are distances from the
// camera. Anything closer than near is unaffected by fog. Anything further
// than far is completely the fog color. Parts between near and far fade from
// their material color to the fog color.
//
// There's also FogExp2 which grows exponentially with distance from the
// camera.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {

  const canvas = document.querySelector( '#c' );
  const view1Elem = document.querySelector( '#view1' );
  const view2Elem = document.querySelector( '#view2' );
  const renderer = new THREE.WebGLRenderer( {
    canvas,
    alpha: true,
    antialias: true,
  } );

  function fogExample( scene, fog ) {

    scene.fog = fog;
    const width = 4;
    const height = 3;
    const depth = 10;
    const geometry = new THREE.BoxGeometry( width, height, depth );
    const material = new THREE.MeshPhongMaterial( { color: 'hsl(130,50%,50%)' } );
    return new THREE.Mesh( geometry, material );

  }

  function makeDiagram( elem, create ) {

    const scene = new THREE.Scene();
    const targetFOVDeg = 60;
    const aspect = 1;
    const near = 0.1;
    const far = 50;
    const camera = new THREE.PerspectiveCamera( targetFOVDeg, aspect, near, far );
    camera.position.z = 15;
    scene.add( camera );

    const root = new THREE.Object3D();
    scene.add( root );
    root.add( create( scene ) );

    const controls = new OrbitControls( camera, elem );
    controls.rotateSpeed = 1 / 6;
    controls.enableZoom = false;
    controls.enablePan = false;

    camera.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444, .5 ) );
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( - 1, 2, 4 - 15 );
    camera.add( light );

    return { elem, scene, camera, root, controls, targetFOVDeg };

  }

  const diagrams = [

    // To use either type of fog you create one and and assign it to the scene
    // as in

    makeDiagram( view1Elem, ( scene ) => {

      const color = 0xFFFFFF;
      const near = 12;
      const far = 18;
      const fog = new THREE.Fog( color, near, far );
      return fogExample( scene, fog );

    } ),

    // or for FogExp2 it would be

    makeDiagram( view2Elem, ( scene ) => {

      const color = 0xFFFFFF;
      const density = 0.1;
      const fog = new THREE.FogExp2( color, density );
      return fogExample( scene, fog );

    } ),
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

  function setScissorForElement( elem ) {

    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // compute a canvas relative rectangle
    const right = Math.min( elemRect.right, canvasRect.right ) - canvasRect.left;
    const left = Math.max( 0, elemRect.left - canvasRect.left );
    const bottom = Math.min( elemRect.bottom, canvasRect.bottom ) - canvasRect.top;
    const top = Math.max( 0, elemRect.top - canvasRect.top );

    const width = Math.min( canvasRect.width, right - left );
    const height = Math.min( canvasRect.height, bottom - top );

    // setup the scissor to only render to that part of the canvas
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor( left, positiveYUpBottom, width, height );
    renderer.setViewport( left, positiveYUpBottom, width, height );

    // return the aspect
    return width / height;

  }

  function render( time ) {

    time *= 0.001;

    resizeRendererToDisplaySize( renderer );

    // turn on the scissor
    renderer.setScissorTest( true );

    diagrams.forEach( ( { elem, scene, camera, root, controls, targetFOVDeg } ) => {

      root.rotation.x = time * .1;
      root.rotation.y = time * .11;

      controls.update();

      const aspect = setScissorForElement( elem );
      const fovDeg = aspect >= 1
        ? targetFOVDeg
        : THREE.MathUtils.radToDeg( 2 * Math.atan( Math.tan( THREE.MathUtils.degToRad( targetFOVDeg ) * .5 ) / aspect ) );

      camera.fov = fovDeg;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.render( scene, camera );

    } );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// FogExp2 is closer to reality but Fog is used more commonly since it lets you
// choose a place to apply the fog so you can decide to show a clear scene up to
// a certain distance and then fade out to some color past that distance.

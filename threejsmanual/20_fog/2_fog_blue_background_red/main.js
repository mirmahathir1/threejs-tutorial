// Fog - Fog blue, background red
// Source: https://threejs.org/manual/#fog
// Local: http://localhost:5173/threejsmanual/20_fog/2_fog_blue_background_red/
//
// It's important to note that the fog is applied to things that are rendered.
// It is part of the calculation of each pixel of the color of the object. What
// that means is if you want your scene to fade to a certain color you need to
// set the fog and the background color to the same color. The background color
// is set using the scene.background property. To pick a background color you
// attach a THREE.Color to it. For example

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

    makeDiagram( view1Elem, ( scene ) => {

      scene.background = new THREE.Color( '#F00' ); // red
      const color = '#00F';
      const near = 12;
      const far = 18;
      return fogExample( scene, new THREE.Fog( color, near, far ) );

    } ),

    makeDiagram( view2Elem, ( scene ) => {

      scene.background = new THREE.Color( '#00F' );
      const color = '#00F';
      const near = 12;
      const far = 18;
      return fogExample( scene, new THREE.Fog( color, near, far ) );

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

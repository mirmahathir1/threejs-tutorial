// Materials - Looking Same
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/3_looking_same/
//
// Note that setting the emissive property to a color on either a
// MeshLambertMaterial or a MeshPhongMaterial and setting the color to black
// (and shininess to 0 for phong) ends up looking just like the
// MeshBasicMaterial.

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

  function makeSphere( widthDivisions, heightDivisions ) {

    const radius = 7;
    return new THREE.SphereGeometry( radius, widthDivisions, heightDivisions );

  }

  const highPolySphereGeometry = function () {

    const widthDivisions = 100;
    const heightDivisions = 50;
    return makeSphere( widthDivisions, heightDivisions );

  }();

  function basicLambertPhongExample( MaterialCtor, params = {} ) {

    const geometry = highPolySphereGeometry;
    const material = new MaterialCtor( {
      color: 'hsl(210,50%,50%)',
      ...params,
    } );
    return new THREE.Mesh( geometry, material );

  }

  const diagrams = [
    makeDiagram( '#basic', basicLambertPhongExample( THREE.MeshBasicMaterial, {
      color: 'purple',
    } ), false ),
    makeDiagram( '#lambert', basicLambertPhongExample( THREE.MeshLambertMaterial, {
      color: 'black',
      emissive: 'purple',
    } ), false ),
    makeDiagram( '#phong', basicLambertPhongExample( THREE.MeshPhongMaterial, {
      color: 'black',
      emissive: 'purple',
      shininess: 0,
    } ), false ),
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

// Why have all 3 when MeshPhongMaterial can do the same things as
// MeshBasicMaterial and MeshLambertMaterial? The reason is the more
// sophisticated material takes more GPU power to draw. On a slower GPU like say
// a mobile phone you might want to reduce the GPU power needed to draw your
// scene by using one of the less complex materials. It also follows that if you
// don't need the extra features then use the simplest material. If you don't
// need the lighting and the specular highlight then use the MeshBasicMaterial.

// Materials - Low Poly
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/1_low_poly/
//
// This article is part of a series of articles about three.js. The first
// article is three.js fundamentals (https://threejs.org/manual/#fundamentals).
// If you haven't read that yet and you're new to three.js you might want to
// consider starting there.
//
// Three.js provides several types of materials. They define how objects will
// appear in the scene. Which materials you use really depends on what you're
// trying to accomplish.
//
// There are 2 ways to set most material properties. One at creation time which
// we've seen before.
//
//   const material = new THREE.MeshPhongMaterial({
//     color: 0xFF0000,    // red (can also use a CSS color string here)
//     flatShading: true,
//   });
//
// The other is after creation
//
//   const material = new THREE.MeshPhongMaterial();
//   material.color.setHSL(0, 1, .5);  // red
//   material.flatShading = true;
//
// note that properties of type THREE.Color have multiple ways to be set.
//
//   material.color.set(0x00FFFF);    // same as CSS's #RRGGBB style
//   material.color.set(cssString);   // any CSS color, eg 'purple', '#F32',
//                                    // 'rgb(255, 127, 64)',
//                                    // 'hsl(180, 50%, 25%)'
//   material.color.set(someColor)    // some other THREE.Color
//   material.color.setHSL(h, s, l)   // where h, s, and l are 0 to 1
//   material.color.setRGB(r, g, b)   // where r, g, and b are 0 to 1
//
// And at creation time you can pass either a hex number or a CSS string
//
//   const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // red
//   const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // red
//   const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // red
//   const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // red
//   const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'}); // red
//
// So let's go over three.js's set of materials.

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

  const lowPolySphereGeometry = function () {

    const widthDivisions = 12;
    const heightDivisions = 9;
    return makeSphere( widthDivisions, heightDivisions );

  }();

  function basicLambertPhongExample( MaterialCtor, lowPoly, params = {} ) {

    const geometry = lowPoly ? lowPolySphereGeometry : highPolySphereGeometry;
    const material = new MaterialCtor( {
      color: 'hsl(210,50%,50%)',
      ...params,
    } );
    return new THREE.Mesh( geometry, material );

  }

  // The MeshBasicMaterial is not affected by lights. The MeshLambertMaterial
  // computes lighting only at the vertices vs the MeshPhongMaterial which
  // computes lighting at every pixel. The MeshPhongMaterial also supports
  // specular highlights.

  const diagrams = [
    makeDiagram( '#basic', basicLambertPhongExample( THREE.MeshBasicMaterial, false ), false ),
    makeDiagram( '#lambert', basicLambertPhongExample( THREE.MeshLambertMaterial, false ), false ),
    makeDiagram( '#phong', basicLambertPhongExample( THREE.MeshPhongMaterial, false ), false ),
    makeDiagram( '#basic-low-poly', basicLambertPhongExample( THREE.MeshBasicMaterial, true ) ),
    makeDiagram( '#lambert-low-poly', basicLambertPhongExample( THREE.MeshLambertMaterial, true ) ),
    makeDiagram( '#phong-low-poly', basicLambertPhongExample( THREE.MeshPhongMaterial, true ) ),
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

// Materials - side
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/10_doubleside/
//
// side: which sides of triangles to show. The default is THREE.FrontSide. Other
// options are THREE.BackSide and THREE.DoubleSide (both sides). Most 3D objects
// drawn in three are probably opaque solids so the back sides (the sides facing
// inside the solid) do not need to be drawn. The most common reason to set side
// is for planes or other non-solid objects where it is common to see the back
// sides of triangles.

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

  function sideExample( side ) {

    const base = new THREE.Object3D();
    const size = 6;
    const geometry = new THREE.PlaneGeometry( size, size );
    [
      { position: [ - 1, 0, 0 ], up: [ 0, 1, 0 ], },
      { position: [ 1, 0, 0 ], up: [ 0, - 1, 0 ], },
      { position: [ 0, - 1, 0 ], up: [ 0, 0, - 1 ], },
      { position: [ 0, 1, 0 ], up: [ 0, 0, 1 ], },
      { position: [ 0, 0, - 1 ], up: [ 1, 0, 0 ], },
      { position: [ 0, 0, 1 ], up: [ - 1, 0, 0 ], },
    ].forEach( ( settings, ndx ) => {

      const material = new THREE.MeshBasicMaterial( { side } );
      material.color.setHSL( ndx / 6, .5, .5 );
      const mesh = new THREE.Mesh( geometry, material );
      mesh.up.set( ...settings.up );
      mesh.lookAt( ...settings.position );
      mesh.position.set( ...settings.position ).multiplyScalar( size * .75 );
      base.add( mesh );

    } );
    return base;

  }

  // Here are 6 planes drawn with THREE.FrontSide and THREE.DoubleSide.

  const diagrams = [
    makeDiagram( '#side-default', sideExample( THREE.FrontSide ) ),
    makeDiagram( '#side-double', sideExample( THREE.DoubleSide ) ),
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

// There's really a lot to consider with materials and we actually still have a
// bunch more to go. In particular we've mostly ignored textures which open up a
// whole slew of options. Before we cover textures though we need to take a
// break and cover setting up your development environment
// (https://threejs.org/manual/#setup)
//
// material.needsUpdate
//
// This topic rarely affects most three.js apps but just as an FYI... Three.js
// applies material settings when a material is used where "used" means
// "something is rendered that uses the material". Some material settings are
// only applied once as changing them requires lots of work by three.js. In
// those cases you need to set material.needsUpdate = true to tell three.js to
// apply your material changes. The most common settings that require you to set
// needsUpdate if you change the settings after using the material are:
//
// - flatShading
//
// - adding or removing a texture
//
// Changing a texture is ok, but if want to switch from using no texture to
// using a texture or from using a texture to using no texture then you need to
// set needsUpdate = true.
//
// In the case of going from texture to no-texture it is often just better to
// use a 1x1 pixel white texture.
//
// As mentioned above most apps never run into these issues. Most apps do not
// switch between flat shaded and non flat shaded. Most apps also either use
// textures or a solid color for a given material, they rarely switch from using
// one to using the other.

// Materials - MeshPhysicalMaterial
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/6_clearcoat/
//
// The MeshPhysicalMaterial is same as the MeshStandardMaterial but it adds a
// clearcoat parameter that goes from 0 to 1 for how much to apply a clearcoat
// gloss layer and a clearCoatRoughness parameter that specifies how rough the
// gloss layer is.

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

  function makeSphere( widthDivisions, heightDivisions ) {

    const radius = 7;
    return new THREE.SphereGeometry( radius, widthDivisions, heightDivisions );

  }

  const highPolySphereGeometry = function () {

    const widthDivisions = 100;
    const heightDivisions = 50;
    return makeSphere( widthDivisions, heightDivisions );

  }();

  function makePhysicalMaterialGrid( selector, update ) {

    const elem = document.querySelector( selector );
    const { scene, camera } = makeScene();

    const numMetal = 5;
    const numRough = 7;
    const meshes = [];
    const color = 'hsl(160,50%,50%)';
    for ( let m = 0; m < numMetal; ++ m ) {

      const row = [];
      for ( let r = 0; r < numRough; ++ r ) {

        const material = new THREE.MeshPhysicalMaterial( {
          color,
          roughness: r / ( numRough - 1 ),
          metalness: 1 - m / ( numMetal - 1 ),
        } );
        const mesh = new THREE.Mesh( highPolySphereGeometry, material );
        row.push( mesh );

      }

      meshes.push( row );

    }

    function render() {

      const rect = elem.getBoundingClientRect();
      const width = rect.right - rect.left;
      const height = rect.bottom - rect.top;
      const left = rect.left;
      const bottom = renderer.domElement.clientHeight - rect.bottom;

      const cellSize = Math.min( width / numRough, height / numMetal ) | 0;
      const xOff = ( width - cellSize * numRough ) / 2;
      const yOff = ( height - cellSize * numMetal ) / 2;

      camera.aspect = 1;
      camera.updateProjectionMatrix();

      update( meshes );

      for ( let m = 0; m < numMetal; ++ m ) {

        for ( let r = 0; r < numRough; ++ r ) {

          const x = left + xOff + r * cellSize;
          const y = bottom + yOff + m * cellSize;
          renderer.setViewport( x, y, cellSize, cellSize );
          renderer.setScissor( x, y, cellSize, cellSize );
          const mesh = meshes[ m ][ r ];
          scene.add( mesh );
          renderer.render( scene, camera );
          scene.remove( mesh );

        }

      }

    }

    return { render };

  }

  // Here's the same grid of roughness by metalness as above but with clearcoat
  // and clearCoatRoughness settings.

  const settings = {
    clearcoat: .5,
    clearcoatRoughness: 0,
  };

  const gui = new GUI();
  gui.add( settings, 'clearcoat', 0, 1 );
  gui.add( settings, 'clearcoatRoughness', 0, 1 );

  const diagrams = [
    makePhysicalMaterialGrid( '#physical', ( meshes ) => {

      meshes.forEach( row => row.forEach( mesh => {

        mesh.material.clearcoat = settings.clearcoat;
        mesh.material.clearcoatRoughness = settings.clearcoatRoughness;

      } ) );

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

// The various standard materials progress from fastest to slowest
// MeshBasicMaterial ➡ MeshLambertMaterial ➡ MeshPhongMaterial ➡
// MeshStandardMaterial ➡ MeshPhysicalMaterial. The slower materials can make
// more realistic looking scenes but you might need to design your code to use
// the faster materials on low powered or mobile machines.

// Materials - MeshStandardMaterial
// Source: https://threejs.org/manual/#materials
// Local: http://localhost:5173/threejsmanual/15_materials/5_metalness/
//
// Next up there are 2 physically based rendering materials. Physically Based
// Rendering is often abbreviated PBR.
//
// The materials above use simple math to make materials that look 3D but they
// aren't what actually happens in real world. The 2 PBR materials use much more
// complex math to come close to what actually happens in the real world.
//
// The first one is MeshStandardMaterial. The biggest difference between
// MeshPhongMaterial and MeshStandardMaterial is it uses different parameters.
// MeshPhongMaterial had a shininess setting. MeshStandardMaterial has 2
// settings roughness and metalness.
//
// At a basic level roughness is the opposite of shininess. Something that has a
// high roughness, like a baseball doesn't have hard reflections whereas
// something that's not rough, like a billiard ball, is very shiny. Roughness
// goes from 0 to 1.
//
// The other setting, metalness, says how metal the material is. Metals behave
// differently than non-metals. 0 for non-metal and 1 for metal.

import * as THREE from 'three';

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

  function makeStandardMaterialGrid( selector ) {

    const elem = document.querySelector( selector );
    const { scene, camera } = makeScene();

    const numMetal = 5;
    const numRough = 7;
    const meshes = [];
    const color = 'hsl(140,50%,50%)';
    for ( let m = 0; m < numMetal; ++ m ) {

      const row = [];
      for ( let r = 0; r < numRough; ++ r ) {

        const material = new THREE.MeshStandardMaterial( {
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

  // Here's a quick sample of MeshStandardMaterial with roughness from 0 to 1
  // across and metalness from 0 to 1 down.

  const diagrams = [
    makeStandardMaterialGrid( '#standard' ),
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

// Scenegraph - Fixed Size
// Source: https://threejs.org/manual/#scenegraph
// Local: http://localhost:5173/threejsmanual/14_scenegraph/4_fixed_size/
//
// To fix it let's add an empty scene graph node. We'll parent both the sun and
// the earth to that node.

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 50, 0 );
  camera.up.set( 0, 0, 1 );
  camera.lookAt( 0, 0, 0 );

  const scene = new THREE.Scene();

  {

    const color = 0xFFFFFF;
    const intensity = 500;
    const light = new THREE.PointLight( color, intensity );
    scene.add( light );

  }

  const objects = [];

  // use just one sphere for everything
  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments );

  // Here we made an Object3D. Like a Mesh it is also a node in the scene graph
  // but unlike a Mesh it has no material or geometry. It just represents a
  // local space.
  //
  // Our new scene graph looks like this
  // (https://threejs.org/manual/resources/images/scenegraph-sun-earth-fixed.svg)
  //
  // Both the sunMesh and the earthMesh are children of the solarSystem. All 3
  // are being rotated and now because the earthMesh is not a child of the
  // sunMesh it is no longer scaled by 5x.

  const solarSystem = new THREE.Object3D();
  scene.add( solarSystem );
  objects.push( solarSystem );

  const sunMaterial = new THREE.MeshPhongMaterial( { emissive: 0xFFFF00 } );
  const sunMesh = new THREE.Mesh( sphereGeometry, sunMaterial );
  sunMesh.scale.set( 5, 5, 5 ); // make the sun large
  solarSystem.add( sunMesh );
  objects.push( sunMesh );

  const earthMaterial = new THREE.MeshPhongMaterial( { color: 0x2233FF, emissive: 0x112244 } );
  const earthMesh = new THREE.Mesh( sphereGeometry, earthMaterial );
  earthMesh.position.x = 10;
  solarSystem.add( earthMesh );
  objects.push( earthMesh );

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

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    objects.forEach( ( obj ) => {

      obj.rotation.y = time;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// Much better. The earth is smaller than the sun and it's rotating around the
// sun and rotating itself.

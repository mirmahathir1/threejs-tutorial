// Scenegraph - Earth Mesh
// Source: https://threejs.org/manual/#scenegraph
// Local: http://localhost:5173/threejsmanual/14_scenegraph/2_earth_mesh/
//
// Now let's add in the earth.

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

  const sunMaterial = new THREE.MeshPhongMaterial( { emissive: 0xFFFF00 } );
  const sunMesh = new THREE.Mesh( sphereGeometry, sunMaterial );
  sunMesh.scale.set( 5, 5, 5 ); // make the sun large
  scene.add( sunMesh );
  objects.push( sunMesh );

  // We make a material that is blue but we gave it a small amount of emissive
  // blue so that it will show up against our black background.
  //
  // We use the same sphereGeometry with our new blue earthMaterial to make an
  // earthMesh. We position that 10 units to the left of the sun and add it to
  // the scene. Since we added it to our objects array it will rotate too.

  const earthMaterial = new THREE.MeshPhongMaterial( { color: 0x2233FF, emissive: 0x112244 } );
  const earthMesh = new THREE.Mesh( sphereGeometry, earthMaterial );
  earthMesh.position.x = 10;
  scene.add( earthMesh );
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

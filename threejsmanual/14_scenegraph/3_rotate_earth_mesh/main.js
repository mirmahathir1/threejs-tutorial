// Scenegraph - Rotate Earth Mesh
// Source: https://threejs.org/manual/#scenegraph
// Local: http://localhost:5173/threejsmanual/14_scenegraph/3_rotate_earth_mesh/
//
// You can see both the sun and the earth are rotating but the earth is not
// going around the sun. Let's make the earth a child of the sun

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 150, 0 );
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

  const earthMaterial = new THREE.MeshPhongMaterial( { color: 0x2233FF, emissive: 0x112244 } );
  const earthMesh = new THREE.Mesh( sphereGeometry, earthMaterial );
  earthMesh.position.x = 10;
  sunMesh.add( earthMesh );
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

// What happened? Why is the earth the same size as the sun and why is it so far
// away? I actually had to move the camera from 50 units above to 150 units
// above to see the earth.
//
// We made the earthMesh a child of the sunMesh. The sunMesh has its scale set
// to 5x with sunMesh.scale.set(5, 5, 5). That means the sunMeshs local space is
// 5 times as big. Anything put in that space will be multiplied by 5. That
// means the earth is now 5x larger and its distance from the sun
// (earthMesh.position.x = 10) is also 5x as well.
//
// Our scene graph currently looks like this
// (https://threejs.org/manual/resources/images/scenegraph-sun-earth.svg)

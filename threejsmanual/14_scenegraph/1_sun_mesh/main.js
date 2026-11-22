// Scenegraph - Sun Mesh
// Source: https://threejs.org/manual/#scenegraph
// Local: http://localhost:5173/threejsmanual/14_scenegraph/1_sun_mesh/
//
// This article is part of a series of articles about three.js. The first
// article is three.js fundamentals (https://threejs.org/manual/#fundamentals).
// If you haven't read that yet you might want to consider starting there.
//
// Three.js's core is arguably its scene graph. A scene graph in a 3D engine is
// a hierarchy of nodes in a graph where each node represents a local space.
// (https://threejs.org/manual/resources/images/scenegraph-generic.svg)
//
// That's kind of abstract so let's try to give some examples.
//
// One example might be solar system, sun, earth, moon.
// (https://threejs.org/manual/resources/images/scenegraph-solarsystem.svg)
//
// The Earth orbits the Sun. The Moon orbits the Earth. The Moon moves in a
// circle around the Earth. From the Moon's point of view it's rotating in the
// "local space" of the Earth. Even though its motion relative to the Sun is
// some crazy spirograph like curve from the Moon's point of view it just has to
// concern itself with rotating around the Earth's local space.
//
// To think of it another way, you living on the Earth do not have to think
// about the Earth's rotation on its axis nor its rotation around the Sun. You
// just walk or drive or swim or run as though the Earth is not moving or
// rotating at all. You walk, drive, swim, run, and live in the Earth's "local
// space" even though relative to the sun you are spinning around the earth at
// around 1000 miles per hour and around the sun at around 67,000 miles per
// hour. Your position in the solar system is similar to that of the moon above
// but you don't have to concern yourself. You just worry about your position
// relative to the earth in its "local space".

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );

  // To make it easy to see we're going to put the camera directly above the
  // origin looking down. The easiest way to do that is to use the lookAt
  // function. The lookAt function will orient the camera from its position to
  // "look at" the position we pass to lookAt. Before we do that though we need
  // to tell the camera which way the top of the camera is facing or rather
  // which way is "up" for the camera. For most situations positive Y being up
  // is good enough but since we are looking straight down we need to tell the
  // camera that positive Z is up.

  camera.position.set( 0, 50, 0 );
  camera.up.set( 0, 0, 1 );
  camera.lookAt( 0, 0, 0 );

  const scene = new THREE.Scene();

  // Let's also put a single point light in the center of the scene. We'll go
  // into more details about point lights later but for now the simple version
  // is a point light represents light that emanates from a single point.

  {

    const color = 0xFFFFFF;
    const intensity = 500;
    const light = new THREE.PointLight( color, intensity );
    scene.add( light );

  }

  // Let's take it one step at a time. Imagine we want to make a diagram of the
  // sun, earth, and moon. We'll start with the sun by just making a sphere and
  // putting it at the origin. Note: We're using sun, earth, moon as a
  // demonstration of how to use a scene graph. Of course the real sun, earth,
  // and moon use physics but for our purposes we'll fake it with a scene graph.

  // an array of objects whose rotation to update
  const objects = [];

  // We're using a really low-polygon sphere. Only 6 subdivisions around its
  // equator. This is so it's easy to see the rotation.

  // use just one sphere for everything
  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments );

  // We're going to reuse the same sphere for everything so we'll set a scale
  // for the sun mesh of 5x.
  //
  // We also set the phong material's emissive property to yellow. A phong
  // material's emissive property is basically the color that will be drawn with
  // no light hitting the surface. Light is added to that color.

  const sunMaterial = new THREE.MeshPhongMaterial( { emissive: 0xFFFF00 } );
  const sunMesh = new THREE.Mesh( sphereGeometry, sunMaterial );
  sunMesh.scale.set( 5, 5, 5 ); // make the sun large
  scene.add( sunMesh );
  objects.push( sunMesh );

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

    // In the render loop, adapted from previous examples, we're rotating all
    // objects in our objects array with this code.
    //
    // Since we added the sunMesh to the objects array it will rotate.

    objects.forEach( ( obj ) => {

      obj.rotation.y = time;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// Plane Subdivisions
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/29_plane_subdivisions/
//
// Sometimes it's easy to choose. For example you can also choose to subdivide a
// plane.

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 40;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xAAAAAA );

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( - 1, 2, 4 );
    scene.add( light );

  }

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( 1, - 2, - 4 );
    scene.add( light );

  }

  const objects = [];
  const spread = 15;

  function addObject( x, y, obj ) {

    obj.position.x = x * spread;
    obj.position.y = y * spread;

    scene.add( obj );
    objects.push( obj );

  }

  function addShape( x, geometry ) {

    geometry.computeBoundingBox();
    const centerOffset = new THREE.Vector3();
    geometry.boundingBox.getCenter( centerOffset ).multiplyScalar( - 1 );

    const material = new THREE.MeshPhongMaterial( {
      flatShading: true,
      side: THREE.DoubleSide,
    } );
    material.color.setHSL( Math.random(), .5, .5 );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.copy( centerOffset );

    const lineMesh = new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial( {
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      } ) );
    lineMesh.position.copy( centerOffset );

    const parent = new THREE.Object3D();
    parent.add( mesh );
    parent.add( lineMesh );

    addObject( x, 0, parent );

  }

  {

    const width = 9;
    const height = 9;
    const widthSegments = 1;
    const heightSegments = 1;
    const geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
    addShape( - .6, geometry );

  }

  {

    const width = 9;
    const height = 9;
    const widthSegments = 10;
    const heightSegments = 10;
    const geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
    addShape( .6, geometry );

  }

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

    objects.forEach( ( obj, ndx ) => {

      const speed = .5 + ndx * .05;
      const rot = time * speed;
      obj.rotation.x = rot;
      obj.rotation.y = rot;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// The plane on the left is 2 triangles. The plane on the right is 200
// triangles. Unlike the sphere there is really no trade off in quality for most
// use cases of a plane. You'd most likely only subdivide a plane if you
// expected to want to modify or warp it in some way. A box is similar.
//
// So, choose whatever is appropriate for your situation. The less subdivisions
// you choose the more likely things will run smoothly and the less memory
// they'll take. You'll have to decide for yourself what the correct tradeoff is
// for your particular situation.
//
// If none of the shapes above fit your use case you can load geometry for
// example from a .obj file (https://threejs.org/manual/#load-obj) or a .gltf
// file (https://threejs.org/manual/#load-gltf). You can also create your own
// custom BufferGeometry (https://threejs.org/manual/#custom-buffergeometry).
//
// Next up let's go over how three's scene graph works and how to use it
// (https://threejs.org/manual/#scenegraph).

// Sphere Subdivisions Smooth
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/28_sphere_subdivisions_smooth/
//
// It's up to you to decide how many subdivisions you need. It might look like
// you need a high number of segments but remove the lines and the flat shading
// and we get this

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
      flatShading: false,
      side: THREE.DoubleSide,
    } );
    material.color.setHSL( Math.random(), .5, .5 );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.copy( centerOffset );

    const parent = new THREE.Object3D();
    parent.add( mesh );

    addObject( x, 0, parent );

  }

  {

    const radius = 7;
    const widthSegments = 5;
    const heightSegments = 3;
    const geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
    addShape( - 1, geometry );

  }

  {

    const radius = 7;
    const widthSegments = 24;
    const heightSegments = 10;
    const geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
    addShape( 0, geometry );

  }

  {

    const radius = 7;
    const widthSegments = 50;
    const heightSegments = 50;
    const geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
    addShape( 1, geometry );

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

// It's now not so clear that the one on the right with 5000 triangles is
// entirely better than the one in the middle with only 480. If you're only
// drawing a few spheres, like say a single globe for a map of the earth, then a
// single 10000 triangle sphere is not a bad choice. If on the other hand you're
// trying to draw 1000 spheres then 1000 spheres times 10000 triangles each is
// 10 million triangles. To animate smoothly you need the browser to draw at 60
// frames per second so you'd be asking the browser to draw 600 million
// triangles per second. That's a lot of computing.

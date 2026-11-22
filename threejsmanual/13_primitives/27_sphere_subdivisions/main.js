// Sphere Subdivisions
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/27_sphere_subdivisions/
//
// One other thing that's important to cover is that almost all shapes have
// various settings for how much to subdivide them. A good example might be the
// sphere geometries. Spheres take parameters for how many divisions to make
// around and how many top to bottom. For example

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

// The first sphere has 5 segments around and 3 high which is 15 segments or 30
// triangles. The second sphere has 24 segments by 10. That's 240 segments or
// 480 triangles. The last one has 50 by 50 which is 2500 segments or 5000
// triangles.

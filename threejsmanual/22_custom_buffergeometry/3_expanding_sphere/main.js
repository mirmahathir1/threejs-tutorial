// Custom BufferGeometry - Expanding sphere
// Source: https://threejs.org/manual/#custom-buffergeometry
// Local: http://localhost:5173/threejsmanual/22_custom_buffergeometry/3_expanding_sphere/
//
// We can also use TypedArrays
// (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
// from the start instead of native JavaScript arrays. The disadvantage to
// TypedArrays is you must specify their size up front. Of course that's not
// that large of a burden but with native arrays we can just push values onto
// them and look at what size they end up by checking their length at the end.
// With TypedArrays there is no push function so we need to do our own
// bookkeeping when adding values to them.
//
// In this example knowing the length up front is pretty easy since we're
// using a big block of static data to start.
//
// A good reason to use typedarrays is if you want to dynamically update any
// part of the vertices.
//
// I couldn't think of a really good example of dynamically updating the
// vertices so I decided to make a sphere and move each quad in and out from
// the center. Hopefully it's a useful example.

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 3;

  const scene = new THREE.Scene();

  function addLight( ...pos ) {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( ...pos );
    scene.add( light );

  }

  addLight( - 1, 2, 4 );
  addLight( 2, - 2, 3 );

  // Here's the code to generate positions and indices for a sphere. The code
  // is sharing vertices within a quad but it's not sharing vertices between
  // quads because we want to be able to move each quad separately.
  //
  // Because I'm lazy I used a small hierarchy of 3 Object3D objects to compute
  // sphere points. How this works is explained in the article on optimizing
  // lots of objects (https://threejs.org/manual/#optimize-lots-of-objects).

  function makeSpherePositions( segmentsAround, segmentsDown ) {

    const numVertices = segmentsAround * segmentsDown * 6;
    const numComponents = 3;
    const positions = new Float32Array( numVertices * numComponents );
    const indices = [];

    const longHelper = new THREE.Object3D();
    const latHelper = new THREE.Object3D();
    const pointHelper = new THREE.Object3D();
    longHelper.add( latHelper );
    latHelper.add( pointHelper );
    pointHelper.position.z = 1;
    const temp = new THREE.Vector3();

    function getPoint( lat, long ) {

      latHelper.rotation.x = lat;
      longHelper.rotation.y = long;
      longHelper.updateMatrixWorld( true );
      return pointHelper.getWorldPosition( temp ).toArray();

    }

    let posNdx = 0;
    let ndx = 0;
    for ( let down = 0; down < segmentsDown; ++ down ) {

      const v0 = down / segmentsDown;
      const v1 = ( down + 1 ) / segmentsDown;
      const lat0 = ( v0 - 0.5 ) * Math.PI;
      const lat1 = ( v1 - 0.5 ) * Math.PI;

      for ( let across = 0; across < segmentsAround; ++ across ) {

        const u0 = across / segmentsAround;
        const u1 = ( across + 1 ) / segmentsAround;
        const long0 = u0 * Math.PI * 2;
        const long1 = u1 * Math.PI * 2;

        positions.set( getPoint( lat0, long0 ), posNdx ); posNdx += numComponents;
        positions.set( getPoint( lat1, long0 ), posNdx ); posNdx += numComponents;
        positions.set( getPoint( lat0, long1 ), posNdx ); posNdx += numComponents;
        positions.set( getPoint( lat1, long1 ), posNdx ); posNdx += numComponents;

        indices.push(
          ndx, ndx + 1, ndx + 2,
          ndx + 2, ndx + 1, ndx + 3,
        );
        ndx += 4;

      }

    }

    return { positions, indices };

  }

  // We can then call it like this

  const segmentsAround = 24;
  const segmentsDown = 16;
  const { positions, indices } = makeSpherePositions( segmentsAround, segmentsDown );

  // Because positions returned are unit sphere positions so they are exactly
  // the same values we need for normals so we can just duplicated them for the
  // normals.

  const normals = positions.slice();

  // And then we setup the attributes like before

  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;

  const positionAttribute = new THREE.BufferAttribute( positions, positionNumComponents );
  positionAttribute.setUsage( THREE.DynamicDrawUsage );
  geometry.setAttribute(
    'position',
    positionAttribute );
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute( normals, normalNumComponents ) );
  geometry.setIndex( indices );

  // I've highlighted a few differences. We save a reference to the position
  // attribute. We also mark it as dynamic. This is a hint to THREE.js that
  // we're going to be changing the contents of the attribute often.

  function makeInstance( geometry, color, x ) {

    const material = new THREE.MeshPhongMaterial( {
      color,
      side: THREE.DoubleSide,
      shininess: 100,
    } );

    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    cube.position.x = x;
    return cube;

  }

  const cubes = [
    makeInstance( geometry, 0xFF0000, 0 ),
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

  // In our render loop we update the positions based off their normals every
  // frame.

  const temp = new THREE.Vector3();

  function render( time ) {

    time *= 0.001;

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    for ( let i = 0; i < positions.length; i += 3 ) {

      const quad = ( i / 12 | 0 );
      const ringId = quad / segmentsAround | 0;
      const ringQuadId = quad % segmentsAround;
      const ringU = ringQuadId / segmentsAround;
      const angle = ringU * Math.PI * 2;
      temp.fromArray( normals, i );
      temp.multiplyScalar( THREE.MathUtils.lerp( 1, 1.4, Math.sin( time + ringId + angle ) * .5 + .5 ) );
      temp.toArray( positions, i );

    }

    positionAttribute.needsUpdate = true;

    // And we set positionAttribute.needsUpdate to tell THREE.js to use our
    // changes.

    cubes.forEach( ( cube, ndx ) => {

      const speed = - 0.2 + ndx * .1;
      const rot = time * speed;
      cube.rotation.y = rot;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// I hope these were useful examples of how to use BufferGeometry directly to
// make your own geometry and how to dynamically update the contents of a
// BufferAttribute.

// Custom BufferGeometry - Three custom cubes
// Source: https://threejs.org/manual/#custom-buffergeometry
// Local: http://localhost:5173/threejsmanual/22_custom_buffergeometry/1_three_custom_cubes/
//
// BufferGeometry is three.js's way of representing all geometry. A
// BufferGeometry essentially a collection named of BufferAttributes. Each
// BufferAttribute represents an array of one type of data: positions, normals,
// colors, uv, etc... Together, the named BufferAttributes represent parallel
// arrays of all the data for each vertex.
//
// Above you can see we have 4 attributes: position, normal, color, uv. They
// represent parallel arrays which means that the Nth set of data in each
// attribute belongs to the same vertex. The vertex at index = 4 is highlighted
// to show that the parallel data across all attributes defines one vertex.
//
// This brings up a point, here's a diagram of a cube with one corner
// highlighted.
//
// Thinking about it that single corner needs a different normal for each face
// of the cube. A normal is info about which direction something faces. In the
// diagram the normals are presented by the arrows around the corner vertex
// showing that each face that shares that vertex position needs a normal that
// points in a different direction.
//
// That corner needs different UVs for each face as well. UVs are texture
// coordinates that specify which part of a texture being drawn on a triangle
// corresponds to that vertex position. You can see the green face needs that
// vertex to have a UV that corresponds to the top right corner of the F
// texture, the blue face needs a UV that corresponds to the top left corner of
// the F texture, and the red face needs a UV that corresponds to the bottom
// left corner of the F texture.
//
// A single vertex is the combination of all of its parts. If a vertex needs
// any part to be different then it must be a different vertex.
//
// As a simple example let's make a cube using BufferGeometry. A cube is
// interesting because it appears to share vertices at the corners but really
// does not. For our example we'll list out all the vertices with all their
// data and then convert that data into parallel arrays and finally use those
// to make BufferAttributes and add them to a BufferGeometry.

import * as THREE from 'three';
import starUrl from '../resources/images/star.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 5;

  const scene = new THREE.Scene();

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( - 1, 2, 4 );
    scene.add( light );

  }

  // We start with a list of all the data needed for the cube. Remember again
  // that if a vertex has any unique parts it has to be a separate vertex. As
  // such to make a cube requires 36 vertices. 2 triangles per face, 3 vertices
  // per triangle, 6 faces = 36 vertices.

  // NOT A GOOD EXAMPLE OF HOW TO MAKE A CUBE!
  // Only trying to make it clear most vertices are unique
  const vertices = [
    // front
    { pos: [ - 1, - 1, 1 ], norm: [ 0, 0, 1 ], uv: [ 0, 0 ], },
    { pos: [ 1, - 1, 1 ], norm: [ 0, 0, 1 ], uv: [ 1, 0 ], },
    { pos: [ - 1, 1, 1 ], norm: [ 0, 0, 1 ], uv: [ 0, 1 ], },

    { pos: [ - 1, 1, 1 ], norm: [ 0, 0, 1 ], uv: [ 0, 1 ], },
    { pos: [ 1, - 1, 1 ], norm: [ 0, 0, 1 ], uv: [ 1, 0 ], },
    { pos: [ 1, 1, 1 ], norm: [ 0, 0, 1 ], uv: [ 1, 1 ], },
    // right
    { pos: [ 1, - 1, 1 ], norm: [ 1, 0, 0 ], uv: [ 0, 0 ], },
    { pos: [ 1, - 1, - 1 ], norm: [ 1, 0, 0 ], uv: [ 1, 0 ], },
    { pos: [ 1, 1, 1 ], norm: [ 1, 0, 0 ], uv: [ 0, 1 ], },

    { pos: [ 1, 1, 1 ], norm: [ 1, 0, 0 ], uv: [ 0, 1 ], },
    { pos: [ 1, - 1, - 1 ], norm: [ 1, 0, 0 ], uv: [ 1, 0 ], },
    { pos: [ 1, 1, - 1 ], norm: [ 1, 0, 0 ], uv: [ 1, 1 ], },
    // back
    { pos: [ 1, - 1, - 1 ], norm: [ 0, 0, - 1 ], uv: [ 0, 0 ], },
    { pos: [ - 1, - 1, - 1 ], norm: [ 0, 0, - 1 ], uv: [ 1, 0 ], },
    { pos: [ 1, 1, - 1 ], norm: [ 0, 0, - 1 ], uv: [ 0, 1 ], },

    { pos: [ 1, 1, - 1 ], norm: [ 0, 0, - 1 ], uv: [ 0, 1 ], },
    { pos: [ - 1, - 1, - 1 ], norm: [ 0, 0, - 1 ], uv: [ 1, 0 ], },
    { pos: [ - 1, 1, - 1 ], norm: [ 0, 0, - 1 ], uv: [ 1, 1 ], },
    // left
    { pos: [ - 1, - 1, - 1 ], norm: [ - 1, 0, 0 ], uv: [ 0, 0 ], },
    { pos: [ - 1, - 1, 1 ], norm: [ - 1, 0, 0 ], uv: [ 1, 0 ], },
    { pos: [ - 1, 1, - 1 ], norm: [ - 1, 0, 0 ], uv: [ 0, 1 ], },

    { pos: [ - 1, 1, - 1 ], norm: [ - 1, 0, 0 ], uv: [ 0, 1 ], },
    { pos: [ - 1, - 1, 1 ], norm: [ - 1, 0, 0 ], uv: [ 1, 0 ], },
    { pos: [ - 1, 1, 1 ], norm: [ - 1, 0, 0 ], uv: [ 1, 1 ], },
    // top
    { pos: [ 1, 1, - 1 ], norm: [ 0, 1, 0 ], uv: [ 0, 0 ], },
    { pos: [ - 1, 1, - 1 ], norm: [ 0, 1, 0 ], uv: [ 1, 0 ], },
    { pos: [ 1, 1, 1 ], norm: [ 0, 1, 0 ], uv: [ 0, 1 ], },

    { pos: [ 1, 1, 1 ], norm: [ 0, 1, 0 ], uv: [ 0, 1 ], },
    { pos: [ - 1, 1, - 1 ], norm: [ 0, 1, 0 ], uv: [ 1, 0 ], },
    { pos: [ - 1, 1, 1 ], norm: [ 0, 1, 0 ], uv: [ 1, 1 ], },
    // bottom
    { pos: [ 1, - 1, 1 ], norm: [ 0, - 1, 0 ], uv: [ 0, 0 ], },
    { pos: [ - 1, - 1, 1 ], norm: [ 0, - 1, 0 ], uv: [ 1, 0 ], },
    { pos: [ 1, - 1, - 1 ], norm: [ 0, - 1, 0 ], uv: [ 0, 1 ], },

    { pos: [ 1, - 1, - 1 ], norm: [ 0, - 1, 0 ], uv: [ 0, 1 ], },
    { pos: [ - 1, - 1, 1 ], norm: [ 0, - 1, 0 ], uv: [ 1, 0 ], },
    { pos: [ - 1, - 1, - 1 ], norm: [ 0, - 1, 0 ], uv: [ 1, 1 ], },
  ];

  // We can then translate all of that into 3 parallel arrays

  const positions = [];
  const normals = [];
  const uvs = [];
  for ( const vertex of vertices ) {

    positions.push( ...vertex.pos );
    normals.push( ...vertex.norm );
    uvs.push( ...vertex.uv );

  }

  // Finally we can create a BufferGeometry and then a BufferAttribute for each
  // array and add it to the BufferGeometry.

  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute( new Float32Array( positions ), positionNumComponents ) );
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute( new Float32Array( normals ), normalNumComponents ) );
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute( new Float32Array( uvs ), uvNumComponents ) );

  // Note that the names are significant. You must name your attributes the
  // names that match what three.js expects (unless you are creating a custom
  // shader). In this case position, normal, and uv. If you want vertex colors
  // then name your attribute color.
  //
  // Above we created 3 JavaScript native arrays, positions, normals and uvs. We
  // then convert those into TypedArrays
  // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
  // of type Float32Array. A BufferAttribute requires a TypedArray not a native
  // array. A BufferAttribute also requires you to tell it how many components
  // there are per vertex. For the positions and normals we have 3 components
  // per vertex, x, y, and z. For the UVs we have 2, u and v.

  const loader = new THREE.TextureLoader();
  const texture = loader.load( starUrl );
  texture.colorSpace = THREE.SRGBColorSpace;

  function makeInstance( geometry, color, x ) {

    const material = new THREE.MeshPhongMaterial( { color, map: texture } );

    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    cube.position.x = x;
    return cube;

  }

  const cubes = [
    makeInstance( geometry, 0x88FF88, 0 ),
    makeInstance( geometry, 0x8888FF, - 4 ),
    makeInstance( geometry, 0xFF8888, 4 ),
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

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    cubes.forEach( ( cube, ndx ) => {

      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// That's a lot of data. A small thing we can do is use indices to reference
// the vertices. Looking back at our cube data, each face is made from 2
// triangles with 3 vertices each, 6 vertices total, but 2 of those vertices
// are exactly the same; The same position, the same normal, and the same uv.
// So, we can remove the matching vertices and then reference them by index.
// First we remove the matching vertices.
//
// So now we have 24 unique vertices. Then we specify 36 indices for the 36
// vertices we need drawn to make 12 triangles by calling
// BufferGeometry.setIndex with an array of indices.

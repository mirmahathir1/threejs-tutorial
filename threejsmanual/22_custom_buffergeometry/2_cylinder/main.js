// Custom BufferGeometry - Cylinder
// Source: https://threejs.org/manual/#custom-buffergeometry
// Local: http://localhost:5173/threejsmanual/22_custom_buffergeometry/2_cylinder/
//
// BufferGeometry has a computeVertexNormals method for computing normals if
// you are not supplying them. Unfortunately, since positions can not be shared
// if any other part of a vertex is different, the results of calling
// computeVertexNormals will generate seams if your geometry is supposed to
// connect to itself like a sphere or a cylinder.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import starLightUrl from '../resources/images/star-light.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 60;
  const aspect = 2;
  const near = 0.1;
  const far = 50;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 15;

  const scene = new THREE.Scene();
  scene.add( camera );

  const root = new THREE.Object3D();
  scene.add( root );

  const controls = new OrbitControls( camera, canvas );
  controls.rotateSpeed = 1 / 6;
  controls.enableZoom = false;
  controls.enablePan = false;

  camera.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444, .5 ) );
  const light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set( - 1, 2, 4 - 15 );
  camera.add( light );

  const loader = new THREE.TextureLoader();
  const texture = loader.load( starLightUrl );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 3, 1 );

  function makeMesh( geometry ) {

    const material = new THREE.MeshPhongMaterial( {
      color: 'hsl(300,50%,50%)',
      side: THREE.DoubleSide,
      map: texture,
    } );
    return new THREE.Mesh( geometry, material );

  }

  const numSegments = 24;
  const positions = [];
  const uvs = [];
  for ( let s = 0; s <= numSegments; ++ s ) {

    const u = s / numSegments;
    const a = u * Math.PI * 2;
    const x = Math.sin( a );
    const z = Math.cos( a );
    positions.push( x, - 1, z );
    positions.push( x, 1, z );
    uvs.push( u, 0 );
    uvs.push( u, 1 );

  }

  const indices = [];
  for ( let s = 0; s < numSegments; ++ s ) {

    const ndx = s * 2;
    indices.push(
      ndx, ndx + 2, ndx + 1,
      ndx + 1, ndx + 2, ndx + 3,
    );

  }

  const positionNumComponents = 3;
  const uvNumComponents = 2;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute( new Float32Array( positions ), positionNumComponents ) );
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute( new Float32Array( uvs ), uvNumComponents ) );

  geometry.setIndex( indices );

  // For the cylinder above the normals were created using
  // computeVertexNormals. If you look closely there is a seam on the cylinder.
  // This is because there is no way to share the vertices at the start and end
  // of the cylinder since they require different UVs so the function to compute
  // them has no idea those are the same vertices to smooth over them. Just a
  // small thing to be aware of. The solution is to supply your own normals.

  geometry.computeVertexNormals();
  geometry.scale( 5, 5, 5 );
  root.add( makeMesh( geometry ) );

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

    root.rotation.x = time * .1;
    root.rotation.y = time * .11;

    controls.update();

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// TextGeometry
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/17_text/
//
// 3D text generated from a 3D font and a string

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import fontUrl from '../fonts/helvetiker_regular.typeface.json?url';

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

  function addShape( x, createGeometry ) {

    const material = new THREE.MeshPhongMaterial( {
      flatShading: true,
      side: THREE.DoubleSide,
    } );
    material.color.setHSL( Math.random(), .5, .5 );

    const lineMaterial = new THREE.LineBasicMaterial( {
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    } );

    const mesh = new THREE.Mesh( new THREE.BufferGeometry(), material );
    const lineMesh = new THREE.LineSegments( mesh.geometry, lineMaterial );

    const parent = new THREE.Object3D();
    parent.add( mesh );
    parent.add( lineMesh );

    addObject( x, 0, parent );

    function update() {

      const geometry = createGeometry();
      geometry.computeBoundingBox();
      const centerOffset = new THREE.Vector3();
      geometry.boundingBox.getCenter( centerOffset ).multiplyScalar( - 1 );

      mesh.geometry.dispose();
      mesh.geometry = geometry;
      lineMesh.geometry = geometry;
      mesh.position.copy( centerOffset );
      lineMesh.position.copy( centerOffset );

    }

    update();
    return update;

  }

  const gui = new GUI();

  {

    const loader = new FontLoader();

    loader.load( fontUrl, ( font ) => {

      const params = {
        text: 'three.js',
        size: 3,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.3,
        bevelSegments: 5,
      };

      const update = addShape( 0, () => {

        const { text, size, depth, curveSegments, bevelEnabled, bevelThickness, bevelSize, bevelSegments } = params;
        return new TextGeometry( text, {
          font: font,
          size,
          depth,
          curveSegments,
          bevelEnabled,
          bevelThickness,
          bevelSize,
          bevelSegments,
        } );

      } );

      gui.add( params, 'text' ).onChange( update );
      gui.add( params, 'size', 1, 10, 0.1 ).onChange( update );
      gui.add( params, 'depth', 0.1, 10, 0.1 ).onChange( update );
      gui.add( params, 'curveSegments', 1, 20, 1 ).onChange( update );
      gui.add( params, 'bevelEnabled' ).onChange( update );
      gui.add( params, 'bevelThickness', 0.1, 3, 0.01 ).onChange( update );
      gui.add( params, 'bevelSize', 0.1, 3, 0.01 ).onChange( update );
      gui.add( params, 'bevelSegments', 0, 8, 1 ).onChange( update );

    } );

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

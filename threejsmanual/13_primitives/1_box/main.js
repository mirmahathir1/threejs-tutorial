// BoxGeometry
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/1_box/
//
// This article is one in a series of articles about three.js. The first article
// was about fundamentals (https://threejs.org/manual/#fundamentals). If you
// haven't read that yet you might want to start there.
//
// Three.js has a large number of primitives. Primitives are generally 3D shapes
// that are generated at runtime with a bunch of parameters.
//
// It's common to use primitives for things like a sphere for a globe or a bunch
// of boxes to draw a 3D graph. It's especially common to use primitives to
// experiment and get started with 3D. For the majority of 3D apps it's more
// common to have an artist make 3D models in a 3D modeling program like Blender
// (https://blender.org) or Maya (https://www.autodesk.com/products/maya/) or
// Cinema 4D (https://www.maxon.net/en-us/products/cinema-4d/). Later in this
// series we'll cover making and loading data from several 3D modeling programs.
// For now let's go over some of the available primitives.
//
// Many of the primitives below have defaults for some or all of their
// parameters so you can use more or less depending on your needs.
//
// A Box

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

    const params = {
      width: 8,
      height: 8,
      depth: 8,
    };

    const update = addShape( - .6, () => {

      const { width, height, depth } = params;
      return new THREE.BoxGeometry( width, height, depth );

    } );

    const folder = gui.addFolder( 'left' );
    folder.add( params, 'width', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'height', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'depth', 1, 10, 0.1 ).onChange( update );

  }

  {

    const params = {
      width: 8,
      height: 8,
      depth: 8,
      widthSegments: 4,
      heightSegments: 4,
      depthSegments: 4,
    };

    const update = addShape( .6, () => {

      const { width, height, depth, widthSegments, heightSegments, depthSegments } = params;
      return new THREE.BoxGeometry(
        width, height, depth,
        widthSegments, heightSegments, depthSegments );

    } );

    const folder = gui.addFolder( 'right' );
    folder.add( params, 'width', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'height', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'depth', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'widthSegments', 1, 10, 1 ).onChange( update );
    folder.add( params, 'heightSegments', 1, 10, 1 ).onChange( update );
    folder.add( params, 'depthSegments', 1, 10, 1 ).onChange( update );

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

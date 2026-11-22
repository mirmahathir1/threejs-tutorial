// RingGeometry
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/13_ring/
//
// A 2D disc with a hole in the center

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
      innerRadius: 2,
      outerRadius: 7,
      thetaSegments: 18,
    };

    const update = addShape( - .6, () => {

      const { innerRadius, outerRadius, thetaSegments } = params;
      return new THREE.RingGeometry(
        innerRadius, outerRadius, thetaSegments );

    } );

    const folder = gui.addFolder( 'left' );
    folder.add( params, 'innerRadius', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'outerRadius', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'thetaSegments', 1, 30, 1 ).onChange( update );

  }

  {

    const params = {
      innerRadius: 2,
      outerRadius: 7,
      thetaSegments: 18,
      phiSegments: 2,
      thetaStart: 0.25,
      thetaLength: 1.5,
    };

    const update = addShape( .6, () => {

      const { innerRadius, outerRadius, thetaSegments, phiSegments } = params;
      const thetaStart = Math.PI * params.thetaStart;
      const thetaLength = Math.PI * params.thetaLength;
      return new THREE.RingGeometry(
        innerRadius, outerRadius,
        thetaSegments, phiSegments,
        thetaStart, thetaLength );

    } );

    const folder = gui.addFolder( 'right' );
    folder.add( params, 'innerRadius', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'outerRadius', 1, 10, 0.1 ).onChange( update );
    folder.add( params, 'thetaSegments', 1, 30, 1 ).onChange( update );
    folder.add( params, 'phiSegments', 1, 10, 1 ).onChange( update );
    folder.add( params, 'thetaStart', 0, 2, 0.01 ).name( 'thetaStart × π' ).onChange( update );
    folder.add( params, 'thetaLength', 0, 2, 0.01 ).name( 'thetaLength × π' ).onChange( update );

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

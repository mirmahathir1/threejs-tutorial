// ExtrudeGeometry
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/6_extrude/
//
// An extruded 2d shape with optional bevelling. Here we are extruding a heart
// shape. Note this is the basis for TextGeometry.

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
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 2,
    };

    const update = addShape( - .6, () => {

      const shape = new THREE.Shape();
      const x = - 2.5;
      const y = - 5;
      shape.moveTo( x + 2.5, y + 2.5 );
      shape.bezierCurveTo( x + 2.5, y + 2.5, x + 2, y, x, y );
      shape.bezierCurveTo( x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5 );
      shape.bezierCurveTo( x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5 );
      shape.bezierCurveTo( x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5 );
      shape.bezierCurveTo( x + 8, y + 3.5, x + 8, y, x + 5, y );
      shape.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );

      const { steps, depth, bevelEnabled, bevelThickness, bevelSize, bevelSegments } = params;
      const extrudeSettings = {
        steps,
        depth,
        bevelEnabled,
        bevelThickness,
        bevelSize,
        bevelSegments,
      };

      return new THREE.ExtrudeGeometry( shape, extrudeSettings );

    } );

    const folder = gui.addFolder( 'left' );
    folder.add( params, 'steps', 1, 100, 1 ).onChange( update );
    folder.add( params, 'depth', 1, 20, 0.1 ).onChange( update );
    folder.add( params, 'bevelEnabled' ).onChange( update );
    folder.add( params, 'bevelThickness', 0.1, 3, 0.01 ).onChange( update );
    folder.add( params, 'bevelSize', 0.1, 3, 0.01 ).onChange( update );
    folder.add( params, 'bevelSegments', 0, 8, 1 ).onChange( update );

  }

  {

    const params = {
      steps: 100,
    };

    const update = addShape( .6, () => {

      const outline = new THREE.Shape( [
        [ - 2, - 0.1 ], [ 2, - 0.1 ], [ 2, 0.6 ],
        [ 1.6, 0.6 ], [ 1.6, 0.1 ], [ - 2, 0.1 ],
      ].map( p => new THREE.Vector2( ...p ) ) );

      const x = - 2.5;
      const y = - 5;
      const shape = new THREE.CurvePath();
      const points = [
        [ x + 2.5, y + 2.5 ],
        [ x + 2.5, y + 2.5 ], [ x + 2, y ], [ x, y ],
        [ x - 3, y ], [ x - 3, y + 3.5 ], [ x - 3, y + 3.5 ],
        [ x - 3, y + 5.5 ], [ x - 1.5, y + 7.7 ], [ x + 2.5, y + 9.5 ],
        [ x + 6, y + 7.7 ], [ x + 8, y + 4.5 ], [ x + 8, y + 3.5 ],
        [ x + 8, y + 3.5 ], [ x + 8, y ], [ x + 5, y ],
        [ x + 3.5, y ], [ x + 2.5, y + 2.5 ], [ x + 2.5, y + 2.5 ],
      ].map( p => new THREE.Vector3( ...p, 0 ) );
      for ( let i = 0; i < points.length; i += 3 ) {

        shape.add( new THREE.CubicBezierCurve3( ...points.slice( i, i + 4 ) ) );

      }

      const extrudeSettings = {
        steps: params.steps,
        bevelEnabled: false,
        extrudePath: shape,
      };

      return new THREE.ExtrudeGeometry( outline, extrudeSettings );

    } );

    const folder = gui.addFolder( 'right' );
    folder.add( params, 'steps', 1, 100, 1 ).onChange( update );

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

// EdgesGeometry
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/21_edges/
//
// A helper object that takes another geometry as input and generates edges only
// if the angle between faces is greater than some threshold. For example if you
// look at the box at the top it shows a line going through each face showing
// every triangle that makes the box. Using an EdgesGeometry instead the middle
// lines are removed. Adjust the thresholdAngle below and you'll see the edges
// below that threshold disappear.

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

  function addLines( x, createGeometry ) {

    const material = new THREE.LineBasicMaterial( {
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
    } );

    const lineMesh = new THREE.LineSegments( new THREE.BufferGeometry(), material );

    const parent = new THREE.Object3D();
    parent.add( lineMesh );

    addObject( x, 0, parent );

    function update() {

      const geometry = createGeometry();
      geometry.computeBoundingBox();
      const centerOffset = new THREE.Vector3();
      geometry.boundingBox.getCenter( centerOffset ).multiplyScalar( - 1 );

      lineMesh.geometry.dispose();
      lineMesh.geometry = geometry;
      lineMesh.position.copy( centerOffset );

    }

    update();
    return update;

  }

  const gui = new GUI();

  {

    addLines( - .6, () => {

      const size = 8;
      const widthSegments = 2;
      const heightSegments = 2;
      const depthSegments = 2;
      const boxGeometry = new THREE.BoxGeometry(
        size, size, size,
        widthSegments, heightSegments, depthSegments );
      return new THREE.EdgesGeometry( boxGeometry );

    } );

  }

  {

    const params = {
      thresholdAngle: 1,
    };

    const update = addLines( .6, () => {

      const radius = 7;
      const widthSegments = 6;
      const heightSegments = 3;
      const sphereGeometry = new THREE.SphereGeometry(
        radius, widthSegments, heightSegments );
      const { thresholdAngle } = params;
      return new THREE.EdgesGeometry( sphereGeometry, thresholdAngle );

    } );

    const folder = gui.addFolder( 'right' );
    folder.add( params, 'thresholdAngle', 1, 180, 1 ).onChange( update );

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

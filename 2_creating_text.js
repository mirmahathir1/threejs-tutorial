// Creating Text: 5. Procedural Text Geometry
// Source: https://threejs.org/manual/#creating-text
//
// If you prefer to work purely in THREE.js or to create procedural and dynamic
// 3D text geometries, you can create a mesh whose geometry is an instance of
// THREE.TextGeometry:
//
//   new THREE.TextGeometry( text, parameters );
//
// In order for this to work, however, your TextGeometry will need an instance
// of THREE.Font to be set on its "font" parameter.
//
// Everything else is the same as 1_creating_a_scene.js, with the cube replaced
// by text.

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import helvetiker from './fonts/helvetiker_regular.typeface.json';

// three.js has no built-in default font, so we bundle Helvetiker (one of the
// typeface JSON fonts from the three.js repo) and wrap it in a THREE.Font.
const font = new Font( helvetiker );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// In place of BoxGeometry, we use TextGeometry. The defaults (size 100, depth
// 50) are far too big for this camera, so only those two are overridden.
const geometry = new TextGeometry( 'Hello', { font: font, size: 1, depth: 0.2 } );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const text = new THREE.Mesh( geometry, material );
scene.add( text );

camera.position.z = 5;

function animate( time ) {

  text.rotation.x = time / 2000;
  text.rotation.y = time / 1000;

  renderer.render( scene, camera );

}

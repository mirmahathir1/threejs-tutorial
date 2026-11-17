// Loading 3D Models
// Source: https://threejs.org/manual/#loading-3d-models
//
// 3D models are available in hundreds of file formats, each with different
// purposes, assorted features, and varying complexity. Although three.js
// provides many loaders, choosing the right format and workflow will save time
// and frustration later on. Some formats are difficult to work with,
// inefficient for realtime experiences, or simply not fully supported at this
// time.
//
// Recommended workflow
//
// Where possible, we recommend using glTF (GL Transmission Format). Both .GLB
// and .GLTF versions of the format are well supported. Because glTF is focused
// on runtime asset delivery, it is compact to transmit and fast to load.
// Features include meshes, materials, textures, skins, skeletons, morph
// targets, animations, lights, and cameras.
//
// Public-domain glTF files are available on sites like Sketchfab, or various
// tools include glTF export (Blender, Substance Painter, Modo, Toolbag,
// Houdini, Cinema 4D, COLLADA2GLTF, FBX2GLTF, OBJ2GLTF, and many more).
//
// When glTF is not an option, popular formats such as FBX, OBJ, or COLLADA are
// also available and regularly maintained.

import * as THREE from 'three';

// Loading
//
// Only a few loaders (e.g. ObjectLoader) are included by default with
// three.js - others should be added to your app individually.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Same scene, camera and renderer as 1_creating_a_scene/main.js.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// Troubleshooting: try to add and position a light source. The model may be
// hidden in the dark. (The model's material reacts to light, unlike
// MeshBasicMaterial, so without a light it would render completely black.)
scene.add( new THREE.HemisphereLight( 0xffffff, 0x444444, 3 ) );

// Once you've imported a loader, you're ready to add a model to your scene.
// Syntax varies among different loaders - when using another format, check the
// examples and documentation for that loader.
const loader = new GLTFLoader();

// Holds the loaded model so animate() can rotate it.
let duck;

loader.load( '/4_loading_3d_models/Duck.glb', function ( gltf ) {

  duck = gltf.scene;
  scene.add( duck );

}, undefined, function ( error ) {

  // Troubleshooting: check the JavaScript console for errors, and make sure
  // you've used an onError callback when calling .load() to log the result.
  console.error( error );

} );

// More troubleshooting, if the model is distorted, miscolored, or missing:
//
// - View the model in another application. For glTF, drag-and-drop viewers are
//   available for three.js and babylon.js. If the model appears correctly in
//   one or more applications, file a bug against three.js. If the model cannot
//   be shown in any application, we strongly encourage filing a bug with the
//   application used to create the model.
//
// - Try scaling the model up or down by a factor of 1000. Many models are
//   scaled differently, and large models may not appear if the camera is inside
//   the model.
//
// - Look for failed texture requests in the network tab, like
//   "C:\\Path\To\Model\texture.jpg". Use paths relative to your model instead,
//   such as images/texture.jpg - this may require editing the model file in a
//   text editor.

// The model loads in the background, so keep rendering every frame and it
// shows up as soon as it has been added to the scene.
function animate( time ) {

  // Spin around the vertical (y) axis once the model has loaded.
  if ( duck ) {

    duck.rotation.y = time / 1000;

  }

  renderer.render( scene, camera );

}

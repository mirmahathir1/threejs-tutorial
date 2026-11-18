// How to use Post Processing
// Source: https://threejs.org/manual/#how-to-use-post-processing
//
// Many three.js applications render their 3D objects directly to the screen.
// Sometimes, however, you want to apply one or more graphical effects like
// Depth-Of-Field, Bloom, Film Grain or various types of Anti-aliasing.
// Post-processing is a widely used approach to implement such effects. First,
// the scene is rendered to a render target which represents a buffer in the
// video card's memory. In the next step one or more post-processing passes
// apply filters and effects to the image buffer before it is eventually
// rendered to the screen.
//
// three.js provides a complete post-processing solution via EffectComposer to
// implement such a workflow.
//
// Workflow
//
// The first step in the process is to import all necessary files from the
// examples directory. The guide assumes you are using the official npm package
// (https://www.npmjs.com/package/three) of three.js. For our basic demo in
// this guide we need the following files.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshNormalMaterial() );
cube.rotation.set( 0.5, 0.5, 0 );
scene.add( cube );

// After all files are successfully imported, we can create our composer by
// passing in an instance of WebGLRenderer.

const composer = new EffectComposer( renderer );

// When using a composer, it's necessary to change the application's animation
// loop. Instead of calling the render method of WebGLRenderer, we now use the
// respective counterpart of EffectComposer.

function animate() {

  requestAnimationFrame( animate );

  composer.render();

}

// Our composer is now ready so it's possible to configure the chain of
// post-processing passes. These passes are responsible for creating the final
// visual output of the application. They are processed in order of their
// addition/insertion. In our example, the instance of RenderPass is executed
// first, then the instance of GlitchPass and finally OutputPass. The last
// enabled pass in the chain is automatically rendered to the screen. The setup
// of the passes looks like so:

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const glitchPass = new GlitchPass();
composer.addPass( glitchPass );

const outputPass = new OutputPass();
composer.addPass( outputPass );

// RenderPass is normally placed at the beginning of the chain in order to
// provide the rendered scene as an input for the next post-processing step. In
// our case, GlitchPass is going to use these image data to apply a wild glitch
// effect. OutputPass is usually the last pass in the chain which performs sRGB
// color space conversion and tone mapping. Check out this live example
// (https://threejs.org/examples/webgl_postprocessing_glitch) to see it in
// action.
//
// Built-in Passes
//
// You can use a wide range of pre-defined post-processing passes provided by
// the engine. They are located in the postprocessing
// (https://github.com/mrdoob/three.js/tree/dev/examples/jsm/postprocessing)
// directory.
//
// Custom Passes
//
// Sometimes you want to write a custom post-processing shader and include it
// into the chain of post-processing passes. For this scenario, you can utilize
// ShaderPass. After importing the file and your custom shader, you can use the
// following code to setup the pass.

import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';

// later in your init routine

const luminosityPass = new ShaderPass( LuminosityShader );
composer.addPass( luminosityPass );

// The repository provides a file called CopyShader
// (https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/CopyShader.js)
// which is a good starting code for your own custom shader. CopyShader just
// copies the image contents of the EffectComposer's read buffer to its write
// buffer without applying any effects.

animate();

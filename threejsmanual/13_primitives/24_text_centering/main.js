// Primitives Text
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/24_text_centering/

import * as THREE from 'three';
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

  function createMaterial() {

    const material = new THREE.MeshPhongMaterial( {
      side: THREE.DoubleSide,
    } );

    const hue = Math.random();
    const saturation = 1;
    const luminance = .5;
    material.color.setHSL( hue, saturation, luminance );

    return material;

  }

  function addSolidGeometry( x, y, geometry ) {

    const mesh = new THREE.Mesh( geometry, createMaterial() );
    addObject( x, y, mesh );

  }

  // There are a couple of notable exceptions to the pattern above. The biggest
  // is probably the TextGeometry. It needs to load 3D font data before it can
  // generate a mesh for the text. That data loads asynchronously so we need to
  // wait for it to load before trying to create the geometry. By promisifiying
  // font loading we can make it mush easier. We create a FontLoader and then a
  // function loadFont that returns a promise that on resolve will give us the
  // font. We then create an async function called doit and load the font using
  // await. And finally create the geometry and call addObject to add it the
  // scene.

  {

    const loader = new FontLoader();
    // promisify font loading
    function loadFont( url ) {

      return new Promise( ( resolve, reject ) => {

        loader.load( url, resolve, undefined, reject );

      } );

    }

    async function doit() {

      const font = await loadFont( fontUrl );
      const geometry = new TextGeometry( 'three.js', {
        font: font,
        size: 3.0,
        depth: .2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: .3,
        bevelSegments: 5,
      } );

      addSolidGeometry( - .5, 0, geometry );

      // There's one other difference. We want to spin the text around its
      // center but by default three.js creates the text such that its center
      // of rotation is on the left edge. To work around this we can ask
      // three.js to compute the bounding box of the geometry. We can then call
      // the getCenter method of the bounding box and pass it our mesh's
      // position object. getCenter copies the center of the box into the
      // position. It also returns the position object so we can call
      // multiplyScalar(-1) to position the entire object such that its center
      // of rotation is at the center of the object.

      const mesh = new THREE.Mesh( geometry, createMaterial() );
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter( mesh.position ).multiplyScalar( - 1 );

      // If we then just called addSolidGeometry like with previous examples it
      // would set the position again which is no good. So, in this case we
      // create an Object3D which is the standard node for the three.js scene
      // graph. Mesh is inherited from Object3D as well. We'll cover how the
      // scene graph works in another article
      // (https://threejs.org/manual/#scenegraph). For now it's enough to know
      // that like DOM nodes, children are drawn relative to their parent. By
      // making an Object3D and making our mesh a child of that we can position
      // the Object3D wherever we want and still keep the center offset we set
      // earlier.
      //
      // If we didn't do this the text would spin off center.

      const parent = new THREE.Object3D();
      parent.add( mesh );

      addObject( .5, 0, parent );

    }

    doit();

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

// Notice the one on the left is not spinning around its center whereas the one
// on the right is.

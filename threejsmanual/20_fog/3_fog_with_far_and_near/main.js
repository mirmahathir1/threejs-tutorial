// Fog - Fog with near and far
// Source: https://threejs.org/manual/#fog
// Local: http://localhost:5173/threejsmanual/20_fog/3_fog_with_far_and_near/
//
// Here is one of our previous examples with fog added. The only addition is
// right after setting up the scene we add the fog and set the scene's
// background color

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
  const gui = new GUI();

  // In the example below the camera's near is 0.1 and its far is 5. The camera
  // is at z = 2. The cubes are 1 unit large and at Z = 0. This means with a fog
  // setting of near = 1 and far = 2 the cubes will fade out right around their
  // center.

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 2;

  const scene = new THREE.Scene();

  // Let's add an interface so we can adjust the fog. Again we'll use lil-gui
  // (https://github.com/georgealways/lil-gui). lil-gui takes an object and a
  // property and automagically makes an interface for that type of property. We
  // could just simply let it manipulate the fog's near and far properties but
  // it's invalid to have near be greater than far so let's make a helper so
  // lil-gui can manipulate a near and far property but we'll make sure near is
  // less than or equal to far and far is greater than or equal near.
  //
  // It might also be nice to be able to change the fog color but like was
  // mentioned above we need to keep both the fog color and the background color
  // in sync. So, let's add another virtual property to our helper that will set
  // both colors when lil-gui manipulates it.
  //
  // lil-gui can manipulate colors in 4 ways, as a CSS 6 digit hex string (eg:
  // #112233). As an hue, saturation, value, object (eg: {h: 60, s: 1, v: }). As
  // an RGB array (eg: [255, 128, 64]). Or, as an RGBA array (eg: [127, 200, 75,
  // 0.3]).
  //
  // It's easiest for our purpose to use the hex string version since that way
  // lil-gui is only manipulating a single value. Fortunately THREE.Color as a
  // getHexString method we get use to easily get such a string, we just have to
  // prepend a '#' to the front.

  // We use this class to pass to lil-gui
  // so when it manipulates near or far
  // near is never > far and far is never < near
  // Also when lil-gui manipulates color we'll
  // update both the fog and background colors.
  class FogGUIHelper {

    constructor( fog, backgroundColor ) {

      this.fog = fog;
      this.backgroundColor = backgroundColor;

    }
    get near() {

      return this.fog.near;

    }
    set near( v ) {

      this.fog.near = v;
      this.fog.far = Math.max( this.fog.far, v );

    }
    get far() {

      return this.fog.far;

    }
    set far( v ) {

      this.fog.far = v;
      this.fog.near = Math.min( this.fog.near, v );

    }
    get color() {

      return `#${this.fog.color.getHexString()}`;

    }
    set color( hexString ) {

      this.fog.color.set( hexString );
      this.backgroundColor.set( hexString );

    }

  }

  // We can then add it like this
  //
  // The near and far parameters set the minimum and maximum values for
  // adjusting the fog. They are set when we setup the camera.
  //
  // The .listen() at the end of the last 2 lines tells lil-gui to listen for
  // changes. That way when we change near because of an edit to far or we
  // change far in response to an edit to near lil-gui will update the other
  // property's UI for us.
  //
  // We then call gui.addColor to add a color UI for our helper's virtual
  // property.

  {

    const near = 1;
    const far = 2;
    const color = 'lightblue';
    scene.fog = new THREE.Fog( color, near, far );
    scene.background = new THREE.Color( color );

    const fogGUIHelper = new FogGUIHelper( scene.fog, scene.background );
    gui.add( fogGUIHelper, 'near', near, far ).listen();
    gui.add( fogGUIHelper, 'far', near, far ).listen();
    gui.addColor( fogGUIHelper, 'color' );

  }

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( - 1, 2, 4 );
    scene.add( light );

  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

  function makeInstance( geometry, color, x ) {

    const material = new THREE.MeshPhongMaterial( { color } );

    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    cube.position.x = x;

    return cube;

  }

  const cubes = [
    makeInstance( geometry, 0x44aa88, 0 ),
    makeInstance( geometry, 0x8844aa, - 2 ),
    makeInstance( geometry, 0xaa8844, 2 ),
  ];

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

    cubes.forEach( ( cube, ndx ) => {

      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// You can see setting near to like 1.9 and far to 2.0 gives a very sharp
// transition between un-fogged and completely fogged. where as near = 1.1 and
// far = 2.9 should just about be the smoothest given our cubes are spinning 2
// units away from the camera.

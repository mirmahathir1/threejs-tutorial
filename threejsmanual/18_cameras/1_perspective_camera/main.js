// Cameras - PerspectiveCamera
// Source: https://threejs.org/manual/#cameras
// Local: http://localhost:5173/threejsmanual/18_cameras/1_perspective_camera/
//
// This article is one in a series of articles about three.js. The first
// article was about fundamentals (https://threejs.org/manual/#fundamentals).
// If you haven't read that yet you might want to start there.
//
// Let's talk about cameras in three.js. We covered some of this in the first
// article but we'll cover it in more detail here.
//
// The most common camera in three.js and the one we've been using up to this
// point is the PerspectiveCamera. It gives a 3d view where things in the
// distance appear smaller than things up close.
//
// The PerspectiveCamera defines a frustum. A frustum is a solid pyramid shape
// with the tip cut off (https://en.wikipedia.org/wiki/Frustum). By name of a
// solid I mean for example a cube, a cone, a sphere, a cylinder, and a frustum
// are all names of different kinds of solids.
//
// I only point that out because I didn't know it for years. Some book or page
// would mention frustum and my eyes would glaze over. Understanding it's the
// name of a type of solid shape made those descriptions suddenly make more
// sense 😅
//
// A PerspectiveCamera defines its frustum based on 4 properties. near defines
// where the front of the frustum starts. far defines where it ends. fov, the
// field of view, defines how tall the front and back of the frustum are by
// computing the correct height to get the specified field of view at near
// units from the camera. The aspect defines how wide the front and back of the
// frustum are. The width of the frustum is just the height multiplied by the
// aspect.
//
// Let's use the scene from the previous article
// (https://threejs.org/manual/#lights) that has a ground plane, a sphere, and
// a cube and make it so we can adjust the camera's settings.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import checkerUrl from '../resources/images/checker.png';

function main() {

  const canvas = document.querySelector( '#c' );

  // Now let's look up the 2 view elements.

  const view1Elem = document.querySelector( '#view1' );
  const view2Elem = document.querySelector( '#view2' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 5;
  const far = 100;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 10, 20 );

  // Then in our code we'll add a CameraHelper. A CameraHelper draws the
  // frustum for a Camera

  const cameraHelper = new THREE.CameraHelper( camera );

  // To do that we'll make a MinMaxGUIHelper for the near and far settings so
  // far is always greater than near. It will have min and max properties that
  // lil-gui will adjust. When adjusted they'll set the 2 properties we specify.

  class MinMaxGUIHelper {

    constructor( obj, minProp, maxProp, minDif ) {

      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;

    }
    get min() {

      return this.obj[ this.minProp ];

    }
    set min( v ) {

      this.obj[ this.minProp ] = v;
      this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );

    }
    get max() {

      return this.obj[ this.maxProp ];

    }
    set max( v ) {

      this.obj[ this.maxProp ] = v;
      this.min = this.min; // this will call the min setter

    }

  }

  // Now we can setup our GUI like this
  //
  // Anytime the camera's settings change we need to call the camera's
  // updateProjectionMatrix function so we made a function called updateCamera
  // add passed it to lil-gui to call it when things change.
  //
  // You can adjust the values and see how they work. Note we didn't make
  // aspect settable since it's taken from the size of the window so if you
  // want to adjust the aspect open the example in a new window and then size
  // the window.
  //
  // Still, I think it's a little hard to see so let's change the example so it
  // has 2 cameras. One will show our scene as we see it above, the other will
  // show another camera looking at the scene the first camera is drawing and
  // showing that camera's frustum.
  //
  // To do this we can use the scissor function of three.js. Let's change it to
  // draw 2 scenes with 2 cameras side by side using the scissor function
  //
  // We can also remove our updateCamera code since we're updating everything
  // in the render function.

  const gui = new GUI();
  gui.add( camera, 'fov', 1, 180 );
  const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
  gui.add( minMaxGUIHelper, 'min', 0.1, 50, 0.1 ).name( 'near' );
  gui.add( minMaxGUIHelper, 'max', 0.1, 50, 0.1 ).name( 'far' );

  // And we'll set our existing OrbitControls to respond to the first view
  // element only.

  const controls = new OrbitControls( camera, view1Elem );
  controls.target.set( 0, 5, 0 );
  controls.update();

  // Let's make a second PerspectiveCamera and a second OrbitControls. The
  // second OrbitControls is tied to the second camera and gets input from the
  // second view element.

  const camera2 = new THREE.PerspectiveCamera(
    60, // fov
    2, // aspect
    0.1, // near
    500, // far
  );
  camera2.position.set( 40, 10, 30 );
  camera2.lookAt( 0, 5, 0 );

  const controls2 = new OrbitControls( camera2, view2Elem );
  controls2.target.set( 0, 5, 0 );
  controls2.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 'black' );
  scene.add( cameraHelper );

  {

    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load( checkerUrl );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set( repeats, repeats );

    const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
    const planeMat = new THREE.MeshPhongMaterial( {
      map: texture,
      side: THREE.DoubleSide,
    } );
    const mesh = new THREE.Mesh( planeGeo, planeMat );
    mesh.rotation.x = Math.PI * - .5;
    scene.add( mesh );

  }

  {

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
    const mesh = new THREE.Mesh( cubeGeo, cubeMat );
    mesh.position.set( cubeSize + 1, cubeSize / 2, 0 );
    scene.add( mesh );

  }

  {

    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
    const sphereMat = new THREE.MeshPhongMaterial( { color: '#CA8' } );
    const mesh = new THREE.Mesh( sphereGeo, sphereMat );
    mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
    scene.add( mesh );

  }

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( 0, 10, 0 );
    light.target.position.set( - 5, 0, 0 );
    scene.add( light );
    scene.add( light.target );

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

  // Finally we need to render the scene from the point of view of each camera
  // using the scissor function to only render to part of the canvas.
  //
  // Here is a function that given an element will compute the rectangle of
  // that element that overlaps the canvas. It will then set the scissor and
  // viewport to that rectangle and return the aspect for that size.

  function setScissorForElement( elem ) {

    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // compute a canvas relative rectangle
    const right = Math.min( elemRect.right, canvasRect.right ) - canvasRect.left;
    const left = Math.max( 0, elemRect.left - canvasRect.left );
    const bottom = Math.min( elemRect.bottom, canvasRect.bottom ) - canvasRect.top;
    const top = Math.max( 0, elemRect.top - canvasRect.top );

    const width = Math.min( canvasRect.width, right - left );
    const height = Math.min( canvasRect.height, bottom - top );

    // setup the scissor to only render to that part of the canvas
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor( left, positiveYUpBottom, width, height );
    renderer.setViewport( left, positiveYUpBottom, width, height );

    // return the aspect
    return width / height;

  }

  // And now we can use that function to draw the scene twice in our render
  // function

  function render() {

    resizeRendererToDisplaySize( renderer );

    // turn on the scissor
    renderer.setScissorTest( true );

    // render the original view
    {

      const aspect = setScissorForElement( view1Elem );

      // adjust the camera for this aspect
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();

      // don't draw the camera helper in the original view
      cameraHelper.visible = false;

      scene.background.set( 0x000000 );

      // render
      renderer.render( scene, camera );

    }

    // render from the 2nd camera
    {

      const aspect = setScissorForElement( view2Elem );

      // adjust the camera for this aspect
      camera2.aspect = aspect;
      camera2.updateProjectionMatrix();

      // draw the camera helper in the 2nd view
      cameraHelper.visible = true;

      // The code above sets the background color of the scene when rendering
      // the second view to dark blue just to make it easier to distinguish the
      // two views.

      scene.background.set( 0x000040 );

      renderer.render( scene, camera2 );

    }

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// And now you can use one view to see the frustum of the other.
//
// On the left you can see the original view and on the right you can see a
// view showing the frustum of the camera on the left. As you adjust near, far,
// fov and move the camera with mouse you can see that only what's inside the
// frustum shown on the right appears in the scene on the left.
//
// Adjust near up to around 20 and you'll easily see the front of objects
// disappear as they are no longer in the frustum. Adjust far below about 35
// and you'll start to see the ground plane disappear as it's no longer in the
// frustum.

// Scenegraph - Showing Axis and Grids
// Source: https://threejs.org/manual/#scenegraph
// Local: http://localhost:5173/threejsmanual/14_scenegraph/6_showing_axis_and_grids/
//
// It is often useful to draw something to visualize the nodes in the scene
// graph. Three.js has some helpful ummmm, helpers to ummm, ... help with this.
//
// One is called an AxesHelper. It draws 3 lines representing the local X, Y,
// and Z axes. Let's add one to every node we created.
//
// On our case we want the axes to appear even though they are inside the
// spheres. To do this we set their material's depthTest to false which means
// they will not check to see if they are drawing behind something else. We also
// set their renderOrder to 1 (the default is 0) so that they get drawn after
// all the spheres. Otherwise a sphere might draw over them and cover them up.
//
// We can see the x (red) and z (blue) axes. Since we are looking straight down
// and each of our objects is only rotating around its y axis we don't see much
// of the y (green) axes.
//
// It might be hard to see some of them as there are 2 pairs of overlapping
// axes. Both the sunMesh and the solarSystem are at the same position.
// Similarly the earthMesh and earthOrbit are at the same position. Let's add
// some simple controls to allow us to turn them on/off for each node. While
// we're at it let's also add another helper called the GridHelper. It makes a
// 2D grid on the X,Z plane. By default the grid is 10x10 units.

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  // We're also going to use lil-gui (https://github.com/georgealways/lil-gui)
  // which is a UI library that is very popular with three.js projects. lil-gui
  // takes an object and a property name on that object and based on the type of
  // the property automatically makes a UI to manipulate that property.

  const gui = new GUI();

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 50, 0 );
  camera.up.set( 0, 0, 1 );
  camera.lookAt( 0, 0, 0 );

  const scene = new THREE.Scene();

  {

    const color = 0xFFFFFF;
    const intensity = 500;
    const light = new THREE.PointLight( color, intensity );
    scene.add( light );

  }

  const objects = [];

  // use just one sphere for everything
  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments );

  const solarSystem = new THREE.Object3D();
  scene.add( solarSystem );
  objects.push( solarSystem );

  const sunMaterial = new THREE.MeshPhongMaterial( { emissive: 0xFFFF00 } );
  const sunMesh = new THREE.Mesh( sphereGeometry, sunMaterial );
  sunMesh.scale.set( 5, 5, 5 ); // make the sun large
  solarSystem.add( sunMesh );
  objects.push( sunMesh );

  const earthOrbit = new THREE.Object3D();
  earthOrbit.position.x = 10;
  solarSystem.add( earthOrbit );
  objects.push( earthOrbit );

  const earthMaterial = new THREE.MeshPhongMaterial( { color: 0x2233FF, emissive: 0x112244 } );
  const earthMesh = new THREE.Mesh( sphereGeometry, earthMaterial );
  earthOrbit.add( earthMesh );
  objects.push( earthMesh );

  const moonOrbit = new THREE.Object3D();
  moonOrbit.position.x = 2;
  earthOrbit.add( moonOrbit );

  const moonMaterial = new THREE.MeshPhongMaterial( { color: 0x888888, emissive: 0x222222 } );
  const moonMesh = new THREE.Mesh( sphereGeometry, moonMaterial );
  moonMesh.scale.set( .5, .5, .5 );
  moonOrbit.add( moonMesh );
  objects.push( moonMesh );

  // makeAxisGrid makes an AxisGridHelper which is a class we'll create to make
  // lil-gui happy. Like it says above lil-gui will automagically make a UI that
  // manipulates the named property of some object. It will create a different
  // UI depending on the type of property. We want it to create a checkbox so we
  // need to specify a bool property. But, we want both the axes and the grid to
  // appear/disappear based on a single property so we'll make a class that has
  // a getter and setter for a property. That way we can let lil-gui think it's
  // manipulating a single property but internally we can set the visible
  // property of both the AxesHelper and GridHelper for a node.

  // Turns both axes and grid visible on/off
  // lil-gui requires a property that returns a bool
  // to decide to make a checkbox so we make a setter
  // and getter for `visible` which we can tell lil-gui
  // to look at.
  class AxisGridHelper {

    constructor( node, units = 10 ) {

      // One thing to notice is we set the renderOrder of the AxesHelper to 2
      // and for the GridHelper to 1 so that the axes get drawn after the grid.
      // Otherwise the grid might overwrite the axes.

      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 2; // after the grid
      node.add( axes );

      const grid = new THREE.GridHelper( units, units );
      grid.material.depthTest = false;
      grid.renderOrder = 1;
      node.add( grid );

      this.grid = grid;
      this.axes = axes;
      this.visible = false;

    }
    get visible() {

      return this._visible;

    }
    set visible( v ) {

      this._visible = v;
      this.grid.visible = v;
      this.axes.visible = v;

    }

  }

  // We want to make both a GridHelper and an AxesHelper for each node. We need
  // a label for each node so we'll get rid of the old loop and switch to
  // calling some function to add the helpers for each node

  function makeAxisGrid( node, label, units ) {

    const helper = new AxisGridHelper( node, units );
    gui.add( helper, 'visible' ).name( label );

  }

  makeAxisGrid( solarSystem, 'solarSystem', 26 );
  makeAxisGrid( sunMesh, 'sunMesh' );
  makeAxisGrid( earthOrbit, 'earthOrbit' );
  makeAxisGrid( earthMesh, 'earthMesh' );
  makeAxisGrid( moonOrbit, 'moonOrbit' );
  makeAxisGrid( moonMesh, 'moonMesh' );

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

    objects.forEach( ( obj ) => {

      obj.rotation.y = time;

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// Turn on the solarSystem and you'll see how the earth is exactly 10 units out
// from the center just like we set above. You can see how the earth is in the
// local space of the solarSystem. Similarly if you turn on the earthOrbit
// you'll see how the moon is exactly 2 units from the center of the local space
// of the earthOrbit.

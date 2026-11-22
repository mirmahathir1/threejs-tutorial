// Scenegraph - Tank
// Source: https://threejs.org/manual/#scenegraph
// Local: http://localhost:5173/threejsmanual/14_scenegraph/7_tank/
//
// A few more examples of scene graphs. An automobile in a simple game world
// might have a scene graph like this
// (https://threejs.org/manual/resources/images/scenegraph-car.svg)
//
// If you move the car's body all the wheels will move with it. If you wanted
// the body to bounce separate from the wheels you might parent the body and the
// wheels to a "frame" node that represents the car's frame.
//
// Another example is a human in a game world.
// (https://threejs.org/manual/resources/images/scenegraph-human.svg)
//
// You can see the scene graph gets pretty complex for a human. In fact that
// scene graph above is simplified. For example you might extend it to cover
// every finger (at least another 28 nodes) and every toe (yet another 28 nodes)
// plus ones for the face and jaw, the eyes and maybe more.
//
// Let's make one semi-complex scene graph. We'll make a tank. The tank will
// have 6 wheels and a turret. The tank will follow a path. There will be a
// sphere that moves around and the tank will target the sphere.
//
// Here's the scene graph. The meshes are colored in green, the Object3Ds in
// blue, the lights in gold, and the cameras in purple. One camera has not been
// added to the scene graph.
// (https://threejs.org/manual/resources/images/scenegraph-tank.svg)
//
// Look in the code to see the setup of all of these nodes.

import * as THREE from 'three';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas } );
  renderer.setClearColor( 0xAAAAAA );
  renderer.shadowMap.enabled = true;

  function makeCamera( fov = 40 ) {

    const aspect = 2; // the canvas default
    const zNear = 0.1;
    const zFar = 1000;
    return new THREE.PerspectiveCamera( fov, aspect, zNear, zFar );

  }

  const camera = makeCamera();
  camera.position.set( 8, 4, 10 ).multiplyScalar( 3 );
  camera.lookAt( 0, 0, 0 );

  const scene = new THREE.Scene();

  {

    const light = new THREE.DirectionalLight( 0xffffff, 3 );
    light.position.set( 0, 20, 0 );
    scene.add( light );
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    const d = 50;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    light.shadow.bias = 0.001;

  }

  {

    const light = new THREE.DirectionalLight( 0xffffff, 3 );
    light.position.set( 1, 2, 4 );
    scene.add( light );

  }

  const groundGeometry = new THREE.PlaneGeometry( 50, 50 );
  const groundMaterial = new THREE.MeshPhongMaterial( { color: 0xCC8866 } );
  const groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
  groundMesh.rotation.x = Math.PI * - .5;
  groundMesh.receiveShadow = true;
  scene.add( groundMesh );

  const carWidth = 4;
  const carHeight = 1;
  const carLength = 8;

  const tank = new THREE.Object3D();
  scene.add( tank );

  const bodyGeometry = new THREE.BoxGeometry( carWidth, carHeight, carLength );
  const bodyMaterial = new THREE.MeshPhongMaterial( { color: 0x6688AA } );
  const bodyMesh = new THREE.Mesh( bodyGeometry, bodyMaterial );
  bodyMesh.position.y = 1.4;
  bodyMesh.castShadow = true;
  tank.add( bodyMesh );

  const tankCameraFov = 75;
  const tankCamera = makeCamera( tankCameraFov );
  tankCamera.position.y = 3;
  tankCamera.position.z = - 6;
  tankCamera.rotation.y = Math.PI;
  bodyMesh.add( tankCamera );

  const wheelRadius = 1;
  const wheelThickness = .5;
  const wheelSegments = 6;
  const wheelGeometry = new THREE.CylinderGeometry(
    wheelRadius, // top radius
    wheelRadius, // bottom radius
    wheelThickness, // height of cylinder
    wheelSegments );
  const wheelMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );
  const wheelPositions = [
    [ - carWidth / 2 - wheelThickness / 2, - carHeight / 2, carLength / 3 ],
    [ carWidth / 2 + wheelThickness / 2, - carHeight / 2, carLength / 3 ],
    [ - carWidth / 2 - wheelThickness / 2, - carHeight / 2, 0 ],
    [ carWidth / 2 + wheelThickness / 2, - carHeight / 2, 0 ],
    [ - carWidth / 2 - wheelThickness / 2, - carHeight / 2, - carLength / 3 ],
    [ carWidth / 2 + wheelThickness / 2, - carHeight / 2, - carLength / 3 ],
  ];
  const wheelMeshes = wheelPositions.map( ( position ) => {

    const mesh = new THREE.Mesh( wheelGeometry, wheelMaterial );
    mesh.position.set( ...position );
    mesh.rotation.z = Math.PI * .5;
    mesh.castShadow = true;
    bodyMesh.add( mesh );
    return mesh;

  } );

  const domeRadius = 2;
  const domeWidthSubdivisions = 12;
  const domeHeightSubdivisions = 12;
  const domePhiStart = 0;
  const domePhiEnd = Math.PI * 2;
  const domeThetaStart = 0;
  const domeThetaEnd = Math.PI * .5;
  const domeGeometry = new THREE.SphereGeometry(
    domeRadius, domeWidthSubdivisions, domeHeightSubdivisions,
    domePhiStart, domePhiEnd, domeThetaStart, domeThetaEnd );
  const domeMesh = new THREE.Mesh( domeGeometry, bodyMaterial );
  domeMesh.castShadow = true;
  bodyMesh.add( domeMesh );
  domeMesh.position.y = .5;

  const turretWidth = .1;
  const turretHeight = .1;
  const turretLength = carLength * .75 * .2;
  const turretGeometry = new THREE.BoxGeometry(
    turretWidth, turretHeight, turretLength );
  const turretMesh = new THREE.Mesh( turretGeometry, bodyMaterial );
  const turretPivot = new THREE.Object3D();
  turretMesh.castShadow = true;
  turretPivot.scale.set( 5, 5, 5 );
  turretPivot.position.y = .5;
  turretMesh.position.z = turretLength * .5;
  turretPivot.add( turretMesh );
  bodyMesh.add( turretPivot );

  const turretCamera = makeCamera();
  turretCamera.position.y = .75 * .2;
  turretMesh.add( turretCamera );

  const targetGeometry = new THREE.SphereGeometry( .5, 6, 3 );
  const targetMaterial = new THREE.MeshPhongMaterial( { color: 0x00FF00, flatShading: true } );
  const targetMesh = new THREE.Mesh( targetGeometry, targetMaterial );
  const targetOrbit = new THREE.Object3D();
  const targetElevation = new THREE.Object3D();
  const targetBob = new THREE.Object3D();
  targetMesh.castShadow = true;
  scene.add( targetOrbit );
  targetOrbit.add( targetElevation );
  targetElevation.position.z = carLength * 2;
  targetElevation.position.y = 8;
  targetElevation.add( targetBob );
  targetBob.add( targetMesh );

  const targetCamera = makeCamera();
  const targetCameraPivot = new THREE.Object3D();
  targetCamera.position.y = 1;
  targetCamera.position.z = - 2;
  targetCamera.rotation.y = Math.PI;
  targetBob.add( targetCameraPivot );
  targetCameraPivot.add( targetCamera );

  // Create a sine-like wave
  const curve = new THREE.SplineCurve( [
    new THREE.Vector2( - 10, 0 ),
    new THREE.Vector2( - 5, 5 ),
    new THREE.Vector2( 0, 0 ),
    new THREE.Vector2( 5, - 5 ),
    new THREE.Vector2( 10, 0 ),
    new THREE.Vector2( 5, 10 ),
    new THREE.Vector2( - 5, 10 ),
    new THREE.Vector2( - 10, - 10 ),
    new THREE.Vector2( - 15, - 8 ),
    new THREE.Vector2( - 10, 0 ),
  ] );

  const points = curve.getPoints( 50 );
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
  const splineObject = new THREE.Line( geometry, material );
  splineObject.rotation.x = Math.PI * .5;
  splineObject.position.y = 0.05;
  scene.add( splineObject );

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

  const targetPosition = new THREE.Vector3();
  const tankPosition = new THREE.Vector2();
  const tankTarget = new THREE.Vector2();

  // For the cameras we setup an array of all 4 cameras at init time with
  // descriptions.

  const cameras = [
    { cam: camera, desc: 'detached camera', },
    { cam: turretCamera, desc: 'on turret looking at target', },
    { cam: targetCamera, desc: 'near target looking at tank', },
    { cam: tankCamera, desc: 'above back of tank', },
  ];

  const infoElem = document.querySelector( '#info' );

  function render( time ) {

    time *= 0.001;

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      cameras.forEach( ( cameraInfo ) => {

        const camera = cameraInfo.cam;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

      } );

    }

    // For the target, the thing the tank is aiming at, there is a targetOrbit
    // (Object3D) which just rotates similar to the earthOrbit above. A
    // targetElevation (Object3D) which is a child of the targetOrbit provides
    // an offset from the targetOrbit and a base elevation. Childed to that is
    // another Object3D called targetBob which just bobs up and down relative to
    // the targetElevation. Finally there's the targetMesh which is just a cube
    // we rotate and change its colors

    // move target
    targetOrbit.rotation.y = time * .27;
    targetBob.position.y = Math.sin( time * 2 ) * 4;
    targetMesh.rotation.x = time * 7;
    targetMesh.rotation.y = time * 13;
    targetMaterial.emissive.setHSL( time * 0.3 % 1, 1, .25 );
    targetMaterial.color.setHSL( time * 0.3 % 1, 1, .25 );

    // For the tank there's an Object3D called tank which is used to move
    // everything below it around. The code uses a SplineCurve which it can ask
    // for positions along that curve. 0.0 is the start of the curve. 1.0 is the
    // end of the curve. It asks for the current position where it puts the
    // tank. It then asks for a position slightly further down the curve and
    // uses that to point the tank in that direction using Object3D.lookAt.

    // move tank
    const tankTime = time * .05;
    curve.getPointAt( tankTime % 1, tankPosition );
    curve.getPointAt( ( tankTime + 0.01 ) % 1, tankTarget );
    tank.position.set( tankPosition.x, 0, tankPosition.y );
    tank.lookAt( tankTarget.x, 0, tankTarget.y );

    // The turret on top of the tank is moved automatically by being a child of
    // the tank. To point it at the target we just ask for the target's world
    // position and then again use Object3D.lookAt

    // face turret at target
    targetMesh.getWorldPosition( targetPosition );
    turretPivot.lookAt( targetPosition );

    // There's a turretCamera which is a child of the turretMesh so it will move
    // up and down and rotate with the turret. We make that aim at the target.

    // make the turretCamera look at target
    turretCamera.lookAt( targetPosition );

    // There is also a targetCameraPivot which is a child of targetBob so it
    // floats around with the target. We aim that back at the tank. Its purpose
    // is to allow the targetCamera to be offset from the target itself. If we
    // instead made the camera a child of targetBob and just aimed the camera
    // itself it would be inside the target.

    // make the targetCameraPivot look at the tank
    tank.getWorldPosition( targetPosition );
    targetCameraPivot.lookAt( targetPosition );

    // Finally we rotate all the wheels

    wheelMeshes.forEach( ( obj ) => {

      obj.rotation.x = time * 3;

    } );

    // and cycle through our cameras at render time.

    const camera = cameras[ time * .25 % cameras.length | 0 ];
    infoElem.textContent = camera.desc;

    renderer.render( scene, camera.cam );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// I hope this gives some idea of how scene graphs work and how you might use
// them. Making Object3D nodes and parenting things to them is an important step
// to using a 3D engine like three.js well. Often it might seem like some
// complex math is necessary to make something move and rotate the way you want.
// For example without a scene graph computing the motion of the moon or where
// to put the wheels of the car relative to its body would be very complicated
// but using a scene graph it becomes much easier.
//
// Next up we'll go over materials (https://threejs.org/manual/#materials).

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x87ceeb );
scene.fog = new THREE.Fog( 0x87ceeb, 10, 80 );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const floor = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200 ), new THREE.MeshBasicMaterial( { color: 0x556655 } ) );
floor.rotation.x = - Math.PI / 2;
scene.add( floor );

const grid = new THREE.GridHelper( 200, 200 );
grid.position.y = 0.01;
scene.add( grid );

const controls = new PointerLockControls( camera, document.body );
const info = document.getElementById( 'info' );
info.addEventListener( 'click', () => controls.lock() );
controls.addEventListener( 'lock', () => info.style.display = 'none' );
controls.addEventListener( 'unlock', () => info.style.display = 'flex' );

const keys = { KeyW: 0, KeyA: 0, KeyS: 0, KeyD: 0, Space: 0 };
window.addEventListener( 'keydown', ( e ) => keys[ e.code ] = 1 );
window.addEventListener( 'keyup', ( e ) => keys[ e.code ] = 0 );

const eyeHeight = 1.6;
const speed = 5;
const jumpSpeed = 5;
const gravity = 9.8;
const direction = new THREE.Vector2();
let velocityY = 0;
let prevTime = 0;

function animate( time ) {

  const delta = Math.min( ( time - prevTime ) / 1000, 0.1 );
  prevTime = time;

  if ( controls.isLocked ) {

    direction.set( keys.KeyD - keys.KeyA, keys.KeyW - keys.KeyS ).normalize();
    controls.moveRight( direction.x * speed * delta );
    controls.moveForward( direction.y * speed * delta );

    if ( keys.Space && camera.position.y === eyeHeight ) velocityY = jumpSpeed;

  }

  velocityY -= gravity * delta;
  camera.position.y = Math.max( camera.position.y + velocityY * delta, eyeHeight );
  if ( camera.position.y === eyeHeight ) velocityY = 0;

  floor.position.x = grid.position.x = Math.round( camera.position.x );
  floor.position.z = grid.position.z = Math.round( camera.position.z );

  renderer.render( scene, camera );

}

window.addEventListener( 'resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

} );

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x87ceeb );
scene.fog = new THREE.Fog( 0x87ceeb, 10, 80 );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

scene.add( new THREE.HemisphereLight( 0xffffff, 0x444444, 2 ) );
const sun = new THREE.DirectionalLight( 0xffffff, 2 );
sun.position.set( 5, 10, 7 );
scene.add( sun );

const floor = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200 ), new THREE.MeshBasicMaterial( { color: 0x556655 } ) );
floor.rotation.x = - Math.PI / 2;
scene.add( floor );

const grid = new THREE.GridHelper( 200, 200 );
grid.position.y = 0.01;
scene.add( grid );

const ft = ( feet, inches = 0 ) => ( feet * 12 + inches ) * 0.0254;

const roomLength = ft( 15, 5 );
const roomWidth = ft( 9 );
const wallHeight = ft( 8 );
const floorLevel = ft( 2 );
const doorHeight = ft( 7 );

const doorFrame = ft( 0, 3 );
const windowFrame = ft( 0, 1 );

const opening = ( width, height, frame ) => ( { width, bottom: doorHeight - height, top: doorHeight, frame } );
const door = opening( ft( 3 ), doorHeight, doorFrame );
const frontDoor = opening( ft( 3, 5 ), doorHeight, doorFrame );
const largeWindow = opening( ft( 4, 10 ), ft( 4, 10 ), windowFrame );
const smallWindow = opening( ft( 4 ), ft( 4 ), windowFrame );
const tinyWindow = opening( ft( 2 ), ft( 1 ), windowFrame );

const wallMaterial = new THREE.MeshLambertMaterial( { color: 0xeeeeee, side: THREE.DoubleSide } );
const frameMaterial = new THREE.MeshLambertMaterial( { color: 0xc4a484, side: THREE.DoubleSide } );
const walls = [];

const house = new THREE.Group();
house.position.y = floorLevel;
house.updateMatrixWorld();
scene.add( house );

function plane( minX, maxX, minZ, maxZ, minY = 0, maxY = wallHeight, material = wallMaterial ) {

  if ( maxY <= minY || maxX - minX + maxZ - minZ < 1e-6 ) return;

  const alongX = maxX > minX;
  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( alongX ? maxX - minX : maxZ - minZ, maxY - minY ), material );
  mesh.position.set( ( minX + maxX ) / 2, ( minY + maxY ) / 2, ( minZ + maxZ ) / 2 );
  if ( ! alongX ) mesh.rotation.y = Math.PI / 2;
  house.add( mesh );
  walls.push( new THREE.Box3().setFromObject( mesh ) );

}

function wall( minX, maxX, minZ, maxZ, openings = [], base = 0, height = wallHeight ) {

  const alongX = maxX > minX;
  const start = alongX ? minX : minZ;
  const end = alongX ? maxX : maxZ;
  const gap = ( end - start - openings.reduce( ( sum, o ) => sum + o.width, 0 ) ) / ( openings.length + 1 );
  const segment = ( a, b, minY = 0, maxY = height, material ) => alongX ? plane( a, b, minZ, maxZ, base + minY, base + maxY, material ) : plane( minX, maxX, a, b, base + minY, base + maxY, material );

  let a = start;

  for ( const o of openings ) {

    const before = o.at !== undefined ? o.at - ( a - start ) : o.before ?? gap;
    segment( a, a + before );
    a += before;
    segment( a, a + o.width, 0, o.bottom );
    segment( a, a + o.width, o.top, height );

    const f = o.frame;
    segment( a, a + f, o.bottom, o.top, frameMaterial );
    segment( a + o.width - f, a + o.width, o.bottom, o.top, frameMaterial );
    segment( a + f, a + o.width - f, o.top - f, o.top, frameMaterial );
    if ( o.bottom > 0 ) segment( a + f, a + o.width - f, o.bottom, o.bottom + f, frameMaterial );

    a += o.width;

  }

  segment( a, end );

}

const left = - 3 * roomLength / 2;
const front = roomWidth / 2;
const back = - roomWidth / 2;
const north = back - ft( 15 );
const room8North = north - ft( 13 );
const room8Level = - ft( 1 );
const room8WallHeight = ft( 7 );
const floorMaterial = new THREE.MeshLambertMaterial( { color: 0x333333 } );

function textTexture( text, color, width, height ) {

  const canvas = document.createElement( 'canvas' );
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext( '2d' );
  context.font = `bold ${ height * 0.75 }px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = color;
  context.fillText( text, width / 2, height / 2 );

  const texture = new THREE.CanvasTexture( canvas );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;

}

function roomLabel( minX, maxX, minZ, maxZ, name, base = 0, color = '#ffffff' ) {

  const text = new THREE.Mesh( new THREE.PlaneGeometry( 2, 0.5 ), new THREE.MeshBasicMaterial( { map: textTexture( name, color, 512, 128 ), transparent: true } ) );
  text.rotation.x = - Math.PI / 2;
  text.position.set( ( minX + maxX ) / 2, base + 0.03, ( minZ + maxZ ) / 2 );
  house.add( text );

}

function roomFloor( minX, maxX, minZ, maxZ, name, base = 0 ) {

  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( maxX - minX, maxZ - minZ ), floorMaterial );
  mesh.rotation.x = - Math.PI / 2;
  mesh.position.set( ( minX + maxX ) / 2, base + 0.02, ( minZ + maxZ ) / 2 );
  house.add( mesh );

  roomLabel( minX, maxX, minZ, maxZ, name, base );

}

for ( let i = 0; i <= 3; i ++ ) {

  const x = left + i * roomLength;
  wall( x, x, back, front, i === 1 || i === 2 ? [ { ...door, before: roomWidth - door.width } ] : [ smallWindow ] );

}

const northWalls = [ left, left + ft( 10 ), left + ft( 20 ), - left - ft( 10 ), - left ];
const room5Window = { ...smallWindow, width: northWalls[ 2 ] - ( left + roomLength ), before: 0 };

const centered = ( o, wallStart, from, to ) => ( { ...o, at: from - wallStart + ( to - from - o.width ) / 2 } );
const middle = ( o, height ) => ( { ...o, bottom: ( height - o.top + o.bottom ) / 2, top: ( height + o.top - o.bottom ) / 2 } );

const backWallOpenings = [
  [ centered( smallWindow, left, northWalls[ 0 ], northWalls[ 1 ] ) ],
  [
    room5Window,
    { ...door, before: ( roomLength - door.width ) / 2 - room5Window.width },
    { ...smallWindow, before: ( roomLength / 2 - door.width / 2 - smallWindow.width ) / 2 }
  ],
  [ centered( smallWindow, left + 2 * roomLength, northWalls[ 3 ], northWalls[ 4 ] ) ]
];

for ( let i = 0; i < 3; i ++ ) {

  const x = left + i * roomLength;

  wall( x, x + roomLength, back, back, backWallOpenings[ i ] );
  wall( x, x + roomLength, front, front, i === 1 ? [ largeWindow, frontDoor, largeWindow ] : [ smallWindow, smallWindow ] );

  roomFloor( x, x + roomLength, back, front, `Room ${ i + 1 }` );

}

const windowGap = ( back - north - 2 * smallWindow.width ) / 3;
const northWallOpenings = [
  [ smallWindow, smallWindow ],
  [ { ...door, before: 0 } ],
  [ { ...door, before: 0 } ],
  [ { ...door, before: 0 } ],
  [ { ...door, before: 0 }, { ...smallWindow, before: 2 * windowGap + smallWindow.width - door.width } ]
];

const room56WallHeight = ft( 12 );
const secondFloorWallHeight = ft( 8 );
const secondFloorTop = room56WallHeight + secondFloorWallHeight;
const room14WindowInset = ( northWalls[ 2 ] - northWalls[ 1 ] - smallWindow.width ) / 2;
const room15Window = { ...smallWindow, at: northWalls[ 3 ] - northWalls[ 2 ] - smallWindow.width - room14WindowInset };

for ( let i = 0; i < northWalls.length; i ++ ) {

  wall( northWalls[ i ], northWalls[ i ], north, back, northWallOpenings[ i ], 0, i >= 1 && i <= 3 ? room56WallHeight : wallHeight );
  if ( i < northWalls.length - 1 ) roomFloor( northWalls[ i ], northWalls[ i + 1 ], north, back, `Room ${ i + 4 }` );

}

wall( northWalls[ 1 ], northWalls[ 1 ], north, back, [ smallWindow, smallWindow ], room56WallHeight, secondFloorWallHeight );
wall( northWalls[ 2 ], northWalls[ 2 ], north, back, [ { ...door, before: 0 } ], room56WallHeight, secondFloorWallHeight );
wall( northWalls[ 3 ], northWalls[ 3 ], north, back, [ smallWindow, smallWindow ], room56WallHeight, secondFloorWallHeight );

plane( northWalls[ 1 ], northWalls[ 3 ], back, back, wallHeight, room56WallHeight );
wall( northWalls[ 1 ], northWalls[ 2 ], back, back, [ smallWindow ], room56WallHeight, secondFloorWallHeight );
wall( northWalls[ 2 ], northWalls[ 3 ], back, back, [ centered( door, northWalls[ 2 ], northWalls[ 1 ], northWalls[ 3 ] ), room15Window ], room56WallHeight, secondFloorWallHeight );
plane( northWalls[ 1 ], northWalls[ 3 ], north, north, wallHeight, room56WallHeight );
wall( northWalls[ 1 ], northWalls[ 2 ], north, north, [ smallWindow ], room56WallHeight, secondFloorWallHeight );
wall( northWalls[ 2 ], northWalls[ 3 ], north, north, [ centered( door, northWalls[ 2 ], northWalls[ 1 ], northWalls[ 3 ] ), room15Window ], room56WallHeight, secondFloorWallHeight );

const ceilingMaterial = new THREE.MeshLambertMaterial( { color: 0xd2b48c, side: THREE.DoubleSide } );
const verandaDepth = ft( 4 );
const secondFloorNorth = north - verandaDepth;
const secondFloorSouth = back + verandaDepth;
const holeWest = northWalls[ 2 ];
const holeEast = holeWest + ft( 4 );
const holeSouth = back - ft( 3 );
const holeNorth = holeSouth - ft( 5 );
const ceilingHoleNorth = north + ft( 3 );
const ceilingHoleSouth = ceilingHoleNorth + ft( 5 );

function ceiling( minX, maxX, minZ, maxZ, y = room56WallHeight ) {

  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( maxX - minX, maxZ - minZ ), ceilingMaterial );
  mesh.rotation.x = - Math.PI / 2;
  mesh.position.set( ( minX + maxX ) / 2, y, ( minZ + maxZ ) / 2 );
  house.add( mesh );
  walls.push( new THREE.Box3().setFromObject( mesh ) );

}

ceiling( northWalls[ 1 ], holeWest, secondFloorNorth, secondFloorSouth );
ceiling( holeEast, northWalls[ 3 ], secondFloorNorth, secondFloorSouth );
ceiling( holeWest, holeEast, secondFloorNorth, holeNorth );
ceiling( holeWest, holeEast, holeSouth, secondFloorSouth );
ceiling( northWalls[ 1 ], holeWest, north, back, secondFloorTop );
ceiling( holeEast, northWalls[ 3 ], north, back, secondFloorTop );
ceiling( holeWest, holeEast, north, ceilingHoleNorth, secondFloorTop );
ceiling( holeWest, holeEast, ceilingHoleSouth, back, secondFloorTop );

const rampBottom = north + door.width;
const rampRun = holeSouth - rampBottom;
const ramp = new THREE.Mesh( new THREE.PlaneGeometry( holeEast - holeWest, Math.hypot( rampRun, room56WallHeight ) ), ceilingMaterial );
ramp.rotation.x = Math.atan2( rampRun, room56WallHeight );
ramp.position.set( ( holeWest + holeEast ) / 2, room56WallHeight / 2, ( rampBottom + holeSouth ) / 2 );
house.add( ramp );

roomLabel( northWalls[ 1 ], northWalls[ 2 ], north, back, 'Room 14', room56WallHeight, '#000000' );
roomLabel( northWalls[ 2 ], northWalls[ 3 ], north, back, 'Room 15', room56WallHeight, '#000000' );

const room10East = left + ft( 6 );
const room8Walls = [ room10East, - left - ft( 22 ), - left ];

const room12West = room8Walls[ 1 ];
const room12East = room12West + ft( 9 );
const room12North = room8North - ft( 6 );
const room12Level = - floorLevel;
const room12WallHeight = ft( 7 );

wall( left, - left, north, north, [
  centered( door, left, left, room10East ),
  centered( smallWindow, left, northWalls[ 1 ], northWalls[ 2 ] ),
  centered( door, left, northWalls[ 2 ], room8Walls[ 1 ] ),
  centered( smallWindow, left, room8Walls[ 1 ], northWalls[ 3 ] ),
  centered( smallWindow, left, northWalls[ 3 ], northWalls[ 4 ] )
] );

const room10WallHeight = wallHeight;

wall( left, room10East, room8North, room8North, [ tinyWindow ], 0, room10WallHeight );
wall( room10East, - left, room8North, room8North, [ middle( centered( smallWindow, room10East, room10East, room8Walls[ 1 ] ), room8WallHeight ), { ...door, at: room12East - door.width - room10East }, middle( centered( smallWindow, room10East, room12East, - left ), room8WallHeight ) ], room8Level, room8WallHeight );
const room10North = room8North + ft( 7 );
wall( left, left, room8North, north, [ centered( tinyWindow, room8North, room8North, room10North ), centered( tinyWindow, room8North, room10North, north ) ], 0, room10WallHeight );
wall( room10East, room10East, room8North, north, [ { ...door, before: ft( 7 ) - door.width }, { ...door, before: 0 } ], 0, room10WallHeight );
wall( left, room10East, room10North, room10North, [], 0, room10WallHeight );
roomFloor( left, room10East, room10North, north, 'Room 10' );
roomFloor( left, room10East, room8North, room10North, 'Room 11' );

for ( let i = 0; i < room8Walls.length; i ++ ) {

  if ( i > 0 ) wall( room8Walls[ i ], room8Walls[ i ], room8North, north, [ { ...door, before: 0 } ], room8Level, room8WallHeight );
  if ( i < room8Walls.length - 1 ) roomFloor( room8Walls[ i ], room8Walls[ i + 1 ], room8North, north, `Room ${ i + 8 }`, room8Level );

}

wall( room12West, room12East, room12North, room12North, [ tinyWindow ], room12Level, room12WallHeight );
wall( room12West, room12West, room12North, room8North, [ tinyWindow ], room12Level, room12WallHeight );
wall( room12East, room12East, room12North, room8North, [ { ...door, before: room8North - room12North - door.width } ], room12Level, room12WallHeight );
roomFloor( room12West, room12East, room12North, room8North, 'Room 12', room12Level );

const room13East = - left + ft( 9 );
const room13North = room8North - ft( 6 );

wall( - left, room13East, room13North, room13North, [ middle( smallWindow, room8WallHeight ) ], room8Level, room8WallHeight );
wall( - left, - left, room13North, room8North, [ { ...door, before: room8North - room13North - door.width } ], room8Level, room8WallHeight );
wall( room13East, room13East, room13North, north, [], room8Level, room8WallHeight );
wall( - left, room13East, north, north, [ door ], room8Level, room8WallHeight );
roomFloor( - left, room13East, room13North, north, 'Room 13', room8Level );

const plinthMaterial = new THREE.MeshLambertMaterial( { color: 0x999999 } );

function plinth( minX, maxX, minZ, maxZ, top ) {

  const mesh = new THREE.Mesh( new THREE.BoxGeometry( maxX - minX, floorLevel + top, maxZ - minZ ), plinthMaterial );
  mesh.position.set( ( minX + maxX ) / 2, ( top - floorLevel ) / 2, ( minZ + maxZ ) / 2 );
  house.add( mesh );

}

plinth( left, - left, north, front, 0 );
plinth( left, room10East, room8North, north, 0 );
plinth( room10East, - left, room8North, north, room8Level );
plinth( - left, room13East, room13North, north, room8Level );

const compass = new THREE.Group();
compass.position.set( 0, 8, 0 );
house.add( compass );

const ring = new THREE.Mesh( new THREE.RingGeometry( 1.4, 1.5, 64 ), new THREE.MeshBasicMaterial( { color: 0x333333, side: THREE.DoubleSide } ) );
ring.rotation.x = - Math.PI / 2;
compass.add( ring );

const needleShape = new THREE.Shape().moveTo( - 0.2, 0 ).lineTo( 0, 1.3 ).lineTo( 0.2, 0 );

function needle( color, rotationX ) {

  const mesh = new THREE.Mesh( new THREE.ShapeGeometry( needleShape ), new THREE.MeshBasicMaterial( { color, side: THREE.DoubleSide } ) );
  mesh.rotation.x = rotationX;
  compass.add( mesh );

}

needle( 0xcc0000, - Math.PI / 2 );
needle( 0xffffff, Math.PI / 2 );

function label( text, x, z ) {

  const sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: textTexture( text, text === 'N' ? '#cc0000' : '#222222', 128, 128 ) } ) );
  sprite.position.set( x, 0, z );
  sprite.scale.setScalar( 0.8 );
  compass.add( sprite );

}

label( 'N', 0, - 2 );
label( 'S', 0, 2 );
label( 'E', 2, 0 );
label( 'W', - 2, 0 );

const controls = new PointerLockControls( camera, document.body );
const info = document.getElementById( 'info' );
info.addEventListener( 'click', () => controls.lock() );
controls.addEventListener( 'lock', () => info.style.display = 'none' );
controls.addEventListener( 'unlock', () => info.style.display = 'flex' );

const keys = { KeyW: 0, KeyA: 0, KeyS: 0, KeyD: 0, Space: 0, ShiftLeft: 0, ShiftRight: 0 };
window.addEventListener( 'keydown', ( e ) => keys[ e.code ] = 1 );
window.addEventListener( 'keyup', ( e ) => keys[ e.code ] = 0 );

const eyeHeight = 1.6;
const playerRadius = 0.3;
const speed = 5;
const direction = new THREE.Vector2();
const previous = new THREE.Vector3();
const playerBox = new THREE.Box3();
let prevTime = 0;

camera.position.set( 0, eyeHeight, front + 8 );

function collides() {

  const { x, y, z } = camera.position;
  playerBox.min.set( x - playerRadius, y - eyeHeight, z - playerRadius );
  playerBox.max.set( x + playerRadius, y, z + playerRadius );
  return walls.some( ( w ) => w.intersectsBox( playerBox ) );

}

function groundAt( x, z ) {

  if ( x > left && x < - left && z > north && z < front ) return floorLevel;
  if ( x > left && x < room10East && z > room8North && z <= north ) return floorLevel;
  if ( x >= room10East && x < - left && z > room8North && z <= north ) return floorLevel + room8Level;
  if ( x >= - left && x < room13East && z > room13North && z <= north ) return floorLevel + room8Level;
  return 0;

}

function animate( time ) {

  const delta = Math.min( ( time - prevTime ) / 1000, 0.1 );
  prevTime = time;

  if ( controls.isLocked ) {

    previous.copy( camera.position );
    direction.set( keys.KeyD - keys.KeyA, keys.KeyW - keys.KeyS ).normalize();
    controls.moveRight( direction.x * speed * delta );
    controls.moveForward( direction.y * speed * delta );

    const nextZ = camera.position.z;
    camera.position.z = previous.z;
    if ( collides() ) camera.position.x = previous.x;
    camera.position.z = nextZ;
    if ( collides() ) camera.position.z = previous.z;

    const up = keys.Space - Math.max( keys.ShiftLeft, keys.ShiftRight );
    camera.position.y = Math.max( camera.position.y + up * speed * delta, groundAt( camera.position.x, camera.position.z ) + eyeHeight );
    if ( collides() ) camera.position.y = previous.y;

  }

  floor.position.x = grid.position.x = Math.round( camera.position.x );
  floor.position.z = grid.position.z = Math.round( camera.position.z );

  renderer.render( scene, camera );

}

window.addEventListener( 'resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

} );

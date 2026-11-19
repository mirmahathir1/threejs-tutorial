import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

const scene = new THREE.Scene();
const fog = new THREE.Fog( 0xf2f5f8, 20, 100 );
scene.fog = fog;

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const sunElevation = 45;
const sunAzimuth = 90;
const sunDirection = new THREE.Vector3().setFromSphericalCoords( 1, THREE.MathUtils.degToRad( 90 - sunElevation ), THREE.MathUtils.degToRad( sunAzimuth ) );

const sky = new Sky();
sky.scale.setScalar( 10000 );
const skyUniforms = sky.material.uniforms;
skyUniforms.turbidity.value = 4;
skyUniforms.rayleigh.value = 1.5;
skyUniforms.mieCoefficient.value = 0.005;
skyUniforms.mieDirectionalG.value = 0.8;
skyUniforms.sunPosition.value.copy( sunDirection );
skyUniforms.cloudCoverage.value = 0.3;

const pmremGenerator = new THREE.PMREMGenerator( renderer );
const skyScene = new THREE.Scene();
skyScene.add( sky );
skyUniforms.showSunDisc.value = 0;
scene.environment = pmremGenerator.fromScene( skyScene ).texture;
scene.environmentIntensity = 0.4;
skyUniforms.showSunDisc.value = 1;
scene.add( sky );

function skyLight( color, intensity ) {

  const light = new THREE.DirectionalLight( color, intensity );
  light.castShadow = true;
  light.shadow.mapSize.set( 4096, 4096 );
  light.shadow.bias = - 0.0005;
  light.shadow.normalBias = 0.02;
  light.shadow.autoUpdate = false;
  light.shadow.needsUpdate = true;
  scene.add( light, light.target );
  return light;

}

const sun = skyLight( 0xfff4e5, 8 );

const moonElevation = 20;
const moonAzimuth = 220;
const moonDirection = new THREE.Vector3().setFromSphericalCoords( 1, THREE.MathUtils.degToRad( 90 - moonElevation ), THREE.MathUtils.degToRad( moonAzimuth ) );

const moonLight = skyLight( 0x9fb4ff, 1 );
moonLight.visible = false;

const moon = new THREE.Mesh( new THREE.SphereGeometry( 8, 32, 16 ), new THREE.MeshBasicMaterial( { color: 0xf4f1e8, toneMapped: false } ) );
moon.position.copy( moonDirection ).multiplyScalar( 500 );
moon.visible = false;
scene.add( moon );

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

function repeatingTexture( url ) {

  const texture = new THREE.TextureLoader().load( url );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;

}

const limewash = repeatingTexture( './textures/limewash.jpg' );
const limewashSize = ft( 4 );
const wallMaterial = new THREE.MeshStandardMaterial( { map: limewash, roughness: 0.9, side: THREE.DoubleSide } );
const wood = repeatingTexture( './textures/wood.jpg' );
const woodHeight = ft( 3, 4 );

const frameMaterial = new THREE.MeshStandardMaterial( { map: wood, roughness: 0.6, side: THREE.DoubleSide } );
const glassMaterial = new THREE.MeshPhysicalMaterial( { color: 0xc8c8c8, roughness: 0.05, transparent: true, opacity: 0.5, side: THREE.DoubleSide } );
const walls = [];
const floors = [];

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

function wall( minX, maxX, minZ, maxZ, openings = [], base = 0, height = wallHeight, wallSurface = wallMaterial ) {

  const alongX = maxX > minX;
  const start = alongX ? minX : minZ;
  const end = alongX ? maxX : maxZ;
  const gap = ( end - start - openings.reduce( ( sum, o ) => sum + o.width, 0 ) ) / ( openings.length + 1 );
  const segment = ( a, b, minY = 0, maxY = height, material = wallSurface ) => alongX ? plane( a, b, minZ, maxZ, base + minY, base + maxY, material ) : plane( minX, maxX, a, b, base + minY, base + maxY, material );

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
    if ( o.bottom > 0 ) {

      segment( a + f, a + o.width - f, o.bottom, o.bottom + f, frameMaterial );
      segment( a + f, a + o.width - f, o.bottom + f, o.top - f, glassMaterial );

    }

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
const floorMaterial = new THREE.MeshStandardMaterial( { color: 0x333333, roughness: 0.4 } );

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

  const text = new THREE.Mesh( new THREE.PlaneGeometry( 2, 0.5 ), new THREE.MeshBasicMaterial( { map: textTexture( name, color, 512, 128 ), transparent: true, toneMapped: false } ) );
  text.rotation.x = - Math.PI / 2;
  text.position.set( ( minX + maxX ) / 2, base + 0.03, ( minZ + maxZ ) / 2 );
  house.add( text );

}

const lampGeometry = new THREE.SphereGeometry( 0.08, 16, 8 );
const lampMaterial = new THREE.MeshBasicMaterial( { color: 0xcccccc, toneMapped: false } );
const roomLights = [];

function roomLight( minX, maxX, minZ, maxZ, base, top, shadow = true ) {

  const lamp = new THREE.Mesh( lampGeometry, lampMaterial );
  lamp.position.set( ( minX + maxX ) / 2, Math.min( top - ft( 1 ), base + ft( 9 ) ), ( minZ + maxZ ) / 2 );
  house.add( lamp );

  const light = new THREE.PointLight( 0xfff1e0, 10, shadow ? 6 : 3.5 );
  light.visible = false;
  light.castShadow = shadow;
  light.shadow.mapSize.set( 256, 256 );
  light.shadow.camera.near = 0.05;
  light.shadow.bias = - 0.002;
  light.shadow.autoUpdate = false;
  light.shadow.needsUpdate = true;
  lamp.add( light );
  roomLights.push( light );

}

function roomFloor( minX, maxX, minZ, maxZ, name, base = 0, height = wallHeight, shadow = true ) {

  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( maxX - minX, maxZ - minZ ), floorMaterial );
  mesh.rotation.x = - Math.PI / 2;
  mesh.position.set( ( minX + maxX ) / 2, base + 0.02, ( minZ + maxZ ) / 2 );
  house.add( mesh );

  roomLabel( minX, maxX, minZ, maxZ, name, base );
  roomLight( minX, maxX, minZ, maxZ, base, base + height, shadow );

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
const room16West = northWalls[ 3 ] - ( northWalls[ 2 ] - northWalls[ 1 ] );

for ( let i = 0; i < northWalls.length; i ++ ) {

  wall( northWalls[ i ], northWalls[ i ], north, back, northWallOpenings[ i ], 0, i >= 1 && i <= 3 ? room56WallHeight : wallHeight );
  if ( i < northWalls.length - 1 ) roomFloor( northWalls[ i ], northWalls[ i + 1 ], north, back, `Room ${ i + 4 }`, 0, i === 1 || i === 2 ? room56WallHeight : wallHeight );

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

const partitionMaterial = new THREE.MeshStandardMaterial( { map: wood, roughness: 0.9, side: THREE.DoubleSide } );
wall( room16West, room16West, north, back, [ { ...door, before: back - north - door.width } ], room56WallHeight, secondFloorWallHeight, partitionMaterial );

const ceilingMaterial = new THREE.MeshStandardMaterial( { map: wood, roughness: 0.8, side: THREE.DoubleSide } );
const verandaDepth = ft( 4 );
const secondFloorNorth = north - verandaDepth;
const secondFloorSouth = back + verandaDepth;
const holeWest = northWalls[ 2 ];
const holeEast = holeWest + ft( 4 );
const holeSouth = back - ft( 3 );
const holeNorth = holeSouth - ft( 5 );
const ceilingHoleNorth = north + ft( 3 );
const ceilingHoleSouth = ceilingHoleNorth + ft( 5 );

const secondFloorMaterial = partitionMaterial.clone();
secondFloorMaterial.envMap = scene.environment;
secondFloorMaterial.envMapIntensity = scene.environmentIntensity;
secondFloorMaterial.envMapRotation.x = Math.PI / 2;

function ceiling( minX, maxX, minZ, maxZ, y = room56WallHeight, material = ceilingMaterial ) {

  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( maxX - minX, maxZ - minZ ), material );
  mesh.rotation.x = - Math.PI / 2;
  mesh.position.set( ( minX + maxX ) / 2, y, ( minZ + maxZ ) / 2 );
  house.add( mesh );
  if ( y === room56WallHeight ) {

    const floor = new THREE.Mesh( mesh.geometry, secondFloorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.position.set( mesh.position.x, y + 0.02, mesh.position.z );
    house.add( floor );

  }

  const box = new THREE.Box3().setFromObject( mesh );
  walls.push( box );
  floors.push( box );

}

ceiling( northWalls[ 1 ], holeWest, secondFloorNorth, secondFloorSouth );
ceiling( holeEast, northWalls[ 3 ], secondFloorNorth, secondFloorSouth );
ceiling( holeWest, holeEast, secondFloorNorth, holeNorth );
ceiling( holeWest, holeEast, holeSouth, secondFloorSouth );
ceiling( northWalls[ 1 ], holeWest, north, back, secondFloorTop );
ceiling( holeEast, northWalls[ 3 ], north, back, secondFloorTop );
ceiling( holeWest, holeEast, north, ceilingHoleNorth, secondFloorTop );
ceiling( holeWest, holeEast, ceilingHoleSouth, back, secondFloorTop );

const fenceHeight = ft( 4 );
const slatWidth = ft( 0, 5 );
const slatSpacing = ft( 0, 8 );
const railWidth = ft( 0, 4 );

function fence( minX, maxX, minZ, maxZ ) {

  const alongX = maxX > minX;
  const start = alongX ? minX : minZ;
  const length = ( alongX ? maxX : maxZ ) - start;
  const count = Math.round( length / slatSpacing );
  const top = room56WallHeight + fenceHeight;

  for ( let i = 0; i < count; i ++ ) {

    const a = start + ( i + 0.5 ) * length / count - slatWidth / 2;
    if ( alongX ) plane( a, a + slatWidth, minZ, maxZ, room56WallHeight, top, partitionMaterial );
    else plane( minX, maxX, a, a + slatWidth, room56WallHeight, top, partitionMaterial );

  }

  const r = railWidth / 2;
  if ( alongX ) ceiling( minX - r, maxX + r, minZ - r, maxZ + r, top, secondFloorMaterial );
  else ceiling( minX - r, maxX + r, minZ, maxZ, top, secondFloorMaterial );

}

fence( northWalls[ 1 ], northWalls[ 3 ], secondFloorNorth, secondFloorNorth );
fence( northWalls[ 1 ], northWalls[ 1 ], secondFloorNorth, north );
fence( northWalls[ 3 ], northWalls[ 3 ], secondFloorNorth, north );
fence( northWalls[ 1 ], northWalls[ 3 ], secondFloorSouth, secondFloorSouth );
fence( northWalls[ 1 ], northWalls[ 1 ], back, secondFloorSouth );
fence( northWalls[ 3 ], northWalls[ 3 ], back, secondFloorSouth );
fence( holeWest + railWidth / 2, holeEast, holeNorth, holeNorth );
fence( holeEast, holeEast, holeNorth, holeSouth );

const roofMetal = repeatingTexture( './textures/roof.jpg' );
const roofSheetWidth = ft( 3 );
const roofSheetLength = ft( 6 );
const roofMaterial = new THREE.MeshStandardMaterial( { map: roofMetal, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide } );
const roofHeight = ft( 3 );

function face( material, points ) {

  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  geometry.setIndex( points.slice( 2 ).flatMap( ( _, i ) => [ 0, i + 1, i + 2 ] ) );
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh( geometry, material );
  house.add( mesh );
  return mesh;

}

function roofFace( ...points ) {

  const normal = new THREE.Triangle( ...points ).getNormal( new THREE.Vector3() );
  if ( normal.y < 0 ) {

    points.reverse();
    normal.negate();

  }

  const down = new THREE.Vector3( normal.x, 0, normal.z ).normalize();
  const across = new THREE.Vector3( - down.z, 0, down.x );
  const uv = points.flatMap( ( p ) => [ p.dot( across ) / roofSheetWidth, p.dot( down ) / roofSheetLength ] );
  face( roofMaterial, points ).geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );

}

const hip = ( back - north ) / 2;
const roofOverhang = verandaDepth;
const eave = secondFloorTop - roofOverhang * roofHeight / hip;
const roofNW = new THREE.Vector3( northWalls[ 1 ] - roofOverhang, eave, north - roofOverhang );
const roofNE = new THREE.Vector3( northWalls[ 3 ] + roofOverhang, eave, north - roofOverhang );
const roofSE = new THREE.Vector3( northWalls[ 3 ] + roofOverhang, eave, back + roofOverhang );
const roofSW = new THREE.Vector3( northWalls[ 1 ] - roofOverhang, eave, back + roofOverhang );
const ridgeWest = new THREE.Vector3( northWalls[ 1 ] + hip, secondFloorTop + roofHeight, north + hip );
const ridgeEast = new THREE.Vector3( northWalls[ 3 ] - hip, secondFloorTop + roofHeight, north + hip );

roofFace( roofNW, roofNE, ridgeEast, ridgeWest );
roofFace( roofSE, roofSW, ridgeWest, ridgeEast );
roofFace( roofNE, roofSE, ridgeEast );
roofFace( roofSW, roofNW, ridgeWest );

const lowerEave = ft( 7 );
const lowerRoofReach = ( room56WallHeight - lowerEave ) / ( room56WallHeight - wallHeight );
const lowerRoofEdge = ( x, z, wallX, wallZ ) => new THREE.Vector3( x + lowerRoofReach * ( wallX - x ), lowerEave, z + lowerRoofReach * ( wallZ - z ) );

const lowerNW = new THREE.Vector3( northWalls[ 1 ], room56WallHeight, north );
const lowerSW = new THREE.Vector3( northWalls[ 1 ], room56WallHeight, back );
const lowerSE = new THREE.Vector3( northWalls[ 3 ], room56WallHeight, back );
const lowerNE = new THREE.Vector3( northWalls[ 3 ], room56WallHeight, north );
const eaveNW = lowerRoofEdge( northWalls[ 1 ], north, left, north );
const eaveSW = lowerRoofEdge( northWalls[ 1 ], back, left, front );
const eaveSE = lowerRoofEdge( northWalls[ 3 ], back, - left, front );

roofFace( lowerSW, lowerSE, eaveSE, eaveSW );
roofFace( lowerNW, lowerSW, eaveSW, eaveNW );

const rampBottom = north + door.width;
const rampRun = holeSouth - rampBottom;
const ramp = new THREE.Mesh( new THREE.PlaneGeometry( holeEast - holeWest, Math.hypot( rampRun, room56WallHeight ) ), ceilingMaterial );
ramp.rotation.x = Math.atan2( rampRun, room56WallHeight );
ramp.position.set( ( holeWest + holeEast ) / 2, room56WallHeight / 2, ( rampBottom + holeSouth ) / 2 );
house.add( ramp );

const rampHeight = ( z ) => room56WallHeight * ( z - rampBottom ) / rampRun;
const rampFenceTop = ( z ) => Math.min( rampHeight( z ) + fenceHeight, room56WallHeight );
const rampRailEnd = rampBottom + rampRun * ( room56WallHeight - fenceHeight ) / room56WallHeight;
const rampSlats = Math.round( rampRun / slatSpacing );

for ( let i = 0; i < rampSlats; i ++ ) {

  const a = rampBottom + ( i + 0.5 ) * rampRun / rampSlats - slatWidth / 2;
  const b = a + slatWidth;
  const slat = face( partitionMaterial, [
    new THREE.Vector3( holeEast, rampHeight( a ), a ),
    new THREE.Vector3( holeEast, rampHeight( b ), b ),
    new THREE.Vector3( holeEast, rampFenceTop( b ), b ),
    new THREE.Vector3( holeEast, rampFenceTop( a ), a )
  ] );
  walls.push( new THREE.Box3().setFromObject( slat ) );

}

face( secondFloorMaterial, [
  new THREE.Vector3( holeEast - railWidth / 2, fenceHeight, rampBottom ),
  new THREE.Vector3( holeEast + railWidth / 2, fenceHeight, rampBottom ),
  new THREE.Vector3( holeEast + railWidth / 2, room56WallHeight, rampRailEnd ),
  new THREE.Vector3( holeEast - railWidth / 2, room56WallHeight, rampRailEnd )
] );

const rampSteps = Math.round( room56WallHeight / ft( 0, 8 ) );
const rampTread = rampRun / rampSteps;

for ( let i = 1; i <= rampSteps; i ++ ) {

  const tread = new THREE.Mesh( new THREE.PlaneGeometry( holeEast - holeWest, rampTread ), secondFloorMaterial );
  tread.rotation.x = - Math.PI / 2;
  tread.position.set( ( holeWest + holeEast ) / 2, i * room56WallHeight / rampSteps, rampBottom + ( i - 0.5 ) * rampTread );
  house.add( tread );

}

roomLabel( northWalls[ 1 ], northWalls[ 2 ], north, back, 'Room 14', room56WallHeight, '#000000' );
roomLabel( northWalls[ 2 ], room16West, north, holeNorth, 'Room 15', room56WallHeight, '#000000' );
roomLabel( room16West, northWalls[ 3 ], north, back, 'Room 16', room56WallHeight, '#000000' );
roomLight( northWalls[ 1 ], northWalls[ 2 ], north, back, room56WallHeight, secondFloorTop );
roomLight( northWalls[ 2 ], room16West, north, back, room56WallHeight, secondFloorTop );
roomLight( room16West, northWalls[ 3 ], north, back, room56WallHeight, secondFloorTop, false );

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
roomFloor( left, room10East, room10North, north, 'Room 10', 0, room10WallHeight );
roomFloor( left, room10East, room8North, room10North, 'Room 11', 0, room10WallHeight, false );
ceiling( left, room10East, room8North, north, room10WallHeight, wallMaterial );

for ( let i = 0; i < room8Walls.length; i ++ ) {

  if ( i > 0 ) wall( room8Walls[ i ], room8Walls[ i ], room8North, north, [ { ...door, before: 0 } ], room8Level, room8WallHeight );
  if ( i < room8Walls.length - 1 ) roomFloor( room8Walls[ i ], room8Walls[ i + 1 ], room8North, north, `Room ${ i + 8 }`, room8Level, room8WallHeight );

}

const room8Top = room8Level + room8WallHeight;
const room8Overhang = ft( 2 );
const room8RoofEave = room8Top - room8Overhang * ( room56WallHeight - room8Top ) / ( north - room8North );

const room9Hip = new THREE.Vector3( eaveSE.x, lowerEave, north - ( room56WallHeight - lowerEave ) * ( north - room8North ) / ( room56WallHeight - room8Top ) );

roofFace( lowerSE, lowerNE, room9Hip, eaveSE );
roofFace(
  new THREE.Vector3( room10East, room56WallHeight, north ),
  lowerNE,
  room9Hip,
  new THREE.Vector3( room9Hip.x, room8RoofEave, room8North - room8Overhang ),
  new THREE.Vector3( room10East, room8RoofEave, room8North - room8Overhang )
);

wall( room12West, room12East, room12North, room12North, [ tinyWindow ], room12Level, room12WallHeight );
wall( room12West, room12West, room12North, room8North, [ tinyWindow ], room12Level, room12WallHeight );
wall( room12East, room12East, room12North, room8North, [ { ...door, before: room8North - room12North - door.width } ], room12Level, room12WallHeight );
roomFloor( room12West, room12East, room12North, room8North, 'Room 12', room12Level, room12WallHeight, false );

const room12Top = room12Level + room12WallHeight;
const room12Overhang = ft( 1 );
const room12RoofEave = room12Top - room12Overhang * ( room8Top - room12Top ) / ( room8North - room12North );

roofFace(
  new THREE.Vector3( room12West, room8Top, room8North ),
  new THREE.Vector3( room12East, room8Top, room8North ),
  new THREE.Vector3( room12East, room12RoofEave, room12North - room12Overhang ),
  new THREE.Vector3( room12West, room12RoofEave, room12North - room12Overhang )
);

const room13East = - left + ft( 9 );
const room13North = room8North - ft( 6 );

wall( - left, room13East, room13North, room13North, [ middle( smallWindow, room8WallHeight ) ], room8Level, room8WallHeight );
wall( - left, - left, room13North, room8North, [ { ...door, before: room8North - room13North - door.width } ], room8Level, room8WallHeight );
wall( room13East, room13East, room13North, north, [], room8Level, room8WallHeight );
wall( - left, room13East, north, north, [ door ], room8Level, room8WallHeight );
roomFloor( - left, room13East, room13North, north, 'Room 13', room8Level, room8WallHeight, false );
ceiling( - left, room13East, room13North, north, room8Top, wallMaterial );

const plinthMaterial = new THREE.MeshStandardMaterial( { color: 0x999999, roughness: 0.95 } );

function plinth( minX, maxX, minZ, maxZ, top ) {

  const mesh = new THREE.Mesh( new THREE.BoxGeometry( maxX - minX, floorLevel + top, maxZ - minZ ), plinthMaterial );
  mesh.position.set( ( minX + maxX ) / 2, ( top - floorLevel ) / 2, ( minZ + maxZ ) / 2 );
  house.add( mesh );
  return mesh;

}

plinth( left, - left, north, front, 0 );
plinth( left, room10East, room8North, north, 0 );
plinth( room10East, - left, room8North, north, room8Level );
plinth( - left, room13East, room13North, north, room8Level );

const porchWest = - ft( 4 );
const porchEast = ft( 4 );
const porchSouth = front + ft( 8 );

plinth( porchWest, porchEast, front, porchSouth, 0 );
const porchFloor = new THREE.Mesh( new THREE.PlaneGeometry( porchEast - porchWest, porchSouth - front ), floorMaterial );
porchFloor.rotation.x = - Math.PI / 2;
porchFloor.position.set( ( porchWest + porchEast ) / 2, 0.02, ( front + porchSouth ) / 2 );
house.add( porchFloor );
ceiling( porchWest, porchEast, front, porchSouth, lowerEave, wallMaterial );

const pillarWidth = ft( 0, 6 );
plane( porchWest, porchWest + pillarWidth, porchSouth, porchSouth, 0, lowerEave, wallMaterial );
plane( porchEast - pillarWidth, porchEast, porchSouth, porchSouth, 0, lowerEave, wallMaterial );

const seatWidth = ft( 2 );
const seatHeight = ft( 2 );
const seatClearance = 0.01;

function seat( minX, maxX ) {

  const mesh = new THREE.Mesh( new THREE.BoxGeometry( maxX - minX, seatHeight, porchSouth - front - 2 * seatClearance ), floorMaterial );
  mesh.position.set( ( minX + maxX ) / 2, seatHeight / 2, ( front + porchSouth ) / 2 );
  house.add( mesh );
  const box = new THREE.Box3().setFromObject( mesh );
  walls.push( box );
  floors.push( box );

}

seat( porchWest, porchWest + seatWidth );
seat( porchEast - seatWidth, porchEast );
roomLight( porchWest, porchEast, front, porchSouth, 0, lowerEave, false );

const stairCount = 3;
const stairRise = floorLevel / ( stairCount + 1 );
const stairTread = ft( 1 );

for ( let i = 1; i <= stairCount; i ++ ) {

  const step = plinth( porchWest, porchEast, porchSouth + ( i - 1 ) * stairTread, porchSouth + i * stairTread, - i * stairRise );
  floors.push( new THREE.Box3().setFromObject( step ) );

}

const yardSize = ft( 120 );
const yardWallHeight = ft( 6 );
const yardWallThickness = ft( 0, 9 );
const yardCenterZ = ( room13North + front ) / 2;

const yard = new THREE.Group();
yard.position.set( ( left + room13East ) / 2, 0, yardCenterZ );
yard.updateMatrixWorld();
scene.add( yard );

const grass = repeatingTexture( './textures/grass.jpg' );
grass.repeat.setScalar( 12 );

const ground = new THREE.Mesh( new THREE.PlaneGeometry( yardSize, yardSize ), new THREE.MeshStandardMaterial( { map: grass, roughness: 1 } ) );
ground.rotation.x = - Math.PI / 2;
yard.add( ground );

const hedge = repeatingTexture( './textures/hedge.jpg' );
const hedgeSize = ft( 3 );
const yardWallMaterial = new THREE.MeshStandardMaterial( { map: hedge, roughness: 1 } );

function yardWall( x, z, rotation ) {

  const mesh = new THREE.Mesh( new THREE.BoxGeometry( yardSize + yardWallThickness, yardWallHeight, yardWallThickness ), yardWallMaterial );
  mesh.position.set( x, yardWallHeight / 2, z );
  mesh.rotation.y = rotation;
  yard.add( mesh );
  walls.push( new THREE.Box3().setFromObject( mesh ) );

}

yardWall( 0, yardSize / 2, 0 );
yardWall( 0, - yardSize / 2, 0 );
yardWall( yardSize / 2, 0, Math.PI / 2 );
yardWall( - yardSize / 2, 0, Math.PI / 2 );

const compass = new THREE.Group();
compass.position.set( 0, 8, 0 );
house.add( compass );

const ring = new THREE.Mesh( new THREE.RingGeometry( 1.4, 1.5, 64 ), new THREE.MeshBasicMaterial( { color: 0x333333, side: THREE.DoubleSide, toneMapped: false } ) );
ring.rotation.x = - Math.PI / 2;
compass.add( ring );

const needleShape = new THREE.Shape().moveTo( - 0.2, 0 ).lineTo( 0, 1.3 ).lineTo( 0.2, 0 );

function needle( color, rotationX ) {

  const mesh = new THREE.Mesh( new THREE.ShapeGeometry( needleShape ), new THREE.MeshBasicMaterial( { color, side: THREE.DoubleSide, toneMapped: false } ) );
  mesh.rotation.x = rotationX;
  compass.add( mesh );

}

needle( 0xcc0000, - Math.PI / 2 );
needle( 0xffffff, Math.PI / 2 );

function label( text, x, z ) {

  const sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: textTexture( text, text === 'N' ? '#cc0000' : '#222222', 128, 128 ), toneMapped: false } ) );
  sprite.position.set( x, 0, z );
  sprite.scale.setScalar( 0.8 );
  compass.add( sprite );

}

label( 'N', 0, - 2 );
label( 'S', 0, 2 );
label( 'E', 2, 0 );
label( 'W', - 2, 0 );

const axes = [ 'x', 'y', 'z' ];
const worldPoint = new THREE.Vector3();
const worldNormal = new THREE.Vector3();
const meshSize = new THREE.Vector3();

function worldUV( mesh, width, height, alongLongest ) {

  const { position, normal } = mesh.geometry.attributes;
  new THREE.Box3().setFromObject( mesh ).getSize( meshSize );
  const normalMatrix = new THREE.Matrix3().getNormalMatrix( mesh.matrixWorld );
  const uv = [];

  for ( let i = 0; i < position.count; i ++ ) {

    worldPoint.fromBufferAttribute( position, i ).applyMatrix4( mesh.matrixWorld );
    worldNormal.fromBufferAttribute( normal, i ).applyMatrix3( normalMatrix );
    const facing = axes.reduce( ( a, b ) => Math.abs( worldNormal[ b ] ) > Math.abs( worldNormal[ a ] ) ? b : a );
    let [ u, v ] = axes.filter( ( axis ) => axis !== facing );
    if ( alongLongest && meshSize[ v ] > meshSize[ u ] ) [ u, v ] = [ v, u ];
    uv.push( worldPoint[ u ] / width, worldPoint[ v ] / height );

  }

  mesh.geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );

}

for ( const group of [ house, yard ] ) group.traverse( ( object ) => {

  if ( object.isMesh && ! object.material.isMeshBasicMaterial ) {

    object.castShadow = ! object.material.transparent;
    object.receiveShadow = true;
    if ( object.material.map === wood ) worldUV( object, 2 * woodHeight, woodHeight, true );
    if ( object.material.map === limewash ) worldUV( object, limewashSize, limewashSize, false );
    if ( object.material.map === hedge ) worldUV( object, hedgeSize, hedgeSize, false );

  }

} );

const houseBounds = new THREE.Box3().setFromObject( house ).union( new THREE.Box3().setFromObject( yard ) ).getBoundingSphere( new THREE.Sphere() );

function aim( light, direction ) {

  light.target.position.copy( houseBounds.center );
  light.position.copy( houseBounds.center ).addScaledVector( direction, houseBounds.radius * 2 );
  const shadowCamera = light.shadow.camera;
  shadowCamera.left = shadowCamera.bottom = - houseBounds.radius;
  shadowCamera.right = shadowCamera.top = houseBounds.radius;
  shadowCamera.near = houseBounds.radius;
  shadowCamera.far = houseBounds.radius * 3;
  shadowCamera.updateProjectionMatrix();

}

aim( sun, sunDirection );
aim( moonLight, moonDirection );

const nightSky = new THREE.Color( 0x070b1a );
const dayNight = document.getElementById( 'day-night' );
let night = false;

function setNight( value ) {

  night = value;
  sky.visible = sun.visible = ! night;
  moon.visible = moonLight.visible = night;
  scene.background = night ? nightSky : null;
  scene.fog = night ? null : fog;
  scene.environmentIntensity = secondFloorMaterial.envMapIntensity = night ? 0.03 : 0.4;
  lampMaterial.color.set( night ? 0xffffff : 0xcccccc );
  for ( const light of roomLights ) light.visible = night;
  dayNight.textContent = night ? 'Day' : 'Night';

}

dayNight.addEventListener( 'click', () => setNight( ! night ) );
window.addEventListener( 'keydown', ( e ) => {

  if ( e.code === 'KeyN' && ! e.repeat ) setNight( ! night );

} );

const controls = new PointerLockControls( camera, document.body );
const info = document.getElementById( 'info' );
info.addEventListener( 'click', () => controls.lock() );
renderer.domElement.addEventListener( 'click', () => controls.lock() );
controls.addEventListener( 'lock', () => info.style.display = 'none' );
controls.addEventListener( 'unlock', () => info.style.display = 'flex' );

const keys = { KeyW: 0, KeyA: 0, KeyS: 0, KeyD: 0, Space: 0, ShiftLeft: 0, ShiftRight: 0, Walk: 0, Back: 0 };
window.addEventListener( 'keydown', ( e ) => keys[ e.code ] = 1 );
window.addEventListener( 'keyup', ( e ) => keys[ e.code ] = 0 );

for ( const [ id, key ] of [ [ 'walk', 'Walk' ], [ 'back', 'Back' ] ] ) {

  const button = document.getElementById( id );
  const release = () => keys[ key ] = 0;
  button.addEventListener( 'pointerdown', ( e ) => {

    button.setPointerCapture( e.pointerId );
    keys[ key ] = 1;
    info.style.display = 'none';

  } );
  button.addEventListener( 'pointerup', release );
  button.addEventListener( 'pointercancel', release );

}

const eyeHeight = 1.6;
const playerRadius = 0.3;
const stepHeight = 0.5;
const walkSpeed = 2.5;
const flySpeed = 5;
const direction = new THREE.Vector2();
const previous = new THREE.Vector3();
const playerBox = new THREE.Box3();
let prevTime = 0;

camera.position.set( 0, eyeHeight, ( front + yardCenterZ + yardSize / 2 ) / 2 );

function collides() {

  const { x, y, z } = camera.position;
  playerBox.min.set( x - playerRadius, y - eyeHeight + stepHeight, z - playerRadius );
  playerBox.max.set( x + playerRadius, y, z + playerRadius );
  return walls.some( ( w ) => w.intersectsBox( playerBox ) );

}

function floorAt( x, z ) {

  if ( x > left && x < - left && z > north && z < front ) return floorLevel;
  if ( x > porchWest && x < porchEast && z >= front && z < porchSouth ) return floorLevel;
  if ( x > left && x < room10East && z > room8North && z <= north ) return floorLevel;
  if ( x >= room10East && x < - left && z > room8North && z <= north ) return floorLevel + room8Level;
  if ( x >= - left && x < room13East && z > room13North && z <= north ) return floorLevel + room8Level;
  return 0;

}

function groundAt( x, z, feet ) {

  const heights = floors.filter( ( f ) => x >= f.min.x && x <= f.max.x && z >= f.min.z && z <= f.max.z ).map( ( f ) => f.max.y );
  if ( x > holeWest && x < holeEast && z > rampBottom && z < holeSouth ) heights.push( floorLevel + room56WallHeight * ( z - rampBottom ) / rampRun );
  return heights.filter( ( h ) => h <= feet + stepHeight ).reduce( ( a, b ) => Math.max( a, b ), floorAt( x, z ) );

}

function place( x, z, rise ) {

  const y = previous.y + rise;
  const ground = groundAt( x, z, y - eyeHeight ) + eyeHeight;
  camera.position.set( x, rise === 0 && y - ground < stepHeight ? ground : Math.max( y, ground ), z );
  return ! collides();

}

function move( delta ) {

  previous.copy( camera.position );
  direction.set( keys.KeyD - keys.KeyA, keys.KeyW + keys.Walk - keys.KeyS - keys.Back ).normalize();
  controls.moveRight( direction.x * walkSpeed * delta );
  controls.moveForward( direction.y * walkSpeed * delta );

  const { x, z } = camera.position;
  const rise = ( keys.Space - Math.max( keys.ShiftLeft, keys.ShiftRight ) ) * flySpeed * delta;
  if ( place( x, z, rise ) || place( x, previous.z, rise ) || place( previous.x, z, rise ) || place( previous.x, previous.z, rise ) ) return;
  camera.position.copy( previous );

}

function animate( time ) {

  const delta = Math.min( ( time - prevTime ) / 1000, 0.1 );
  prevTime = time;

  if ( controls.isLocked || keys.Walk || keys.Back ) {

    const steps = Math.ceil( delta * 60 );
    for ( let i = 0; i < steps; i ++ ) move( delta / steps );

  }

  renderer.render( scene, camera );

}

window.addEventListener( 'resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

} );

// Shadows - Fake Shadow
// Source: https://threejs.org/manual/#shadows
// Local: http://localhost:5173/threejsmanual/19_shadows/1_fake_shadow/
//
// This article is part of a series of articles about three.js. The first
// article is three.js fundamentals (https://threejs.org/manual/#fundamentals).
// If you haven't read that yet and you're new to three.js you might want to
// consider starting there. The previous article was about cameras
// (https://threejs.org/manual/#cameras) which is important to have read before
// you read this article as well as the article before that one about lights
// (https://threejs.org/manual/#lights).
//
// Shadows on computers can be a complicated topic. There are various solutions
// and all of them have tradeoffs including the solutions available in
// three.js.
//
// Three.js by default uses shadow maps. The way a shadow map works is, for
// every light that casts shadows all objects marked to cast shadows are
// rendered from the point of view of the light. READ THAT AGAIN! and let it
// sink in.
//
// In other words, if you have 20 objects, and 5 lights, and all 20 objects are
// casting shadows and all 5 lights are casting shadows then your entire scene
// will be drawn 6 times. All 20 objects will be drawn for light #1, then all
// 20 objects will be drawn for light #2, then #3, etc and finally the actual
// scene will be drawn using data from the first 5 renders.
//
// It gets worse, if you have a point light casting shadows the scene has to be
// drawn 6 times just for that light!
//
// For these reasons it's common to find other solutions than to have a bunch
// of lights all generating shadows. One common solution is to have multiple
// lights but only one directional light generating shadows.
//
// Yet another solution is to use lightmaps and or ambient occlusion maps to
// pre-compute the effects of lighting offline. This results in static lighting
// or static lighting hints but at least it's fast. We'll cover both of those
// in another article.
//
// Another solution is to use fake shadows. Make a plane, put a grayscale
// texture in the plane that approximates a shadow, draw it above the ground
// below your object.
//
// For example let's use this texture as a fake shadow
//
// We'll use some of the code from the previous article
// (https://threejs.org/manual/#cameras).

import * as THREE from 'three';
import checkerUrl from '../resources/images/checker.png';
import roundshadowUrl from '../resources/images/roundshadow.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 0, 10, 20 );
  camera.lookAt( 0, 0, 0 );

  // Let's set the background color to white.

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 'white' );

  // Then we'll setup the same checkerboard ground but this time it's using a
  // MeshBasicMaterial as we don't need lighting for the ground.

  const loader = new THREE.TextureLoader();

  {

    const planeSize = 40;

    const texture = loader.load( checkerUrl );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set( repeats, repeats );

    const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
    const planeMat = new THREE.MeshBasicMaterial( {
      map: texture,
      side: THREE.DoubleSide,
    } );

    // Note we're setting the color to 1.5, 1.5, 1.5. This will multiply the
    // checkerboard texture's colors by 1.5, 1.5, 1.5. Since the texture's
    // colors are 0x808080 and 0xC0C0C0 which is medium gray and light gray,
    // multiplying them by 1.5 will give us a white and light grey checkerboard.

    planeMat.color.setRGB( 1.5, 1.5, 1.5 );
    const mesh = new THREE.Mesh( planeGeo, planeMat );
    mesh.rotation.x = Math.PI * - .5;
    scene.add( mesh );

  }

  // Let's load the shadow texture

  const shadowTexture = loader.load( roundshadowUrl );

  // and make an array to remember each sphere and associated objects.

  const sphereShadowBases = [];
  {

    // Then we'll make a sphere geometry

    const sphereRadius = 1;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );

    // And a plane geometry for the fake shadow

    const planeSize = 1;
    const shadowGeo = new THREE.PlaneGeometry( planeSize, planeSize );

    // Now we'll make a bunch of spheres. For each sphere we'll create a base
    // THREE.Object3D and we'll make both the shadow plane mesh and the sphere
    // mesh children of the base. That way if we move the base both the sphere
    // and the shadow will move. We need to put the shadow slightly above the
    // ground to prevent z-fighting. We also set depthWrite to false so that the
    // shadows don't mess each other up. We'll go over both of these issues in
    // another article (https://threejs.org/manual/#transparency). The shadow is
    // a MeshBasicMaterial because it doesn't need lighting.
    //
    // We make each sphere a different hue and then save off the base, the
    // sphere mesh, the shadow mesh and the initial y position of each sphere.

    const numSpheres = 15;
    for ( let i = 0; i < numSpheres; ++ i ) {

      // make a base for the shadow and the sphere
      // so they move together.
      const base = new THREE.Object3D();
      scene.add( base );

      // add the shadow to the base
      // note: we make a new material for each sphere
      // so we can set that sphere's material transparency
      // separately.
      const shadowMat = new THREE.MeshBasicMaterial( {
        map: shadowTexture,
        transparent: true, // so we can see the ground
        depthWrite: false, // so we don't have to sort
      } );
      const shadowMesh = new THREE.Mesh( shadowGeo, shadowMat );
      shadowMesh.position.y = 0.001; // so we're above the ground slightly
      shadowMesh.rotation.x = Math.PI * - .5;
      const shadowSize = sphereRadius * 4;
      shadowMesh.scale.set( shadowSize, shadowSize, shadowSize );
      base.add( shadowMesh );

      // add the sphere to the base
      const u = i / numSpheres; // goes from 0 to 1 as we iterate the spheres.
      const sphereMat = new THREE.MeshPhongMaterial();
      sphereMat.color.setHSL( u, 1, .75 );
      const sphereMesh = new THREE.Mesh( sphereGeo, sphereMat );
      sphereMesh.position.set( 0, sphereRadius + 2, 0 );
      base.add( sphereMesh );

      // remember all 3 plus the y position
      sphereShadowBases.push( { base, sphereMesh, shadowMesh, y: sphereMesh.position.y } );

    }

  }

  // We setup 2 lights. One is a HemisphereLight with the intensity set to 2 to
  // really brighten things up.

  {

    const skyColor = 0xB1E1FF; // light blue
    const groundColor = 0xB97A20; // brownish orange
    const intensity = 0.75;
    const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
    scene.add( light );

  }

  // The other is a DirectionalLight so the spheres get some definition

  {

    const color = 0xFFFFFF;
    const intensity = 2.5;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( 0, 10, 5 );
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

  // It would render as is but let's animate there spheres. For each sphere,
  // shadow, base set we move the base in the xz plane, we move the sphere up
  // and down using Math.abs(Math.sin(time)) which gives us a bouncy animation.
  // And, we also set the shadow material's opacity so that as each sphere goes
  // higher its shadow fades out.

  function render( time ) {

    time *= 0.001; // convert to seconds

    resizeRendererToDisplaySize( renderer );

    {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }

    sphereShadowBases.forEach( ( sphereShadowBase, ndx ) => {

      const { base, sphereMesh, shadowMesh, y } = sphereShadowBase;

      // u is a value that goes from 0 to 1 as we iterate the spheres
      const u = ndx / sphereShadowBases.length;

      // compute a position for the base. This will move
      // both the sphere and its shadow
      const speed = time * .2;
      const angle = speed + u * Math.PI * 2 * ( ndx % 1 ? 1 : - 1 );
      const radius = Math.sin( speed - ndx ) * 10;
      base.position.set( Math.cos( angle ) * radius, 0, Math.sin( angle ) * radius );

      // yOff is a value that goes from 0 to 1
      const yOff = Math.abs( Math.sin( time * 2 + ndx ) );
      // move the sphere up and down
      sphereMesh.position.y = y + THREE.MathUtils.lerp( - 2, 2, yOff );
      // fade the shadow as the sphere goes up
      shadowMesh.material.opacity = THREE.MathUtils.lerp( 1, .25, yOff );

    } );

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// And here's 15 kind of bouncing balls.
//
// In some apps it's common to use a round or oval shadow for everything but of
// course you could also use different shaped shadow textures. You might also
// give the shadow a harder edge. A good example of using this type of shadow
// is Animal Crossing Pocket Camp where you can see each character has a simple
// round shadow. It's effective and cheap. Monument Valley appears to also use
// this kind of shadow for the main character.

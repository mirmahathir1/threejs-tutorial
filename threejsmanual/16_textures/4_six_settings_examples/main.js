// Textures - Six Settings Examples
// Source: https://threejs.org/manual/#textures
// Local: http://localhost:5173/threejsmanual/16_textures/4_six_settings_examples/
//
// Memory Usage
//
// Textures are often the part of a three.js app that use the most memory. It's
// important to understand that in general, textures take width * height * 4 *
// 1.33 bytes of memory.
//
// Notice that says nothing about compression. I can make a .jpg image and set
// its compression super high. For example let's say I was making a scene of a
// house. Inside the house there is a table and I decide to put this wood
// texture on the top surface of the table
// (https://threejs.org/manual/resources/images/compressed-but-large-wood-texture.jpg)
//
// That image is only 157k so it will download relatively quickly but it is
// actually 3024 x 3761 pixels in size. Following the equation above that's
//
//   3024 * 3761 * 4 * 1.33 = 60505764.5
//
// That image will take 60 MEG OF MEMORY! in three.js. A few textures like that
// and you'll be out of memory.
//
// I bring this up because it's important to know that using textures has a
// hidden cost. In order for three.js to use the texture it has to hand it off
// to the GPU and the GPU in general requires the texture data to be
// uncompressed.
//
// The moral of the story is make your textures small in dimensions not just
// small in file size. Small in file size = fast to download. Small in
// dimensions = takes less memory. How small should you make them? As small as
// you can and still look as good as you need them to look.
//
// JPG vs PNG
//
// This is pretty much the same as regular HTML in that JPGs have lossy
// compression, PNGs have lossless compression so PNGs are generally slower to
// download. But, PNGs support transparency. PNGs are also probably the
// appropriate format for non-image data like normal maps, and other kinds of
// non-image maps which we'll go over later.
//
// It's important to remember that a JPG doesn't use less memory than a PNG in
// WebGL. See above.
//
// Filtering and Mips
//
// Let's apply this 16x16 texture
// (https://threejs.org/manual/resources/images/mip-low-res-enlarged.png)
//
// To a cube
//
// Let's draw that cube really small
//
// Hmmm, I guess that's hard to see. Let's magnify that tiny cube
//
// How does the GPU know which colors to make each pixel it's drawing for the
// tiny cube? What if the cube was so small that it's just 1 or 2 pixels?
//
// This is what filtering is about.
//
// If it was Photoshop, Photoshop would average nearly all the pixels together
// to figure out what color to make those 1 or 2 pixels. That would be a very
// slow operation. GPUs solve this issue using mipmaps.
//
// Mips are copies of the texture, each one half as wide and half as tall as the
// previous mip where the pixels have been blended to make the next smaller mip.
// Mips are created until we get all the way to a 1x1 pixel mip. For the image
// above all of the mips would end up being something like this
// (https://threejs.org/manual/resources/images/mipmap-low-res-enlarged.png)
//
// Now, when the cube is drawn so small that it's only 1 or 2 pixels large the
// GPU can choose to use just the smallest or next to smallest mip level to
// decide what color to make the tiny cube.
//
// In three.js you can choose what happens both when the texture is drawn larger
// than its original size and what happens when it's drawn smaller than its
// original size.
//
// For setting the filter when the texture is drawn larger than its original
// size you set texture.magFilter property to either THREE.NearestFilter or
// THREE.LinearFilter. NearestFilter means just pick the closet single pixel
// from the original texture. With a low resolution texture this gives you a
// very pixelated look like Minecraft.
//
// LinearFilter means choose the 4 pixels from the texture that are closest to
// the where we should be choosing a color from and blend them in the
// appropriate proportions relative to how far away the actual point is from
// each of the 4 pixels.
//
// For setting the filter when the texture is drawn smaller than its original
// size you set the texture.minFilter property to one of 6 values.
//
//   - THREE.NearestFilter
//     same as above, choose the closest pixel in the texture
//   - THREE.LinearFilter
//     same as above, choose 4 pixels from the texture and blend them
//   - THREE.NearestMipmapNearestFilter
//     choose the appropriate mip then choose one pixel
//   - THREE.NearestMipmapLinearFilter
//     choose 2 mips, choose one pixel from each, blend the 2 pixels
//   - THREE.LinearMipmapNearestFilter
//     chose the appropriate mip then choose 4 pixels and blend them
//   - THREE.LinearMipmapLinearFilter
//     choose 2 mips, choose 4 pixels from each and blend all 8 into 1 pixel

import * as THREE from 'three';
import mipExampleUrl from '../resources/images/mip-example.png';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: false, canvas } );

  const fov = 60;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 150;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 'black' );

  function createMip( level, numLevels, scale ) {

    const u = level / numLevels;
    const size = 2 ** ( numLevels - level - 1 );
    const halfSize = Math.ceil( size / 2 );
    const ctx = document.createElement( 'canvas' ).getContext( '2d' );
    ctx.canvas.width = size * scale;
    ctx.canvas.height = size * scale;
    ctx.scale( scale, scale );
    ctx.fillStyle = `hsl(${180 + u * 360 | 0},100%,20%)`;
    ctx.fillRect( 0, 0, size, size );
    ctx.fillStyle = `hsl(${u * 360 | 0},100%,50%)`;
    ctx.fillRect( 0, 0, halfSize, halfSize );
    ctx.fillRect( halfSize, halfSize, halfSize, halfSize );
    return ctx.canvas;

  }

  const loader = new THREE.TextureLoader();
  loader.load( mipExampleUrl, ( texture ) => {

    const root = new THREE.Object3D();
    const depth = 50;
    const plane = new THREE.PlaneGeometry( 1, depth );
    const mipmap = [];
    const numMips = 7;
    for ( let i = 0; i < numMips; ++ i ) {

      mipmap.push( createMip( i, numMips, 1 ) );

    }

    // Is this a design flaw in three.js?
    // AFAIK there's no way to clone a texture really
    // Textures can share an image and I guess deep down
    // if the image is the same they might share a WebGLTexture
    // but no checks for mipmaps I'm guessing. It seems like
    // they shouldn't be checking for same image, the should be
    // checking for same WebGLTexture. Given there is more than
    // WebGL to support maybe they need to abstract WebGLTexture to
    // PlatformTexture or something?

    // Here's an example showing all 6 settings

    const meshInfos = [
      { x: - 1, y: 1, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter },
      { x: 0, y: 1, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter },
      { x: 1, y: 1, minFilter: THREE.NearestMipmapNearestFilter, magFilter: THREE.LinearFilter },
      { x: - 1, y: - 1, minFilter: THREE.NearestMipmapLinearFilter, magFilter: THREE.LinearFilter },
      { x: 0, y: - 1, minFilter: THREE.LinearMipmapNearestFilter, magFilter: THREE.LinearFilter },
      { x: 1, y: - 1, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter },
    ].map( ( info ) => {

      const copyTexture = texture.clone();
      copyTexture.minFilter = info.minFilter;
      copyTexture.magFilter = info.magFilter;
      copyTexture.wrapT = THREE.RepeatWrapping;
      copyTexture.repeat.y = depth;
      copyTexture.needsUpdate = true;

      const mipTexture = new THREE.CanvasTexture( mipmap[ 0 ] );
      mipTexture.mipmaps = mipmap;
      mipTexture.minFilter = info.minFilter;
      mipTexture.magFilter = info.magFilter;
      mipTexture.wrapT = THREE.RepeatWrapping;
      mipTexture.repeat.y = depth;

      const material = new THREE.MeshBasicMaterial( {
        map: copyTexture,
      } );

      const mesh = new THREE.Mesh( plane, material );
      mesh.rotation.x = Math.PI * .5 * info.y;
      mesh.position.x = info.x * 1.5;
      mesh.position.y = info.y;
      root.add( mesh );
      return {
        material,
        copyTexture,
        mipTexture,
      };

    } );
    scene.add( root );

    // If you click the picture above it will toggle between the texture we've
    // been using above and a texture where every mip level is a different color.

    document.querySelector( '#diagram' ).addEventListener( 'click', () => {

      for ( const meshInfo of meshInfos ) {

        const { material, copyTexture, mipTexture } = meshInfo;
        material.map = material.map === copyTexture ? mipTexture : copyTexture;

      }

    } );

  } );

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

    camera.position.y = Math.sin( time * .2 ) * .5;

    renderer.render( scene, camera );

    requestAnimationFrame( render );

  }

  requestAnimationFrame( render );

}

main();

// One thing to notice is the top left and top middle using NearestFilter and
// LinearFilter don't use the mips. Because of that they flicker in the
// distance because the GPU is picking pixels from the original texture. On the
// left just one pixel is chosen and in the middle 4 are chosen and blended but
// it's not enough come up with a good representative color. The other 4 strips
// do better with the bottom right, LinearMipmapLinearFilter being best.
//
// This makes it more clear what is happening. You can see in the top left and
// top middle the first mip is used all the way into the distance. The top
// right and bottom middle you can clearly see where a different mip is used.
//
// Switching back to the original texture you can see the bottom right is the
// smoothest, highest quality. You might ask why not always use that mode. The
// most obvious reason is sometimes you want things to be pixelated for a retro
// look or some other reason. The next most common reason is that reading 8
// pixels and blending them is slower than reading 1 pixel and blending. While
// it's unlikely that a single texture is going to be the difference between
// fast and slow as we progress further into these articles we'll eventually
// have materials that use 4 or 5 textures all at once. 4 textures * 8 pixels
// per texture is looking up 32 pixels for ever pixel rendered. This can be
// especially important to consider on mobile devices.

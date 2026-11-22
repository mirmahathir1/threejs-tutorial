// Primitives
// Source: https://threejs.org/manual/#primitives
// Local: http://localhost:5173/threejsmanual/13_primitives/23_all_primitives/
//
// We'll go over creating custom geometry in another article
// (https://threejs.org/manual/#custom-buffergeometry). For now let's make an
// example creating each type of primitive. We'll start with the examples from
// the previous article (https://threejs.org/manual/#responsive).

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import fontUrl from '../fonts/helvetiker_regular.typeface.json?url';

function main() {

  const canvas = document.querySelector( '#c' );
  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

  // The camera needs to change position so that we can see all the objects.

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.z = 120;

  // Near the top let's set a background color

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xAAAAAA );

  // This tells three.js to clear to lightish gray.

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

  // Let's add a function, addObject, that takes an x, y position and an
  // Object3D and adds the object to the scene.

  const objects = [];
  const spread = 15;

  function addObject( x, y, obj ) {

    obj.position.x = x * spread;
    obj.position.y = y * spread;

    scene.add( obj );
    objects.push( obj );

  }

  // Let's also make a function to create a random colored material. We'll use
  // a feature of Color that lets you set a color based on hue, saturation, and
  // luminance.
  //
  // hue goes from 0 to 1 around the color wheel with red at 0, green at .33
  // and blue at .66. saturation goes from 0 to 1 with 0 having no color and 1
  // being most saturated. luminance goes from 0 to 1 with 0 being black, 1
  // being white and 0.5 being the maximum amount of color. In other words as
  // luminance goes from 0.0 to 0.5 the color will go from black to hue. From
  // 0.5 to 1.0 the color will go from hue to white.

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

  // We also passed side: THREE.DoubleSide to the material. This tells three to
  // draw both sides of the triangles that make up a shape. For a solid shape
  // like a sphere or a cube there's usually no reason to draw the back sides of
  // triangles as they all face inside the shape. In our case though we are
  // drawing a few things like the PlaneGeometry and the ShapeGeometry which are
  // 2 dimensional and so have no inside. Without setting
  // side: THREE.DoubleSide they would disappear when looking at their back
  // sides.
  //
  // I should note that it's faster to draw when not setting
  // side: THREE.DoubleSide so ideally we'd set it only on the materials that
  // really need it but in this case we are not drawing too much so there isn't
  // much reason to worry about it.
  //
  // Let's make a function, addSolidGeometry, that we pass a geometry and it
  // creates a random colored material via createMaterial and adds it to the
  // scene via addObject.

  function addSolidGeometry( x, y, geometry ) {

    const mesh = new THREE.Mesh( geometry, createMaterial() );
    addObject( x, y, mesh );

  }

  // The other exceptions are the 2 line based examples for EdgesGeometry and
  // WireframeGeometry. Instead of calling addSolidGeometry they call
  // addLineGeometry which looks like this

  function addLineGeometry( x, y, geometry ) {

    const material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    const mesh = new THREE.LineSegments( geometry, material );
    addObject( x, y, mesh );

  }

  // It creates a black LineBasicMaterial and then creates a LineSegments
  // object which is a wrapper for Mesh that helps three know you're rendering
  // line segments (2 points per segment).
  //
  // Now we can use this for the majority of the primitives we create. For
  // example creating a box

  {

    const width = 8;
    const height = 8;
    const depth = 8;
    addSolidGeometry( - 2, 2, new THREE.BoxGeometry( width, height, depth ) );

  }

  // If you look in the code below you'll see a similar section for each type
  // of geometry.

  {

    const radius = 7;
    const segments = 24;
    addSolidGeometry( - 1, 2, new THREE.CircleGeometry( radius, segments ) );

  }

  {

    const radius = 6;
    const height = 8;
    const segments = 16;
    addSolidGeometry( 0, 2, new THREE.ConeGeometry( radius, height, segments ) );

  }

  {

    const radiusTop = 4;
    const radiusBottom = 4;
    const height = 8;
    const radialSegments = 12;
    addSolidGeometry( 1, 2, new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radialSegments ) );

  }

  {

    const radius = 7;
    addSolidGeometry( 2, 2, new THREE.DodecahedronGeometry( radius ) );

  }

  {

    const shape = new THREE.Shape();
    const x = - 2.5;
    const y = - 5;
    shape.moveTo( x + 2.5, y + 2.5 );
    shape.bezierCurveTo( x + 2.5, y + 2.5, x + 2, y, x, y );
    shape.bezierCurveTo( x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5 );
    shape.bezierCurveTo( x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5 );
    shape.bezierCurveTo( x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5 );
    shape.bezierCurveTo( x + 8, y + 3.5, x + 8, y, x + 5, y );
    shape.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );

    const extrudeSettings = {
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 2,
    };

    addSolidGeometry( - 2, 1, new THREE.ExtrudeGeometry( shape, extrudeSettings ) );

  }

  {

    const radius = 7;
    addSolidGeometry( - 1, 1, new THREE.IcosahedronGeometry( radius ) );

  }

  {

    const points = [];
    for ( let i = 0; i < 10; ++ i ) {

      points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 3 + 3, ( i - 5 ) * .8 ) );

    }

    addSolidGeometry( 0, 1, new THREE.LatheGeometry( points ) );

  }

  {

    const radius = 7;
    addSolidGeometry( 1, 1, new THREE.OctahedronGeometry( radius ) );

  }

  {

    /*
    from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js

    The MIT License

    Copyright © 2010-2018 three.js authors

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

    */
    function klein( v, u, target ) {

      u *= Math.PI;
      v *= 2 * Math.PI;
      u = u * 2;

      let x;
      let z;

      if ( u < Math.PI ) {

        x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
        z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

      } else {

        x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
        z = - 8 * Math.sin( u );

      }

      const y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );

      target.set( x, y, z ).multiplyScalar( 0.75 );

    }

    const slices = 25;
    const stacks = 25;
    addSolidGeometry( 2, 1, new ParametricGeometry( klein, slices, stacks ) );

  }

  {

    const width = 9;
    const height = 9;
    const widthSegments = 2;
    const heightSegments = 2;
    addSolidGeometry( - 2, 0, new THREE.PlaneGeometry( width, height, widthSegments, heightSegments ) );

  }

  {

    const verticesOfCube = [
      - 1, - 1, - 1, 1, - 1, - 1, 1, 1, - 1, - 1, 1, - 1,
      - 1, - 1, 1, 1, - 1, 1, 1, 1, 1, - 1, 1, 1,
    ];
    const indicesOfFaces = [
      2, 1, 0, 0, 3, 2,
      0, 4, 7, 7, 3, 0,
      0, 1, 5, 5, 4, 0,
      1, 2, 6, 6, 5, 1,
      2, 3, 7, 7, 6, 2,
      4, 5, 6, 6, 7, 4,
    ];
    const radius = 7;
    const detail = 2;
    addSolidGeometry( - 1, 0, new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, radius, detail ) );

  }

  {

    const innerRadius = 2;
    const outerRadius = 7;
    const segments = 18;
    addSolidGeometry( 0, 0, new THREE.RingGeometry( innerRadius, outerRadius, segments ) );

  }

  {

    const shape = new THREE.Shape();
    const x = - 2.5;
    const y = - 5;
    shape.moveTo( x + 2.5, y + 2.5 );
    shape.bezierCurveTo( x + 2.5, y + 2.5, x + 2, y, x, y );
    shape.bezierCurveTo( x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5 );
    shape.bezierCurveTo( x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5 );
    shape.bezierCurveTo( x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5 );
    shape.bezierCurveTo( x + 8, y + 3.5, x + 8, y, x + 5, y );
    shape.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );
    addSolidGeometry( 1, 0, new THREE.ShapeGeometry( shape ) );

  }

  {

    const radius = 7;
    const widthSegments = 12;
    const heightSegments = 8;
    addSolidGeometry( 2, 0, new THREE.SphereGeometry( radius, widthSegments, heightSegments ) );

  }

  {

    const radius = 7;
    addSolidGeometry( - 2, - 1, new THREE.TetrahedronGeometry( radius ) );

  }

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
      const mesh = new THREE.Mesh( geometry, createMaterial() );
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter( mesh.position ).multiplyScalar( - 1 );

      const parent = new THREE.Object3D();
      parent.add( mesh );

      addObject( - 1, - 1, parent );

    }

    doit();

  }

  {

    const radius = 5;
    const tubeRadius = 2;
    const radialSegments = 8;
    const tubularSegments = 24;
    addSolidGeometry( 0, - 1, new THREE.TorusGeometry( radius, tubeRadius, radialSegments, tubularSegments ) );

  }

  {

    const radius = 3.5;
    const tube = 1.5;
    const radialSegments = 8;
    const tubularSegments = 64;
    const p = 2;
    const q = 3;
    addSolidGeometry( 1, - 1, new THREE.TorusKnotGeometry( radius, tube, tubularSegments, radialSegments, p, q ) );

  }

  {

    class CustomSinCurve extends THREE.Curve {

      constructor( scale ) {

        super();
        this.scale = scale;

      }
      getPoint( t ) {

        const tx = t * 3 - 1.5;
        const ty = Math.sin( 2 * Math.PI * t );
        const tz = 0;
        return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

      }

    }

    const path = new CustomSinCurve( 4 );
    const tubularSegments = 20;
    const radius = 1;
    const radialSegments = 8;
    const closed = false;
    addSolidGeometry( 2, - 1, new THREE.TubeGeometry( path, tubularSegments, radius, radialSegments, closed ) );

  }

  {

    const width = 8;
    const height = 8;
    const depth = 8;
    const thresholdAngle = 15;
    addLineGeometry( - 1, - 2, new THREE.EdgesGeometry(
      new THREE.BoxGeometry( width, height, depth ),
      thresholdAngle ) );

  }

  {

    const width = 8;
    const height = 8;
    const depth = 8;
    addLineGeometry( 1, - 2, new THREE.WireframeGeometry( new THREE.BoxGeometry( width, height, depth ) ) );

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

      const speed = .1 + ndx * .05;
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

// Here's the result:
//
// Each of the primitives has several parameters you can pass on creation and
// it's best to look in the documentation (https://threejs.org/docs/) for all
// of them rather than repeat them here. You can also click the links above
// next to each shape to take you directly to the docs for that shape.

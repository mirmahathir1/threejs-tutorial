import { defineConfig } from 'vite';
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';

const root = import.meta.dirname;
const skipped = new Set( [ 'node_modules', 'dist' ] );

function files( dir ) {

  return readdirSync( dir, { withFileTypes: true } ).flatMap( ( entry ) => {

    if ( skipped.has( entry.name ) || entry.name.startsWith( '.' ) ) return [];
    const path = join( dir, entry.name );
    return entry.isDirectory() ? files( path ) : [ path ];

  } );

}

const all = files( root );
const pages = all.filter( ( file ) => file.endsWith( 'index.html' ) );
const runtimeAssets = all.filter( ( file ) => [ '.jpg', '.glb' ].includes( extname( file ) ) );

export default defineConfig( {
  build: {
    rollupOptions: { input: pages }
  },
  plugins: [ {
    name: 'copy-runtime-assets',
    apply: 'build',
    closeBundle() {

      for ( const file of runtimeAssets ) {

        const target = join( root, 'dist', relative( root, file ) );
        mkdirSync( dirname( target ), { recursive: true } );
        cpSync( file, target );

      }

    }
  } ]
} );

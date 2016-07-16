// rollup.config.js

export default {
  entry: 'src/cssobj-plugin-post-gencss.js',
  moduleName: 'cssobj_plugin_post_gencss',
  moduleId: 'cssobj_plugin_post_gencss',
  targets: [
    { format: 'iife', dest: 'dist/cssobj-plugin-post-gencss.iife.js' },
    { format: 'amd',  dest: 'dist/cssobj-plugin-post-gencss.amd.js'  },
    { format: 'cjs',  dest: 'dist/cssobj-plugin-post-gencss.cjs.js'  },
    { format: 'es',   dest: 'dist/cssobj-plugin-post-gencss.es.js'   }
  ]
}

'use strict';
const config = require('./config');
const js = { 'test.js': 'test.js' };
const css = { 'style.css': 'test.css' };

module.exports = {
  options: {
    src: './',
    dst: './test'
  },

  'task:default': { js, css },

  'belt:js': {
    tools: [ 'src-rollup', 'dst-file' ]
  },

  'belt:css': {
    options: {
      postcss: {
        plugins: [
          'postcss-import',
          'postcss-mixins',
          { 'postcss-simple-vars': { variables: config } },
          'postcss-conditionals',
          'postcss-color-function',
          'postcss-calc',
          'postcss-nested',
          'autoprefixer'
        ]
      }
    },
    tools: [ 'src-file', 'postcss', 'dst-file' ]
  }
};

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      build: {
        src: ['rekwire.js', 'rekwire.localstorage.js']
      }
    },

    uglify: {
      build: {
        options: {
          banner: '/* rekwire :: Josh Everett :: MIT License */\n'
        },
        files: [
          { src: 'rekwire.js',
            dest: 'rekwire.min.js' },
          { src: 'rekwire.localstorage.js',
            dest: 'rekwire.localstorage.min.js' }
        ]
      }
    },

    copy: {
      build: {
        files: [
          { src: 'rekwire.js',
            dest: 'test/rekwire.js' },
          { src: 'rekwire.localstorage.js',
            dest: 'test/rekwire.localstorage.js' },
          { src: 'node_modules/qunitjs/qunit/qunit.css',
            dest: 'test/qunit/qunit.css' },
          { src: 'node_modules/qunitjs/qunit/qunit.js',
            dest: 'test/qunit/qunit.js' }
        ]
      }
    },

    connect: {
      build: {
        options: {
          port: 8000,
          base: 'test/'
        }
      }
    },

    qunit: {
      build: {
        options: {
          urls: ['http://localhost:8000']
        }
      }
    },

    watch: {
      build: {
        files: ['rekwire.js', 'rekwire.localstorage.js'],
        tasks: ['jshint', 'uglify', 'copy', 'qunit']
      },
      debug: {
        files: ['rekwire.js', 'rekwire.localstorage.js'],
        tasks: ['jshint', 'copy']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'jshint:build',
    'uglify:build',
    'copy:build',
    'connect:build',
    'qunit:build',
    'watch:build'
  ]);

  grunt.registerTask('debug', ['connect:build', 'watch:debug']);
};

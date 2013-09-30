module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      build: {
        src: 'rekwire.js'
      }
    },

    uglify: {
      build: {
        options: {
          banner: '/* rekwire :: Josh Everett :: MIT License */\n'
        },
        src: 'rekwire.js',
        dest: 'rekwire.min.js'
      }
    },

    watch: {
      files: 'rekwire.js',
      tasks: ['jshint', 'uglify']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'uglify', 'watch']);
};

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['public/js/**/*.js', '!public/js/external/*.js', '!public/js/dist/*.js'],
        dest: 'public/dist/speez.js',
      },
    },

    uglify: {
      options: {
        sourceMap: true,
      },
      my_target: {
        files: {
          'public/dist/speez.min.js': [
            'public/dist/speez.js'
          ]
        }
      }
    },

    watch: {
      scripts: {
        files: ['public/js/**/*.js', 'Gruntfile.js'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false,
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify', 'watch']);
}
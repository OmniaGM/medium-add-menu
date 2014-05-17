'use strict'

module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig
    watch:
      options:
        spawn: true
      coffee:
        files: 'assets/scripts/**/*.coffee'
        tasks: ['coffee:compile']
      styles_less:
        files: ['assets/styles/**/*.less']
        tasks: ['less:compile']
      styles_css:
        files: ['public/styles/**/*.css']
        tasks: []

    coffee:
      compile:
        expand: true,
        flatten: true,
        cwd: "assets/scripts/",
        src: ['**/*.coffee'],
        dest: 'public/assets/scripts/',
        ext: '.js'
    
    copy:
      dist:
        expand: true
        cwd: 'public/assets/'
        src: '**/*'
        dest: 'dist/'

    less:
      options:
        paths: ["/"]
      compile: 
        files:[{
          expand: true
          cwd: 'assets/styles/'
          src: ['main.less']
          dest: 'public/assets/styles/'
          ext: ".css"
        }]
  grunt.registerTask 'compile', ['coffee', 'less:compile']
  grunt.registerTask 'default', [
    'compile',
    'copy:dist'
  ]

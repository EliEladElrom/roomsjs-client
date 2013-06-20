module.exports = function (grunt) {

    Roomsjs = [
        'socketcontroller.js'
    ];

    Roomsjs = Roomsjs.map(function (p) {
        return 'public/js/libs/' + p;
    });

    grunt.initConfig({
        uglify: {
            Roomsjs: {
                options: {
                    compress: {
                        unsafe: false
                    }
                },
                files: {
                    'public/js/libs/socketcontroller.min.js': Roomsjs
                }
            }
        },
        pkg: grunt.file.readJSON('package.json')
    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // tasks
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('minify', ['uglify']);
};
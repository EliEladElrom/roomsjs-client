module.exports = function (grunt) {

    Roomsjs = [
        'rooms.js'
    ];

    Roomsjs = Roomsjs.map(function (p) {
        return 'client/dist/libs/' + p;
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
                    'client/dist/libs/rooms.min.js': Roomsjs
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

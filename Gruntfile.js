module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'bin/{,*/}*.js',
                'public/scripts/{,*/}*.js'
            ]
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            vendor: {
                files: [
                    {
                        'production/build/public/libs/angular/angular.js': 'public/libs/angular/angular.js',
                        'production/build/public/libs/angular-bootstrap/ui-bootstrap-tpls.js': 'public/libs/angular-bootstrap/ui-bootstrap-tpls.js',
                        'production/build/public/libs/angular-cookies/angular-cookies.js': 'public/libs/angular-cookies/angular-cookies.js',
                        'production/build/public/libs/angular-route/angular-route.js': 'public/libs/angular-route/angular-route.js',
                        'production/build/public/libs/angular-sanitize/angular-sanitize.js': 'public/libs/angular-sanitize/angular-sanitize.js',
                        'production/build/public/libs/Chart.js/Chart.js': 'public/libs/Chart.js/Chart.js',
                        'production/build/public/libs/jquery/dist/jquery.js': 'public/libs/jquery/dist/jquery.js',
                        'production/build/public/libs/json3/lib/json3.js': 'public/libs/json3/lib/json3.js',
                        'production/build/public/libs/notifyjs/dist/notify-combined.js': 'public/libs/notifyjs/dist/notify-combined.js',
                        'production/build/public/libs/underscore/underscore.js': 'public/libs/underscore/underscore.js'
                    }
                ]
            },
            scripts: {
                options: {
                    beautify: false
                },
                files: [
                    {
                        expand: true,
                        cwd: 'public/scripts',
                        src: '**/*.js',
                        dest: 'production/build/public/scripts'
                    },
                    {
                        expand: true,
                        cwd: 'config',
                        src: '**/*.js',
                        dest: 'production/build/config'
                    }
                ]
            },
            server: {
                files: [
                    {
                        expand: true,
                        cwd: 'bin',
                        src: '**/*.js',
                        dest: 'production/build/bin'
                    }
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true/*,
                     collapseWhitespace: true*/
                },
                files: [
                    {
                        expand: true,
                        cwd: 'public/views',
                        src: ['**/*.html'],
                        dest: 'production/build/public/views/'
                    },
                    {
                        "production/build/public/index.html": "public/index.html"
                    }
                ]
            }
        },
        cssmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/styles/',
                        src: ['*.css'],
                        dest: 'production/build/public/styles/',
                        ext: '.css'
                    },
                    {
                        'production/build/public/libs/bootstrap/dist/css/bootstrap.css': 'public/libs/bootstrap/dist/css/bootstrap.css',
                        'production/build/public/libs/font-awesome/css/font-awesome.css': 'public/libs/font-awesome/css/font-awesome.css'
                    }
                ]
            }
        },
        copy: {
            images: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/images',
                        src: ['**'],
                        dest: 'production/build/public/images/'
                    }
                ]
            },
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/libs/font-awesome/fonts',
                        src: ['**'],
                        dest: 'production/build/public/libs/font-awesome/fonts/'
                    }
                ]
            },
            resources: {
                files: [
                    {
                        expand: true,
                        cwd: 'resources',
                        src: ['**'],
                        dest: 'production/build/resources/'
                    }
                ]
            },
            views: {
                files: [
                    {
                        expand: true,
                        cwd: 'views',
                        src: ['**'],
                        dest: 'production/build/views/'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('verification', [
        'jshint'
    ]);

    grunt.registerTask('default', [
        'uglify',
        'htmlmin',
        'cssmin',
        'copy'
    ]);
};
'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        'jshint': {
            options: {
                'jshintrc': '.jshintrc',
                '-W015': true
            },
            all: [
                'Gruntfile.js',
                'bin/{,*/}*.js',
                'public/app/{,*/}*.js'
            ]
        },
        'htmlmin': {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        'production/build/public/index.html': 'public/index.html'
                    }
                ]
            }
        },
        'html2js': {
            templates: {
                options: {
                    singleModule: true,
                    useStrict: true,
                    indentString: '    ',
                    module: 'templates',
                    rename: function (moduleName) {
                        return moduleName.replace(/^\.\.(.*)$/, function (s, moduleName) {
                            return moduleName;
                        });
                    },
                    htmlmin: {
                        /*collapseWhitespace: true,*/
                        removeComments: true
                    }
                },
                src: ['public/app/**/*.html'],
                dest: 'production/build/public/app/modules/templates/templates.js'
            }
        },
        'string-replace': {
            replaceTemplatesUrl: {
                files: {
                    'production/build/': 'production/build/public/index.html'
                },
                options: {
                    replacements: [
                        {
                            pattern: '<div style="display: none">/public/app/modules/templates/templates.js</div>',
                            replacement: '<script src="/public/app/modules/templates/templates.js"></script>'
                        }
                    ]
                }
            },
            injectTemplatesModule: {
                files: {
                    'production/build/': 'production/build/public/app/modules/application.js'
                },
                options: {
                    replacements: [
                        {
                            pattern: '"constants"',
                            replacement: '"constants","templates"'
                        }
                    ]
                }
            }
        },
        'uglify': {
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
                        cwd: 'public/app',
                        src: '**/*.js',
                        dest: 'production/build/public/app'
                    },
                    {
                        'production/build/public/app/modules/templates/templates.js': 'production/build/public/app/modules/templates/templates.js'
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
                    },
                    {
                        expand: true,
                        cwd: 'config',
                        src: '**/*.js',
                        dest: 'production/build/config'
                    }
                ]
            }
        },
        'cssmin': {
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
        'copy': {
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
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('verification', [
        'jshint'
    ]);

    grunt.registerTask('default', [
        'htmlmin',
        'html2js',
        'cssmin',
        'uglify',
        'string-replace',
        'copy'
    ]);
};
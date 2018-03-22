// Gruntfile.js
module.exports = function(grunt) {

    grunt.initConfig({

        // JS TASKS ================================================================
        // check all js files for errors
        jshint: {
            options: {
                curly: true, // throws warning if no brackets for if, for...
                eqeqeq: true, // for == instead of === kind of comparisons
                eqnull: true, // ==null or == undefined
                browser: true, //This option defines globals exposed by modern browsers: all the way from good old document and navigator to the HTML5 FileReader
                unused: true, //This option warns when you define and never use your variables. It is very useful for general code cleanup, especially when used in addition to undef.
                devel: true, //ignore console.log(),alert...
                expr: true, //This option suppresses warnings about the use of expressions where normally you would expect to see assignments or function calls.
                node: true, //suitable for node apps
                strict: 'implied', //no need to mention strict in every page
                globals: {
                    jQuery: true,
                    "$": false, //Ignore $ in jQyery
                    angular: false
                }
            },
            all: ['public/src/js/controllers/*.js', 'public/src/js/services/*.js',
                'public/src/js/main.js',
                /*'Gruntfile.js',*/
                'server.js'
            ]
            // afterconcat:['public/dist/js/app.min.js']
        },

        // Beautifies the Html files, CSS files and JS files
        jsbeautifier: {
            files: ["public/src/js/*.js", "public/src/js/controllers/*.js", "public/src/js/services/*.js", /*"public/src/!**!/!**!/!*.js",*/ "public/src/css/*.css", /*"public/src/!**!/!**!/!*.css",*/ "*.js", "*.html", "public/src/templates/*.html"],
            options: {
                // config: "path/to/configFile",
                html: {
                    braceStyle: "collapse",
                    indentChar: " ",
                    indentScripts: "keep",
                    indentSize: 4,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    unformatted: ["a", "sub", "sup", "b", "i", "u"],
                    wrapLineLength: 0
                },
                css: {
                    indentChar: " ",
                    indentSize: 4
                },
                js: {
                    braceStyle: "collapse",
                    breakChainedMethods: false,
                    e4x: false,
                    evalCode: false,
                    indentChar: " ",
                    indentLevel: 0,
                    indentSize: 4,
                    indentWithTabs: false,
                    jslintHappy: false,
                    keepArrayIndentation: false,
                    keepFunctionIndentation: false,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    spaceBeforeConditional: true,
                    spaceInParen: false,
                    unescapeStrings: false,
                    wrapLineLength: 0,
                    endWithNewline: true
                }
            }
        },

        // take all the js files and minify them into app.min.js
        uglify: {
            // pkg: grunt.file.readJSON('package.json'),
            options: {
                banner: '/*! <%= "mTrainer" %> <%= grunt.template.today("yyyy-mm-dd hh:mm") %> */\n'
                // beautify: true
            },
            build: {
                files: {
                    'public/dist/js/app.min.js': [ /*'public/src/js/!**!/!*.js',*/ 'public/src/js/main.js', 'public/src/js/services/botFactory.js']
                }
            }
        },

        // CSS TASKS ===============================================================
        // process the less file to style.css
        less: {
            development: {
                options: {
                    paths: ['public/src/less']
                },
                files: {
                    'public/src/css/style.css': 'public/src/less/style.less'
                }
            }
        },

        // take the processed style.css file and minify
        cssmin: {
            build: {
                files: {
                    'public/dist/css/style.min.css': 'public/src/css/style.css'
                    // 'public/dist/css/style.min.css': ['public/src/css/*.css' /*, 'public/src/css/!**!/!*.css'*/ ]
                }
            }
        },
        /*//todo grunt-mocha-chai-sinon
  'mocha-chai-sinon': {
  build: {
  src: ['tests/mocha_chai/sample_test.js'],
  options: {
  ui: 'bdd',
  reporter: 'spec',
  quiet: false
}
}
/!*,
coverage: {
src: ['tests/mocha_chai/sample_test.js'],
options: {
ui: 'bdd',
reporter: 'html-cov',
quiet: true,
/!*filter: '/foo/foo1/',*!/
captureFile: 'coverage/coverage.html'
}
}*!/
},
*/
        mochaTest: {
            specs: {
                options: {
                    ui: 'bdd',
                    reporter: 'spec'
                    // require: 'tests/mocha_chai/sample_test.js'
                },
                src: ['tests/mocha_chai/sample_test.js']
            }
        },
        //todo grunt-mocha-istanbul
        mocha_istanbul: {
            coverage: {
                // src: 'tests/mocha_chai/test-server.js', // a folder works nicely
                src: 'tests/mocha_chai/sample_test.js',
                options: {
                    // mask: '*.spec.js'
                }
            }
        },
        //     coverageSpecial: {
        //         src: ['testSpecial/*/*.js', 'testUnique/*/*.js'], // specifying file patterns works as well
        //         options: {
        //             coverageFolder: 'coverageSpecial',
        //             mask: '*.spec.js',
        //             mochaOptions: ['--harmony', '--async-only'], // any extra options
        //             istanbulOptions: ['--harmony', '--handle-sigint']
        //         }
        //     },
        //     coveralls: {
        //         src: ['test', 'testSpecial', 'testUnique'], // multiple folders also works
        //         options: {
        //             coverage: true, // this will make the grunt.event.on('coverage') event listener to be triggered
        //             check: {
        //                 lines: 75,
        //                 statements: 75
        //             },
        //             root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
        //             reportFormats: ['cobertura', 'lcovonly']
        //         }
        //     }
        // },
        // istanbul_check_coverage: {
        //     default: {
        //         options: {
        //             coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
        //             check: {
        //                 lines: 80,
        //                 statements: 80
        //             }
        //         }
        //     }
        // },

        //todo (optional) make the logs verbose and colorful
        protractor: {
            options: {
                configFile: "node_modules/protractor/example/conf.js", // Default config file
                keepAlive: true, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.

                args: {
                    // Arguments passed to the command
                    verbose: true
                }
            },
            your_target: { // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
                options: {
                    configFile: "tests/protractor/config.js", // Target-specific config file
                    noColor: false,
                    args: {
                        noColor: false
                    } // Target-specific arguments
                }
            }
        },

        // COOL TASKS ==============================================================
        // watch css and js files and process the above tasks
        watch: {
            // css: {
            //     files: ['public/src/css/**/*.css', 'public/src/css/*.css'],
            //     tasks: ['cssmin', 'jsbeautifier']
            // },
            less: {
                files: ['public/src/less/**/*.less', 'public/src/less/*.less', 'public/src/partials/**/*.less'],
                tasks: ['less:development', 'cssmin']
            },
            js: {
                files: ['public/src/js/**/*.js', 'public/src/js/*.js'],
                tasks: [ /*'jshint',*/ 'uglify', 'jsbeautifier']
            },
            html: {
                files: ['*.html', 'public/src/templates/*.html'],
                tasks: [ /*'jshint',*/ 'uglify', 'jsbeautifier']
            }
            /*,
  livereload: {
  // Here we watch the files the sass task will compile to
  // These files are sent to the live reload server after sass compiles to them
  options: { livereload: true },
  files: ['dest/!**!/!*'],
}*/
        },

        // watch our node server for changes
        nodemon: {
            dev: {
                script: 'server.js'
            }
        },

        // run watch and nodemon at the same time
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            tasks: ['nodemon', 'watch']
        }


    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    // grunt.loadNpmTasks('grunt-mocha-chai-sinon');
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-mocha-test');


    grunt.registerTask('default', ['less', 'cssmin', /*'jshint',*/ 'uglify', /*'jsbeautifier', 'mocha-chai-sinon',*/ /*'mocha_istanbul',*/ 'concurrent']);
    grunt.registerTask('Test Node', ['mochaTest']);
    // grunt.registerTask('Coverage', ['mocha_istanbul']);
    // grunt.registerTask('Open Coverage', [start coverage/lcov-report/index.html]);
    // grunt.registerTask('Test Angular', ['protractor']);
    grunt.registerTask('Hint', ['jshint']);


};

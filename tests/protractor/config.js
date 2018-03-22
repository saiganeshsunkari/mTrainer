exports.config = {
    framework: 'jasmine',
    jasmineNodeOpts: {
        isVerbose: true,
        showColors: true // Use colors in the command line report.
    },
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['todo-spec.js','gittest.js']
};
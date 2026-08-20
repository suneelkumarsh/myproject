// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-spec-reporter'),
      require('karma-firefox-launcher'),
      require('karma-chrome-launcher'),
      require('karma-sonarqube-unit-reporter'),
      require('karma-coverage'),
    ],
    client: {
      clearContext: true, // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      // Explicitly specify subdirectory to avoid nesting
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' }, // Generates lcov.info
        { type: 'text-summary' },
      ],
      fixWebpackSourcePaths: true,
    },
    sonarQubeUnitReporter: {
      sonarQubeVersion: 'LATEST',
      outputFile: 'reports/ut_report.xml',
      overrideTestDescription: true,
      testPaths: ['./src'],
      testFilePattern: '.spec.ts',
      useBrowserName: false,
    },
    reporters: ['progress', 'coverage', 'spec'], // Replaced 'kjhtml' reporter with 'spec' because 'karma-jasmine-html-reporter'
    // causes a TypeError: "alert is null" in Firefox Headless environments.
    // 'spec' provides a stable CLI output without browser alert dependencies.
    port: 4200,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true,
    restartOnFileChange: true,
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000,
  });
};

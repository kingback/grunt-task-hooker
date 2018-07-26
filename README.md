# grunt-task-hooker

<p align="center">
  <a href="https://www.npmjs.com/package/grunt-task-hooker"><img alt="NPM Version" src="https://img.shields.io/npm/v/grunt-task-hooker.svg?style=flat"/></a>
</p>

Add pre-execution and post-execution "hooks" to grunt task, see [issues/542](https://github.com/gruntjs/grunt/issues/542).

## Install

```
npm install grunt-task-hooker --save-dev
```

## Usage

```js
// Gruntfile.js
module.exports = function (grunt) {

  // Don't forget to pass "grunt" object into the function!!!
  require('grunt-task-hooker')(grunt);

  grunt.initConfig({
    clean: {
      src: {},
      dist: {}
    }
  });

  grunt.registerTask('build', [...]);

  // pre hook without description
  grunt.hooker.hook('build', ['clean:dist']);

  // post hook with description
  grunt.hooker.hook('clean:src', 'post clean src', function() {
    const done = this.async();
    setTimeout(function() {
      done();
    }, false);
  }, true);

  // hook multi task
  grunt.hooker.hook('clean', 'pre clean all', function() {
    console.log('do something before all clean tasks');
  });

  // unhook all hooks
  grunt.hooker.unhook('clean');

  // unhook all pre hooks
  grunt.hooker.unhook('build', 'pre');

  // unhook all post hooks
  grunt.hooker.unhook('build', 'post');
};
```

## License

The MIT License (MIT)

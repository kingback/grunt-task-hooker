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
  const hooker = require('grunt-task-hooker')(grunt);

  grunt.initConfig({
    clean: {
      src: {},
      dist: {}
    }
  });

  grunt.registerTask('build', [...]);

  // pre hook without description
  hooker.hook('build', ['clean:dist']);

  // post hook with description
  hooker.hook('clean:src', 'post clean src', function() {
    const done = this.async();
    setTimeout(function() {
      done();
    }, false);
  }, true);

  // hook multi task
  hooker.hook('clean', 'pre clean all', function() {
    console.log('do something before all clean tasks');
  });

  // unhook all hooks
  hooker.unhook('clean');

  // unhook all pre hooks
  hooker.unhook('build', 'pre');

  // unhook all post hooks
  hooker.unhook('build', 'post');
};
```

## License

The MIT License (MIT)

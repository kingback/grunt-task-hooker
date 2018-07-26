'use script';

let globalHooker;
const exit = require('exit');
const VALID_TASK_TYPE = ['string', 'array', 'function'];
const hookFunction = function(grunt) {
  if (globalHooker) return globalHooker;

  const hookMap = {};
  const runTask = grunt.task.run;

  const hooker = {

    _run(tasks) {
      if (!tasks || !tasks.length) return;
      return runTask.apply(grunt.task, arguments);
    },

    _hook(where, taskName, description, task) {
      if (!task) return;
      if (!hookMap[taskName]) hookMap[taskName] = { pre: [], post: [] };

      const hookTaskList = hookMap[taskName][where];
      const hookTaskName = `$hook_${where}_${taskName}_${hookTaskList.length}`;
      
      hookTaskList.push(hookTaskName);
      grunt.registerTask(hookTaskName, description, task);
    },

    _unhook(taskName, where) {
      const hookTask = hookMap[taskName];
      const tasks = grunt.task._tasks;
      hookTask[where].forEach(function(task) { delete tasks[task]; });
      hookTask[where] = [];
    },

    hook(taskName, description, task, post) {
      const descType = grunt.util.kindOf(description);
      const taskNameType = grunt.util.kindOf(taskName);
      let taskType = grunt.util.kindOf(task);

      if (
        (descType !== 'string' && description) || // hook('clean', []) hook('clean', function() {}, true)
        (descType === 'string' && description && (!task || taskType === 'boolean'))  // hook('build', 'clean') hook('build', 'clean', true)
      ) { 
        post = task;
        task = description; 
        description = null;
        taskType = grunt.util.kindOf(task);
      }

      if (
        !task || 
        VALID_TASK_TYPE.indexOf(taskType) < 0 ||
        (taskType === 'array' && !task.length) 
      ) return;

      const where = post && post !== 'pre' ? 'post' : 'pre';

      if (taskNameType === 'array') {
        taskName.forEach((tsn) => this._hook(where, tsn, description, task));
      } else {
        this._hook(where, taskName, description, task);
      }
    },

    unhook(taskName, where) {
      if (grunt.util.kindOf(taskName) === 'array') {
        taskName.forEach((tsn) => this.unhook(tsn, where));
      } else {
        const hookTask = hookMap[taskName];
        if (!hookTask) return;
        if (where === 'pre' || !where || where === 'both') this._unhook(taskName, 'pre');
        if (where === 'post' || !where || where === 'both') this._unhook(taskName, 'post');
        if (!hookTask.pre.length && !hookTask.post.length) delete hookMap[taskName];
      }
    }
  };

  // override original function
  grunt.task.run = function(taskName) {
    const hookTask = hookMap[taskName];
    if (hookTask && taskName) {
      hooker._run(hookTask.pre);
      runTask.apply(this, arguments);
      hooker._run(hookTask.post);
    } else {
      return runTask.apply(this, arguments);
    }
  }

  // add grunt method
  grunt.hookTask = grunt.task.hookTask = hooker.hook.bind(hooker);
  grunt.unhookTask = grunt.task.unhookTask = hooker.unhook.bind(hooker);
  
  return (globalHooker = hooker);
};

Object.defineProperty(hookFunction, 'hook', {
  get: function() {
    console.error('Error: Use hooker like "require(\'grunt-task-hooker\')(grunt)"'.red);
    exit(0);
  }
});

Object.defineProperty(hookFunction, 'unhook', {
  get: function() {
    console.error('Error: Use hooker like "require(\'grunt-task-hooker\')(grunt)"'.red);
    exit(0);
  }
});

module.exports = hookFunction;
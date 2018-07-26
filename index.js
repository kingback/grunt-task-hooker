'use script';

let globalHooker;
const exit = require('exit');
const VALID_TASK_TYPE = ['string', 'array', 'function'];
const hookFunction = function(grunt) {
  if (globalHooker) return globalHooker;

  const hookMap = {};
  const runTask = grunt.task.run;

  const hooker = {

    grunt,

    _check(task) {
      const type = grunt.util.kindOf(task);
      return task && VALID_TASK_TYPE.indexOf(type) && (type !== 'array' || task.length);
    },

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

    hook(taskName, description, task, options) {
      if (description && typeof description !== 'string') { 
        options = task;
        tasks = description; 
        description = null;
      }

      if (!this._check(task)) return false;

      if (!options) {
        options = { pre: task };
      } else if (typeof options === 'boolean') {
        if (options) {
          options = { post: task };
        } else {
          options = { pre: task };
        }
      }

      this._hook('pre', taskName, description, options.pre);
      this._hook('post', taskName, description, options.post);
    },

    unhook(taskName, where) {
      const hookTask = hookMap[taskName];
      if (!hookTask) return;
      if (where === 'pre' || !where) this._unhook(taskName, 'pre');
      if (where === 'post' || !where) this._unhook(taskName, 'post');
      if (!hookTask.pre.length && !hookTask.post.length) delete hookMap[taskName];
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

  return (globalHooker = hooker);
};

Object.defineProperty(hookFunction, 'hook', {
  get: function() {
    console.error('Error: Use hooker like "const hook = require(\'grunt-task-hooker\')(grunt)"'.red);
    exit(0);
  }
});

Object.defineProperty(hookFunction, 'unhook', {
  get: function() {
    console.error('Error: Use hooker like "const hook = require(\'grunt-task-hooker\')(grunt)"'.red);
    exit(0);
  }
});

module.exports = hookFunction;
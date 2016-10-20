var gulp = require('gulp');
var inquirer = require('inquirer');
var _ = require('lodash');

module.exports = function(groups, done) {
  selTask('选择任务分组：', _.keys(groups), function(err, group) {
    selTask('选择任务项：', groups[group], function(err, task) {
      gulp.start(task);
    });
  });
}

function selTask(message, taskList, cb) {
  inquirer.prompt([{
    type: 'list',
    name: 'task',
    message: message,
    choices: taskList
  }], function(answers) {
    cb && cb(null, answers.task);
  });
}
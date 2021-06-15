'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn deleted to recommendations
 *
 **/

var info = {
  "revision": 12,
  "name": "add-recommendation-deleted-field",
  "created": "2021-06-15T15:53:00.000Z",
  "comment": "Добавление признака удаленной рекомендации"
};

var migrationCommands = [

  // addColumn deleted to recommendations
  {
    fn: "addColumn",
    params: [
      "recommendations",
      "deleted",
      {
        "defaultValue": false,
        "type": Sequelize.BOOLEAN
      }
    ]
  }
];

var rollbackCommands = [{
  fn: "removeColumn",
  params: ["recommendations", "deleted"]
}];

module.exports = {
  pos: 0,
  up: function (queryInterface, Sequelize) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          let command = migrationCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
        }
        else
          resolve();
      }
      next();
    });
  },
  down: function (queryInterface, Sequelize) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < rollbackCommands.length) {
          let command = rollbackCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
        }
        else
          resolve();
      }
      next();
    });
  },
  info: info
};

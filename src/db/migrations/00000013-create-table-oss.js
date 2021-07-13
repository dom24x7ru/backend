'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "oss", deps: []
 * addColumn "ossId" to "votes"
 * addIndex "votes_oss_id" to table "votes"
 *
 **/

var info = {
  "revision": 13,
  "name": "create-table-oss",
  "created": "2021-07-12T18:10:00.000Z",
  "comment": "Добавление таблицы для хранения данных ОСС"
};

var migrationCommands = [

  // createTable oss
  {
    fn: "createTable",
    params: [
      "oss",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "houseId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "houses",
            "key": "id"
          },
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "start": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "end": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "deleted": {
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        }
      },
      {
        "comment": "Список общих собраний собственников"
      }
    ]
  },

  // addColumn ossId to votes
  {
    fn: "addColumn",
    params: [
      "votes",
      "ossId",
      {
        "onDelete": "NO ACTION",
        "onUpdate": "CASCADE",
        "references": {
          "model": "oss",
          "key": "id"
        },
        "allowNull": true,
        "type": Sequelize.INTEGER
      }
    ]
  },

  // addIndex votes ossId
  {
    fn: "addIndex",
    params: [
      "votes",
      [{
        "name": "ossId"
      }],
      {
        "indexName": "votes_oss_id"
      }
    ]
  }
];

var rollbackCommands = [{
  fn: "removeColumn",
  params: ["votes", "ossId"]
},
{
  fn: "dropTable",
  params: ["oss"]
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

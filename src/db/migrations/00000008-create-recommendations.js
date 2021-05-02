'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "recommendationCategories", deps: []
 * createTable "recommendations", deps: [persons, recommendationCategories]
 *
 **/

var info = {
  "revision": 8,
  "name": "create-recommendations",
  "created": "2021-02-12T14:39:00.000Z",
  "comment": "Добавление таблицы для хранения рекомендаций от пользователей"
};

var migrationCommands = [

  // createTable recommendationCategories
  {
    fn: "createTable",
    params: [
      "recommendationCategories",
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
        "name": {
          "allowNull": false,
          "type": Sequelize.STRING
        }
      },
      {
        "comment": "Справочник категорий рекомендаций пользователей"
      }
    ]
  },

  // createTable recommendations
  {
    fn: "createTable",
    params: [
      "recommendations",
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
        "categoryId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "recommendationCategories",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "title": {
          "type": Sequelize.STRING
        },
        "body": {
          "type": Sequelize.TEXT
        },
        "extra": {
          "type": Sequelize.JSON
        }
      },
      {
        "comment": "Рекомендации пользователей"
      }
    ]
  },
];

var rollbackCommands = [{
  fn: "dropTable",
  params: ["recommendations"]
},
{
  fn: "dropTable",
  params: ["recommendationCategories"]
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

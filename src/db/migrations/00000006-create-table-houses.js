'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "houses", deps: []
 * addColumn houseId to flats
 * addIndex "flats_houseId" to table "flats"
 *
 **/

var info = {
  "revision": 6,
  "name": "create-table-houses",
  "created": "2021-01-25T18:20:00.000Z",
  "comment": "Добавление таблицы для хранения данных по самому дому с связка с ним квартир"
};

var migrationCommands = [

  // createTable houses
  {
    fn: "createTable",
    params: [
      "houses",
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
        "address": {
          "comment": "Адрес здания в свободной форме",
          "allowNull": false,
          "unique": true,
          "type": Sequelize.STRING
        },
        "dadata": {
          "comment": "Структурированный формат адреса от сервиса DADATA",
          "type": Sequelize.JSON
        },
        "lat": {
          "comment": "Широта",
          "type": Sequelize.DOUBLE
        },
        "lon": {
          "comment": "Долгота",
          "type": Sequelize.DOUBLE
        }
      },
      {
        "comment": "Дома, подключенные к сервису"
      }
    ]
  },

  // addColumn houseId to flats
  {
    fn: "addColumn",
    params: [
      "flats",
      "houseId",
      {
        "onDelete": "NO ACTION",
        "onUpdate": "CASCADE",
        "references": {
          "model": "houses",
          "key": "id"
        },
        "allowNull": true,
        "type": Sequelize.INTEGER
      }
    ]
  },

  // addIndex flats houseId
  {
    fn: "addIndex",
    params: [
      "flats",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "flats_houseId"
      }
    ]
  }
];

var rollbackCommands = [{
  fn: "removeColumn",
  params: ["flats", "houseId"]
},
{
  fn: "dropTable",
  params: ["houses"]
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

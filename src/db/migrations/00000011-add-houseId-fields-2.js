'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn houseId to instructions
 * addColumn houseId to recommendationCategories
 * addColumn houseId to votes
 * 
 * addIndex "instructions_houseId" to table "instructions"
 * addIndex "recommendationCategories_houseId" to table "recommendationCategories"
 * addIndex "votes_houseId" to table "votes"
 *
 **/

var info = {
  "revision": 10,
  "name": "add-houseId-fields-2",
  "created": "2021-05-01T19:34:00.000Z",
  "comment": "Разделение всех ресурсов сервиса по домам"
};

var migrationCommands = [

  // addColumn houseId to instructions
  {
    fn: "addColumn",
    params: [
      "instructions",
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

  // addColumn houseId to recommendationCategories
  {
    fn: "addColumn",
    params: [
      "recommendationCategories",
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

  // addColumn houseId to votes
  {
    fn: "addColumn",
    params: [
      "votes",
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

  // addIndex instructions houseId
  {
    fn: "addIndex",
    params: [
      "instructions",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "instructions_house_id"
      }
    ]
  },

  // addIndex recommendationCategories houseId
  {
    fn: "addIndex",
    params: [
      "recommendationCategories",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "recommendationCategories_house_id"
      }
    ]
  },

  // addIndex votes houseId
  {
    fn: "addIndex",
    params: [
      "votes",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "votes_house_id"
      }
    ]
  }
];

var rollbackCommands = [{
  fn: "removeColumn",
  params: ["instructions", "houseId"]
},
{
  fn: "removeColumn",
  params: ["recommendationCategories", "houseId"]
},
{
  fn: "removeColumn",
  params: ["votes", "houseId"]
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

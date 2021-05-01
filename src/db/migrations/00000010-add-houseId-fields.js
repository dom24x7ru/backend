'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn houseId to posts
 * addColumn houseId to documents
 * addColumn houseId to faqCategories
 * addColumn houseId to imChannels
 * 
 * addIndex "posts_houseId" to table "posts"
 * addIndex "documents_houseId" to table "documents"
 * addIndex "faq_categories_houseId" to table "faqCategories"
 * addIndex "im_channels_houseId" to table "imChannels"
 *
 **/

var info = {
  "revision": 10,
  "name": "add-houseId-fields",
  "created": "2021-04-30T20:05:00.000Z",
  "comment": "Разделение всех ресурсов сервиса по домам"
};

var migrationCommands = [

  // addColumn houseId to posts
  {
    fn: "addColumn",
    params: [
      "posts",
      "houseId",
      {
        "type": Sequelize.STRING
      }
    ]
  },

  // addColumn houseId to documents
  {
    fn: "addColumn",
    params: [
      "documents",
      "houseId",
      {
        "type": Sequelize.STRING
      }
    ]
  },

  // addColumn houseId to faqCategories
  {
    fn: "addColumn",
    params: [
      "faqCategories",
      "houseId",
      {
        "type": Sequelize.STRING
      }
    ]
  },

  // addColumn houseId to imChannels
  {
    fn: "addColumn",
    params: [
      "imChannels",
      "houseId",
      {
        "type": Sequelize.STRING
      }
    ]
  },

  // addIndex posts houseId
  {
    fn: "addIndex",
    params: [
      "posts",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "posts_house_id"
      }
    ]
  },

  // addIndex documents houseId
  {
    fn: "addIndex",
    params: [
      "documents",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "documents_house_id"
      }
    ]
  },

  // addIndex faqCategories houseId
  {
    fn: "addIndex",
    params: [
      "faqCategories",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "faq_categories_house_id"
      }
    ]
  },

  // addIndex imChannels houseId
  {
    fn: "addIndex",
    params: [
      "imChannels",
      [{
        "name": "houseId"
      }],
      {
        "indexName": "im_channels_house_id"
      }
    ]
  }
];

var rollbackCommands = [{
  fn: "removeColumn",
  params: ["posts", "houseId"]
},
{
  fn: "removeColumn",
  params: ["documents", "houseId"]
},
{
  fn: "removeColumn",
  params: ["faqCategories", "houseId"]
},
{
  fn: "removeColumn",
  params: ["imChannels", "houseId"]
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

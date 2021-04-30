'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "roles", deps: []
 * createTable "flats", deps: []
 * createTable "posts", deps: []
 * createTable "instructions", deps: []
 * createTable "documents", deps: []
 * createTable "faqCategories", deps: []
 * createTable "imChannels", deps: []
 * createTable "versions", deps: []
 * createTable "users", deps: [roles]
 * createTable "events", deps: [users]
 * createTable "events_log", deps: [events]
 * createTable "sessions", deps: [users]
 * createTable "persons", deps: [users]
 * createTable "residents", deps: [persons, flats]
 * createTable "invites", deps: [users]
 * createTable "faq", deps: [faqCategories]
 * createTable "votes", deps: [users]
 * createTable "voteQuestions", deps: [votes]
 * createTable "voteAnswers", deps: [votes, voteQuestions, persons]
 * createTable "votePersons", deps: [votes, persons]
 * createTable "imMessages", deps: [persons, imChannels]
 * createTable "imChannelPersons", deps: [imChannels, persons]
 * createTable "imMessageShowPersons", deps: [persons, imMessages]
 * createTable "notificationTokens", deps: [users]
 * addIndex "flats_floor" to table "flats"
 * addIndex "flats_section" to table "flats"
 * addIndex "residents_flat_id" to table "residents"
 * addIndex "residents_person_id" to table "residents"
 * addIndex "invites_used" to table "invites"
 * addIndex "invites_user_id" to table "invites"
 * addIndex "vote_persons_person_id" to table "votePersons"
 * addIndex "vote_persons_vote_id" to table "votePersons"
 * addIndex "im_messages_deleted" to table "imMessages"
 * addIndex "im_messages_channel_id" to table "imMessages"
 * addIndex "im_messages_person_id" to table "imMessages"
 * addIndex "im_channels_floor" to table "imChannels"
 * addIndex "im_channels_section" to table "imChannels"
 * addIndex "im_channels_house" to table "imChannels"
 * addIndex "im_channel_persons_person_id" to table "imChannelPersons"
 * addIndex "im_channel_persons_channel_id" to table "imChannelPersons"
 * addIndex "notification_tokens_user_id" to table "notificationTokens"
 * addIndex "flats_number" to table "flats"
 *
 **/

var info = {
  "revision": 1,
  "name": "first-migration",
  "created": "2021-01-12T12:15:45.407Z",
  "comment": "Первая миграция"
};

var migrationCommands = [

  // createTable roles
  {
    fn: "createTable",
    params: [
      "roles",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "name": {
          "type": Sequelize.STRING
        },
        "code": {
          "type": Sequelize.STRING
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Справочник ролей пользователей"
      }
    ]
  },

  // createTable flats
  {
    fn: "createTable",
    params: [
      "flats",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "number": {
          "comment": "Номер квартиры",
          "type": Sequelize.INTEGER
        },
        "section": {
          "comment": "Секция / подъезд",
          "type": Sequelize.INTEGER
        },
        "floor": {
          "comment": "Этаж",
          "type": Sequelize.INTEGER
        },
        "rooms": {
          "comment": "Количество комнат",
          "type": Sequelize.INTEGER
        },
        "square": {
          "comment": "Площадь квартиры",
          "type": Sequelize.DOUBLE
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список доступных в доме квартир"
      }
    ]
  },

  // createTable posts
  {
    fn: "createTable",
    params: [
      "posts",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "type": {
          "comment": "Тип новости",
          "type": Sequelize.STRING
        },
        "title": {
          "type": Sequelize.STRING
        },
        "body": {
          "type": Sequelize.TEXT
        },
        "url": {
          "comment": "Ссылка на объект, о которой новость",
          "type": Sequelize.STRING
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Новости"
      }
    ]
  },

  // createTable instructions
  {
    fn: "createTable",
    params: [
      "instructions",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "title": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "subtitle": {
          "type": Sequelize.STRING
        },
        "body": {
          "comment": "json со списком шагов",
          "type": Sequelize.JSON
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список инструкций"
      }
    ]
  },

  // createTable documents
  {
    fn: "createTable",
    params: [
      "documents",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "title": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "annotation": {
          "type": Sequelize.STRING
        },
        "url": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список документов"
      }
    ]
  },

  // createTable faqCategories
  {
    fn: "createTable",
    params: [
      "faqCategories",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "name": {
          "unique": true,
          "type": Sequelize.STRING
        },
        "description": {
          "type": Sequelize.STRING
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Категории вопросов для FAQ"
      }
    ]
  },

  // createTable imChannels
  {
    fn: "createTable",
    params: [
      "imChannels",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "title": {
          "type": Sequelize.STRING
        },
        "house": {
          "comment": "Признак, что канал для всего дома",
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "section": {
          "comment": "Если указана секция, то канал на конкретную секция, либо этаж конкретной секции, если еще и этаж указан",
          "type": Sequelize.INTEGER
        },
        "floor": {
          "comment": "Указывается совместно с параметром секции. Если указан, то канал по конкретному этажу в секции",
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Группы и каналы в чатах"
      }
    ]
  },

  // createTable versions
  {
    fn: "createTable",
    params: [
      "versions",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "number": {
          "type": Sequelize.INTEGER
        },
        "build": {
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Актуальные версии приложения"
      }
    ]
  },

  // createTable users
  {
    fn: "createTable",
    params: [
      "users",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "mobile": {
          "unique": true,
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "smsCode": {
          "type": Sequelize.STRING
        },
        "banned": {
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "roleId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "roles",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {}
    ]
  },

  // createTable events
  {
    fn: "createTable",
    params: [
      "events",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "userId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "type": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "status": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "priority": {
          "allowNull": false,
          "defaultValue": "MEDIUM",
          "type": Sequelize.STRING
        },
        "data": {
          "type": Sequelize.TEXT
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {}
    ]
  },

  // createTable event_log
  {
    fn: "createTable",
    params: [
      "events_log",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "userId": {
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "eventId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "events",
            "key": "id"
          },
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
        }
      },
      {}
    ]
  },

  // createTable sessions
  {
    fn: "createTable",
    params: [
      "sessions",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "uuid": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "userId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "ip": {
          "allowNull": false,
          "type": Sequelize.STRING
        },
        "forwardedIp": {
          "type": Sequelize.STRING
        },
        "login": {
          "type": Sequelize.DATE
        },
        "logout": {
          "type": Sequelize.DATE
        },
        "online": {
          "type": Sequelize.BOOLEAN
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {}
    ]
  },

  // createTable persons
  {
    fn: "createTable",
    params: [
      "persons",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "userId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "unique": true,
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "surname": {
          "type": Sequelize.STRING
        },
        "name": {
          "type": Sequelize.STRING
        },
        "midname": {
          "type": Sequelize.STRING
        },
        "birthday": {
          "type": Sequelize.DATE
        },
        "sex": {
          "defaultValue": "U",
          "type": Sequelize.STRING
        },
        "biography": {
          "type": Sequelize.TEXT
        },
        "telegram": {
          "comment": "Аккаунт в Телеграм",
          "type": Sequelize.STRING
        },
        "access": {
          "comment": "json с настройками безопасности по отображению персональных данных",
          "type": Sequelize.JSON
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Профили пользователей"
      }
    ]
  },

  // createTable residents
  {
    fn: "createTable",
    params: [
      "residents",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "flatId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "flats",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "isOwner": {
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Связка пользователей с квартирави, которые у них в собственности, либо они в них живут"
      }
    ]
  },

  // createTable invites
  {
    fn: "createTable",
    params: [
      "invites",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "userId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "code": {
          "unique": true,
          "type": Sequelize.STRING
        },
        "used": {
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "newUserId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "unique": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список приглашений"
      }
    ]
  },

  // createTable faq
  {
    fn: "createTable",
    params: [
      "faq",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "categoryId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "faqCategories",
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
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {}
    ]
  },

  // createTable votes
  {
    fn: "createTable",
    params: [
      "votes",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "title": {
          "type": Sequelize.STRING
        },
        "multi": {
          "comment": "Признак, что можно выбирать сразу несколько вариантов",
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "anonymous": {
          "comment": "Признак, что голосование анонимное",
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "closed": {
          "comment": "Признак, что голосование закрыто",
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "house": {
          "comment": "Признак, что голосование на весь дом",
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "section": {
          "comment": "Если указана секция, то голосование на конкретную секция, либо этаж конкретной секции, если еще и этаж указан",
          "type": Sequelize.INTEGER
        },
        "floor": {
          "comment": "Указывается совместно с параметром секции. Если указан, то голосование по конкретному этажу в секции",
          "type": Sequelize.INTEGER
        },
        "userId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список голосований"
      }
    ]
  },

  // createTable voteQuestions
  {
    fn: "createTable",
    params: [
      "voteQuestions",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "voteId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "votes",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "body": {
          "type": Sequelize.STRING
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список вопросов для голосования"
      }
    ]
  },

  // createTable voteAnswers
  {
    fn: "createTable",
    params: [
      "voteAnswers",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "voteId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "votes",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "questionId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "voteQuestions",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список ответов по голосованию"
      }
    ]
  },

  // createTable votePersons
  {
    fn: "createTable",
    params: [
      "votePersons",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "voteId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "votes",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Список пользователей, которые имеют доступ к голосованию"
      }
    ]
  },

  // createTable imMessages
  {
    fn: "createTable",
    params: [
      "imMessages",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "channelId": {
          "onDelete": "NO ACTION",
          "onUpdate": "CASCADE",
          "references": {
            "model": "imChannels",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "body": {
          "type": Sequelize.JSON
        },
        "deleted": {
          "defaultValue": false,
          "type": Sequelize.BOOLEAN
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Сообщения в чате"
      }
    ]
  },

  // createTable imChannelPersons
  {
    fn: "createTable",
    params: [
      "imChannelPersons",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "channelId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "imChannels",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Участники группового чата"
      }
    ]
  },

  // createTable imMessageShowPersons
  {
    fn: "createTable",
    params: [
      "imMessageShowPersons",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "personId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "persons",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "messageId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "imMessages",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Сообщения, которые пользователь просмотрел"
      }
    ]
  },

  // createTable notificationTokens
  {
    fn: "createTable",
    params: [
      "notificationTokens",
      {
        "id": {
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false,
          "type": Sequelize.INTEGER
        },
        "userId": {
          "onDelete": "CASCADE",
          "onUpdate": "CASCADE",
          "references": {
            "model": "users",
            "key": "id"
          },
          "allowNull": true,
          "type": Sequelize.INTEGER
        },
        "token": {
          "unique": true,
          "type": Sequelize.STRING
        },
        "createdAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        },
        "updatedAt": {
          "allowNull": false,
          "type": Sequelize.DATE
        }
      },
      {
        "comment": "Токены пользователей для отображения нотификаций"
      }
    ]
  },

  // addIndex flats floor
  {
    fn: "addIndex",
    params: [
      "flats",
      [{
        "name": "floor"
      }],
      {
        "indexName": "flats_floor"
      }
    ]
  },

  // addIndex flats section
  {
    fn: "addIndex",
    params: [
      "flats",
      [{
        "name": "section"
      }],
      {
        "indexName": "flats_section"
      }
    ]
  },

  // addIndex residents flatId
  {
    fn: "addIndex",
    params: [
      "residents",
      [{
        "name": "flatId"
      }],
      {
        "indexName": "residents_flat_id"
      }
    ]
  },

  // addIndex residents personId
  {
    fn: "addIndex",
    params: [
      "residents",
      [{
        "name": "personId"
      }],
      {
        "indexName": "residents_person_id"
      }
    ]
  },

  // addIndex invites used
  {
    fn: "addIndex",
    params: [
      "invites",
      [{
        "name": "used"
      }],
      {
        "indexName": "invites_used"
      }
    ]
  },

  // addIndex invites userId
  {
    fn: "addIndex",
    params: [
      "invites",
      [{
        "name": "userId"
      }],
      {
        "indexName": "invites_user_id"
      }
    ]
  },

  // addIndex votePersons personId
  {
    fn: "addIndex",
    params: [
      "votePersons",
      [{
        "name": "personId"
      }],
      {
        "indexName": "vote_persons_person_id"
      }
    ]
  },

  // addIndex votePersons voteId
  {
    fn: "addIndex",
    params: [
      "votePersons",
      [{
        "name": "voteId"
      }],
      {
        "indexName": "vote_persons_vote_id"
      }
    ]
  },

  // addIndex imMessages deleted
  {
    fn: "addIndex",
    params: [
      "imMessages",
      [{
        "name": "deleted"
      }],
      {
        "indexName": "im_messages_deleted"
      }
    ]
  },

  // addIndex imMessages channelId
  {
    fn: "addIndex",
    params: [
      "imMessages",
      [{
        "name": "channelId"
      }],
      {
        "indexName": "im_messages_channel_id"
      }
    ]
  },

  // addIndex imMessages personId
  {
    fn: "addIndex",
    params: [
      "imMessages",
      [{
        "name": "personId"
      }],
      {
        "indexName": "im_messages_person_id"
      }
    ]
  },

  // addIndex imChannels floor
  {
    fn: "addIndex",
    params: [
      "imChannels",
      [{
        "name": "floor"
      }],
      {
        "indexName": "im_channels_floor"
      }
    ]
  },

  // addIndex imChannels section
  {
    fn: "addIndex",
    params: [
      "imChannels",
      [{
        "name": "section"
      }],
      {
        "indexName": "im_channels_section"
      }
    ]
  },

  // addIndex imChannels house
  {
    fn: "addIndex",
    params: [
      "imChannels",
      [{
        "name": "house"
      }],
      {
        "indexName": "im_channels_house"
      }
    ]
  },

  // addIndex imChannelPersons personId
  {
    fn: "addIndex",
    params: [
      "imChannelPersons",
      [{
        "name": "personId"
      }],
      {
        "indexName": "im_channel_persons_person_id"
      }
    ]
  },

  // addIndex imChannelPersons channelId
  {
    fn: "addIndex",
    params: [
      "imChannelPersons",
      [{
        "name": "channelId"
      }],
      {
        "indexName": "im_channel_persons_channel_id"
      }
    ]
  },

  // addIndex notificationTokens userId
  {
    fn: "addIndex",
    params: [
      "notificationTokens",
      [{
        "name": "userId"
      }],
      {
        "indexName": "notification_tokens_user_id"
      }
    ]
  },

  // addIndex flats number
  {
    fn: "addIndex",
    params: [
      "flats",
      [{
        "name": "number"
      }],
      {
        "indexName": "flats_number"
      }
    ]
  }
];

var rollbackCommands = [{
  fn: "dropTable",
  params: ["users"]
},
{
  fn: "dropTable",
  params: ["events_log"]
},
{
  fn: "dropTable",
  params: ["events"]
},
{
  fn: "dropTable",
  params: ["sessions"]
},
{
  fn: "dropTable",
  params: ["persons"]
},
{
  fn: "dropTable",
  params: ["residents"]
},
{
  fn: "dropTable",
  params: ["invites"]
},
{
  fn: "dropTable",
  params: ["faq"]
},
{
  fn: "dropTable",
  params: ["votes"]
},
{
  fn: "dropTable",
  params: ["voteQuestions"]
},
{
  fn: "dropTable",
  params: ["voteAnswers"]
},
{
  fn: "dropTable",
  params: ["votePersons"]
},
{
  fn: "dropTable",
  params: ["imMessages"]
},
{
  fn: "dropTable",
  params: ["imChannelPersons"]
},
{
  fn: "dropTable",
  params: ["imMessageShowPersons"]
},
{
  fn: "dropTable",
  params: ["notificationTokens"]
},
{
  fn: "dropTable",
  params: ["roles"]
},
{
  fn: "dropTable",
  params: ["flats"]
},
{
  fn: "dropTable",
  params: ["posts"]
},
{
  fn: "dropTable",
  params: ["instructions"]
},
{
  fn: "dropTable",
  params: ["documents"]
},
{
  fn: "dropTable",
  params: ["faqCategories"]
},
{
  fn: "dropTable",
  params: ["imChannels"]
},
{
  fn: "dropTable",
  params: ["versions"]
}
];

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

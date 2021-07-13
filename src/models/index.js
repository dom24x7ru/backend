"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = exports.NotificationToken = exports.Recommendation = exports.RecommendationCategory = exports.IMMessageShow = exports.IMChannelPerson = exports.IMChannel = exports.IMMessage = exports.Oss = exports.VotePerson = exports.VoteAnswer = exports.VoteQuestion = exports.Vote = exports.FAQItem = exports.FAQCategory = exports.Document = exports.Instruction = exports.Post = exports.Invite = exports.Resident = exports.Flat = exports.House = exports.Person = exports.Role = exports.User = exports.Session = exports.EventLog = exports.Event = exports.sequelize = void 0;
const event_model_1 = require("./event/event.model");
exports.Event = event_model_1.default;
const logger_model_1 = require("./event/logger.model");
exports.EventLog = logger_model_1.default;
const session_model_1 = require("./security/session/session.model");
exports.Session = session_model_1.default;
const user_model_1 = require("./security/user/user.model");
exports.User = user_model_1.default;
const role_model_1 = require("./security/role/role.model");
exports.Role = role_model_1.default;
const person_model_1 = require("./person/person.model");
exports.Person = person_model_1.default;
const invite_model_1 = require("./invite/invite.model");
exports.Invite = invite_model_1.default;
const house_model_1 = require("./flat/house.model");
exports.House = house_model_1.default;
const flat_model_1 = require("./flat/flat.model");
exports.Flat = flat_model_1.default;
const resident_model_1 = require("./flat/resident.model");
exports.Resident = resident_model_1.default;
const post_model_1 = require("./post/post.model");
exports.Post = post_model_1.default;
const instruction_model_1 = require("./instruction/instruction.model");
exports.Instruction = instruction_model_1.default;
const document_model_1 = require("./document/document.model");
exports.Document = document_model_1.default;
const faq_category_model_1 = require("./faq/faq.category.model");
exports.FAQCategory = faq_category_model_1.default;
const faq_model_1 = require("./faq/faq.model");
exports.FAQItem = faq_model_1.default;
const vote_model_1 = require("./vote/vote.model");
exports.Vote = vote_model_1.default;
const vote_question_model_1 = require("./vote/vote.question.model");
exports.VoteQuestion = vote_question_model_1.default;
const vote_answer_model_1 = require("./vote/vote.answer.model");
exports.VoteAnswer = vote_answer_model_1.default;
const vote_person_model_1 = require("./vote/vote.person.model");
exports.VotePerson = vote_person_model_1.default;
const oss_model_1 = require("./vote/oss.model");
exports.Oss = oss_model_1.default;
const im_message_model_1 = require("./im/im.message.model");
exports.IMMessage = im_message_model_1.default;
const im_channel_model_1 = require("./im/im.channel.model");
exports.IMChannel = im_channel_model_1.default;
const im_channel_person_model_1 = require("./im/im.channel.person.model");
exports.IMChannelPerson = im_channel_person_model_1.default;
const im_message_show_model_1 = require("./im/im.message.show.model");
exports.IMMessageShow = im_message_show_model_1.default;
const recommendation_category_model_1 = require("./recommendation/recommendation.category.model");
exports.RecommendationCategory = recommendation_category_model_1.default;
const recommendation_model_1 = require("./recommendation/recommendation.model");
exports.Recommendation = recommendation_model_1.default;
const notification_token_model_1 = require("./notification/notification.token.model");
exports.NotificationToken = notification_token_model_1.default;
const version_model_1 = require("./version/version.model");
exports.Version = version_model_1.default;
const db_1 = require("../db");
exports.sequelize = db_1.default;

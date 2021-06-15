"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const response_1 = require("./response");
class ResponseUpdate {
    constructor(exchange) {
        this.exchange = exchange;
    }
    update(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                eventData.createAt = new Date(eventData.createAt).getTime();
                eventData.data = eventData.data != null ? JSON.parse(eventData.data) : null;
                switch (eventData.type) {
                    case "USER.UPDATE":
                        yield this.updateUser(eventData);
                        break;
                    case "POST.SAVE":
                        yield this.updatePostSave(eventData);
                        break;
                    case "INVITE.SAVE":
                        yield this.updateInviteSave(eventData);
                        break;
                    case "VOTE.SAVE":
                    case "VOTE.ANSWER.SAVE":
                        yield this.updateVote(eventData);
                        break;
                    case "RECOMMENDATION.SAVE":
                    case "RECOMMENDATION.DELETE":
                        yield this.updateRecommendation(eventData);
                        break;
                    case "IM.SAVE":
                    case "IM.SHOWN":
                    case "IM.MSG.DEL":
                        yield this.updateIMMessage(eventData);
                        yield this.updateIMChannel(eventData);
                        break;
                    case "IM.CHANNEL.UPDATE":
                        yield this.updateIMChannel(eventData);
                        break;
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    updateUser(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield _1.UserResponse.info(eventData.userId);
            this.publish(`user.${eventData.userId}`, data, "update");
        });
    }
    updatePostSave(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield _1.PostResponse.get(eventData.data.postId);
            const houseId = yield response_1.default.getHouseId(eventData.userId);
            this.publish(`posts.${houseId}`, post, eventData.data.event);
        });
    }
    updateInviteSave(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const invite = yield _1.InviteResponse.get(eventData.data.inviteId);
            this.publish(`invites.${eventData.userId}`, invite, eventData.data.event);
        });
    }
    updateVote(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteId = eventData.data.voteId;
            const vote = yield _1.VoteResponse.get(voteId);
            this.publish(`vote.${voteId}`, vote, eventData.data.event);
        });
    }
    updateRecommendation(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendationId = eventData.data.recommendationId;
            const recommendation = yield _1.RecommendationResponse.get(eventData.userId, recommendationId);
            const houseId = yield response_1.default.getHouseId(eventData.userId);
            this.publish(`recommendations.${houseId}`, recommendation, eventData.data.event);
        });
    }
    updateIMMessage(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield _1.IMMessageResponse.get(eventData.data.messageId);
            this.publish(`imMessages.${message.channel.id}`, message, eventData.data.event);
        });
    }
    updateIMChannel(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = eventData.data.channelId;
            const channel = yield _1.IMChannelResponse.get(channelId);
            this.publish(`imChannel.${channelId}`, channel, eventData.data.event);
        });
    }
    /**
     * Отправка данных в канал
     * @param channel название канала
     * @param rows массив или единичные данные с обновлениями для отправки
     * @param event тип обновления канала: create, update, destroy
     */
    publish(channel, rows, event = "update") {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`publishUpdateData to CHANNEL: ${channel}, event = ${event}`);
            if (rows != null) {
                if (rows instanceof Array) {
                    for (let data of rows) {
                        yield this.exchange.publish(channel, { event, data });
                    }
                }
                else {
                    let data = rows;
                    yield this.exchange.publish(channel, { event, data });
                }
            }
            yield this.exchange.publish(channel, { event: "ready" });
        });
    }
}
exports.default = ResponseUpdate;

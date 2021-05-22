import { IMChannelResponse, IMMessageResponse, InviteResponse, PostResponse, RecommendationResponse, UserResponse, VoteResponse } from ".";
import * as _ from "lodash";
import Response from "./response";

export type tPublishEvent = "create" | "update" | "destroy" | "ready";

export default class ResponseUpdate {

  private exchange;

  constructor(exchange) {
    this.exchange = exchange;
  }

  async update(eventData) {
    try {
      eventData.createAt = new Date(eventData.createAt).getTime();
      eventData.data = eventData.data != null ? JSON.parse(eventData.data) : null;

      switch (eventData.type) {
        case "USER.UPDATE":
          await this.updateUser(eventData);
          break;
        case "POST.SAVE":
          await this.updatePostSave(eventData);
          break;
        case "INVITE.SAVE":
          await this.updateInviteSave(eventData);
          break;
        case "VOTE.SAVE":
        case "VOTE.ANSWER.SAVE":
          await this.updateVote(eventData);
          break;
        case "RECOMMENDATION.SAVE":
          await this.updateRecommendation(eventData);
          break;
        case "IM.SAVE":
        case "IM.SHOWN":
        case "IM.MSG.DEL":
          await this.updateIMMessage(eventData);
          await this.updateIMChannel(eventData);
          break;
        case "IM.CHANNEL.UPDATE":
          await this.updateIMChannel(eventData);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async updateUser(eventData) {
    const data = await UserResponse.info(eventData.userId);
    this.publish(`user.${eventData.userId}`, data, "update");
  }

  private async updatePostSave(eventData) {
    const post = await PostResponse.get(eventData.data.postId);
    const houseId = await Response.getHouseId(eventData.userId);
    this.publish(`posts.${houseId}`, post, eventData.data.event);
  }

  private async updateInviteSave(eventData) {
    const invite = await InviteResponse.get(eventData.data.inviteId);
    this.publish(`invites.${eventData.userId}`, invite, eventData.data.event);
  }

  private async updateVote(eventData) {
    const voteId = eventData.data.voteId;
    const vote = await VoteResponse.get(voteId);
    this.publish(`vote.${voteId}`, vote, eventData.data.event);
  }

  private async updateRecommendation(eventData) {
    const recommendationId = eventData.data.recommendationId;
    const recommendation = await RecommendationResponse.get(eventData.userId, recommendationId);
    const houseId = await Response.getHouseId(eventData.userId);
    this.publish(`recommendations.${houseId}`, recommendation, eventData.data.event);
  }

  private async updateIMMessage(eventData) {
    const message = await IMMessageResponse.get(eventData.data.messageId);
    this.publish(`imMessages.${message.channel.id}`, message, eventData.data.event);
  }

  private async updateIMChannel(eventData) {
    const channelId = eventData.data.channelId;
    const channel = await IMChannelResponse.get(channelId);
    this.publish(`imChannel.${channelId}`, channel, eventData.data.event);
  }

  /**
   * Отправка данных в канал
   * @param channel название канала
   * @param rows массив или единичные данные с обновлениями для отправки
   * @param event тип обновления канала: create, update, destroy
   */
  private async publish(channel, rows, event: tPublishEvent = "update") {
    console.log(`publishUpdateData to CHANNEL: ${channel}, event = ${event}`);
    if (rows != null) {
      if (rows instanceof Array) {
        for (let data of rows) {
          await this.exchange.publish(channel, { event, data });
        }
      } else {
        let data = rows;
        await this.exchange.publish(channel, { event, data });
      }
    }
    await this.exchange.publish(channel, { event: "ready" });
  }
}
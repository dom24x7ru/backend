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
const axios_1 = require("axios");
const models_1 = require("../../models");
class Push {
    static send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = {
                headers: {
                    Authorization: `key=AAAAkuwL2rQ:APA91bEk6grefA6S4XsyRcx__soFI1KEzwTtJ3kvWRjzs6MDCGSzCZkFiX-4CD4FYyjbYnvzK27llVjXzdo1tHvEdjSH5KNJ-54A73IrIHHM4YscvdlYqMRG2wb05X6CIIz733wgW4o9`,
                    "Content-Type": "application/json"
                }
            };
            if (data.all) {
                // отправляем всем
                const tokens = yield models_1.NotificationToken.findAll();
                const list = tokens.map(item => item.token);
                const pushData = {
                    notification: {
                        title: Push.TITLE,
                        body: data.body,
                        icon: Push.ICON,
                        click_action: Push.APP_URL + (data.uri != null ? data.uri : ""),
                    },
                    registration_ids: list // FIXME: должно быть не более 1000 адресов
                };
                const result = yield axios_1.default.post(Push.URL, pushData, config);
                return result;
            }
            else if (data.to) {
                // отправляем конкретному пользователю
                const pushData = {
                    notification: {
                        title: Push.TITLE,
                        body: data.body,
                        icon: Push.ICON,
                        click_action: Push.APP_URL + (data.uri != null ? data.uri : ""),
                    },
                    to: data.to
                };
                const result = yield axios_1.default.post(Push.URL, pushData, config);
                return result;
            }
        });
    }
}
exports.default = Push;
Push.URL = "https://fcm.googleapis.com/fcm/send";
Push.TITLE = "Dom24x7";
Push.ICON = "/img/logo.png";
Push.APP_URL = "https://yarea40.dom24x7.ru/#";

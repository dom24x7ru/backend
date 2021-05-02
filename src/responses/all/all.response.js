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
const __1 = require("..");
const response_1 = require("../response");
class AllResponse extends response_1.default {
    constructor() {
        super();
    }
    static create() {
        return new AllResponse();
    }
    static init(userId, channelName) {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = [];
            let flats = [];
            let invites = [];
            if (channelName == null || channelName == "posts")
                posts = yield __1.PostResponse.list(userId);
            if (channelName == null || channelName == "flats")
                flats = yield __1.FlatResponse.list(userId);
            if (channelName == null || channelName == "invites")
                invites = yield __1.InviteResponse.list(userId);
            let result = AllResponse.create();
            result.posts = posts;
            result.flats = flats;
            result.invites = invites;
            return result;
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (socket.authToken == null)
                return null;
            return yield AllResponse.init(socket.authToken.id, params == null || params.length == 0 ? null : params);
        });
    }
}
exports.default = AllResponse;

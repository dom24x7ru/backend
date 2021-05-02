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
const responses_1 = require("../responses");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.time("channels.test");
        const result = yield responses_1.RecommendationResponse.list(1);
        console.log(result);
        console.timeEnd("channels.test");
    }
    catch (error) {
        console.error(error);
    }
    finally {
        process.exit(0);
    }
}))();

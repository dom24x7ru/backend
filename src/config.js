"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ENV_NAME = {
    DEV: "development",
    PROD: "production"
};
const DEFAULT_ENV_NAME = ENV_NAME.PROD;
const env = process.env.NODE_ENV || DEFAULT_ENV_NAME;
const db = require("./db/credentials")[env];
const plogicId = env == DEFAULT_ENV_NAME ? "srv00" : process.env.PLOGIC_ID;
const config = {
    env,
    db: db,
    redis: {
        host: "136.144.29.95",
        login: "admin",
        password: "AENgcz02491"
    },
    kue_web: {
        prefix: "dom24x7_kue_web",
    },
    kue_pl: {
        prefix_without_srv: "dom24x7_kue_pl",
        prefix: `dom24x7_kue_pl${plogicId != null ? "_" + plogicId : ""}`,
    }
};
exports.default = config;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authToken = core_1.default.getInput('authToken', { required: true });
            const siteName = core_1.default.getInput('siteName', { required: true });
            const authEmail = core_1.default.getInput('authEmail', { required: true });
            const fileList = JSON.parse(core_1.default.getInput('fileList', { required: true }));
            if (fileList.length > 0) {
                const areFilesValid = fileList.reduce((acc, curr) => {
                    if (!acc) {
                        return false;
                    }
                    return typeof curr === 'string' || curr.url;
                }, true);
                if (!areFilesValid) {
                    core_1.default.setFailed('File list is formatted incorrectly. See https://api.cloudflare.com/#zone-purge-files-by-url for details');
                }
            }
            const zoneID = yield getZoneID(authToken, siteName, authEmail);
            const response = yield axios_1.default.post(`https://api.cloudflare.com/client/v4/zones/${zoneID}/purge_cache`, {
                purge_everything: fileList.length === 0,
                fileList: fileList.length === 0 ? undefined : fileList
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'X-Auth-Email': authEmail
                }
            });
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    });
}
function getZoneID(authToken, siteName, authEmail) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.cloudflare.com/client/v4/zones', {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'X-Auth-Email': authEmail
                }
            });
            const targetZone = response.data.result.find(site => site.name === siteName);
            if (!targetZone) {
                reject('Your zone was not found. Are you sure you passed the right name?');
            }
            resolve(targetZone.id);
        }
        catch (e) {
            reject(e);
        }
    }));
}
run();

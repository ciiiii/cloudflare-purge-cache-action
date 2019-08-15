"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authToken = core.getInput('authToken', { required: true });
            const siteName = core.getInput('siteName', { required: true });
            const authEmail = core.getInput('authEmail', { required: true });
            const rawFileList = core.getInput('fileList');
            const fileList = !!rawFileList ? JSON.parse(rawFileList) : [];
            if (fileList.length > 0) {
                const areFilesValid = fileList.reduce((acc, curr) => {
                    if (!acc) {
                        return false;
                    }
                    return typeof curr === 'string' || curr.url;
                }, true);
                if (!areFilesValid) {
                    core.setFailed('File list is formatted incorrectly. See https://api.cloudflare.com/#zone-purge-files-by-url for details');
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
            core.setFailed(error.message);
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

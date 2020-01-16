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
const baseUrl = 'https://api.cloudflare.com/client/v4';
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
            let zoneId = yield getZoneID(authToken, authEmail, siteName);
            let res = yield axios_1.default.post(`${baseUrl}/zones/${zoneId}/purge_cache`, {
                purge_everything: fileList.length === 0,
                fileList: fileList.length === 0 ? undefined : fileList
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'X-Auth-Email': authEmail
                }
            });
            let { success } = res.data;
            if (success) {
                core.setOutput('res', `Purge ${siteName} cache success!`);
            }
            core.setFailed(`Purge ${siteName} cache fail!`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function getZoneID(authToken, authEmail, siteName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield axios_1.default.get(`${baseUrl}/zones?name=${siteName}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'X-Auth-Email': authEmail
                }
            });
            let { result } = res.data;
            if (result.length != 0) {
                return result[0].id;
            }
            core.setFailed(`Query zoneId error, check your siteName: ${siteName}.`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();

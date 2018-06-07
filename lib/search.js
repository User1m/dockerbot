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
}
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request-promise-native"));
function searchBand(searchQuery) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.SEARCH_KEY ? process.env.SEARCH_KEY : "";
        const options = {
            method: 'GET',
            uri: `https://schedule-search.search.windows.net/indexes/documentdb-index/docs?api-version=2016-09-01&search=${searchQuery}`,
            headers: { 'api-key': apiKey },
            json: true
        };
        try {
            const r = yield request.get(options);
            return r.value;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    });
}
exports.searchBand = searchBand;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function getDays(filter = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const shows = yield getShows(filter);
        const allDays = shows.map(s => s.day);
        return new Set(allDays);
    });
}
exports.getDays = getDays;
function getGenres(filter = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const shows = yield getShows(filter);
        const allGenres = shows.map(s => s.genre);
        return new Set(allGenres);
    });
}
exports.getGenres = getGenres;
function getShows(filter = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let shows = require('../schedule.json');
        shows = shows.filter(s => (!filter.day || s.day === filter.day)
            && (!filter.genre || s.genre === filter.genre));
        return shows;
    });
}
exports.getShows = getShows;

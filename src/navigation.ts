import { Show } from './model/show';

export interface PerformanceFilter {
    day?: string;
    genre?: string;
}

export async function getDays(filter: PerformanceFilter = {}): Promise<Set<string>> {
    const shows = await getShows(filter);
    const allDays = shows.map(s => s.day);
    return new Set(allDays);
}

export async function getGenres(filter: PerformanceFilter = {}): Promise<Set<string>> {
    const shows = await getShows(filter);
    const allGenres = shows.map(s => s.genre);
    return new Set(allGenres);
}

export async function getShows(filter: PerformanceFilter = {}): Promise<Show[]> {
    let shows: Show[] = require('../schedule.json');
    shows = shows.filter(s =>
        (!filter.day || s.day === filter.day)
        && (!filter.genre || s.genre === filter.genre)
    );

    return shows;
}
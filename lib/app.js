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
const botbuilder_1 = require("botbuilder");
const restify = __importStar(require("restify"));
const navigation_1 = require("./navigation");
// Create server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, '0.0.0.0', () => {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Add state middleware
const storage = new botbuilder_1.MemoryStorage();
const convoState = new botbuilder_1.ConversationState(storage);
adapter.use(new botbuilder_1.BotStateSet(convoState));
// Listen for incoming requests, and route them to adapter for processing
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, botLogic);
});
function botLogic(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate && context.activity.membersAdded) {
            // If someone (other than the bot) joined the conversation, welcome them
            const botId = context.activity.recipient.id;
            if (context.activity.membersAdded.some(m => m.id !== botId)) {
                yield context.sendActivity(`Hey there! I'm the ASH Music Festival Bot. I'm here to guide you around the festival`);
                yield sendMenu(context);
            }
        }
        else if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
            // Get conversation state
            const state = convoState.get(context);
            if (!state) {
                throw new Error(`Failed to get state`);
            }
            const lowerText = context.activity.text.toLowerCase();
            if (state.prompt === 'qna_feedback') {
                // We're expecting QNA feedback
                if (lowerText === 'yes') {
                    const resp = `Great! I'll make a note that this is the right answer to your question`;
                    yield respondAfterFeedback(state, context, resp);
                    return;
                }
                else if (lowerText === 'no') {
                    return yield respondAfterFeedback(state, context);
                }
            }
            else if (state.prompt === 'day') {
                // We're expecting a day. Update the filter with it
                const day = context.activity.text;
                state.performanceFilter = Object.assign({}, state.performanceFilter, { day: day });
                // Continue navigation by prompting user for a genre
                state.prompt = 'genre';
                const genres = yield navigation_1.getGenres(state.performanceFilter);
                const msg = createCardMessage(`What genre of music would you like to see on ${day}?`, [], [...genres]);
                yield context.sendActivity(msg);
                return;
            }
            else if (state.prompt === 'genre') {
                // We're expecting a genre
                const genre = context.activity.text;
                state.performanceFilter = Object.assign({}, state.performanceFilter, { genre: genre });
                // Complete navigation by listing shows
                delete state.prompt;
                const shows = yield navigation_1.getShows(state.performanceFilter);
                if (shows.length === 0) {
                    yield context.sendActivity(`I couldn't find any ${state.performanceFilter.genre} shows on ${state.performanceFilter.day}`);
                    return;
                }
                // TODO: Description needs to map to this particular band
                const cards = shows.map(s => botbuilder_1.CardFactory.heroCard(s.bandName, `${s.day}, ${s.startTime} at the ${s.stage} Stage`, [imageUrl(s)], ['Description', 'Main Menu']));
                const msg = botbuilder_1.MessageFactory.carousel(cards);
                yield context.sendActivity(msg);
                return;
            }
            if (["hi", "home", "main menu"].indexOf(lowerText) > -1) {
                delete state.prompt;
                yield sendMenu(context);
            }
            else if (lowerText === 'navigate') {
                // Clear previous filter
                delete state.performanceFilter;
                // Start navigation by prompting user for day
                state.prompt = 'day';
                const days = yield navigation_1.getDays();
                const msg = createCardMessage(`What day would you like to see music?`, [], [...days]);
                yield context.sendActivity(msg);
            }
            else {
                // If we don't understand, try QnA Maker
                state.last_user_msg = lowerText;
                yield context.sendActivity(`Sorry, I don't understand`);
                yield getFeedback(state, context);
            }
        }
        function respondAfterFeedback(state, context, resp = `Sorry I couldn't help! I'll use your feedback to better answer your questions in the future!`) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    delete state.prompt;
                    yield context.sendActivity(resp);
                    yield sendMenu(context);
                }
                catch (error) {
                    console.log(JSON.stringify(error, null, 2));
                }
            });
        }
        function getFeedback(state, context) {
            return __awaiter(this, void 0, void 0, function* () {
                state.prompt = 'qna_feedback';
                const card = botbuilder_1.CardFactory.heroCard('', [], ['Yes', 'No']);
                const msg = botbuilder_1.MessageFactory.attachment(card, 'Was this the answer you were looking for?');
                yield context.sendActivity(msg);
            });
        }
        function sendMenu(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const card = botbuilder_1.CardFactory.heroCard('', [], ['Navigate']);
                const msg = botbuilder_1.MessageFactory.attachment(card, 'How would you like to explore the event?');
                yield context.sendActivity(msg);
            });
        }
        function createCardMessage(text, images, buttons) {
            const card = botbuilder_1.CardFactory.heroCard('', images, buttons);
            const msg = botbuilder_1.MessageFactory.attachment(card, text);
            return msg;
        }
        function imageUrl(show) {
            return `https://nodeteam1storage.blob.core.windows.net${show.imageUrl.substring(1)}`;
        }
    });
}

import { BotFrameworkAdapter, ActivityTypes, TurnContext, CardFactory, MessageFactory, MemoryStorage, ConversationState, BotStateSet, CardImage, CardAction } from 'botbuilder';
import { QnAMaker } from 'botbuilder-ai';
import * as restify from 'restify';
import * as dotenv from 'dotenv';
import * as request from 'superagent';
import { PerformanceFilter, getDays, getGenres, getShows } from './navigation';
import { Show } from './model/show';

// Load environment variables from .env file
// dotenv.load();

// Custom state type for our bot
interface MyState {
    prompt?: 'qna_feedback' | 'band_search' | 'day' | 'genre';
    last_user_msg?: string;
    performanceFilter?: PerformanceFilter;
}

// Create server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, '0.0.0.0', () => {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState<MyState>(storage);
adapter.use(new BotStateSet(convoState));

// Listen for incoming requests, and route them to adapter for processing
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, botLogic);
});

async function botLogic(context: TurnContext) {
    if (context.activity.type === ActivityTypes.ConversationUpdate && context.activity.membersAdded) {
        // If someone (other than the bot) joined the conversation, welcome them
        const botId = context.activity.recipient.id;
        if (context.activity.membersAdded.some(m => m.id !== botId)) {
            await context.sendActivity(`Hey there! I'm the ASH Music Festival Bot. I'm here to guide you around the festival`);
            await sendMenu(context);
        }
    }

    else if (context.activity.type === ActivityTypes.Message) {
        // Get conversation state
        const state = convoState.get(context);
        if (!state) {
            throw new Error(`Failed to get state`);
        }

        const lowerText = context.activity.text.toLowerCase();

        if (state.prompt === 'qna_feedback') {
            // We're expecting QNA feedback
            if (lowerText === 'yes') {
                const resp = `Great! I'll make a note that this is the right answer to your question`
                await respondAfterFeedback(state, context, resp);
                return;
            } else if (lowerText === 'no') {
                return await respondAfterFeedback(state, context);
            }
        } else if (state.prompt === 'day') {
            // We're expecting a day. Update the filter with it
            const day = context.activity.text;
            state.performanceFilter = { ...state.performanceFilter, day: day };

            // Continue navigation by prompting user for a genre
            state.prompt = 'genre';
            const genres = await getGenres(state.performanceFilter);
            const msg = createCardMessage(`What genre of music would you like to see on ${day}?`, [], [...genres]);
            await context.sendActivity(msg);
            return;
        } else if (state.prompt === 'genre') {
            // We're expecting a genre
            const genre = context.activity.text;
            state.performanceFilter = { ...state.performanceFilter, genre: genre };

            // Complete navigation by listing shows
            delete state.prompt;
            const shows = await getShows(state.performanceFilter);
            if (shows.length === 0) {
                await context.sendActivity(`I couldn't find any ${state.performanceFilter.genre} shows on ${state.performanceFilter.day}`);
                return;
            }

            // TODO: Description needs to map to this particular band
            const cards = shows.map(s => CardFactory.heroCard(s.bandName, `${s.day}, ${s.startTime} at the ${s.stage} Stage`, [imageUrl(s)], ['Description', 'Main Menu']));
            const msg = MessageFactory.carousel(cards);
            await context.sendActivity(msg);
            return;
        }

        if (["hi", "home", "main menu"].indexOf(lowerText) > -1) {
            delete state.prompt;
            await sendMenu(context);
        } else if (lowerText === 'navigate') {
            // Clear previous filter
            delete state.performanceFilter;

            // Start navigation by prompting user for day
            state.prompt = 'day';
            const days = await getDays();
            const msg = createCardMessage(`What day would you like to see music?`, [], [...days]);
            await context.sendActivity(msg);
        } else {
            // If we don't understand, try QnA Maker
            state.last_user_msg = lowerText;
            await context.sendActivity(`Sorry, I don't understand`);
            await getFeedback(state, context);
        }
    }

    async function respondAfterFeedback(state: MyState, context: TurnContext, resp: string = `Sorry I couldn't help! I'll use your feedback to better answer your questions in the future!`) {
        try {
            delete state.prompt;
            await context.sendActivity(resp);
            await sendMenu(context);
        } catch (error) {
            console.log(JSON.stringify(error, null, 2));
        }
    }

    async function getFeedback(state: MyState, context: TurnContext) {
        state.prompt = 'qna_feedback';
        const card = CardFactory.heroCard('', [], ['Yes', 'No']);
        const msg = MessageFactory.attachment(card, 'Was this the answer you were looking for?')
        await context.sendActivity(msg);
    }

    async function sendMenu(context: TurnContext) {
        const card = CardFactory.heroCard('', [], ['Navigate']);
        const msg = MessageFactory.attachment(card, 'How would you like to explore the event?');
        await context.sendActivity(msg);
    }

    function createCardMessage(text: string, images: (string | CardImage)[], buttons: (string | CardAction)[]) {
        const card = CardFactory.heroCard('', images, buttons);
        const msg = MessageFactory.attachment(card, text);
        return msg;
    }

    function imageUrl(show: Show) {
        return `https://nodeteam1storage.blob.core.windows.net${show.imageUrl.substring(1)}`;
    }
}
import { HandleRequest, HttpRequest, HttpResponse } from '@fermyon/spin-sdk';
import { getSettings } from './utils';

export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface Choice {
	index: number;
	message: Message;
	finish_reason: string;
}

export interface Message {
	role: string;
	content: string;
}

export interface ChatGPTCompletionRequest {
	model: string;
	messages: Message[];
}

export interface ChatGPTCompletionResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	usage: Usage;
	choices: Choice[];
}

const router = utils.Router();
let decoder = new TextDecoder();

router.get('/roll/:dice', async req => {
	let diceToRoll = req.params['dice'].toLowerCase();
	let settings = await getSettings();

	let promptRequest: ChatGPTCompletionRequest = {
		model: 'gpt-4',
		messages: [
			{
				role: 'system',
				content:
					'You are a dice roller. Generate the results of the dice roll. You understand that "roll a d20" is code for "I need to know a number greater than or equal to one and less than or equal to twenty", and "roll 2d6" is code for "I need to know a number greater than or equal to two and less than or equal to twelve". Provide only the total. If the user asks for more than one dice roll, provide the results for each individual dice roll in the results as well as the sum. Use the format "Results: \nTotal: \n"',
			},
			{
				role: 'user',
				content: diceToRoll.startsWith('d') ? 'Roll a ' + diceToRoll : 'Roll ' + diceToRoll,
			},
		],
	};

	let response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		body: JSON.stringify(promptRequest),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.apiKey}`,
		},
	});

	if (!response.ok) {
		console.log(
			'Error making chat request:',
			response.status,
			response.statusText
		);
		console.log(await response.text());
		return {
			status: 500,
		};
	}

	const completionResponse =
		(await response.json()) as ChatGPTCompletionResponse;

	let message = completionResponse.choices[0].message.content;

	return {
		status: 200,
		body: message,
	};
});

router.post('/assistant', async (_, body) => {
	let prompt = decoder.decode(body);

	let store = spinSdk.kv.openDefault();
	let settings = await getSettings();

	let key = prompt.replace(' ', '-');
	if (store.exists(key)) {
		return {
			status: 200,
			body: store.get(key),
		};
	}

	let promptRequest: ChatGPTCompletionRequest = {
		model: 'gpt-4',
		messages: [
			{
				role: 'system',
				content:
					'You are a helpful assistant. Respond in as few tokens as possible.',
			},
			{
				role: 'user',
				content: prompt,
			},
		],
	};

	let response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		body: JSON.stringify(promptRequest),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.apiKey}`,
		},
	});

	if (!response.ok) {
		console.log(
			'Error making chat request:',
			response.status,
			response.statusText
		);
		console.log(await response.text());
		return {
			status: 500,
		};
	}

	const completionResponse =
		(await response.json()) as ChatGPTCompletionResponse;

	let message = completionResponse.choices[0].message.content;
	store.set(key, message);

	return {
		status: 200,
		body: message,
	};
});

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
	return await router.handleRequest(request, request.body);
};

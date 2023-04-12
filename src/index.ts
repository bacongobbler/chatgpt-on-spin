import { HandleRequest, HttpRequest, HttpResponse } from '@fermyon/spin-sdk'
import { getSettings } from './utils';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface Usage {
  prompt_tokens: number,
  completion_tokens: number,
  total_tokens: number
}

export interface Choice {
  index: number,
  message: Message,
  finish_reason: string,
}

export interface Message {
  role: string,
  content: string,
}

export interface ChatGPTCompletionRequest {
  model: string,
  messages: Message[],
}

export interface ChatGPTCompletionResponse {
  id: string,
  object: string,
  created: number,
  model: string,
  usage: Usage,
  choices: Choice[],
}

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  if (request.method != 'POST') {
    return {
      status: 400,
      body: encoder.encode('this server only supports POST requests').buffer
    }
  }

  let settings = await getSettings();

  let prompt = decoder.decode(request.body)

  console.log('Received prompt:', prompt);

  var promptRequest: ChatGPTCompletionRequest = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.'
      },
      {
        role: 'user',
        content: prompt,
      }
    ]
  }

  var response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    body: new TextEncoder().encode(JSON.stringify(promptRequest)).buffer,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    }
  });

  if (!response.ok) {
    console.log('Error making chat request:', response.status, response.statusText);
    console.log(await response.text());
    return {
      status: 500
    }
  }

  const completionResponse = await response.json() as ChatGPTCompletionResponse;

  return {
    status: 200,
    body: encoder.encode(completionResponse.choices[0].message.content).buffer
  }
}

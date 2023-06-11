import axios from 'axios';

import {Prompt, PromptOptions} from './Prompt';

export interface GeneratorOptions {
  model: string;
  apiKey: string;
  baseUrl: string;
  execute: (prompt: string) => Promise<string>;
}

export class Generator {
  model: string;
  apiKey: string;
  baseUrl: string;
  execute: (prompt: string) => Promise<string>;

  constructor(options: GeneratorOptions) {
    this.model = options.model;
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.execute = options.execute;
  }

  public prompt<T, U>(options: PromptOptions<T, U>): Prompt<T, U> {
    return new Prompt<T, U>({...options, generator: this});
  }
}

export const DEFAULT_OPENAI_MODEL = 'text-davinci-003';

export function OpenAIGenerator(options: GeneratorOptions) {
  const execute = async (prompt: string) => {
    const url = `https://api.openai.com/v1/completions`;
    const headers = { Authorization: `Bearer ${options.apiKey}`, 'Content-Type': 'application/json' };
    const data = {
      prompt,
      model: options.model || DEFAULT_OPENAI_MODEL,
    };
    
    const response = await axios.post(url, data, {headers});
    
    if (!response.data?.choices?.[0]?.text) {
      throw new Error('Invalid response from OpenAI API');
    }

    return response.data.choices[0].text.trim();
  }

  return new Generator({...options, execute});
}



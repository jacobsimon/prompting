import {Prompt} from '../lib';

describe('Prompt', () => {
  it('should generate a prompt', async () => {
    type AuthorPrompt = {
      name: string;
      num?: number;
    }

    type Book = {
      title: string;
      year: string;
    };

    const prompt = Prompt<AuthorPrompt, Book[]>({})
      .text('List {{num}} books by {{name}}.')
      .defaults({num: 3})
      .schema({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {type: 'string'},
            year: {type: 'string'},
          },
          required: ['title', 'year'],
        },
      }).vars({name: 'George Orwell'});

    expect(prompt.toString()).toEqual(
`List 3 books by George Orwell. Please provide a json response with the following structure:
[
  {
    "title": "string",
    "year": "string"
  }
]`
    );
  });

  it('should throw error when required values are missing', () => {
    type TestPrompt = { value: string };
    type TestResponse = { result: string };
    const prompt = Prompt<TestPrompt, TestResponse>({})
      .text('Hello, {{value}}.')
      .schema({
        type: 'object',
        properties: {
          result: { type: 'string' },
        },
        required: ['result'],
      });
    expect(() => prompt.toString()).toThrow(/missing/i);
  });
});

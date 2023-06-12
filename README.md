# prompting

> *A batteries-included, model-agnostic prompt engineering library for Node.js and TypeScript.*

Build dynamic, reusable prompts that output structured data that's ready to use in your application or API. Compatible with all text-based generative language models such as OpenAI GPT.

## Features

* Intuitive, flexible `Prompt` builder
* Reusable prompt templates with variables
* Validated output in JSON or CSV
* Model-agnostic, extensible generation API
* Serializable to database and files

## Installation

To install `prompting`, use npm:

```bash
npm install prompting
```

## Examples

### Simple example

First, import the Prompt and OpenAIGenerator classes from the library:

```typescript
import {Prompt, OpenAIGenerator} from 'prompting';

const generator = new OpenAIGenerator({ apiKey: 'my_api_key', model: 'gpt-3.5' });

const prompt = Prompt()
  .text('What is your favorite {{topic}}?')
  .withVars({topic: 'animal'});

const result = await generator.execute(prompt.toString());
```

### Using Generator.prompt helper

The `Generator.prompt()` helper can be used to create prompts that are already attached to the generator instance. This is useful for creating reusable prompts that can be used with different variables.

```typescript
import {OpenAIGenerator} from 'prompting';

const gpt = new OpenAIGenerator({ apiKey: 'my_api_key', model: 'gpt-3.5' });

const prompt = gpt.prompt().text('What is your favorite {{topic}}?');

const result = await prompt.generate({topic: 'color'});
```

### Structured JSON data with JSON Schema validation

To output a structured object and validate the result automatically, construct your prompt using the `schema` method. The `Prompt` class leverages the power of JSON Schema and the battle-tested validation library [`ajv`](https://ajv.js.org/) to validate the response.

```typescript
import {OpenAIGenerator} from 'prompting';

const generator = new OpenAIGenerator({apiKey: 'my_api_key', model: 'gpt-3.5'});
const prompt = generator.prompt()
  .text('List {{num}} books by the author {{author}}.')
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
  });

const result = await prompt.generate({author: 'George Orwell'});
```

The `generate` method returns a Promise that resolves to the model's response if it matches the schema, or rejects with an error if the AI's response doesn't match the schema.

## Usage with TypeScript

The library supports strongly typed prompts, arguments, and return types when used with TypeScript. The `Prompt` class can be used with generics to specify the expected arguments and return type.

### Typed Arguments and Response

When creating a new prompt, specify the expected argument and response types by passing them as type parameters to the `Prompt` class. The argument type should be an object whose properties correspond to the variables used in the prompt text. The response type should match the structure defined by the JSON schema.

Here's an example:

```typescript
import {Prompt} from 'prompting';

type BookArgs = {author: string};
type Book = {title: string, year: string};

const prompt = Prompt<BookArgs, Book[]>()
  .text('List books by the author {{author}}.')
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
  });

const result = await prompt.generate({author: 'George Orwell', num: 2});
// => result is of type Book[]
```

In this example, the `generate` method expects an argument of type `BookArgs` and returns a promise that resolves to an array of `Book` objects, or throws an error if the model fails to generate a valid response.

## Prompt API

| Method | Description | Usage
| --- | --- | ---
| `Prompt(options?: PromptOptions)` | Creates a new instance of the Prompt class. | Prompt()
| `text(template: string)` | Sets the text template for the prompt. | prompt.text('What is your favorite {{topic}}?')
| `defaults(defaults: object)` | Sets default values for the variables in the text template. | prompt.defaults({topic: 'animal'})
| `schema(schema: object)` | Sets the JSON schema for validating the generated result. | prompt.schema({type: 'string'})
| `generate(vars?: object)` | Generates the final prompt text by replacing variables in the template, then executes the generator to get the AI response. | prompt.generate({color: 'red'})
| `withVars(vars: object)` | Returns a copy of the Prompt with variables preset but does not generate the result, e.g. in order to call `toString` | prompt.withVars({topic: 'animal'})
| `using(generator: Generator)` | Sets the generator for the prompt so that `generate` can be called. | prompt.using(generator)
| `toString()` | Returns the final prompt text by replacing variables in the template. | prompt.toString()
| `toJSON()` | Returns the prompt as a JSON object, useful for serializing to a file or database. | prompt.toJSON()

### PromptOptions

| Property | Type | Description
| --- | --- | ---
| `text` | string | The text template for the prompt.
| `defaults` | object | Default values for the variables in the text template.
| `schema` | object | The JSON schema for validating the generated result.
| `generator` | Generator | The generator instance to use for executing the prompt.

## Contributing

Contributions to `prompting` are welcome! To contribute, please fork the repository and make your changes, then submit a pull request. Please ensure your code passes the tests before submitting a pull request.

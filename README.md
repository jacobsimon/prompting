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

### Simple text prompt

```typescript
import {Prompt} from 'prompting';

const prompt = Prompt().text('What is your favorite animal?')

console.log(prompt.toString(); // 'What is your favorite animal?'
```

### Using template variables and default values

```typescript
import {Prompt} from 'prompting';

const prompt = Prompt()
  .text('What is your favorite {{topic}}?')
  .defaults({topic: 'animal'});

prompt.toString(); // 'What is your favorite animal?'
prompt.vars({topic: 'color'}).toString(); // 'What is your favorite color?'
```

### Generating prompt responses

The library also contains a flexible `Generator` class for generating responses to a `Prompt`. For convenience, the `Generator.prompt()` method creates a new prompt that is bound to the `Generator` instance and can be invoked by calling `generate()`.

Here's an example using the `OpenAIGenerator`:

```typescript
import {OpenAIGenerator} from 'prompting';

const gpt = new OpenAIGenerator({apiKey: 'my_api_key'});

const prompt = gpt.prompt().text('What is your favorite {{topic}}?');

const result = await prompt.generate({topic: 'color'});
```

The `generate` method returns a Promise that resolves to the model's response for the prompt.

### Structured JSON data with validation

To output a structured object and validate the result automatically, construct your prompt using the `schema` method. The `Prompt` class leverages the power of JSON Schema and the battle-tested validation library [`ajv`](https://ajv.js.org/) to validate the response.

```typescript
const prompt = Prompt()
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

The `generate` method returns a Promise that resolves to the model's response if it matches the schema, or rejects with a validation error if the model's response doesn't match the schema.

## TypeScript Support

The library supports strongly typed prompts, arguments, and return types when used with TypeScript. The `Prompt` class supports generics to specify the expected arguments and return type.

Here's an example:

```typescript
import {Prompt} from 'prompting';

type BookVars = {author: string};
type Book = {title: string, year: string};

const prompt = Prompt<BookVars, Book>()
  .text('What is the most popular book by {{author}}?')
  .schema({
    type: 'object',
    properties: {
      title: {type: 'string'},
      year: {type: 'string'},
    },
    required: ['title', 'year'],
  });

const result: Book = await prompt.generate({author: 'George Orwell'});
```

In this example, the `generate` method takes an argument of type `BookVars` and returns a Promise that resolves to a `Book` object, or rejects with a validation error if the model fails to generate a valid response.

## Prompt API

| Method | Description | Usage
| --- | --- | ---
| `Prompt(options?: PromptOptions)` | Creates a new instance of the Prompt class. | Prompt()
| `text(template: string)` | Sets the text template for the prompt. | prompt.text('What is your favorite {{topic}}?')
| `defaults(defaults: object)` | Sets default values for the variables in the text template. | prompt.defaults({topic: 'animal'})
| `schema(schema: object)` | Sets the JSON schema for validating the generated result. | prompt.schema({type: 'string'})
| `generate(vars?: object)` | Generates the final prompt text by replacing variables in the template, then executes the generator to get the AI response. | prompt.generate({color: 'red'})
| `vars(vars: object)` | Returns a copy of the Prompt with variables preset but does not generate the result, e.g. in order to call `toString` | prompt.vars({topic: 'animal'})
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

Contributions to `prompting` are welcome! To contribute, please fork the repository and make your changes, then submit a pull request.

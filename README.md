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
First, import the `Prompt` class from the library and create a new instance:

```typescript
import {Prompt, Generator} from 'prompting';

const prompt = Prompt('What is your favorite {{topic}}?');

const gpt = Generator.OpenAi({apiKey: 'my_api_key', model: 'gpt-3.5'});

const result = await gpt.generate(prompt, {topic: 'color'});

// => e.g. 'orange'
```

### Structured JSON data
To output a structured object and validate the result, call the `generate` method, passing your prompt and JSON schema as arguments:

```typescript
const gpt = Generator.OpenAi({...});

const prompt = gpt.prompt()
  .text('List {{num}} books by the author {{author}}.')
  .defaultValues({num: 3})
  .schema({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: {type: 'string', description: 'Title of the book'},
        year: {type: 'number', description: 'Year of publication'},
      },
    },
  });

const result = await prompt.generate({author: 'George Orwell', num: 2});

// => [{title: '1984', year: 1942}, {title: 'Animal Farm', year: 1948}]
```

The `generate` method returns a Promise that resolves to the model's response if it matches the schema, or rejects with an error if the AI's response doesn't match the schema or there's an issue with the request.

## Usage with TypeScript

The library supports strongly typed prompts and schemas when used with TypeScript. You can use generics to specify the expected arguments and return type for the prompt's `generate` method:

```typescript
Prompt<IPromptArguments, IPromptResponse> {
  generate(args: IPromptArguments): Promise<IPromptResponse> {
    // ...
  }
}
```

Example usage:

```typescript
type BookArgs = {author: string, num?: number};
type BookResult = {title: string, year: number};

const prompt = Prompt<BookArgs, BookResult[]>()
  .text('List {{num}} books by the author {{author}}.')
  .defaultValues({num: 3})
  .schema({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: {type: 'string', description: 'Title of the book'},
        year: {type: 'number', description: 'Year of publication'},
      },
    },
  });
```

## Schema Documentation

We use a JSON schema format to define the expected structure of the model's response. This documentation explains the fields and possible structures that can be used in the schema. Under the hood, the library uses `ajv`, a battle-tested validation and parsing library.

#### Basic Structure

The schema should be a valid JSON object with the following structure:

```json
{
  "type": "object",
  "properties": {
    // Properties defining the structure of the AI response
  },
  "required": ["propertyA", "propertyB"]
}
```

- **type**: Specifies the type of the object. In most cases, it should be set to `"object"` as the AI response is expected to be an object.
- **properties**: Defines the properties that should be present in the AI response. Each property should have a name and a corresponding schema definition.
- **required**: Specifies the properties that are required in the AI response. It should be an array of property names.

#### Property Definitions

Each property within the `properties` field should follow the schema definition format. Here's an example property definition:

```json
{
  "propertyName": {
    "type": "string",
    "description": "Description of the property"
  }
}
```

- **type**: Specifies the data type of the property. It can be `"string"`, `"number"`, `"boolean"`, `"array"`, or `"object"`. Additional data types may be supported depending on the JSON schema implementation.
- **description** (optional): Provides a description of the property. This is useful for conveying the purpose or expected content of the property.

#### Nested Objects

To define a nested object within the schema, use the `"object"` type:

```json
{
  "nestedObject": {
    "type": "object",
    "properties": {
      // Properties defining the structure of the nested object
    },
    "required": ["property1", "property2"]
  }
}
```

You can nest objects to any depth by defining properties within the nested object's `"properties"` field.

#### Arrays

To define an array within the schema, use the `"array"` type:

```json
{
  "arrayProperty": {
    "type": "array",
    "items": {
      // Schema definition for the items in the array
    }
  }
}
```

- **items**: Defines the schema for the items within the array. It can be a single schema definition or an array of schema definitions if the array contains different types of items.

#### Examples

Here are a few examples to illustrate different schema structures:

##### Example 1: Simple Object

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the object"
    },
    "age": {
      "type": "number",
      "description": "Age of the object"
    }
  },
  "required": ["name"]
}
```

##### Example 2: Nested Object

```json
{
  "type": "object",
  "properties": {
    "person": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Name of the person"
        },
        "age": {
          "type": "number",
          "description": "Age of the person"
        }
      },
      "required": ["name"]
    }
  },
  "required": ["person"]
}
```

##### Example 3: Array of Objects

```json
{
  "type": "object",
  "properties": {


    "books": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Title of the book"
          },
          "author": {
            "type": "string",
            "description": "Author of the book"
          }
        },
        "required": ["title", "author"]
      }
    }
  },
  "required": ["books"]
}
```

## Development

To develop `prompting`, you'll need Node.js and npm. First, install the dependencies:

```bash
npm install
```

You can then compile the TypeScript code to JavaScript using the `build` script:

```bash
npm run build
```

To run the tests, use the `test` script:

```bash
npm run test
```

## Contributing

Contributions to `prompting` are welcome! To contribute, please fork the repository and make your changes, then submit a pull request. Please ensure your code passes the tests before submitting a pull request.

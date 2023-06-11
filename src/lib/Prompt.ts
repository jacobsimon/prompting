import Ajv, {JTDSchemaType, JTDParser} from "ajv/dist/jtd"

import {Generator} from './Generator';

export type PromptOptions<T, U> = {
  generator?: Generator,
  text?: string,
  schema?: JTDSchemaType<U>,
  defaults?: Partial<T>,
  format?: string,
};

export class Prompt<T, U> {
  private _text?: string;
  private _defaults: Partial<T>;
  private _schema?: JTDSchemaType<U>;
  private _vars?: T;
  private _generator?: Generator;
  private _parser?: JTDParser<U>;
  private _format?: string;

  constructor(options: PromptOptions<T, U> = {}) {
    this._generator = options.generator;
    this._text = options.text;
    this._defaults = options.defaults || {};
    this._schema = options.schema;
    this._format = options.format || 'json';

    if (options.schema) {
      this._parser = new Ajv().compileParser(options.schema);
    }
  }

  private describeSchema(
    schema: any = this._schema,
    indent: string = '',
  ): string {
    let description = '';
    const props = (schema || this._schema).properties || {};
    for (const key in props) {
      description += `\n${indent}- ${key} (${props[key].type}): "${props[key].description}"`;
      if (props[key].type === 'object') {
        description += this.describeSchema(props[key], indent + '  ');
      }
    }
    return description;
  }

  private resolvePrompt(vars?: Partial<T>): string {
    let prompt = this._text || '';

    // Replace template variables with provided arguments or default values
    const allVars = {...this._defaults, ...(vars || this._vars)};
    for (const [key, value] of Object.entries(allVars)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      prompt = prompt.replace(regex, value as string);
    }

    // Check for any remaining template variables that were not replaced
    const unboundVars = prompt.match(/{{\s*[\w]+\s*}}/g);
    if (unboundVars) {
      throw new Error(`Missing template variables or default values: ${unboundVars.join(', ')}`);
    }

    if (this._schema) {
      prompt += `\n\Please respond with valid ${this._format} data with the following format:\n`;
      prompt += this.describeSchema();
    }

    return prompt;
  }

  public defaults(values: Partial<T>): Prompt<T, U> {
    this._defaults = values;
    return this;
  }

  public schema(schema: JTDSchemaType<U>): Prompt<T, U> {
    this._schema = schema;
    this._parser = new Ajv().compileParser(schema);
    return this;
  }

  public async generate(vars: T): Promise<U> {
    if (!this._generator) {
      throw new Error('No generator was provided yet. Use prompt.using(generator) to set a generator or use Generator.prompt() to create new prompts.');
    }

    const prompt = this.resolvePrompt(vars);
    const generatedText = await this._generator.execute(prompt);
  
    if (this._schema && this._parser) {
      const data = this._parser(generatedText);

      if (!data) {
        throw new Error(`Response did not match the expected format: ${this._parser.message}`);
      }

      return data;
    }

    // Return string type if no schema is provided
    return generatedText as U;
  }

  public withVars(vars: T): Prompt<T, U> {
    const newPrompt = new Prompt<T, U>({...this.toJSON()});
    newPrompt._vars = vars;
    return newPrompt;
  }

  public using(generator: Generator): Prompt<T, U> {
    this._generator = generator;
    return this;
  }

  public toString(): string {
    return this.resolvePrompt();
  }

  public toJSON(): PromptOptions<T, U> {
    return {
      text: this._text,
      defaults: this._defaults,
      schema: this._schema,
    };
  }

  public static fromJSON<T, U>(
    data: PromptOptions<T, U>,
    generator: Generator,
  ): Prompt<T, U> {
    return new Prompt<T, U>({...data}).using(generator);
  }
}



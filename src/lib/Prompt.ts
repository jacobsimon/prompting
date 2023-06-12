import Ajv, {JSONSchemaType, ValidateFunction} from 'ajv';

import {Generator} from './Generator';

export type PromptOptions<T, U> = {
  generator?: Generator,
  text?: string,
  schema?: JSONSchemaType<U>,
  defaults?: Partial<T>,
  format?: string,
};

export class PromptClass<T, U> {
  private _text?: string;
  private _defaults: Partial<T>;
  private _schema?: JSONSchemaType<U>;
  private _vars?: T;
  private _generator?: Generator;
  private _validator?: ValidateFunction;
  private _format?: string;

  constructor(options: PromptOptions<T, U> = {}) {
    this._generator = options.generator;
    this._text = options.text;
    this._defaults = options.defaults || {};
    this._schema = options.schema;
    this._format = options.format || 'json';

    if (options.schema) {
      this._validator = new Ajv().compile(options.schema);
    }
  }

  private describeSchema(schema: any = this._schema): any {
    if (!schema) return 'undefined';

    switch (schema.type) {
      case 'object': {
        const props: any = {};

        for (const key in schema.properties) {
          props[key] = this.describeSchema(schema.properties[key]);
        }

        return props;
      }
      case 'array': {
        const itemSchema = schema.items;
        return itemSchema.type === "object"
          ? [this.describeSchema(itemSchema)]
          : [itemSchema.type];
      }
      default:
        return schema.type;
    }
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
      prompt += ` Please provide a ${this._format} response with the following structure:\n`;
      prompt += JSON.stringify(this.describeSchema(), null, 2);
    }

    return prompt;
  }

  private validate(data: unknown): data is U {
    if (!this._validator) {
      throw new Error('No validator set up.');
    }
    const valid = this._validator(data);
    if (!valid) {
      throw new Error(`Invalid data: ${this._validator.errors?.map(err => err.message).join(', ')}`);
    }
    return true;
  }

  public text(text: string): PromptClass<T, U> {
    this._text = text;
    return this;
  }

  public defaults(values: Partial<T>): PromptClass<T, U> {
    this._defaults = values;
    return this;
  }

  public schema(schema: JSONSchemaType<U>): PromptClass<T, U> {
    this._schema = schema;
    this._validator = new Ajv().compile(schema);
    return this;
  }

  public async generate(vars?: T): Promise<U> {
    if (!this._generator) {
      throw new Error('No generator was provided yet. Use prompt.using(generator) to set a generator or use Generator.prompt() to create new prompts.');
    }

    const prompt = this.resolvePrompt(vars);
    const generatedText = await this._generator.execute(prompt);
  
    if (this._schema && this._validator) {
      const data: unknown = JSON.parse(generatedText);
      if (this.validate(data)) {
        return data;
      }
    }

    // Return string type if no schema is provided
    return generatedText as U;
  }

  public vars(vars: T): PromptClass<T, U> {
    const newPrompt = new PromptClass<T, U>({...this.toJSON()});
    newPrompt._vars = vars;
    return newPrompt;
  }

  public using(generator: Generator): PromptClass<T, U> {
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
  ): PromptClass<T, U> {
    return new PromptClass<T, U>({...data}).using(generator);
  }
}

export function Prompt<T, U>(options?: PromptOptions<T, U>): PromptClass<T, U> {
  return new PromptClass<T, U>(options);
}

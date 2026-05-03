export interface ParameterModel {
  name: string;
  type: string;
}

export interface PropertyModel {
  name: string;
  type: string;
  optional: boolean;
  readonly: boolean;
  visibility: string;
  static: boolean;
}

export interface FunctionModel {
  name: string;
  kind: 'function' | 'method' | 'constructor' | 'component';
  exported: boolean;
  async: boolean;
  static: boolean;
  visibility: string;
  returnType: string;
  parameters: ParameterModel[];
  bodyText?: string;
  jsxLike: boolean;
  pseudocode?: string[];
}

export interface TypeModel {
  name: string;
  kind: 'class' | 'interface' | 'enum' | 'typeAlias';
  exported: boolean;
  extends: string[];
  implements: string[];
  properties: PropertyModel[];
  methods: FunctionModel[];
  members?: string[];
  targetType?: string;
}

export interface SourceModel {
  sourcePath: string;
  fileName: string;
  relativePath: string;
  imports: string[];
  referencedFiles: string[];
  types: TypeModel[];
  functions: FunctionModel[];
  notes: string[];
}

export interface PipelineOptions {
  inputPath: string;
  outputRoot: string;
  tsconfigPath?: string;
  useTsUml2: 'auto' | 'always' | 'never';
  command: 'full' | 'analyze' | 'generate-rust';
}

import path from 'node:path';
import { Node, Project, ScriptKind, SyntaxKind, ts, type Expression, type SourceFile } from 'ts-morph';
import { buildFunctionPseudocode } from './pseudocode.js';
import type { FunctionModel, ParameterModel, PropertyModel, SourceModel, TypeModel } from './types.js';

export function createProject(tsconfigPath?: string): Project {
  if (tsconfigPath) {
    return new Project({ tsConfigFilePath: tsconfigPath, skipAddingFilesFromTsConfig: false });
  }
  return new Project({
    compilerOptions: {
      allowJs: false,
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: false
    },
    skipFileDependencyResolution: false,
    useInMemoryFileSystem: false
  });
}

export function addSourceFiles(project: Project, files: string[]): void {
  for (const file of files) {
    project.addSourceFileAtPathIfExists(file) ??
      project.createSourceFile(file, '', { scriptKind: file.endsWith('.tsx') ? ScriptKind.TSX : ScriptKind.TS, overwrite: false });
  }
}

export function extractSourceModel(sourceFile: SourceFile, inputRoot: string): SourceModel {
  const classes = sourceFile.getClasses().map((c) => toTypeModelClass(c));
  const interfaces = sourceFile.getInterfaces().map((i) => toTypeModelInterface(i));
  const enums = sourceFile.getEnums().map((e) => toTypeModelEnum(e));
  const typeAliases = sourceFile.getTypeAliases().map((t) => toTypeModelAlias(t));

  const topLevelFunctions = sourceFile.getFunctions().map((fn) => toFunctionModel(fn, 'function'));
  const variableFunctions = sourceFile
    .getVariableDeclarations()
    .flatMap((decl) => {
      const init = decl.getInitializer();
      if (!init) return [];
      if (Node.isArrowFunction(init) || Node.isFunctionExpression(init)) {
        return [toVariableFunctionModel(decl.getName(), init, decl.isExported())];
      }
      return [];
    });

  return {
    sourcePath: sourceFile.getFilePath(),
    fileName: sourceFile.getBaseName(),
    relativePath: path.relative(path.resolve(inputRoot), sourceFile.getFilePath()).split(path.sep).join('/'),
    imports: sourceFile.getImportDeclarations().map((decl) => decl.getModuleSpecifierValue()),
    referencedFiles: sourceFile.getReferencedSourceFiles().map((sf) => sf.getFilePath()),
    types: [...classes, ...interfaces, ...enums, ...typeAliases],
    functions: [...topLevelFunctions, ...variableFunctions],
    notes: collectNotes(sourceFile)
  };
}

function collectNotes(sourceFile: SourceFile): string[] {
  const notes: string[] = [];
  if (sourceFile.getBaseName().endsWith('.tsx')) {
    notes.push('TSX input detected; UI rendering logic may require a Rust UI framework target instead of direct translation.');
  }
  if (sourceFile.getImportDeclarations().some((decl) => decl.getModuleSpecifierValue().includes('react'))) {
    notes.push('React import detected. Consider Dioxus, Yew, or Leptos as the explicit Rust UI target.');
  }
  return notes;
}

function toTypeModelClass(cls: ReturnType<SourceFile['getClasses']>[number]): TypeModel {
  return {
    name: cls.getName() ?? 'AnonymousClass',
    kind: 'class',
    exported: cls.isExported(),
    extends: cls.getExtends()?.getText() ? [cls.getExtends()!.getText()] : [],
    implements: cls.getImplements().map((imp) => imp.getText()),
    properties: cls.getProperties().map(toPropertyModel),
    methods: [
      ...cls.getConstructors().map((ctor) => toFunctionModel(ctor, 'constructor')),
      ...cls.getMethods().map((method) => toFunctionModel(method, 'method'))
    ],
    members: undefined,
    targetType: undefined
  };
}

function toTypeModelInterface(intf: ReturnType<SourceFile['getInterfaces']>[number]): TypeModel {
  return {
    name: intf.getName(),
    kind: 'interface',
    exported: intf.isExported(),
    extends: intf.getExtends().map((e) => e.getText()),
    implements: [],
    properties: intf.getProperties().map((prop) => ({
      name: prop.getName(),
      type: prop.getTypeNode()?.getText() ?? prop.getType().getText(prop),
      optional: prop.hasQuestionToken(),
      readonly: prop.isReadonly(),
      visibility: 'public',
      static: false
    })),
    methods: intf.getMethods().map((method) => ({
      name: method.getName(),
      kind: 'method',
      exported: intf.isExported(),
      async: false,
      static: false,
      visibility: 'public',
      returnType: method.getReturnTypeNode()?.getText() ?? method.getReturnType().getText(method),
      parameters: method.getParameters().map(toParameterModel),
      bodyText: undefined,
      jsxLike: false,
      pseudocode: ['// interface signature only']
    })),
    members: undefined,
    targetType: undefined
  };
}

function toTypeModelEnum(en: ReturnType<SourceFile['getEnums']>[number]): TypeModel {
  return {
    name: en.getName(),
    kind: 'enum',
    exported: en.isExported(),
    extends: [],
    implements: [],
    properties: [],
    methods: [],
    members: en.getMembers().map((member) => member.getName()),
    targetType: undefined
  };
}

function toTypeModelAlias(alias: ReturnType<SourceFile['getTypeAliases']>[number]): TypeModel {
  return {
    name: alias.getName(),
    kind: 'typeAlias',
    exported: alias.isExported(),
    extends: [],
    implements: [],
    properties: [],
    methods: [],
    members: undefined,
    targetType: alias.getTypeNode()?.getText() ?? alias.getType().getText(alias)
  };
}

function toPropertyModel(prop: ReturnType<ReturnType<SourceFile['getClasses']>[number]['getProperties']>[number]): PropertyModel {
  return {
    name: prop.getName(),
    type: prop.getTypeNode()?.getText() ?? prop.getType().getText(prop),
    optional: prop.hasQuestionToken(),
    readonly: prop.isReadonly(),
    visibility: prop.getScope() ?? 'public',
    static: prop.isStatic()
  };
}

function toParameterModel(param: { getName(): string; getTypeNode(): { getText(): string } | undefined; getType(): { getText(node?: Node): string }; hasQuestionToken(): boolean }): ParameterModel {
  const typeText = param.getTypeNode()?.getText() ?? param.getType().getText();
  return {
    name: param.getName() + (param.hasQuestionToken() ? '?' : ''),
    type: typeText
  };
}

function toFunctionModel(fn: any, kind: FunctionModel['kind']): FunctionModel {
  const bodyText = typeof fn.getBodyText === 'function' ? fn.getBodyText() ?? undefined : undefined;
  const jsxLike = bodyText?.includes('<') ?? false;
  return {
    name: kind === 'constructor' ? 'new' : fn.getName?.() ?? 'anonymous',
    kind,
    exported: typeof fn.isExported === 'function' ? fn.isExported() : false,
    async: typeof fn.isAsync === 'function' ? fn.isAsync() : false,
    static: typeof fn.isStatic === 'function' ? fn.isStatic() : false,
    visibility: typeof fn.getScope === 'function' ? fn.getScope() ?? 'public' : 'public',
    returnType: kind === 'constructor' ? 'self' : fn.getReturnTypeNode?.()?.getText() ?? fn.getReturnType?.().getText(fn) ?? 'void',
    parameters: fn.getParameters().map((param: any) => toParameterModel(param)),
    bodyText,
    jsxLike,
    pseudocode: typeof fn.getBody === 'function' ? buildFunctionPseudocode(fn) : undefined
  };
}

function toVariableFunctionModel(name: string, fn: Expression, exported: boolean): FunctionModel {
  const isComponent = /^[A-Z]/.test(name) || fn.getText().includes('<');
  const bodyText = (Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)) ? fn.getBodyText() ?? undefined : undefined;
  return {
    name,
    kind: isComponent ? 'component' : 'function',
    exported,
    async: 'isAsync' in fn && typeof fn.isAsync === 'function' ? fn.isAsync() : false,
    static: false,
    visibility: 'public',
    returnType: 'getReturnType' in fn && typeof fn.getReturnType === 'function' ? fn.getReturnType().getText(fn) : 'unknown',
    parameters: 'getParameters' in fn && typeof fn.getParameters === 'function' ? fn.getParameters().map((param: any) => toParameterModel(param)) : [],
    bodyText,
    jsxLike: bodyText?.includes('<') ?? false,
    pseudocode: (Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)) ? buildFunctionPseudocode(fn as any) : undefined
  };
}

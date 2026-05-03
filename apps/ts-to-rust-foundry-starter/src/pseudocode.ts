import { Node, SyntaxKind, type Statement, type FunctionLikeDeclarationBase } from 'ts-morph';

export function buildFunctionPseudocode(fn: FunctionLikeDeclarationBase): string[] {
  const body = fn.getBody();
  if (!body || !Node.isBlock(body)) {
    const bodyText = fn.getBodyText()?.trim();
    return bodyText ? [`return ${normalize(bodyText)}`] : ['// no body'];
  }
  const lines: string[] = [];
  for (const statement of body.getStatements()) {
    lines.push(...statementToLines(statement, 0));
  }
  return lines.length > 0 ? lines : ['// empty body'];
}

function statementToLines(statement: Statement, depth: number): string[] {
  const indent = '  '.repeat(depth);
  if (Node.isVariableStatement(statement)) {
    return statement.getDeclarations().map((decl) => {
      const name = decl.getName();
      const init = decl.getInitializer()?.getText() ?? 'undefined';
      return `${indent}let ${name} = ${normalize(init)}`;
    });
  }
  if (Node.isExpressionStatement(statement)) {
    return [`${indent}${normalize(statement.getExpression().getText())}`];
  }
  if (Node.isReturnStatement(statement)) {
    return [`${indent}return ${normalize(statement.getExpression()?.getText() ?? '')}`.trimEnd()];
  }
  if (Node.isThrowStatement(statement)) {
    return [`${indent}throw ${normalize(statement.getExpression()?.getText() ?? '')}`.trimEnd()];
  }
  if (Node.isIfStatement(statement)) {
    const lines = [`${indent}if ${normalize(statement.getExpression().getText())}`];
    lines.push(...childToLines(statement.getThenStatement(), depth + 1));
    const elseStmt = statement.getElseStatement();
    if (elseStmt) {
      lines.push(`${indent}else`);
      lines.push(...childToLines(elseStmt, depth + 1));
    }
    lines.push(`${indent}end if`);
    return lines;
  }
  if (Node.isForStatement(statement)) {
    return [
      `${indent}for (${normalize(statement.getInitializer()?.getText() ?? '')}; ${normalize(statement.getCondition()?.getText() ?? '')}; ${normalize(statement.getIncrementor()?.getText() ?? '')})`,
      ...childToLines(statement.getStatement(), depth + 1),
      `${indent}end for`
    ];
  }
  if (Node.isForOfStatement(statement)) {
    return [
      `${indent}for each ${normalize(statement.getInitializer().getText())} in ${normalize(statement.getExpression().getText())}`,
      ...childToLines(statement.getStatement(), depth + 1),
      `${indent}end for`
    ];
  }
  if (Node.isForInStatement(statement)) {
    return [
      `${indent}for each key ${normalize(statement.getInitializer().getText())} in ${normalize(statement.getExpression().getText())}`,
      ...childToLines(statement.getStatement(), depth + 1),
      `${indent}end for`
    ];
  }
  if (Node.isWhileStatement(statement)) {
    return [
      `${indent}while ${normalize(statement.getExpression().getText())}`,
      ...childToLines(statement.getStatement(), depth + 1),
      `${indent}end while`
    ];
  }
  if (Node.isSwitchStatement(statement)) {
    const lines = [`${indent}switch ${normalize(statement.getExpression().getText())}`];
    for (const clause of statement.getCaseBlock().getClauses()) {
      if (Node.isCaseClause(clause)) {
        lines.push(`${indent}  case ${normalize(clause.getExpression().getText())}`);
      } else {
        lines.push(`${indent}  default`);
      }
      for (const child of clause.getStatements()) {
        lines.push(...statementToLines(child, depth + 2));
      }
    }
    lines.push(`${indent}end switch`);
    return lines;
  }
  if (Node.isTryStatement(statement)) {
    const lines = [`${indent}try`];
    lines.push(...childToLines(statement.getTryBlock(), depth + 1));
    const catchClause = statement.getCatchClause();
    if (catchClause) {
      lines.push(`${indent}catch ${catchClause.getVariableDeclaration()?.getName() ?? ''}`.trimEnd());
      lines.push(...childToLines(catchClause.getBlock(), depth + 1));
    }
    const finallyBlock = statement.getFinallyBlock();
    if (finallyBlock) {
      lines.push(`${indent}finally`);
      lines.push(...childToLines(finallyBlock, depth + 1));
    }
    lines.push(`${indent}end try`);
    return lines;
  }
  if (statement.getKind() === SyntaxKind.BreakStatement) {
    return [`${indent}break`];
  }
  if (statement.getKind() === SyntaxKind.ContinueStatement) {
    return [`${indent}continue`];
  }
  return [`${indent}// ${statement.getKindName()}: ${normalize(statement.getText())}`];
}

function childToLines(node: Node, depth: number): string[] {
  if (Node.isBlock(node)) {
    return node.getStatements().flatMap((statement) => statementToLines(statement, depth));
  }
  if (Node.isStatement(node)) {
    return statementToLines(node, depth);
  }
  return [`${'  '.repeat(depth)}${normalize(node.getText())}`];
}

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

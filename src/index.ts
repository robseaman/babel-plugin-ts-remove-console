import * as t from '@babel/types';
import * as babel from '@babel/core';
import { Visitor, NodePath } from '@babel/traverse';

type Options = { exclude?: { name: string }[] };

export interface PluginOptions {
  opts: Options;
}

export interface Babel {
  types: typeof t;
  version: string; // babel version
  /**
   * ...etc...
   * transform: (code, opts, callback) => void;
   * traverse: (...) => void;
   */
}

// help functions

const isIdWithNameGlobal = (name: string, id: NodePath): boolean => {
  return (
    id.isIdentifier({ name }) &&
    !id.scope.getBinding(name) &&
    id.scope.hasGlobal(name)
  );
};

const isNameInArray = (
  property: NodePath,
  array?: { name: string }[],
): boolean => {
  return !!(array && array.some((name) => property.isIdentifier({ name })));
};

const createNoop = (): t.FunctionExpression => {
  return t.functionExpression(null, [], t.blockStatement([]));
};

const createVoid0 = (): t.UnaryExpression => {
  return t.unaryExpression('void', t.numericLiteral(0));
};

const isIncludedConsole = (
  memberExpr: NodePath<t.MemberExpression>,
  excludeArray?: { name: string }[],
): boolean => {
  const object = memberExpr.get('object') as NodePath;
  const property = memberExpr.get('property') as NodePath;

  if (isNameInArray(property, excludeArray)) return false;

  if (isIdWithNameGlobal('console', object)) return true;

  return (
    isIdWithNameGlobal('console', object.get('object') as NodePath) &&
    (property.isIdentifier({ name: 'call' }) ||
      property.isIdentifier({ name: 'apply' }))
  );
};

const isIncludedConsoleBind = (
  memberExpr: NodePath<t.MemberExpression>,
  excludeArray?: { name: string }[],
): boolean => {
  const object = memberExpr.get('object') as NodePath;

  if (!object.isMemberExpression()) return false;
  if (isNameInArray(object.get('property') as NodePath, excludeArray))
    return false;

  return (
    isIdWithNameGlobal('console', object.get('object') as NodePath) &&
    (memberExpr.get('property') as NodePath).isIdentifier({ name: 'bind' })
  );
};

// called in context of PluginPass
export default function transformRemoveLogger(
  babelObj: Babel,
  opts: Options,
  pluginFilename: string,
): babel.PluginObj<PluginOptions> {
  const removeConsole: Visitor<PluginOptions> = {
    CallExpression(path, state): void {
      const callee = path.get('callee') as NodePath<t.MemberExpression>;

      if (!callee.isMemberExpression()) return;

      if (isIncludedConsole(callee, state.opts.exclude)) {
        // console.log()
        if (path.parentPath.isExpressionStatement()) {
          path.remove();
        } else {
          // replacing MemberExpression with UnaryExpression (void 0)
          path.replaceWith(createVoid0());
        }
      } else if (isIncludedConsoleBind(callee, state.opts.exclude)) {
        // console.log.bind()
        path.replaceWith(createNoop());
      }
    },
    MemberExpression: {
      exit(path, state): void {
        if (
          isIncludedConsole(
            path as NodePath<t.MemberExpression>,
            state.opts.exclude,
          ) &&
          !path.parentPath.isMemberExpression()
        ) {
          if (
            path.parentPath.isAssignmentExpression() &&
            path.parentKey === 'left'
          ) {
            (path.parentPath.get('right') as NodePath<
              t.AssignmentExpression
            >).replaceWith(createNoop());
          } else {
            path.replaceWith(createNoop());
          }
        }
      },
    },
  };

  return {
    name: 'ts-remove-console',
    visitor: removeConsole,
  };
}

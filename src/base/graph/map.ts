import { type Node } from './types';

export function map<T, O>(
  node: Node<T>,
  f: (node: Node<T>, path: readonly Node<T>[], indices: readonly number[]) => O,
): readonly O[] {
  return mapInternal(node, f);
}

function mapInternal<T, O>(
  node: Node<T>,
  f: (node: Node<T>, path: readonly Node<T>[], indices: readonly number[]) => O,
  path: readonly Node<T>[] = [],
  indices: readonly number[] = [],
): readonly O[] {
  if (path.some(step => step === node)) {
    return [];
  }
  const result = f(node, path, indices);
  const newPath = path.concat([node]);
  return [
    result,
    ...node.connections.flatMap((connection, index) => {
      return mapInternal(connection, f, newPath, indices.concat([index]));
    }),
  ];
}

export interface TreeNode {
  key: string;
  type: string;
  props: Record<string, unknown>;
  children: TreeNode[];
}

export type Patch =
  | { op: 'insert'; key: string; node: TreeNode }
  | { op: 'delete'; key: string }
  | { op: 'update'; key: string; props: Record<string, unknown> }
  | { op: 'move'; key: string; toIndex: number };

/** Convenience builder */
export function node(
  key: string,
  type: string,
  props: Record<string, unknown> = {},
  children: TreeNode[] = [],
): TreeNode {
  return { key, type, props, children };
}

import type {
  SblFileNodeAssert,
  SblFolderNodeAssert,
  SblNode,
} from '@simple-b2-list/types';

export function path2Segments(path: string) {
  const temp = path.split('/');
  return temp[temp.length - 1] === '' ? temp.slice(0, -1) : temp;
}

export function calcCurrentFolderNode(
  rootNode: SblFolderNodeAssert,
  path: string,
) {
  const segments = path2Segments(path);
  let currentNode = rootNode;
  for (const segment of segments) {
    if (!('children' in currentNode)) return undefined;
    const result = currentNode.children.find(
      (child) => 'children' in child && child.name === segment,
    ) as SblFolderNodeAssert | undefined;
    if (result === undefined) return undefined;
    currentNode = result;
  }
  currentNode.children = currentNode.children.filter(
    (child) => child.name !== '.bzEmpty',
  );
  currentNode.children.sort((a, b) => {
    if (!('children' in a) && !('children' in b))
      return a.name.localeCompare(b.name);
    if ('children' in a && 'children' in b) return a.name.localeCompare(b.name);
    if ('children' in a) return -1;
    return 1;
  });
  return currentNode;
}

export function calcCurrentFileNode(rootNode: SblNode, path: string) {
  const segments = path2Segments(path);
  let currentNode = rootNode;
  for (const segment of segments.slice(0, segments.length - 1)) {
    if (!('children' in currentNode)) return undefined;
    const result = currentNode.children.find(
      (child) => 'children' in child && child.name === segment,
    );
    if (result === undefined) return undefined;
    currentNode = result;
  }

  if (!('children' in currentNode)) return undefined;
  const result = currentNode.children.find(
    (child) =>
      !('children' in child) && child.name === segments[segments.length - 1],
  );
  if (result === undefined) return undefined;
  currentNode = result;

  return currentNode as SblFileNodeAssert;
}

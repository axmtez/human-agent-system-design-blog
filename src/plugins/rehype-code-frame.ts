import { visit } from 'unist-util-visit';

export function rehypeCodeFrame() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: any, parent: any) => {
      if (node.tagName !== 'pre' || index == null || !parent) return;

      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-packet'] },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-packet__header', 'sys'] },
            children: [{ type: 'text', value: '// DATA' }],
          },
          node,
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-packet__rule'] },
            children: [],
          },
        ],
      };

      parent.children.splice(index, 1, wrapper);
      return index + 1;
    });
  };
}

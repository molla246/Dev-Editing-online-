/**
 * Utility function to extract formatted text from HTML content,
 * excluding <img> tags while preserving exact line breaks, indentation,
 * and code layout without line expansion or extra blank lines.
 */
export const extractFormattedText = (htmlContent: string): string => {
  if (!htmlContent) return '';

  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;

  // 1. Remove all <img> tags
  temp.querySelectorAll('img').forEach((img) => img.remove());

  // 2. Recursive helper to extract text without creating duplicate blank lines
  const getNodeText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'br') {
        return '\n';
      }

      let childText = '';
      node.childNodes.forEach((child) => {
        childText += getNodeText(child);
      });

      // For block-level elements, ensure it ends with a single newline if not already ending with one
      const isBlock = /^(div|p|li|tr|pre|blockquote|h1|h2|h3|h4|h5|h6)$/.test(tagName);
      if (isBlock && childText) {
        if (!childText.endsWith('\n')) {
          childText += '\n';
        }
      }

      return childText;
    }

    return '';
  };

  let text = getNodeText(temp);

  // 3. Clean up lingering markdown image syntax or raw base64 data URLs
  text = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/data:image\/[a-zA-Z]+;base64,[^\s"']+/g, '')
    .replace(/\r\n/g, '\n');

  return text.trim();
};


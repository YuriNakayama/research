/**
 * Bridge between DOM Selection/Range objects and the plain-text offsets the
 * anchor resolver works in.
 *
 * The rendered article is a React element tree, so there is no single text
 * node to index into. These helpers walk the container's text nodes in document
 * order, which yields the same string the resolver sees.
 */

/** Text nodes of `root` in document order, skipping non-rendered subtrees. */
function textNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      // Ignore UI chrome injected into the article (note buttons, copy
      // buttons) so offsets track the document's own prose.
      if (parent.closest("[data-notes-ignore]")) {
        return NodeFilter.FILTER_REJECT;
      }
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE") {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n as Text);
  }
  return nodes;
}

/** The full text of `root`, matching the offsets the other helpers return. */
export function getDocumentText(root: HTMLElement): string {
  return textNodes(root)
    .map((n) => n.data)
    .join("");
}

/**
 * Convert a DOM Range into text offsets within `root`.
 * Returns null when the range lies outside `root`.
 */
export function rangeToOffsets(
  root: HTMLElement,
  range: Range,
): { start: number; end: number } | null {
  let offset = 0;
  let start: number | null = null;
  let end: number | null = null;

  for (const node of textNodes(root)) {
    if (node === range.startContainer) {
      start = offset + range.startOffset;
    }
    if (node === range.endContainer) {
      end = offset + range.endOffset;
    }
    offset += node.data.length;
  }

  if (start === null || end === null || start >= end) {
    return null;
  }
  return { start, end };
}

/**
 * Convert text offsets back into a DOM Range within `root`.
 * Returns null when the offsets fall outside the available text.
 */
export function offsetsToRange(
  root: HTMLElement,
  start: number,
  end: number,
): Range | null {
  let offset = 0;
  let startNode: Text | null = null;
  let startInner = 0;
  let endNode: Text | null = null;
  let endInner = 0;

  for (const node of textNodes(root)) {
    const nodeEnd = offset + node.data.length;
    if (startNode === null && start < nodeEnd) {
      startNode = node;
      startInner = start - offset;
    }
    if (end <= nodeEnd) {
      endNode = node;
      endInner = end - offset;
      break;
    }
    offset = nodeEnd;
  }

  if (!startNode || !endNode) {
    return null;
  }
  const range = document.createRange();
  try {
    range.setStart(startNode, Math.max(0, startInner));
    range.setEnd(endNode, Math.min(endNode.data.length, endInner));
  } catch {
    return null;
  }
  return range;
}

/**
 * The id of the heading section a range falls under.
 *
 * Walks backwards through preceding elements to find the nearest heading with
 * an id, which narrows anchor resolution to the right section.
 */
export function findEnclosingHeadingId(
  root: HTMLElement,
  range: Range,
): string | undefined {
  const startEl =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  if (!startEl) return undefined;

  const headings = Array.from(
    root.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id], h5[id], h6[id]"),
  );
  let found: string | undefined;
  for (const heading of headings) {
    // DOCUMENT_POSITION_FOLLOWING: the heading comes after our start point, so
    // the previous one encloses it.
    const position = heading.compareDocumentPosition(startEl);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      found = heading.id;
    } else {
      break;
    }
  }
  return found;
}

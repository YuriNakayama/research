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
  const nodes = textNodes(root);

  // Browsers may report a boundary as an element plus a child index (double
  // click, cross-paragraph drags, selectAllChildren). Comparing only against
  // text nodes would miss those and silently drop the selection, so fall back
  // to boundary comparison against each text node.
  const boundaryOffset = (
    container: Node,
    containerOffset: number,
    isStart: boolean,
  ): number | null => {
    if (container.nodeType === Node.TEXT_NODE) {
      let offset = 0;
      for (const node of nodes) {
        if (node === container) return offset + containerOffset;
        offset += node.data.length;
      }
      return null;
    }

    const probe = document.createRange();
    try {
      probe.setStart(container, containerOffset);
    } catch {
      return null;
    }
    let offset = 0;
    for (const node of nodes) {
      // START_TO_START < 0 means the boundary precedes this text node, so the
      // boundary sits at this node's start (or, for an end boundary, at the
      // end of everything before it).
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);
      if (probe.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0) {
        return offset;
      }
      if (probe.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0) {
        return offset + node.data.length;
      }
      offset += node.data.length;
    }
    // Past every text node: clamp to the end for an end boundary.
    return isStart ? null : offset;
  };

  const start = boundaryOffset(range.startContainer, range.startOffset, true);
  const end = boundaryOffset(range.endContainer, range.endOffset, false);

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
  // querySelectorAll returns nodes in document order, so the last heading that
  // precedes the start point is the enclosing one.
  for (const heading of headings) {
    // Selecting the heading's own text belongs to that heading, not the
    // previous section — compareDocumentPosition returns 0 for self, which
    // would otherwise fall through to the `break` below.
    if (heading === startEl || heading.contains(startEl)) {
      found = heading.id;
      break;
    }
    const position = heading.compareDocumentPosition(startEl);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      found = heading.id;
    } else {
      break;
    }
  }
  return found;
}

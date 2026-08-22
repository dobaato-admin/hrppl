import { r as requireXmlNameValidator } from "./xml-name-validator.mjs";
var attributes = {};
var constants = {};
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  constants.NAMESPACES = {
    HTML: "http://www.w3.org/1999/xhtml",
    XML: "http://www.w3.org/XML/1998/namespace",
    XMLNS: "http://www.w3.org/2000/xmlns/"
  };
  constants.NODE_TYPES = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    // historical
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    // historical
    ENTITY_NODE: 6,
    // historical
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
    // historical
  };
  constants.VOID_ELEMENTS = /* @__PURE__ */ new Set([
    "area",
    "base",
    "basefont",
    "bgsound",
    "br",
    "col",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ]);
  return constants;
}
var hasRequiredAttributes;
function requireAttributes() {
  if (hasRequiredAttributes) return attributes;
  hasRequiredAttributes = 1;
  const xnv = requireXmlNameValidator();
  const { NAMESPACES } = requireConstants();
  function generatePrefix(map, newNamespace, prefixIndex) {
    const generatedPrefix = `ns${prefixIndex}`;
    map[newNamespace] = [generatedPrefix];
    return generatedPrefix;
  }
  function preferredPrefixString(map, ns, preferredPrefix) {
    const candidateList = map[ns];
    if (!candidateList) {
      return null;
    }
    if (candidateList.includes(preferredPrefix)) {
      return preferredPrefix;
    }
    return candidateList[candidateList.length - 1];
  }
  function serializeAttributeValue(value) {
    if (value === null) {
      return "";
    }
    return value.replace(/&/ug, "&amp;").replace(/"/ug, "&quot;").replace(/</ug, "&lt;").replace(/>/ug, "&gt;").replace(/\t/ug, "&#x9;").replace(/\n/ug, "&#xA;").replace(/\r/ug, "&#xD;");
  }
  function serializeAttributes(element, map, localPrefixes, ignoreNamespaceDefAttr, requireWellFormed, refs) {
    let result = "";
    const namespaceLocalnames = /* @__PURE__ */ Object.create(null);
    for (const attr of element.attributes) {
      if (requireWellFormed && namespaceLocalnames[attr.namespaceURI] && namespaceLocalnames[attr.namespaceURI].has(attr.localName)) {
        throw new Error("Found duplicated attribute");
      }
      if (!namespaceLocalnames[attr.namespaceURI]) {
        namespaceLocalnames[attr.namespaceURI] = /* @__PURE__ */ new Set();
      }
      namespaceLocalnames[attr.namespaceURI].add(attr.localName);
      const attributeNamespace = attr.namespaceURI;
      let candidatePrefix = null;
      if (attributeNamespace !== null) {
        candidatePrefix = preferredPrefixString(
          map,
          attributeNamespace,
          attr.prefix
        );
        if (attributeNamespace === NAMESPACES.XMLNS) {
          if (attr.value === NAMESPACES.XML || attr.prefix === null && ignoreNamespaceDefAttr || attr.prefix !== null && localPrefixes[attr.localName] !== attr.value && map[attr.value].includes(attr.localName)) {
            continue;
          }
          if (requireWellFormed && attr.value === NAMESPACES.XMLNS) {
            throw new Error(
              "The XMLNS namespace is reserved and cannot be applied as an element's namespace via XML parsing"
            );
          }
          if (requireWellFormed && attr.value === "") {
            throw new Error(
              "Namespace prefix declarations cannot be used to undeclare a namespace"
            );
          }
          if (attr.prefix === "xmlns") {
            candidatePrefix = "xmlns";
          }
        } else if (candidatePrefix === null) {
          candidatePrefix = generatePrefix(
            map,
            attributeNamespace,
            refs.prefixIndex++
          );
          result += ` xmlns:${candidatePrefix}="${serializeAttributeValue(
            attributeNamespace
          )}"`;
        }
      }
      result += " ";
      if (candidatePrefix !== null) {
        result += `${candidatePrefix}:`;
      }
      if (requireWellFormed && (attr.localName.includes(":") || !xnv.name(attr.localName) || attr.localName === "xmlns" && attributeNamespace === null)) {
        throw new Error("Invalid attribute localName value");
      }
      result += `${attr.localName}="${serializeAttributeValue(attr.value)}"`;
    }
    return result;
  }
  attributes.preferredPrefixString = preferredPrefixString;
  attributes.generatePrefix = generatePrefix;
  attributes.serializeAttributeValue = serializeAttributeValue;
  attributes.serializeAttributes = serializeAttributes;
  return attributes;
}
var serialize;
var hasRequiredSerialize;
function requireSerialize() {
  if (hasRequiredSerialize) return serialize;
  hasRequiredSerialize = 1;
  const xnv = requireXmlNameValidator();
  const attributeUtils = requireAttributes();
  const { NAMESPACES, VOID_ELEMENTS, NODE_TYPES } = requireConstants();
  const XML_CHAR = /^(\x09|\x0A|\x0D|[\x20-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}-\u{10FFFF}])*$/u;
  const PUBID_CHAR = /^(\x20|\x0D|\x0A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/u;
  function asciiCaseInsensitiveMatch(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; ++i) {
      if ((a.charCodeAt(i) | 32) !== (b.charCodeAt(i) | 32)) {
        return false;
      }
    }
    return true;
  }
  function recordNamespaceInformation(element, map, prefixMap) {
    let defaultNamespaceAttrValue = null;
    for (let i = 0; i < element.attributes.length; ++i) {
      const attr = element.attributes[i];
      if (attr.namespaceURI === NAMESPACES.XMLNS) {
        if (attr.prefix === null) {
          defaultNamespaceAttrValue = attr.value;
          continue;
        }
        let namespaceDefinition = attr.value;
        if (namespaceDefinition === NAMESPACES.XML) {
          continue;
        }
        if (namespaceDefinition === null) {
          namespaceDefinition = "";
        }
        if (namespaceDefinition in map && map[namespaceDefinition].includes(attr.localName)) {
          continue;
        }
        if (!(namespaceDefinition in map)) {
          map[namespaceDefinition] = [];
        }
        map[namespaceDefinition].push(attr.localName);
        prefixMap[attr.localName] = namespaceDefinition;
      }
    }
    return defaultNamespaceAttrValue;
  }
  function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
    if (requireWellFormed && !PUBID_CHAR.test(node.publicId)) {
      throw new Error("Failed to serialize XML: document type node publicId is not well-formed.");
    }
    if (requireWellFormed && (!XML_CHAR.test(node.systemId) || node.systemId.includes('"') && node.systemId.includes("'"))) {
      throw new Error("Failed to serialize XML: document type node systemId is not well-formed.");
    }
    let markup = `<!DOCTYPE ${node.name}`;
    if (node.publicId !== "") {
      markup += ` PUBLIC "${node.publicId}"`;
    } else if (node.systemId !== "") {
      markup += " SYSTEM";
    }
    if (node.systemId !== "") {
      markup += ` "${node.systemId}"`;
    }
    return `${markup}>`;
  }
  function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
    if (requireWellFormed && (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml"))) {
      throw new Error("Failed to serialize XML: processing instruction node target is not well-formed.");
    }
    if (requireWellFormed && (!XML_CHAR.test(node.data) || node.data.includes("?>"))) {
      throw new Error("Failed to serialize XML: processing instruction node data is not well-formed.");
    }
    return `<?${node.target} ${node.data}?>`;
  }
  function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
    if (requireWellFormed && node.documentElement === null) {
      throw new Error("Failed to serialize XML: document does not have a document element.");
    }
    let serializedDocument = "";
    for (const child of node.childNodes) {
      serializedDocument += xmlSerialization(
        child,
        namespace,
        prefixMap,
        requireWellFormed,
        refs
      );
    }
    return serializedDocument;
  }
  function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
    let markup = "";
    for (const child of node.childNodes) {
      markup += xmlSerialization(
        child,
        namespace,
        prefixMap,
        requireWellFormed,
        refs
      );
    }
    return markup;
  }
  function serializeText(node, namespace, prefixMap, requireWellFormed) {
    if (requireWellFormed && !XML_CHAR.test(node.data)) {
      throw new Error("Failed to serialize XML: text node data is not well-formed.");
    }
    return node.data.replace(/&/ug, "&amp;").replace(/</ug, "&lt;").replace(/>/ug, "&gt;");
  }
  function serializeComment(node, namespace, prefixMap, requireWellFormed) {
    if (requireWellFormed && !XML_CHAR.test(node.data)) {
      throw new Error("Failed to serialize XML: comment node data is not well-formed.");
    }
    if (requireWellFormed && (node.data.includes("--") || node.data.endsWith("-"))) {
      throw new Error("Failed to serialize XML: found hyphens in illegal places in comment node data.");
    }
    return `<!--${node.data}-->`;
  }
  function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
    if (requireWellFormed && (node.localName.includes(":") || !xnv.name(node.localName))) {
      throw new Error("Failed to serialize XML: element node localName is not a valid XML name.");
    }
    let markup = "<";
    let qualifiedName = "";
    let skipEndTag = false;
    let ignoreNamespaceDefinitionAttr = false;
    const map = { ...prefixMap };
    const localPrefixesMap = /* @__PURE__ */ Object.create(null);
    const localDefaultNamespace = recordNamespaceInformation(
      node,
      map,
      localPrefixesMap
    );
    let inheritedNs = namespace;
    const ns = node.namespaceURI;
    if (inheritedNs === ns) {
      if (localDefaultNamespace !== null) {
        ignoreNamespaceDefinitionAttr = true;
      }
      if (ns === NAMESPACES.XML) {
        qualifiedName = `xml:${node.localName}`;
      } else {
        qualifiedName = node.localName;
      }
      markup += qualifiedName;
    } else {
      let { prefix } = node;
      let candidatePrefix = attributeUtils.preferredPrefixString(map, ns, prefix);
      if (prefix === "xmlns") {
        if (requireWellFormed) {
          throw new Error(`Failed to serialize XML: element nodes can't have a prefix of "xmlns".`);
        }
        candidatePrefix = "xmlns";
      }
      if (candidatePrefix !== null) {
        qualifiedName = `${candidatePrefix}:${node.localName}`;
        if (localDefaultNamespace !== null && localDefaultNamespace !== NAMESPACES.XML) {
          inheritedNs = localDefaultNamespace === "" ? null : localDefaultNamespace;
        }
        markup += qualifiedName;
      } else if (prefix !== null) {
        if (prefix in localPrefixesMap) {
          prefix = attributeUtils.generatePrefix(map, ns, refs.prefixIndex++);
        }
        if (map[ns]) {
          map[ns].push(prefix);
        } else {
          map[ns] = [prefix];
        }
        qualifiedName = `${prefix}:${node.localName}`;
        markup += `${qualifiedName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
        if (localDefaultNamespace !== null) {
          inheritedNs = localDefaultNamespace === "" ? null : localDefaultNamespace;
        }
      } else if (localDefaultNamespace === null || localDefaultNamespace !== ns) {
        ignoreNamespaceDefinitionAttr = true;
        qualifiedName = node.localName;
        inheritedNs = ns;
        markup += `${qualifiedName} xmlns="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
      } else {
        qualifiedName = node.localName;
        inheritedNs = ns;
        markup += qualifiedName;
      }
    }
    markup += attributeUtils.serializeAttributes(
      node,
      map,
      localPrefixesMap,
      ignoreNamespaceDefinitionAttr,
      requireWellFormed,
      refs
    );
    if (ns === NAMESPACES.HTML && node.childNodes.length === 0 && VOID_ELEMENTS.has(node.localName)) {
      markup += " /";
      skipEndTag = true;
    } else if (ns !== NAMESPACES.HTML && node.childNodes.length === 0) {
      markup += "/";
      skipEndTag = true;
    }
    markup += ">";
    if (skipEndTag) {
      return markup;
    }
    if (ns === NAMESPACES.HTML && node.localName === "template") {
      markup += xmlSerialization(
        node.content,
        inheritedNs,
        map,
        requireWellFormed,
        refs
      );
    } else {
      for (const child of node.childNodes) {
        markup += xmlSerialization(
          child,
          inheritedNs,
          map,
          requireWellFormed,
          refs
        );
      }
    }
    markup += `</${qualifiedName}>`;
    return markup;
  }
  function serializeCDATASection(node) {
    return `<![CDATA[${node.data}]]>`;
  }
  function xmlSerialization(node, namespace, prefixMap, requireWellFormed, refs) {
    switch (node.nodeType) {
      case NODE_TYPES.ELEMENT_NODE:
        return serializeElement(
          node,
          namespace,
          prefixMap,
          requireWellFormed,
          refs
        );
      case NODE_TYPES.DOCUMENT_NODE:
        return serializeDocument(
          node,
          namespace,
          prefixMap,
          requireWellFormed,
          refs
        );
      case NODE_TYPES.COMMENT_NODE:
        return serializeComment(node, namespace, prefixMap, requireWellFormed);
      case NODE_TYPES.TEXT_NODE:
        return serializeText(node, namespace, prefixMap, requireWellFormed);
      case NODE_TYPES.DOCUMENT_FRAGMENT_NODE:
        return serializeDocumentFragment(
          node,
          namespace,
          prefixMap,
          requireWellFormed,
          refs
        );
      case NODE_TYPES.DOCUMENT_TYPE_NODE:
        return serializeDocumentType(
          node,
          namespace,
          prefixMap,
          requireWellFormed
        );
      case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
        return serializeProcessingInstruction(
          node,
          namespace,
          prefixMap,
          requireWellFormed
        );
      case NODE_TYPES.ATTRIBUTE_NODE:
        return "";
      case NODE_TYPES.CDATA_SECTION_NODE:
        return serializeCDATASection(node);
      default:
        throw new TypeError("Failed to serialize XML: only Nodes can be serialized.");
    }
  }
  serialize = (root, { requireWellFormed = false } = {}) => {
    const namespacePrefixMap = /* @__PURE__ */ Object.create(null);
    namespacePrefixMap["http://www.w3.org/XML/1998/namespace"] = ["xml"];
    return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, {
      prefixIndex: 1
    });
  };
  return serialize;
}
export {
  requireSerialize as r
};

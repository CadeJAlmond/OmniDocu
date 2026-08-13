/** EmbeddedLinksPlugin.Js
 * @brief : This class defines the actually html and internal data of an
 *    embedded link node.
 * 
 * -Referenced : pages/texteditor/embeddedLinksPlugin
 */

/* --=== Imports ===-- */
import { TextNode } from "lexical";

// Example borrowed from https://lexical.dev/docs/concepts/nodes#extending-textnode

export class EmbeddedLinkNode extends TextNode {
  // Defines internal data for HTML
    /**
   * @param nodeText : The name / text of the embedded entity
   * @returns The function which will be executed whenever an embedded entity is hovered over.
   */
    selectEmbeddedEntity = (entityType, nodeText) => {
      return () => {
        /** Get data from the state */
        /** Choose the data and actions to perform */
        //If we have a controller that gets all items we wouldn't need entity type
        //const data = (entityType === 'character' ? dispatch(requestGetItems(0)) : dispatch(requestGetItems(2)))        
      };
    };

  constructor(text, entity_type, key) {
    super(text, key);
    this.__color = "#c200fb";
    this.__entity_type = entity_type;
    this.__onClickFunc = this.selectEmbeddedEntity(entity_type, this.__text );
  }

  static getType() {
    return "embedded";
  }

  static clone(node) {
    return new EmbeddedLinkNode(node.__text, node.__color, node.__key);
  }

  // This creates the element of an Embedded Link onto the DOC
  createDOM(config) {
    const element = super.createDOM(config);
    element.style.color = this.__color;
    element.style.cursor = 'pointer'
    element.addEventListener("click", this.selectEmbeddedEntity(this.__entity_type, this.__text ));
    return element;
  }

  updateDOM(prevNode, dom, config) {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if (prevNode.__color !== this.__color) {
      dom.style.color = this.__color;
    }
    return isUpdated;
  }

  exportJSON() {
    return {
      text: this.__text,
      type: 'embedded',
      entity_type: 'character'
    };
  }

  static importJSON(serializedNode) {
    const text = serializedNode.text
    const entityType = serializedNode.entity_type
    const node = new EmbeddedLinkNode(text, entityType)
    return node;
  }
}

// This triggers a embeddedLink to be created
export function $createEmbeddedLinkNode(text, entityType) {
  return new EmbeddedLinkNode(text, entityType);
}

// This checks if a node is an embeddedLinkNode
export function $isEmbeddedLinkNode(node) {
  return node instanceof EmbeddedLinkNode;
}

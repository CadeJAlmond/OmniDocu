/** EmbeddedLinksPlugin.Js
 * @brief : This class defines a plugin which will create "click-able" text entities
 *    into a text editor whenever an existing name of a character, or event is
 *    referenced in the text.
 *
 * -Referenced : pages/Writing
 */

/* --=== Imports ===-- */
// --() Lexical text editor
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import { $createEmbeddedLinkNode, EmbeddedLinkNode } from "./EmbeddedLinkNode";
import { removePunctuationFromWord } from "./AdvancedTextEditor";

// --() State Management and On-Click Functions
import { useCallback } from "react";

/**
 * @param charactersData : An object which contains two fields, 'names' and 'charactersdata'.
 *     The names field is an array which holds all of the names of characters, while the
 *     charactersdata is a mapping between character names and the character instance.
 *
 * @param eventsData : An object which contains two fields, 'names' and 'eventsdata'.
 *     The names field holds all of the names of events, while the eventsdata is a mapping
 *     between event names and the event instance.
 * @param conceptsData : ....
 * @param selectedEmbeddedEntity : The function responsible for selecting an entity which
 *     an embedded link is clicked.
 */
export default function EmbeddedLinkPlugin({charactersData}) {
  /**
   * @param nodeText : The name / text of the embedded entity
   * @returns a new embedded link node
   */
  const createEmbeddedLinkNode = useCallback((textNode) => {
    const nodeText        = textNode.getTextContent();
    const firstWordOfName =  removePunctuationFromWord(
      nodeText.split(/\s+/)[0].toLowerCase()
    );

    const entityType = ( firstWordOfName in charactersData ? "character" : "event" )
    return $createEmbeddedLinkNode(nodeText, entityType );
  }, []);

  /**
   * @brief : This method will scan the text to see if an entire entity
   *    name is actually written out inside of the text.
   *
   * @param entityFullName : The full name of an entity
   * @param index : The current index being looked at in the text
   * @param words : The text inside the text editor
   *
   * @returns A boolean : Embedded Entity which will know if the entire
   *  entity's name was written in the text, and the length of the name.
   */
  const checkFollowingWords = (entityNames, index, words) => {
    if (!entityNames) return [false, -1];
    const embeddedEntityFound = [];

    entityNames.forEach((entityFullName) => {
      const name = entityFullName.name.split(" ");
      let embeddedEntity = true;

      name.forEach((partOfName, i) => {
        const curIndex = +i + +index;
        
        const nextWordOnPage = words[curIndex] ? 
          removePunctuationFromWord( words[curIndex].toLowerCase() ) : " "

        embeddedEntity = embeddedEntity && words[curIndex] && removePunctuationFromWord( partOfName.toLowerCase() ) === nextWordOnPage
      });

      if (embeddedEntity === true) embeddedEntityFound.push(entityFullName);
    });

    return [embeddedEntityFound.length, embeddedEntityFound[0]?.name?.length];
  };

  /**
   * @param checkWord : A word from the text that will be checked to
   *    determine if the word MIGHT be a reference entity in the text,
   *    and is actually an entity from characters or events.
   * @param i : The current index being looked at in the text
   * @param words : The text inside the text editor
   * @returns A boolean : Embedded Entity which will know if the entire
   *  entity's name was written in the text, and the length of the name.
   */
  const checkEmbeddedLink = (checkWord, i, words) => {
    const word = checkWord.toLowerCase();

    if (word in charactersData) {
      const [isEmbeddedLink, endingIndex] = checkFollowingWords(charactersData[word], i, words );
      
      return [isEmbeddedLink, endingIndex];
    }
    
    return [false, -1];
  };

  /**
   * @brief : This is the method that will actually scan the words and
   *    text of the text editor. If any word if found to be a reference
   *    to a character or event, than that word is turned into an
   *    embedded link and placed into the text editor.
   */
  const getEmbeddedLinkMatch = useCallback((text) => {
    const words = text.split(/\s+/);

    for (const i in words) {
      const word = removePunctuationFromWord(words[i])

      const [isEmbeddedLink, endingIndex] = checkEmbeddedLink(word.toLowerCase(), i, words );

      if (isEmbeddedLink)
        return {
          start: text.indexOf(word),
          end: text.indexOf(word) + endingIndex,
        };
    }
    return null;
  }, []);

  /** This is used for lexical to use the plugin we defined here **/
  useLexicalTextEntity(
    getEmbeddedLinkMatch,
    EmbeddedLinkNode,
    createEmbeddedLinkNode
  );

  return null;
}

/** (NOTES EMBEDDED LINK ALGORITHM)
 * The text editor takes all events, places and characters and compiles the
 * FIRST word of their name into an array. For example : 
 *    Capitan America -> Capitan
 *    Red Skull -> Red
 * In the Embedded Links plugin, we check if any word in the text matches any
 * of the first words in the names array. If so, we check the preceding words 
 * to check if the entire name of the character is written. 
 * Secondly, a mapping between ALL of the character / event / place data is 
 * compiled into a hash map named "charactersData" or "placesData". This hashmap
 * maps the first word of the entity name into the entirety of the entity. We use
 * this to hashmap to retrieve the full name of the entity for checking AND to
 * create the onClick event for an embedded link.
 ***/
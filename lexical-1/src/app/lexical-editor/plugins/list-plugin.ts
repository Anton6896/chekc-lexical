import { LexicalEditor } from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from '@lexical/list';
import { $getSelection, $isRangeSelection } from 'lexical';

export type ListType = 'bullet' | 'number' | null;

/**
 * Toggles a bulleted (unordered) list
 * @param editor - The Lexical editor instance
 */
export function toggleBulletList(editor: LexicalEditor): void {
  editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  editor.focus();
}

/**
 * Toggles a numbered (ordered) list
 * @param editor - The Lexical editor instance
 */
export function toggleNumberedList(editor: LexicalEditor): void {
  editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  editor.focus();
}

/**
 * Removes the current list formatting
 * @param editor - The Lexical editor instance
 */
export function removeList(editor: LexicalEditor): void {
  editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  editor.focus();
}

/**
 * Gets the current list type (bullet, number, or none)
 * @param selection - The current selection
 * @returns The current list type or null
 */
export function getCurrentListType(selection: any): ListType {
  if ($isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode();
    let element = anchorNode.getParent();

    // Traverse up to find a list node
    while (element) {
      if ($isListNode(element)) {
        const listNode = element as ListNode;
        const listType = listNode.getListType();

        if (listType === 'bullet') {
          return 'bullet';
        } else if (listType === 'number') {
          return 'number';
        }
      }
      element = element.getParent();
    }
  }

  return null;
}

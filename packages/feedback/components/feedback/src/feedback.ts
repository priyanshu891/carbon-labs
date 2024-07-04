/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, TemplateResult, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import HostListener from '@carbon/web-components/es/globals/decorators/host-listener.js';
import HostListenerMixin from '@carbon/web-components/es/globals/mixins/host-listener.js';

// @ts-ignore
import styles from './feedback.scss?inline';
import { FeedbackData } from '../defs';

/**
 * Feedback component to record and give feedback on AI generated content
 */
export class Feedback extends HostListenerMixin(LitElement) {
  static styles = styles;

  /**
   * Model ID or Model Name for which feedback is recording
   */
  @property({ attribute: 'model', type: String })
  private _model_id = '';

  /**
   * User Input to the model
   */
  @property({ attribute: 'input', type: String })
  private _input = '';

  /**
   * Output generated by AI Model
   */
  @property({ attribute: 'output', type: String })
  private _output = '';

  /**
   * ID generated For a particular input and output
   */
  @property({ attribute: 'generation-id', type: String, reflect: true })
  generationId;

  @property()
  private feedbackList: FeedbackData[] = [];

  /**
   * Boolean property for displaying AI slug
   */
  @property({ type: Boolean, reflect: true })
  showSlug = false;

  /**
   * State variable for Feedback Model
   */
  @state()
  private isModelOpen = false;

  /**
   * State variable for Edit selected text
   */
  @state()
  private isEditable = false;

  /**
   * To store data of selected text
   */
  @state()
  private selection;

  @state()
  disableSave = false;

  @state()
  private isUpdateMode = false;

  @state()
  highlighted: TemplateResult | null = null;

  /**
   * Getter for selection
   */
  get Selection() {
    return this.selection;
  }

  /**
   * Object for recording the feedback
   */
  @state()
  private formData: FeedbackData = {
    feedbackId: '',
    generationId: '',
    startIndex: 0,
    endIndex: 0,
    selectedText: '',
    suggestedText: '',
    feedbackType: [],
    comment: '',
  };

  /**
   * Array for storing checkbox values selected by user
   */
  feedbacks: string[] = [];
  pageX = 0;
  pageY = 0;

  /**
   * For Mounting the web component
   */
  connectedCallback(): void {
    super.connectedCallback();
    if (this._model_id && (this._input || this._output)) {
      const event = new CustomEvent('on-generation', {
        detail: {
          message: 'generated content',
          data: {
            id: this.generationId,
            input_value: this._input,
            output_value: this._output,
            model: this._model_id,
          },
        },
      });
      this.dispatchEvent(event);
    }

    window.addEventListener('mousedown', () => {
      this.setUserSelect('auto');
      this.selection = null;
    });
  }

  /**
   * Click event handler that is attached to this component to get the selection / selected text
   * @param {Event} e Event from elements
   * @private
   */
  @HostListener('mouseup')
  _handleTextSelection(e) {
    if (this.isModelOpen) {
      this.selection = null;
      return;
    }
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    const selection = window.getSelection();

    this.selection = selection;
    const selectedText = selection?.toString().trim();

    if (selectedText && selection) {
      this.resetFeedbackForm();
      const minOffset = Math.min(selection.anchorOffset, selection.focusOffset);
      const maxOffset = Math.max(selection.anchorOffset, selection.focusOffset);
      this.formData.generationId = this.generationId;
      this.formData.selectedText = selectedText;
      this.formData.startIndex = minOffset;
      this.formData.endIndex = maxOffset;
      this.requestUpdate();
    } else {
      this.selection = null;
    }
  }

  /**
   * Input event handler that is attached to the feedback (corrected value) form input
   *
   * @param {object} event Event object of the corrected value from input box
   * @param {object} event.target input element
   * @private
   */
  _handleTextInput({ target }: Event) {
    const { value } = target as HTMLInputElement;
    this.formData.suggestedText = value;
  }

  /**
   * Input event handler that is attached to the feedback (comments) form input
   *
   * @param {object} event Event object of the corrected value from input box
   * @param {object} event.target input element
   * @private
   */
  _handleTextArea(event) {
    this.formData.comment = event?.target.value;
    if (this.formData.comment !== '') {
      this.disableSave = false;
    } else {
      this.disableSave = true;
    }
  }

  /**
   * Submit/Record the feedback data to backend
   * @private
   */
  _handleFormData() {
    if (this.isUpdateMode) {
      this.feedbackList = this.feedbackList.map((item) => {
        if (item.feedbackId === this.formData.feedbackId) {
          return { ...item, ...this.formData };
        }
        return item;
      });
    } else {
      if (!this.formData.feedbackId) {
        this.formData.feedbackId = uuidv4();
      }
      if (!this.formData.suggestedText) {
        this.formData.suggestedText = this.formData.selectedText;
      }
      this.feedbackList.push(this.formData);
    }

    const event = new CustomEvent('on-feedback-save', {
      detail: this.formData,
    });

    this.dispatchEvent(event);

    this.selection = null;
    this.resetFeedbackForm();
    this.feedbacks = [];
    this.isModelOpen = false;
    this.isEditable = false;
    this.requestUpdate('feedbackList', []);
  }

  /**
   *
   * @param {FeedbackData} data Feedback Object
   */
  handleFeedbackUpdate(data: FeedbackData) {
    const {
      comment,
      endIndex,
      feedbackId,
      feedbackType,
      generationId,
      selectedText,
      startIndex,
      suggestedText,
    } = data;
    this.formData.feedbackId = feedbackId;
    this.formData.generationId = generationId;
    this.formData.selectedText = selectedText;
    this.formData.suggestedText = suggestedText;
    this.formData.feedbackType = feedbackType;
    this.formData.startIndex = startIndex;
    this.formData.endIndex = endIndex;
    this.formData.comment = comment;
    this.isEditable = true;
    this.isUpdateMode = true;
    this.isModelOpen = true;
  }

  /**
   * Checkbox Input event handler that is attached to the feedback form input
   *
   * @param {object} event Event object of the corrected value from input box
   * @param {object} event.target input element
   * @private
   */
  _handleFeedback(event) {
    const feedback = event.target.value;
    if (!this.formData.feedbackType.includes(feedback)) {
      this.formData.feedbackType.push(feedback);
    } else {
      this.formData.feedbackType = this.formData.feedbackType.filter(
        (item) => item != feedback
      );
    }
    this.disableSave = this.formData.feedbackType.includes('OTHER');
  }

  /**
   * Method for toggling the Feedback Modal
   */
  _toggle() {
    this.isModelOpen = !this.isModelOpen;
    this.isUpdateMode = false;
    this.isEditable = false;
  }

  /**
   * Method for toggling improved text field
   */
  _toggleEdit() {
    this.isEditable = !this.isEditable;
  }

  /**
   *
   * @param {string} id feedback id
   *
   */
  handleFeedbackDelete(id) {
    this.feedbackList = this.feedbackList.filter(
      (item) => item.feedbackId !== id
    );
    const event = new CustomEvent('on-feedback-delete', {
      detail: { feedbackId: id },
    });
    this.dispatchEvent(event);
  }

  /**
   *
   */
  resetFeedbackForm() {
    this.formData = {
      feedbackId: '',
      generationId: '',
      startIndex: 0,
      endIndex: 0,
      selectedText: '',
      suggestedText: '',
      feedbackType: [],
      comment: '',
    };
  }

  @state()
  private textPositions: any[] = [];

  /**
   *
   */
  calculateTextPosition() {
    const slotElement = this.shadowRoot?.querySelector('slot');
    const assignedNodes = slotElement?.assignedNodes({ flatten: true });
    const textNode = assignedNodes?.find(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== ''
    );

    const positions: any[] = [];
    this.textPositions = [];
    if (textNode) {
      for (const { startIndex, endIndex } of this.feedbackList) {
        const range = document.createRange();
        range.setStart(textNode, startIndex);
        range.setEnd(textNode, endIndex);
        const rect = range.getBoundingClientRect();
        positions.push(rect);
        this.textPositions.push(rect);
      }
    }
    this.textPositions = positions;
    return positions;
  }

  /**
   *
   * @param {FeedbackData} feedback feedback object
   */
  highlightedText(feedback: FeedbackData) {
    const text = this._output;
    const { startIndex, endIndex } = feedback;
    if (
      text &&
      startIndex >= 0 &&
      endIndex <= text.length &&
      endIndex > startIndex
    ) {
      const beforeHighlight = text.substring(0, startIndex);
      const highlightedText = text.substring(startIndex, endIndex);
      const afterHighlight = text.substring(endIndex);

      this.highlighted = html`${beforeHighlight}<span
          class="highlight-selection"
          >${highlightedText}</span
        >${afterHighlight}`;
    }
  }

  /**
   * To Reset the higlighted text
   */
  resetHiglightedText() {
    this.highlighted = null;
  }

  /**
   * To Reset the selection text
   * @param {object} event Event object of the button clicked
   */
  resetSelection(event) {
    event.preventDefault();
    this.setUserSelect('none');
    this.selection = null;
  }

  /**
   * To remove the text selection
   * @param {string} value value for `user-select` css property
   */
  setUserSelect(value: string) {
    const element = this.shadowRoot?.getElementById('container');
    if (element) {
      element.style.userSelect = value;
    }
  }
}

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import '@carbon/web-components/es/components/loading/index.js';
import Maximize16 from '@carbon/web-components/es/icons/maximize/16.js';
import Download16 from '@carbon/web-components/es/icons/download/16.js';
import Launch16 from '@carbon/web-components/es/icons/launch/16.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function molecularElementTemplate(customElementClass) {
  const {
    theme,
    title,
    _uniqueID: uniqueID,
    _smilesContent: smilesContent,
    streaming,
    loading,
    fullscreenMode,
    disableOptions,
    _openEditorView: openEditorView,
    disableFullscreen,
    _openFullscreenView: openFullscreenView,
    _closeFullscreenView: closeFullscreenView,
    disableExport,
    _exportToImage: exportToImage,
    disableCodeInspector,
  } = customElementClass;

  return html`
    <div
      class="${clabsPrefix}--chat-molecule-container ${clabsPrefix}--chat-molecule-${theme}">
      ${loading
        ? html`
            <div class="${clabsPrefix}--chat-molecule-container-loader">
              <cds-loading></cds-loading>
            </div>
          `
        : ''}

      <svg
        class="${clabsPrefix}--chat-molecule-target"
        id="clabs--chat-molecule-${uniqueID}"></svg>

      ${streaming
        ? html`<div class="${clabsPrefix}--chat-molecule-stream-text-container">
            <div class="${clabsPrefix}--chat-molecule-stream-text-content">
              ${smilesContent}
            </div>
          </div>`
        : ``}
      ${title
        ? html`<div class="${clabsPrefix}--chat-molecule-title">${title}</div>`
        : html``}
      ${disableOptions || loading || streaming
        ? html``
        : html` <div class="${clabsPrefix}--chat-molecule-options">
            <div class="${clabsPrefix}--chat-molecule-options-prefade-${theme}">
              &nbsp;
            </div>
            <div class="${clabsPrefix}--chat-molecule-options-buttons">
              ${!disableExport
                ? html`
                    <cds-icon-button
                      kind="ghost"
                      size="sm"
                      align="bottom-right"
                      @click="${exportToImage}">
                      ${Download16({ slot: 'icon' })}
                      <span slot="tooltip-content">Export to PNG</span>
                    </cds-icon-button>
                  `
                : html``}
              ${!disableCodeInspector
                ? html`
                    <cds-icon-button
                      kind="ghost"
                      size="sm"
                      align="bottom-right"
                      @click="${openEditorView}">
                      ${Launch16({ slot: 'icon' })}
                      <span slot="tooltip-content">Open in PubChem</span>
                    </cds-icon-button>
                  `
                : html``}
              ${!disableFullscreen
                ? html`
                    <cds-icon-button
                      kind="ghost"
                      size="sm"
                      align="bottom-right"
                      @click="${openFullscreenView}">
                      ${Maximize16({ slot: 'icon' })}
                      <span slot="tooltip-content">Fullscreen</span>
                    </cds-icon-button>
                  `
                : html``}
            </div>
          </div>`}
    </div>

    <div class="${clabsPrefix}--chat-molecule-tester">
      <svg id="clabs--chat-molecule-test-${uniqueID}"></svg>
    </div>

    <div
      class="${clabsPrefix}--chat-molecule-fullscreen-container"
      style="visibility:${fullscreenMode ? 'visible' : 'hidden'};"
      @click="${closeFullscreenView}">
      <svg
        class="${clabsPrefix}--chat-molecule-target-fullscreen"
        id="clabs--chat-molecule-fullscreen-${uniqueID}"></svg>
    </div>
  `;
}

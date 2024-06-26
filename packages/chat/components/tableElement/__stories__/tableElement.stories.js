/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../tableElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Table',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <clabs-chat-table
      content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY">
    </clabs-chat-table>`,
};

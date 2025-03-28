import React from 'react';
import TermsOfUsePopup from '.';

export default {
  title: 'Components/App/TermsOfUsePopupOld',
  component: TermsOfUsePopup,
  argTypes: {
    onAccept: {
      action: 'onAccept',
    },
  },
};

export const DefaultStory = (args) => <TermsOfUsePopup {...args} />;

DefaultStory.storyName = 'Default';

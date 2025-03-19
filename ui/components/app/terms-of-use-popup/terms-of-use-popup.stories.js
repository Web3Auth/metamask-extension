import React from 'react';
import TermsOfUsePopup from '.';

export default {
  title: 'Components/App/TermsOfUsePopup',
  component: TermsOfUsePopup,
  argTypes: {
    onAccept: {
      action: 'onAccept',
    },
    onDecline: {
      action: 'onDecline',
    },
  },
};

export const DefaultStory = (args) => <TermsOfUsePopup {...args} />;

DefaultStory.storyName = 'Default';

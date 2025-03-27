import React from 'react';
import SrpInput from '.';

export default {
  title: 'Components/App/SrpInputOld',

  component: SrpInput,
  argTypes: {
    onChange: { action: 'changed' },
  },
};

const Template = (args) => {
  return <SrpInput {...args} />;
};

export const DefaultStory = Template.bind({});

DefaultStory.storyName = 'Default';

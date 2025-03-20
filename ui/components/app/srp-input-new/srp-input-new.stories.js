import React from 'react';
import SrpInput from '.';

export default {
  title: 'Components/App/SrpInputNew',

  component: SrpInput,
  argTypes: {},
};

const Template = (args) => {
  return <SrpInput {...args} />;
};

export const DefaultStory = Template.bind({});

DefaultStory.storyName = 'Default';

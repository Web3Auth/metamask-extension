import React from 'react';
import PasswordHint from './password-hint';

export default {
  title: 'Pages/SettingsPage/PasswordHint',
  component: PasswordHint,
};

export const DefaultStory = (args) => {
  return <PasswordHint {...args} />;
};

DefaultStory.storyName = 'Default';

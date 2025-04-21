import React from 'react';
import ChangePassword from './change-password';

export default {
  title: 'Pages/SettingsPage/ChangePassword',
  component: ChangePassword,
};

export const DefaultStory = (args) => {
  return <ChangePassword {...args} />;
};

DefaultStory.storyName = 'Default';

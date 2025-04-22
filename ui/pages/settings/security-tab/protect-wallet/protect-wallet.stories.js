import React from 'react';
import ProtectWallet from './protect-wallet';

export default {
  title: 'Pages/SettingsPage/ProtectWallet',
  component: ProtectWallet,
};

export const DefaultStory = (args) => {
  return <ProtectWallet {...args} />;
};

DefaultStory.storyName = 'Default';

import React from 'react';
import SRPHint from './srp-hint';

export default {
  title: 'Pages/OnboardingFlow/SRPHint',
};

export const DefaultStory = () => {
  return (
    <div style={{ maxHeight: '2000px' }}>
      <SRPHint />
    </div>
  );
};

DefaultStory.storyName = 'Default';

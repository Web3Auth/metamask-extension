import React, { useEffect, useState } from 'react';
import WelcomeBanner from './welcome-banner';
import WelcomeGetStarted from './welcome-get-started';

const WelcomePageState = {
  Banner: 'Banner',
  Login: 'Login',
};

export default function Welcome() {
  const [pageState, setPageState] = useState(WelcomePageState.Banner);

  useEffect(() => {
    const container = document.getElementById('app-content');
    if (container) {
      if (pageState === WelcomePageState.Banner) {
        container.classList.remove('welcome-login');
        container.classList.add('welcome-banner');
      } else {
        container.classList.remove('welcome-banner');
        container.classList.add('welcome-login');
      }
    }

    return () => {
      if (container) {
        container.classList.remove('welcome-banner');
        container.classList.remove('welcome-login');
      }
    };
  }, [pageState]);

  return (
    <div className="welcome">
      {pageState === WelcomePageState.Banner && (
        <WelcomeBanner onAccept={() => setPageState(WelcomePageState.Login)} />
      )}
      {pageState === WelcomePageState.Login && <WelcomeGetStarted />}
    </div>
  );
}

Welcome.propTypes = {};

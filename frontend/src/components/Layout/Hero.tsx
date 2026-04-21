import { memo } from 'react';

interface HeroProps {
  apiStatus?: string;
}

// Hero component is now minimal - branding moved to Header
function Hero(_props: HeroProps) {
  return null;
}

export default memo(Hero);

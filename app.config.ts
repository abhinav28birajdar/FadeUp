import 'dotenv/config';

import type { ExpoConfig } from '@expo/config-types';

export default ({ config }: { config: ExpoConfig }) => ({
  ...config,
  extra: {
    // Add custom env variables here if needed
  },
});
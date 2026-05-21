import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.act.map',
  appName: 'ACT Map',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

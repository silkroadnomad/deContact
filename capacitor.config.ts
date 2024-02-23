import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.doichain.deContact',
  appName: 'decontact',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;

import type { ConfigContext, ExpoConfig } from 'expo/config';

// Static settings live in app.json. The release pipeline overrides the
// version through APP_VERSION and ANDROID_VERSION_CODE.
export default ({ config }: ConfigContext): ExpoConfig => {
  const versionCode = process.env.ANDROID_VERSION_CODE;
  return {
    ...config,
    name: config.name ?? '7 Minute Workout',
    slug: config.slug ?? 'seven-minute-workout',
    version: process.env.APP_VERSION || config.version,
    android: {
      ...config.android,
      versionCode: versionCode ? Number(versionCode) : config.android?.versionCode,
    },
  };
};

// Expo config plugin: signs release builds with the upload key when the
// ANDROID_KEYSTORE_* environment variables are set (as in the release
// workflow), and falls back to the debug key otherwise so local and CI test
// builds still work.
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_SIGNING_CONFIG = `
        release {
            def keystorePath = System.getenv('ANDROID_KEYSTORE_PATH')
            if (keystorePath) {
                storeFile file(keystorePath)
                storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
                keyAlias System.getenv('ANDROID_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_KEY_PASSWORD')
            }
        }`;

const DEBUG_RELEASE_SIGNING =
  '// see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.debug';

const UPLOAD_RELEASE_SIGNING =
  "// Signed with the upload key in CI, see plugins/withReleaseSigning.js.\n            signingConfig System.getenv('ANDROID_KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug";

function addReleaseSigning(gradle) {
  if (gradle.includes("System.getenv('ANDROID_KEYSTORE_PATH')")) return gradle;
  if (!gradle.includes('signingConfigs {') || !gradle.includes(DEBUG_RELEASE_SIGNING)) {
    // Fail loudly rather than silently shipping a debug-signed release.
    throw new Error(
      'withReleaseSigning: android/app/build.gradle no longer matches the expected template; update the plugin.',
    );
  }
  return gradle
    .replace('signingConfigs {', `signingConfigs {${RELEASE_SIGNING_CONFIG}`)
    .replace(DEBUG_RELEASE_SIGNING, UPLOAD_RELEASE_SIGNING);
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = addReleaseSigning(cfg.modResults.contents);
    return cfg;
  });
};

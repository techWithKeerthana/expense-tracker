const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * react-native-android-notification-listener's own AndroidManifest.xml declares
 * android:allowBackup="false" on <application>, which conflicts with this app's
 * allowBackup="true" and fails Android's manifest merger with no resolution hint
 * applied. This plugin adds tools:replace="android:allowBackup" so the app's own
 * value wins, exactly as Android's merger error message suggests.
 */
module.exports = function withAllowBackupOverride(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];

    if (application) {
      manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';
      if (!application.$['android:allowBackup']) {
        application.$['android:allowBackup'] = 'true';
      }
      const existingReplace = application.$['tools:replace'];
      const replaceList = existingReplace ? existingReplace.split(',') : [];
      if (!replaceList.includes('android:allowBackup')) {
        replaceList.push('android:allowBackup');
      }
      application.$['tools:replace'] = replaceList.join(',');
    }

    return config;
  });
};

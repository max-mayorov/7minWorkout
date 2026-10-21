# Releasing to Google Play

Three GitHub Actions workflows build the app with Gradle on GitHub's runners. No Expo account or EAS is involved.

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | Pull requests | Typecheck, lint, unit tests, JS bundle, then an Android build signed with the debug key |
| `apk.yml` | **Run workflow** button only (any branch) | Checks, then an **APK** for manual install, kept as a workflow artifact. Built for phones only (`arm64-v8a`, `armeabi-v7a`); it won't install on x86 emulators. Nothing is sent to Play. |
| `release.yml` | Tag `v1.2` or `v1.2.3` | Checks, then a signed **AAB** uploaded to the Play **production** track |
| `release.yml` | **Run workflow** button (any branch) | Checks, then a signed **AAB** kept as a workflow artifact. Never uploaded to Play. |

How a build works:

1. `npx expo prebuild` generates the `android/` project from `app.json`. The folder is not committed.
2. Gradle builds the app. `plugins/withReleaseSigning.js` signs it with your **upload key** from GitHub secrets, or falls back to the debug key when the secrets are missing (only `apk.yml` and `ci.yml` allow that fallback).
3. For tags, [`r0adkll/upload-google-play`](https://github.com/r0adkll/upload-google-play) uploads the bundle and its ProGuard mapping file.

**Versions**

- `versionCode` is `100 + workflow run number`, so it always increases within each workflow.
- `versionName` is the tag without the `v` for Play releases (for example `1.2.3`). APKs are named `<app.json version>-apk.<versionCode>`, and manual AAB builds `<app.json version>-manual.<versionCode>`.

Each build is kept as a workflow artifact for 30 days.

## Building and installing an APK

1. In GitHub, open **Actions → APK → Run workflow** and pick a branch (usually `main`). When the run finishes, download the `7minworkout-…-apk` artifact. It is a zip; extract the `.apk`.
2. Copy it to your phone and open it. Android asks you to allow installs from that app (Files, Chrome, …) the first time.

Android only lets an app update itself with the same signing key. The sideloaded APK and the Play Store version use different keys: the APK uses your upload key or the debug key, while Play delivers the app re-signed by Google. So uninstall one before installing the other (this deletes the app's local workout history). The same applies when switching between debug-signed and upload-key-signed APKs.

## One-time setup

In GitHub, go to **Settings → General → Default branch** and make `main` the default branch.

You only need steps 1–6 to publish to Google Play. APK builds work without any secrets; they are then signed with the debug key.

### 1. Create an upload key

Run this on your own computer (you need a JDK for `keytool`):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore upload.jks \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

With PKCS12, the key password is the same as the keystore password.

Store `upload.jks` and its password somewhere safe, such as a password manager. Never commit it. This is only the *upload* key: Google keeps the real app signing key through Play App Signing. If you lose the upload key, you can ask Play support to reset it.

### 2. Add GitHub secrets

In GitHub, go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret | Value |
| --- | --- |
| `ANDROID_UPLOAD_KEYSTORE_BASE64` | `base64 -w 0 upload.jks` (macOS: `base64 -i upload.jks \| tr -d '\n'`) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | `upload` (or the alias you chose) |
| `ANDROID_KEY_PASSWORD` | Key password (same as the keystore password for PKCS12) |
| `PLAY_SERVICE_ACCOUNT_JSON` | Contents of the service-account JSON key from step 5 |

### 3. Create the app in Play Console

In [Play Console](https://play.google.com/console), choose **Create app**. The package name is fixed when you upload the first bundle and must be `com.maxmayorov.sevenminutesworkout`, the value of `expo.android.package` in `app.json`. Keep the default **Play App Signing**.

### 4. Upload the first bundle by hand

Google only allows API uploads after an app has had at least one bundle uploaded through Play Console.

1. With the keystore secrets from step 2 in place, open **Actions → Release → Run workflow** and pick `main`. The workflow builds and signs the bundle but never uploads a manual run to Play.
2. Open the workflow run and download the `app-release-…` artifact.
3. In Play Console, go to **Test and release → Testing → Internal testing → Create new release**, upload `app-release.aab`, and roll it out to your testers.

### 5. Create a service account for uploads

1. In [Google Cloud Console](https://console.cloud.google.com/), create or pick a project and enable the **Google Play Android Developer API**.
2. Go to **IAM & Admin → Service accounts → Create service account**. No Cloud roles are needed.
3. Open the account, go to **Keys → Add key → JSON**, and paste the downloaded file into the `PLAY_SERVICE_ACCOUNT_JSON` secret.
4. In Play Console, go to **Users and permissions → Invite new users** and enter the service account's email. Under **App permissions**, add this app and grant:
   - View app information
   - Release apps to testing tracks
   - Release to production, exclude devices, and use Play App Signing

### 6. Turn on uploads

In GitHub, go to **Settings → Secrets and variables → Actions → Variables** and add:

| Variable | Value |
| --- | --- |
| `PLAY_UPLOAD_ENABLED` | `true` |
| `PLAY_RELEASE_STATUS` | `draft` *while the app has never been published*, then delete it (the default is `completed`) |

Until Google has reviewed and published the app once, the Play API only accepts **draft** releases. With `draft`, each upload appears in Play Console and you press **Roll out** yourself. After the first publication, remove the variable so releases roll out automatically.

## Day-to-day

- **Try a build on your phone:** run **Actions → APK → Run workflow** and install the APK from the run's artifacts (see above). Merging to `main` doesn't build anything by itself.
- **Get a signed AAB without publishing:** **Actions → Release → Run workflow**, then download the `app-release-…` artifact.
- **Publish to Google Play:** tag the commit and push the tag.

  ```bash
  git tag v1.2.0
  git push origin v1.2.0
  ```

  The release goes to Google for review, then to all users. The version shown in the app and in Play is `1.2.0`.

## Before your first production release

Play Console asks for more than a bundle. Its **Dashboard** lists what's missing:

- **Store listing:** title, descriptions, icon (`assets/icon.png`), feature graphic and phone screenshots.
- **App content:** content rating questionnaire, target audience, ads declaration, data safety form and a privacy policy URL.
  - All workout and weight data stays on the device and nothing is sent anywhere, which keeps the data safety form simple.
- **New personal developer accounts:** Google requires a closed test with at least 12 opted-in testers for 14 days in a row before you can apply for production access. Upload a build to the closed testing track by hand from Play Console (or ask for a workflow that targets it); `release.yml` publishes only to production.

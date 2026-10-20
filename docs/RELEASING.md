# Releasing to Google Play

Two GitHub Actions workflows build the app with Gradle on GitHub's runners. No Expo account or EAS is involved.

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | Pull requests and pushes to `main` | Typecheck, lint, unit tests, JS bundle, then an unsigned (debug-key) Android build of the native project |
| `release.yml` | Push to `main` | Signed `.aab` → **internal testing** track |
| `release.yml` | Tag `v1.2` or `v1.2.3` | Signed `.aab` → **production** track |

How a release build works:

1. `npx expo prebuild` generates the `android/` project from `app.json`. The folder is not committed.
2. `./gradlew bundleRelease` builds the bundle. `plugins/withReleaseSigning.js` signs it with your **upload key** from GitHub secrets.
3. [`r0adkll/upload-google-play`](https://github.com/r0adkll/upload-google-play) uploads the bundle and its ProGuard mapping file.

**Versions**

- `versionCode` is `100 + workflow run number`, so it is unique and always increases.
- `versionName` is the tag without the `v` (for example `1.2.3`). Builds from `main` are named `<app.json version>-internal.<versionCode>`.

The signed bundle is also kept as a workflow artifact for 30 days.

## One-time setup

The workflows only run on `main`. If this repository has no `main` branch yet, merge the app's branch into `main` and make `main` the default branch.

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

In [Play Console](https://play.google.com/console), choose **Create app**. The package name is fixed when you upload the first bundle and must be `com.maxmayorov.sevenminworkout`, the value of `expo.android.package` in `app.json`. Keep the default **Play App Signing**.

### 4. Upload the first bundle by hand

Google only allows API uploads after an app has had at least one bundle uploaded through Play Console.

1. Push to `main`. Leave the `PLAY_UPLOAD_ENABLED` variable unset for now; the workflow then builds and signs the bundle but skips the upload.
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

- **Internal testing:** merge to `main`. A few minutes after the workflow finishes, testers get the new build.
- **Production:** tag the commit and push the tag.

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
- **New personal developer accounts:** Google requires a closed test with at least 12 opted-in testers for 14 days in a row before you can apply for production access. Run that on the closed testing track first.

# Taipei Trails (iOS, TestFlight)

Native iPhone app that recommends runs and hikes in Taipei that fit your distance, time on trail, and travel limit from wherever you are staying. Uses GPS ("Use my location"), Apple Maps hotel lookup, an MRT station picker, and an English / 繁體中文 toggle.

Bundle ID: `com.qerberos.taipeitrails`

## Ship to TestFlight

Run each command from this folder, one at a time:

    cd ~/sei/devday/testflight
    npm install -g eas-cli
    npm install
    eas login
    eas init
    eas build --platform ios --profile production
    eas submit --platform ios --latest

- `eas init` links the project to your Expo account (answer Y). Commit the updated `app.json` afterwards.
- `eas build` asks for your Apple ID and creates the certificates and provisioning profile (answer Y).
- `eas submit` uploads the build to App Store Connect. It appears in TestFlight after Apple processing (usually 10 to 30 minutes).
- The production profile auto-increments the build number, so repeat `eas build` and `eas submit` for each new TestFlight release.

## Quick preview (optional)

    npx expo start

Scan the QR code with the iPhone camera to open it in Expo Go.

## Files

- `App.js`: screen and UI
- `src/data.js`: trails, MRT stations, EN / zh-Hant strings
- `src/logic.js`: time estimates and ranking
- `app.json`: app name, bundle ID, location permission text
- `eas.json`: build and submit profiles

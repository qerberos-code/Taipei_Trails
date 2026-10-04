# Taipei Trails (Expo)

Recommends runs and hikes in Taipei that fit your distance, time on trail, and travel limit from wherever you are staying. English / 繁體中文 toggle.

## Run on your iPhone with Expo Go (free, about 2 minutes)

    npm install
    npx expo start

Scan the QR code with the iPhone Camera app. It opens in Expo Go.

## Ship to TestFlight

    npx eas-cli@latest login
    npx eas-cli@latest init
    npx eas-cli@latest build --platform ios --profile production
    npx eas-cli@latest submit --platform ios --latest

The first build asks you to sign in with your Apple ID and creates the certificates and the App Store Connect app for bundle id `com.qerberos.taipeitrails`. Uses 1 of the 15 free iOS builds a month on the Expo Free plan.

## Files

- `App.js`: screen and UI
- `src/data.js`: trails, MRT stations, EN / zh-Hant strings
- `src/logic.js`: time estimates and ranking

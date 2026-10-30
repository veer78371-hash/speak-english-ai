# Speak English AI — Android-installable PWA

This starter app runs as an installable Android web app (PWA). On Android, open its HTTPS address in Chrome and choose **Install app** or **Add to Home screen**.

## Included
- ChatGPT-powered English tutor conversation
- Daily conversation, job interview, work/customer and grammar practice modes
- Voice input through browser speech recognition where supported
- Odia + English, Hindi + English, or English-only explanations
- Daily practice counter and simple practice goals
- Installable home-screen app shell and basic offline caching

## Important: connect the AI
The app needs an OpenAI API key on the server. The key is never placed in the Android/browser code.

1. Install Node.js 18 or newer on a computer or hosting service.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your API key in `.env` as `OPENAI_API_KEY=...`.
5. Run `npm start`.
6. Deploy the app to a host with HTTPS. Keep `.env` private; never upload it publicly.
7. Open the HTTPS site in Chrome on Android and install it.

The backend uses the OpenAI Responses API. API usage may incur charges. Set billing limits and protect your key. Do not share your key with anyone.

## Android APK
This package is an installable PWA, not a signed APK. It can be installed from Chrome on Android after HTTPS deployment. A native APK would require an Android build environment and signing.

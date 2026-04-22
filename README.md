# Lectio

A native [Komga](https://komga.org/) client for Android and iOS, focused on books.

## Why

Most existing Komga clients are built around comics and manga. Lectio is built for readers whose libraries are mostly books: EPUB, PDF, FB2, and similar formats. The goal is a reading-first experience rather than a page-by-page image viewer.

## Design

The aim is a clean, library-first layout with large covers, readable metadata, and a reader that feels closer to a dedicated e-reader than a comic viewer.

<div align="center">

**Getting started & browsing**

| Sign In | Home | Libraries | Series |
|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/c07c00b5-ddba-4be4-b3ac-1a1d89b6757e" width="200"/> | <img src="https://github.com/user-attachments/assets/2b7832b9-24dd-48c4-9dd7-90a8cdf6d8c0" width="200"/> | <img src="https://github.com/user-attachments/assets/61a61aec-763d-4784-81ed-2a4fbe5dcb68" width="200"/> | <img src="https://github.com/user-attachments/assets/3e5d30f6-06a2-44d0-ab09-3237eb5f5f08" width="200"/> |

**Discovery**

| Books | Authors | Collections | Reading Lists |
|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/7051a9d5-de17-485d-8c00-f69cbe3336c8" width="200"/> | <img src="https://github.com/user-attachments/assets/174b48d1-4de8-4ccd-b47b-23ff8bae44e3" width="200"/> | <img src="https://github.com/user-attachments/assets/2c29b856-3de3-4ff0-af62-6021b04416f7" width="200"/> | <img src="https://github.com/user-attachments/assets/c33b9891-fbee-4532-8b8e-0c16217a9d9b" width="200"/> |

**Themes & settings**

| Settings | Theme 1 | Theme 2 | Theme 3 |
|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/35bcf809-985d-4c6a-8dce-1e3ebd2b5f6d" width="200"/> | <img src="https://github.com/user-attachments/assets/02c12d77-9126-4fc6-80f7-df9833bc7817" width="200"/> | <img src="https://github.com/user-attachments/assets/91ae20dd-67c6-4c29-a464-85bd0e0c92cf" width="200"/> | <img src="https://github.com/user-attachments/assets/00c50aad-760d-448a-bcd1-2dd64b9017e1" width="200"/> |

</div>

## Requirements

- Komga server, version 1.24.0 or later
- A Komga user account

## Tech Stack

- React Native (Expo 54) 
- TypeScript
- React Navigation (bottom tabs + native stack)
- Zustand for state management
- Axios for HTTP
- UniWind for styling
- AsyncStorage for persisted auth and settings
- Lucide icons

## Getting Started

```bash
npm install
npx expo run:android
npx expo run:ios
```

You will need a running Komga server and a user account on it.

### Demo Mode

If you want to share the app with someone who does not have a Komga server, you can run Lectio in a bundled demo mode:

```bash
EXPO_PUBLIC_DEMO_MODE=true npx expo start
```

In demo mode the app skips server authentication and loads a static public-domain sample library with:

- 2 libraries
- 10 series
- 38 books
- genres, tags, publishers, language, age ratings, and read progress
- 2 collections
- 1 reading list

You can also download the release APK and let people enter the bundled demo library from the login screen. Demo sessions are stored on-device until the user signs out.

## Project Structure

```
src/
  providers/     Library backend adapters (Komga, base interface)
  store/         Zustand stores (auth, library, browse, bookmarks, progress)
  navigation/    React Navigation stacks and tab layout
  screens/       App screens (Login, Libraries, Series, Book, Reader, etc.)
  components/    Shared UI components (CoverImage, etc.)
  hooks/         Reusable hooks
  theme/         Theme tokens and helpers
  sync/          KOReader kosync integration
```

## Roadmap

- [x] Komga authentication (session token via `X-Auth-Token`, Basic auth for images)
- [x] Library, series, and book metadata fetching and rendering
- [x] Authors, collections, and read lists browsing
- [x] Bookmarks 
- [x] UI layout, navigation, and theming
- [x] Search, filter, and sort across libraries
- [ ] Offline caching with a local database (in progress)
- [ ] Creating and managing read lists and collections from the app
- [ ] EPUB reader
- [ ] PDF reader
- [ ] FB2 reader
- [ ] Read progress tracking, synced back to Komga
- [ ] Per-book reader settings (font, size, theme, line spacing)
- [ ] KOReader kosync integration for sharing progress with e-ink devices
- [ ] Downloading books for offline reading
- [ ] Reading statistics (time read, books finished, streaks)
- [ ] Kavita support (tentative)

## Supported Backend

- Komga

## Contributing

Issues and pull requests are welcome. Please open an issue first for larger changes so the approach can be discussed before work starts.

## Acknowledgements

- [Komga](https://komga.org/) for the server this app is built around
- [Bookfusion](https://www.bookfusion.com) for the UI inspiration

## Disclaimer

Lectio is an independent, community-built client and is not affiliated with or endorsed by Komga or Bookfusion.

## License

MIT

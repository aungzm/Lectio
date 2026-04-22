# Lektio

A native [Komga](https://komga.org/) client for Android and iOS, focused on books.

## Why

Most existing Komga clients are built around comics and manga. Lektio is built for readers whose libraries are mostly books: EPUB, PDF, FB2, and similar formats. The goal is a reading-first experience rather than a page-by-page image viewer.

## Design

The aim is a clean, library-first layout with large covers, readable metadata, and a reader that feels closer to a dedicated e-reader than a comic viewer.

## Requirements

- Komga server, version 1.24.0 or later
- A Komga user account

## Tech Stack

- React Native (Expo 54) 
- TypeScript
- React Navigation (bottom tabs + native stack)
- Zustand for state management
- Axios for HTTP
- NativeWind for styling
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

If you want to share the app with someone who does not have a Komga server, you can run Lektio in a bundled demo mode:

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

The seeded metadata is based on public-domain classics so you can attach your own compatible covers later.

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

Lektio is an independent, community-built client and is not affiliated with or endorsed by Komga or Bookfusion.

## License

MIT

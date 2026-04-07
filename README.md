# Lektio

A React Native companion reading app for self-hosted e-libraries. Connect to your personal book server, sync reading progress via KOReader, and read ebooks directly in-app on iOS and Android.

## Vision

Self-hosted e-library servers like Kavita are excellent for managing your personal collection, but their mobile experience is often limited or browser-based. Lektio bridges that gap by providing a native mobile reading experience that connects to your existing infrastructure — with no cloud lock-in.

The app is designed from the ground up to support multiple library backends. Kavita is the first supported provider, with others planned.

## Planned Features

### Library Integration
- Browse your Kavita library: series, volumes, chapters, and reading lists
- Search, filter, and sort your collection
- View metadata: covers, descriptions, genres, tags, ratings
- Track reading status and progress synced back to the server

### In-App Reading
- Native epub rendering via `@epubjs-react-native` (or equivalent)
- Customizable reader: font, size, theme (light/dark/sepia), line spacing
- Tap-to-turn / swipe navigation
- Chapter navigation and table of contents

### KOReader Progress Sync
- Sync reading position and progress with KOReader via the kosync protocol
- Resume on any device — phone, tablet, or KOReader e-ink device
- Two-way sync: positions set in Lektio appear in KOReader and vice versa

### Multi-Provider Support
- Plugin-style provider system — add a server URL and authenticate
- Kavita (v0.8.9.33+) — JWT auth via `/api/Account/login`
- Planned: Calibre-Web, Komga, Audiobookshelf

### Offline Support
- Download books for offline reading
- Offline progress tracked and synced when back online

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo or bare workflow) |
| Navigation | React Navigation |
| State management | Zustand or Redux Toolkit |
| Epub rendering | `@epubjs-react-native` / `react-native-epub-view` |
| HTTP client | Axios or fetch with typed API layer |
| KOReader sync | kosync REST protocol (self-hosted or third-party) |
| Storage | AsyncStorage + SQLite (via expo-sqlite or react-native-mmkv) |
| Auth | JWT (Kavita), extensible per provider |

## Supported Backends

### Kavita
- API: OpenAPI 3.0, JWT-authenticated
- Tested against: v0.8.9.33
- Features used: Account, Library, Series, Volume, Chapter, Reader endpoints
- Docs: https://wiki.kavitareader.com/en/api

### Future Providers
- Calibre-Web (Content Server API)
- Komga (REST API)
- Audiobookshelf (for audiobooks)

## KOReader Sync

Lektio implements the [kosync](https://github.com/koreader/koreader/tree/master/plugins/kosync.koplugin) protocol to sync reading positions. This requires a kosync-compatible server (e.g. [koreader-sync-server](https://github.com/koreader/koreader-sync-server) or a Kavita instance with sync support).

Progress synced per document:
- Current page / CFI position
- Percentage complete
- Last read timestamp

## Project Structure (Planned)

```
src/
  providers/          # Library backend adapters (Kavita, Komga, ...)
    kavita/           # Kavita API client, types, auth
    base/             # ILibraryProvider interface
  sync/               # KOReader kosync integration
  reader/             # Epub reader component and controls
  screens/            # App screens (Home, Library, Reader, Settings)
  store/              # Global state (auth, library, progress)
  components/         # Shared UI components
```

## Getting Started

> Setup instructions will be added once the project scaffolding is in place.

```bash
# Install dependencies
npm install

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Roadmap

- [ ] Project scaffolding (Expo + TypeScript)
- [ ] Kavita auth + library browsing
- [ ] Epub reader integration
- [ ] KOReader progress sync
- [ ] Offline download support
- [ ] Second provider (Calibre-Web or Komga)
- [ ] App Store / Google Play release

## License

MIT

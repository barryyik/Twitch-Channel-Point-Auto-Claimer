# Twitch Channel Point Auto Claimer

## About
This is a chrome extension for collecting Twitch Points on Twitch.tv.

## How To Use
1. Refresh twitch websites after installation. It will then check and claim channel points automatically if the "claim special bonuses" button is present.
2. You can check how many points has been claimed by this extension for each channel by clicking the extension icon.

## Chrome Web Store Extension:
https://chrome.google.com/webstore/detail/twitch-channel-point-auto/fchmanciglollaagnijpcagpofejennb

## Made With:
- Bun v1.3.9

## How To Compile:
```
bun install
bun run build
```

After code changes, run `bun run build:chrome` or `bun run build:firefox`, then reload the unpacked extension in your browser. Manifest `version` is set from `package.json` at build time. Use `bun run dev` for popup-only Vite preview on port 5173.

## Update log

```
Version 1.4.0 (2026.09.03):
- Add: Pin channels to favourites; pinned rows appear first in user-defined order
- Add: ↑/↓ reorder controls for pinned rows
- Add: Clear-record confirms when clearing removes a pinned channel
- Fix: Scrollbar gutter only when table body overflows

Version 1.3.1 (2026.08.31):
- Fix: Body MutationObserver only rediscovers community-points-summary; full claim checks no longer run on every chat DOM mutation
- Change: Outside-summary claim buttons are picked up by the 5s interval (~5s latency by design; was ~500ms via body observer)
- Change: Combined multi-locale aria-label selector (single querySelector fallback)
- Change: Extension version taken from package.json at build time (manifests + popup fallback)
- Change: Remove no-op --watch / dev:chrome / dev:firefox scripts; iterate with build:chrome or build:firefox
- Fix: Settings exclude URL matches bare /settings as well as /settings/...
- Fix: Drop ungated console.warn in channel-parser decode path
- Change: Theme menu menuitem roles; ConfirmDialog focus trap and restore to trigger

Version 1.3.0 (2026.08.22):
- Add: Six accent color presets (teal, green, blue, purple, orange, pink) in theme menu
- Add: Accent color persistence with pre-paint apply via theme-boot (no flash on reload)
- Add: i18n for accent labels (en + zh-TW)
- Fix: Claim button discovery when bonus UI renders outside community-points-summary
- Change: Body observer triggers claim checks on DOM changes outside summary subtree
- Change: Single source of truth for accent presets (accent-presets.js + generated theme-boot)
- Change: Content script build fails if stray export keywords remain after injection
- Change: theme-boot.js gitignored like content.js; predev generates for local dev

Version 1.2.3 (2026.08.12):
- Fix: Prevent double-counting claims (cooldown + handled button guard)
- Fix: Multi-tab storage races via background single-writer increments
- Fix: Normalize channel names to lowercase; merge legacy casing
- Change: Scoped MutationObserver on community-points-summary; 5s fallback interval
- Change: Prefer stable claim selectors; demote hashed CSS classes
- Change: Popup shows claim counts only (removed ×50 estimate)
- Add: Live popup updates via storage.onChanged; theme FOUC mirror
- Add: i18n for confirms, empty/loading, theme labels
- Change: Refactor claim helpers, popup i18n/theme modules

Version 1.2.2 (2026.06.29):
- Change: Built with React + Vite
- Add: Light & Dark Theme
- Add: Clear record confirmation
- Add: Firefox support
- Fix: Fix a bug when user is accessing a moderator page

Version 1.1.1 (2022.03.16):
- Fix: Exclude dashboard.twitch.tv and Setting page

Version 1.1.0 (2021.09.26):
- Change: Migrated from Manifest V2 to Manifest V3

Version 1.0.8 (2021.07.22):
- Fix: Record cannot be cleared

Version 1.0.7 (2021.05.25):
- Change: Bonus button detection is now more adaptive for future Twitch changes

Version 1.0.6 (2021.05.18):
- Change: Updated with Twitch.tv new button name
- Change: Minor UI changes

Version 1.0.5 (2021.04.26):
- Change: Enhanced performance
- Change: Reduced extension file size

Version 1.0.4 (2021.03.26):
- Change: Enhanced performance

Version 1.0.3 (2021.02.24):
- Fix: Display bug

Version 1.0.2 (2021.02.21):
- Change: Reduced extension file size
- Change: Minor UI tweaks

Version 1.0.1 (2021.02.12):
- Add: zh-TW language support
- Change: Minor UI tweaks
```
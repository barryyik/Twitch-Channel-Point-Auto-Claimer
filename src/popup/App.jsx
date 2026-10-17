import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { storage, runtime } from '../utils/browser-api.js';
import {
  partitionChannels,
  pruneFavorites,
  toggleFavorite,
  isPinned,
  removeFavorite,
  reorderFavorites,
  normalizeChannel
} from '../utils/favorites.js';
import { getMessage } from './i18n.js';
import { useTheme, ACCENT_PRESETS } from './useTheme.js';
import { PaletteIcon, MonitorIcon, SunIcon, MoonIcon } from './ThemeIcons.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import PinnedRow from './PinnedRow.jsx';
import ChannelRow from './ChannelRow.jsx';
import SortableHeader from './SortableHeader.jsx';
import {
  DEFAULT_SORT,
  SORT_STORAGE_KEY,
  normalizeSortPreference,
  nextSortPreference,
  sortChannels
} from '../utils/channel-sort.js';
import './App.css';

const TABLE_COLS = (
  <colgroup>
    <col />
    <col />
    <col />
    <col />
    <col />
    <col />
  </colgroup>
);

const App = () => {
  const [claimData, setClaimData] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [sortPreference, setSortPreference] = useState(DEFAULT_SORT);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const headTableRef = useRef(null);
  const headWrapRef = useRef(null);
  const bodyTableRef = useRef(null);
  const confirmTriggerRef = useRef(null);
  const {
    theme,
    accent,
    showThemeMenu,
    setShowThemeMenu,
    menuRef,
    saveThemePreference,
    saveAccentPreference
  } = useTheme();

  const applyLoadedData = useCallback((result) => {
    const claims = result.tcpacObj || {};
    const rawFavorites = result.tcpacFavorites || [];
    const pruned = pruneFavorites(rawFavorites, claims);
    setClaimData(claims);
    setFavorites(pruned);
    if (Object.prototype.hasOwnProperty.call(result, SORT_STORAGE_KEY)) {
      setSortPreference(normalizeSortPreference(result[SORT_STORAGE_KEY]));
    }
    if (pruned.length !== rawFavorites.length) {
      storage.local.set({ tcpacFavorites: pruned });
    }
    setLoading(false);
  }, []);

  const loadData = useCallback(() => {
    storage.local.get(['tcpacObj', 'tcpacFavorites', SORT_STORAGE_KEY], applyLoadedData);
  }, [applyLoadedData]);

  const handleSort = (column) => {
    const next = nextSortPreference(sortPreference, column);
    setSortPreference(next);
    storage.local.set({ [SORT_STORAGE_KEY]: next });
  };

  const restoreConfirmFocus = useCallback(() => {
    confirmTriggerRef.current?.focus();
    confirmTriggerRef.current = null;
  }, []);

  const handleTogglePin = useCallback(
    (channel) => {
      const next = toggleFavorite(favorites, channel);
      setFavorites(next);
      storage.local.set({ tcpacFavorites: next });
    },
    [favorites]
  );

  const handleMovePinned = useCallback(
    (channel, direction) => {
      const from = favorites.findIndex(
        (entry) => normalizeChannel(entry) === normalizeChannel(channel)
      );
      if (from < 0) return;

      const to = from + (direction === 'up' ? -1 : 1);
      if (to < 0 || to >= favorites.length) return;

      const next = reorderFavorites(favorites, from, to);
      setFavorites(next);
      storage.local.set({ tcpacFavorites: next });
    },
    [favorites]
  );

  const requestClearAll = (event) => {
    confirmTriggerRef.current = event.currentTarget;
    const pinnedCount = favorites.length;
    setConfirmState({ type: 'all', pinnedCount });
  };

  const requestClearChannel = (channelName) => (event) => {
    confirmTriggerRef.current = event.currentTarget;
    setConfirmState({
      type: 'channel',
      channel: channelName,
      isPinned: isPinned(favorites, channelName)
    });
  };

  const handleConfirmCancel = useCallback(() => {
    setConfirmState(null);
    restoreConfirmFocus();
  }, [restoreConfirmFocus]);

  const handleConfirmOk = useCallback(() => {
    if (!confirmState) return;

    const closeDialog = () => {
      loadData();
      setConfirmState(null);
      restoreConfirmFocus();
    };

    if (confirmState.type === 'all') {
      storage.local.remove(['tcpacObj', 'tcpacFavorites'], closeDialog);
      return;
    }

    if (confirmState.type === 'channel') {
      const channelName = confirmState.channel;
      storage.local.get(['tcpacObj', 'tcpacFavorites'], (result) => {
        const newData = { ...(result.tcpacObj || {}) };
        delete newData[channelName];
        const newFavorites = removeFavorite(result.tcpacFavorites || [], channelName);
        storage.local.set(
          { tcpacObj: newData, tcpacFavorites: newFavorites },
          closeDialog
        );
      });
    }
  }, [confirmState, restoreConfirmFocus, loadData]);

  useEffect(() => {
    if (runtime && runtime.getManifest) {
      setVersion(runtime.getManifest().version);
    } else {
      setVersion(__APP_VERSION__);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!storage?.onChanged) return undefined;

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== 'local') return;
      if (changes[SORT_STORAGE_KEY]) {
        setSortPreference(normalizeSortPreference(changes[SORT_STORAGE_KEY].newValue));
      }
      if (!changes.tcpacObj && !changes.tcpacFavorites) return;

      storage.local.get(['tcpacObj', 'tcpacFavorites'], applyLoadedData);
    };

    storage.onChanged.addListener(handleStorageChange);
    return () => {
      storage.onChanged.removeListener(handleStorageChange);
    };
  }, [applyLoadedData]);

  // Size columns to content and keep header/body tables aligned
  useLayoutEffect(() => {
    if (loading) return;

    const headTable = headTableRef.current;
    const bodyTable = bodyTableRef.current;
    if (!headTable || !bodyTable) return;

    const headCols = headTable.querySelectorAll('colgroup col');
    const bodyCols = bodyTable.querySelectorAll('colgroup col');
    const ths = headTable.querySelectorAll('thead th');
    if (!ths.length) return;

    headTable.style.tableLayout = 'auto';
    bodyTable.style.tableLayout = 'auto';
    headCols.forEach((col) => {
      col.style.width = '';
    });
    bodyCols.forEach((col) => {
      col.style.width = '';
    });
    headTable.style.width = 'max-content';
    bodyTable.style.width = 'max-content';

    const widths = Array.from(ths, (th) => th.getBoundingClientRect().width);
    bodyTable.querySelectorAll('tbody tr').forEach((tr) => {
      const cells = [...tr.querySelectorAll('td')];
      // Skip footer/empty rows with colspan — they inflate channel width
      if (cells.some((td) => td.colSpan > 1) || cells.length !== widths.length) {
        return;
      }
      cells.forEach((td, index) => {
        widths[index] = Math.max(widths[index], td.getBoundingClientRect().width);
      });
    });

    let total = 0;
    widths.forEach((width, index) => {
      const px = `${Math.ceil(width)}px`;
      total += Math.ceil(width);
      if (headCols[index]) headCols[index].style.width = px;
      if (bodyCols[index]) bodyCols[index].style.width = px;
    });

    const scrollEl = bodyTable.closest('.table-body-scroll');
    const headWrap = headWrapRef.current;

    headTable.style.tableLayout = 'fixed';
    bodyTable.style.tableLayout = 'fixed';
    headTable.style.width = `${total}px`;
    bodyTable.style.width = `${total}px`;

    if (scrollEl && headWrap) {
      const needsScroll = scrollEl.scrollHeight > scrollEl.clientHeight + 1;
      scrollEl.classList.toggle('table-body-scroll--overflow', needsScroll);
      headWrap.style.paddingRight = needsScroll
        ? `${Math.ceil(Math.max(0, scrollEl.offsetWidth - scrollEl.clientWidth))}px`
        : '0px';
    }
  }, [claimData, favorites, loading, sortPreference]);

  const { pinned, others } = partitionChannels(claimData, favorites);
  const sortedOthers = sortChannels(others, sortPreference);
  const hasRecords = Object.keys(claimData).length > 0;
  const showOthersDivider = pinned.length > 0 && others.length > 0;

  const confirmMessage = (() => {
    if (confirmState?.type === 'all') {
      if (confirmState.pinnedCount === 1) {
        return getMessage('confirmclearallwithpinssingle');
      }
      if (confirmState.pinnedCount > 1) {
        return getMessage('confirmclearallwithpins', [confirmState.pinnedCount]);
      }
      return getMessage('confirmclearall');
    }
    if (confirmState?.type === 'channel') {
      if (confirmState.isPinned) {
        return getMessage('confirmclearchannelpinned', [confirmState.channel]);
      }
      return getMessage('confirmclearchannel', [confirmState.channel]);
    }
    return '';
  })();

  const confirmLabel =
    confirmState?.type === 'all' ? getMessage('clearall') : getMessage('clear');

  return (
    <div className="container">
      <div className="header-section">
        <h1 className="popup-title">Twitch Channel Point Auto Claimer</h1>

        <div className="theme-toggle-wrapper" ref={menuRef}>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title={getMessage('toggledtheme')}
            aria-label={getMessage('toggledtheme')}
            aria-expanded={showThemeMenu}
          >
            <PaletteIcon />
          </button>

          {showThemeMenu && (
            <div className="theme-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className={`theme-dropdown-item ${theme === 'system' ? 'active' : ''}`}
                onClick={() => saveThemePreference('system')}
              >
                <MonitorIcon />
                {getMessage('system')}
              </button>
              <button
                type="button"
                role="menuitem"
                className={`theme-dropdown-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => saveThemePreference('light')}
              >
                <SunIcon />
                {getMessage('light')}
              </button>
              <button
                type="button"
                role="menuitem"
                className={`theme-dropdown-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => saveThemePreference('dark')}
              >
                <MoonIcon />
                {getMessage('dark')}
              </button>

              <div className="theme-dropdown-divider" role="separator" />
              <div className="accent-section">
                <div className="accent-section-label">{getMessage('accent')}</div>
                <div className="accent-swatch-row" role="group" aria-label={getMessage('accent')}>
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`accent-swatch ${accent === preset.id ? 'active' : ''}`}
                      style={{ '--swatch-color': preset.swatch }}
                      onClick={() => saveAccentPreference(preset.id)}
                      title={getMessage(`accent${preset.id}`)}
                      aria-label={getMessage(`accent${preset.id}`)}
                      aria-pressed={accent === preset.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="tcpacDisplayDiv">
        {loading ? (
          <div className="loading">{getMessage('loading')}</div>
        ) : (
          <div className="table-card">
            <div className="table-head-wrap" ref={headWrapRef}>
              <table className="table-head" ref={headTableRef}>
                {TABLE_COLS}
                <thead>
                  <tr>
                    <th className="col-pin" aria-label={getMessage('pin')} />
                    <th className="col-drag" aria-label={getMessage('reorder')} />
                    <SortableHeader column="channel" label={getMessage('channel')}
                      preference={sortPreference} onSort={handleSort} />
                    <SortableHeader column="count" label={getMessage('claimedcount')}
                      className="col-num" preference={sortPreference} onSort={handleSort} />
                    <SortableHeader column="points" label={getMessage('approxpoints')}
                      className="col-num" preference={sortPreference} onSort={handleSort} />
                    <th className="col-clear-cell">{getMessage('clearrecord')}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="table-body-scroll">
              <table className="table-body" ref={bodyTableRef}>
                {TABLE_COLS}
                <tbody>
                  {!hasRecords ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        {getMessage('empty')}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {pinned.map(({ channel, count }) => {
                        const index = favorites.findIndex(
                          (entry) =>
                            normalizeChannel(entry) === normalizeChannel(channel)
                        );
                        return (
                          <PinnedRow
                            key={channel}
                            channel={channel}
                            count={count}
                            canMoveUp={index > 0}
                            canMoveDown={index >= 0 && index < favorites.length - 1}
                            onTogglePin={handleTogglePin}
                            onMove={handleMovePinned}
                            onClearChannel={requestClearChannel}
                          />
                        );
                      })}
                      {showOthersDivider && (
                        <tr className="section-divider-row">
                          <td colSpan="6">{getMessage('others')}</td>
                        </tr>
                      )}
                      {sortedOthers.map(({ channel, count }) => (
                        <ChannelRow
                          key={channel}
                          channel={channel}
                          count={count}
                          onTogglePin={handleTogglePin}
                          onClearChannel={requestClearChannel}
                        />
                      ))}
                    </>
                  )}
                  {hasRecords && (
                    <tr className="last-row">
                      <td colSpan="5" />
                      <td className="col-clear-cell">
                        <button
                          type="button"
                          className="tcpacDelBtn"
                          id="tcpacResetBtn"
                          onClick={requestClearAll}
                        >
                          {getMessage('clearall')}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div id="creditDiv">
        <p>
          Made by{' '}
          <a href="https://github.com/barryyik" target="_blank" rel="noopener noreferrer">
            Barry Yik
          </a>
          {' · '}
          Version {version}
        </p>
      </div>

      <ConfirmDialog
        open={confirmState != null}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default App;

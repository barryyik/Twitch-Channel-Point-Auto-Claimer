import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { storage, runtime } from '../utils/browser-api.js';
import { getMessage } from './i18n.js';
import { useTheme } from './useTheme.js';
import { PaletteIcon, MonitorIcon, SunIcon, MoonIcon, TrashIcon } from './ThemeIcons.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import './App.css';

const TABLE_COLS = (
  <colgroup>
    <col />
    <col />
    <col />
    <col />
  </colgroup>
);

const App = () => {
  const [claimData, setClaimData] = useState({});
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const headTableRef = useRef(null);
  const headWrapRef = useRef(null);
  const bodyTableRef = useRef(null);
  const {
    theme,
    showThemeMenu,
    setShowThemeMenu,
    menuRef,
    saveThemePreference
  } = useTheme();

  const loadData = () => {
    storage.local.get('tcpacObj', (result) => {
      setClaimData(result.tcpacObj || {});
      setLoading(false);
    });
  };

  const requestClearAll = () => {
    setConfirmState({ type: 'all' });
  };

  const requestClearChannel = (channelName) => {
    setConfirmState({ type: 'channel', channel: channelName });
  };

  const handleConfirmCancel = () => {
    setConfirmState(null);
  };

  const handleConfirmOk = () => {
    if (!confirmState) return;

    if (confirmState.type === 'all') {
      storage.local.remove('tcpacObj', () => {
        loadData();
        setConfirmState(null);
      });
      return;
    }

    if (confirmState.type === 'channel') {
      const channelName = confirmState.channel;
      storage.local.get('tcpacObj', (result) => {
        const newData = { ...(result.tcpacObj || {}) };
        delete newData[channelName];
        storage.local.set({ tcpacObj: newData }, () => {
          loadData();
          setConfirmState(null);
        });
      });
    }
  };

  useEffect(() => {
    if (runtime && runtime.getManifest) {
      setVersion(runtime.getManifest().version);
    } else {
      setVersion('1.2.3');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!storage?.onChanged) return undefined;

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== 'local' || !changes.tcpacObj) return;
      setClaimData(changes.tcpacObj.newValue || {});
      setLoading(false);
    };

    storage.onChanged.addListener(handleStorageChange);
    return () => {
      storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

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
    const scrollbarWidth = scrollEl
      ? Math.ceil(Math.max(0, scrollEl.offsetWidth - scrollEl.clientWidth))
      : 0;

    headTable.style.tableLayout = 'fixed';
    bodyTable.style.tableLayout = 'fixed';
    headTable.style.width = `${total}px`;
    bodyTable.style.width = `${total}px`;
    // Pad header wrap to cover the body scrollbar gutter (avoids empty strip)
    if (headWrap) {
      headWrap.style.paddingRight = `${scrollbarWidth}px`;
    }
  }, [claimData, loading]);

  const channels = Object.keys(claimData);
  const hasRecords = channels.length > 0;

  const confirmMessage =
    confirmState?.type === 'all'
      ? getMessage('confirmclearall')
      : confirmState?.type === 'channel'
        ? getMessage('confirmclearchannel', [confirmState.channel])
        : '';

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
                className={`theme-dropdown-item ${theme === 'system' ? 'active' : ''}`}
                onClick={() => saveThemePreference('system')}
              >
                <MonitorIcon />
                {getMessage('system')}
              </button>
              <button
                type="button"
                className={`theme-dropdown-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => saveThemePreference('light')}
              >
                <SunIcon />
                {getMessage('light')}
              </button>
              <button
                type="button"
                className={`theme-dropdown-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => saveThemePreference('dark')}
              >
                <MoonIcon />
                {getMessage('dark')}
              </button>
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
                    <th>{getMessage('channel')}</th>
                    <th className="col-num">{getMessage('claimedcount')}</th>
                    <th className="col-num col-approx">{getMessage('approxpoints')}</th>
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
                      <td colSpan="4" className="empty-state">
                        {getMessage('empty')}
                      </td>
                    </tr>
                  ) : (
                    Object.entries(claimData)
                      .sort(([channelA], [channelB]) => channelA.localeCompare(channelB))
                      .map(([channel, count]) => (
                        <tr key={channel}>
                          <td>
                            <a
                              href={`https://www.twitch.tv/${channel}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {channel}
                            </a>
                          </td>
                          <td className="col-num">{count}</td>
                          <td className="col-num col-approx">~{count * 50}</td>
                          <td className="col-clear-cell">
                            <button
                              type="button"
                              className="tcpacDelBtn"
                              onClick={() => requestClearChannel(channel)}
                            >
                              <TrashIcon />
                              {getMessage('clear')}
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                  {hasRecords && (
                    <tr className="last-row">
                      <td colSpan="3"></td>
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

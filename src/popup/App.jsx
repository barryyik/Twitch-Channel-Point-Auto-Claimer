import React, { useState, useEffect, useRef } from 'react';
import { storage, i18n, runtime } from '../utils/browser-api.js';
import './App.css';

const App = () => {
  const [claimData, setClaimData] = useState({});
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');
  const [theme, setTheme] = useState('system');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef(null);

  // Get i18n message (works with both Chrome and Firefox)
  const getMessage = (messageName) => {
    if (i18n && i18n.getMessage) {
      const message = i18n.getMessage(messageName);
      if (message) return message;
    }
    // Fallback messages
    const fallbacks = {
      channel: 'Channel',
      claimedcount: 'Claimed Count (Points)',
      clearrecord: 'Clear Records',
      clear: 'Clear',
      clearall: 'Clear All',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    };
    return fallbacks[messageName] || messageName;
  };

  // Get theme icon
  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '💻';
  };

  // Load theme preference from storage
  const loadThemePreference = () => {
    storage.local.get('themePreference', (result) => {
      const savedTheme = result.themePreference || 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    });
  };

  // Apply theme to document
  const applyTheme = (themeMode) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    
    if (themeMode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'theme-dark' : 'theme-light');
    } else if (themeMode === 'dark') {
      root.classList.add('theme-dark');
    } else if (themeMode === 'light') {
      root.classList.add('theme-light');
    }
  };

  // Save theme preference
  const saveThemePreference = (themeMode) => {
    setTheme(themeMode);
    applyTheme(themeMode);
    setShowThemeMenu(false);
    storage.local.set({ themePreference: themeMode });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Load data from storage
  const loadData = () => {
    storage.local.get('tcpacObj', (result) => {
      setClaimData(result.tcpacObj || {});
      setLoading(false);
    });
  };

  // Clear all records
  const clearAllRecords = () => {
    if (window.confirm('Confirm to clear records for ALL?')) {
      storage.local.remove('tcpacObj', () => {
        loadData();
      });
    }
  };

  // Clear single channel record
  const clearChannelRecord = (channelName) => {
    if (window.confirm(`Confirm to clear records for ${channelName}?`)) {
      storage.local.get('tcpacObj', (result) => {
        const newData = { ...result.tcpacObj };
        delete newData[channelName];
        storage.local.set({ tcpacObj: newData }, () => {
          loadData();
        });
      });
    }
  };

  // Get version
  useEffect(() => {
    if (runtime && runtime.getManifest) {
      setVersion(runtime.getManifest().version);
    } else {
      setVersion('1.2.0');
    }
  }, []);

  // Load data and theme on component mount
  useEffect(() => {
    loadData();
    loadThemePreference();
  }, []);

  return (
    <div className="container">
      <div className="header-section">
        <div className="headerH1Box">
          <h1>Twitch Channel Point Auto Claimer</h1>
        </div>
        
        <div className="theme-toggle-wrapper" ref={menuRef}>
          <button 
            className="theme-toggle-btn"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title="Toggle theme"
          >
            {getThemeIcon()}
          </button>
          
          {showThemeMenu && (
            <div className="theme-dropdown">
              <button 
                className={`theme-dropdown-item ${theme === 'system' ? 'active' : ''}`}
                onClick={() => saveThemePreference('system')}
              >
                💻 System
              </button>
              <button 
                className={`theme-dropdown-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => saveThemePreference('light')}
              >
                ☀️ Light
              </button>
              <button 
                className={`theme-dropdown-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => saveThemePreference('dark')}
              >
                🌙 Dark
              </button>
            </div>
          )}
        </div>
      </div>

      <div id="tcpacDisplayDiv">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{getMessage('channel')}</th>
                <th>{getMessage('claimedcount')}</th>
                <th>{getMessage('clearrecord')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(claimData).length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>
                    N/A
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
                      <td>
                        {count} ({count * 50})
                      </td>
                      <td>
                        <button
                          className="tcpacDelBtn"
                          onClick={() => clearChannelRecord(channel)}
                        >
                          {getMessage('clear')}
                        </button>
                      </td>
                    </tr>
                  ))
              )}
              <tr className="last-row">
                <td colSpan="2"></td>
                <td>
                  <button
                    className="tcpacDelBtn"
                    id="tcpacResetBtn"
                    onClick={clearAllRecords}
                  >
                    {getMessage('clearall')}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div id="creditDiv">
        <p>
          Made by{' '}
          <a href="https://github.com/barryyik" target="_blank" rel="noopener noreferrer">
            Barry Yik
          </a>
        </p>
        <p>(Version: {version})</p>
      </div>
    </div>
  );
};

export default App;
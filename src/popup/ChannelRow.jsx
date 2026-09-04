import React from 'react';
import { getMessage } from './i18n.js';
import { StarIcon, TrashIcon } from './ThemeIcons.jsx';

const ChannelRow = ({ channel, count, onTogglePin, onClearChannel }) => {
  return (
    <tr>
      <td className="col-pin">
        <button
          type="button"
          className="pin-btn"
          onClick={() => onTogglePin(channel)}
          aria-label={getMessage('pinchannel', [channel])}
          aria-pressed="false"
        >
          <StarIcon />
        </button>
      </td>
      <td className="col-drag" aria-hidden="true" />
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
          onClick={onClearChannel(channel)}
        >
          <TrashIcon />
          {getMessage('clear')}
        </button>
      </td>
    </tr>
  );
};

export default ChannelRow;

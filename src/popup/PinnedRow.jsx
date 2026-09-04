import React from 'react';
import { getMessage } from './i18n.js';
import {
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon
} from './ThemeIcons.jsx';

const PinnedRow = ({
  channel,
  count,
  canMoveUp,
  canMoveDown,
  onTogglePin,
  onMove,
  onClearChannel
}) => {
  return (
    <tr className="row-pinned">
      <td className="col-pin">
        <button
          type="button"
          className="pin-btn pinned"
          onClick={() => onTogglePin(channel)}
          aria-label={getMessage('unpinchannel', [channel])}
          aria-pressed="true"
        >
          <StarIcon filled />
        </button>
      </td>
      <td className="col-drag">
        <div className="reorder-controls">
          <button
            type="button"
            className="reorder-btn"
            disabled={!canMoveUp}
            onClick={() => onMove(channel, 'up')}
            aria-label={getMessage('moveup', [channel])}
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            className="reorder-btn"
            disabled={!canMoveDown}
            onClick={() => onMove(channel, 'down')}
            aria-label={getMessage('movedown', [channel])}
          >
            <ChevronDownIcon />
          </button>
        </div>
      </td>
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

export default PinnedRow;

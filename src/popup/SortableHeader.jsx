import React from 'react';
import { getMessage } from './i18n.js';
import { ChevronUpIcon, ChevronDownIcon } from './ThemeIcons.jsx';
import { nextSortPreference } from '../utils/channel-sort.js';

const SortableHeader = ({ column, label, className, preference, onSort }) => {
  const active = preference.column === column;
  const ascending = preference.direction === 'asc';
  const next = nextSortPreference(preference, column);
  const action = getMessage(next.direction === 'asc' ? 'sortascending' : 'sortdescending');

  return (
    <th
      className={className}
      scope="col"
      aria-sort={active ? (ascending ? 'ascending' : 'descending') : undefined}
    >
      <button
        type="button"
        className={`sort-button${active ? ' active' : ''}`}
        onClick={() => onSort(column)}
        aria-label={`${label}: ${action}`}
        title={action}
      >
        {label}
        <span className={`sort-indicator${active ? '' : ' sort-indicator--unsorted'}`} aria-hidden="true">
          {(!active || ascending) && <ChevronUpIcon />}
          {(!active || !ascending) && <ChevronDownIcon />}
        </span>
      </button>
    </th>
  );
};

export default SortableHeader;

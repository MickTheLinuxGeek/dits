import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterDropdown } from './FilterDropdown';

const meta: Meta<typeof FilterDropdown> = {
  title: 'Issues/FilterDropdown',
  component: FilterDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dropdown component for filtering options. Used in the issue list toolbar to filter by status, priority, and other criteria.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed before the dropdown value',
    },
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    onChange: { action: 'changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterDropdown>;

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'Todo', label: 'Todo' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' },
];

const priorityOptions = [
  { value: 'all', label: 'All' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const dateOptions = [
  { value: 'all', label: 'All' },
  { value: 'with', label: 'With date' },
  { value: 'without', label: 'Without date' },
];

export const StatusFilter: Story = {
  args: {
    label: 'Status',
    value: 'all',
    options: statusOptions,
    onChange: () => {},
  },
};

export const PriorityFilter: Story = {
  args: {
    label: 'Priority',
    value: 'all',
    options: priorityOptions,
    onChange: () => {},
  },
};

export const DateFilter: Story = {
  args: {
    label: 'Due Date',
    value: 'all',
    options: dateOptions,
    onChange: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    label: 'Status',
    value: 'In Progress',
    options: statusOptions,
    onChange: () => {},
  },
};

// Interactive story
export const InteractiveStatus: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState('all');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FilterDropdown
          label="Status"
          value={value}
          options={statusOptions}
          onChange={setValue}
        />
        <div
          style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          Selected: <strong>{value}</strong>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive status filter that responds to selection.',
      },
    },
  },
};

export const InteractivePriority: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState('all');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FilterDropdown
          label="Priority"
          value={value}
          options={priorityOptions}
          onChange={setValue}
        />
        <div
          style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          Selected: <strong>{value}</strong>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive priority filter that responds to selection.',
      },
    },
  },
};

// Multiple filters together
export const MultipleFilters: Story = {
  render: function MultipleFiltersStory() {
    const [status, setStatus] = useState('all');
    const [priority, setPriority] = useState('all');
    const [date, setDate] = useState('all');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <FilterDropdown
            label="Status"
            value={status}
            options={statusOptions}
            onChange={setStatus}
          />
          <FilterDropdown
            label="Priority"
            value={priority}
            options={priorityOptions}
            onChange={setPriority}
          />
          <FilterDropdown
            label="Due Date"
            value={date}
            options={dateOptions}
            onChange={setDate}
          />
        </div>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#F3F4F6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#6B7280',
          }}
        >
          <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
            Active Filters:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>
              Status: <strong>{status}</strong>
            </li>
            <li>
              Priority: <strong>{priority}</strong>
            </li>
            <li>
              Due Date: <strong>{date}</strong>
            </li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Multiple filter dropdowns working together, as seen in the issue list toolbar.',
      },
    },
  },
};

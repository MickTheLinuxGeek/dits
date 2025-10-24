import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SortDropdown } from './SortDropdown';
import type {
  SortField,
  SortDirection,
} from '../IssueListContainer/IssueListContainer';

const meta: Meta<typeof SortDropdown> = {
  title: 'Issues/SortDropdown',
  component: SortDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dropdown component for sorting options. Allows users to select sort field and toggle direction (ascending/descending). Clicking the same field toggles direction.',
      },
    },
  },
  argTypes: {
    currentField: {
      control: 'select',
      options: [
        'title',
        'status',
        'priority',
        'dueDate',
        'createdAt',
        'updatedAt',
      ],
      description: 'Currently selected sort field',
    },
    currentDirection: {
      control: 'select',
      options: ['asc', 'desc'],
      description: 'Current sort direction',
    },
    onSortChange: { action: 'sort changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SortDropdown>;

export const DefaultSort: Story = {
  args: {
    currentField: 'createdAt',
    currentDirection: 'desc',
    onSortChange: () => {},
  },
};

export const SortByTitle: Story = {
  args: {
    currentField: 'title',
    currentDirection: 'asc',
    onSortChange: () => {},
  },
};

export const SortByPriority: Story = {
  args: {
    currentField: 'priority',
    currentDirection: 'desc',
    onSortChange: () => {},
  },
};

export const SortByDueDate: Story = {
  args: {
    currentField: 'dueDate',
    currentDirection: 'asc',
    onSortChange: () => {},
  },
};

// Interactive story
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [field, setField] = useState<SortField>('createdAt');
    const [direction, setDirection] = useState<SortDirection>('desc');

    const handleSortChange = (
      newField: SortField,
      newDirection: SortDirection,
    ) => {
      setField(newField);
      setDirection(newDirection);
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minWidth: '300px',
        }}
      >
        <SortDropdown
          currentField={field}
          currentDirection={direction}
          onSortChange={handleSortChange}
        />
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#F3F4F6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#6B7280',
          }}
        >
          <p style={{ margin: 0 }}>
            Sorting by: <strong>{field}</strong> (
            {direction === 'asc' ? 'Ascending' : 'Descending'})
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem' }}>
            💡 Tip: Click the same field to toggle direction
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sort dropdown. Click a field to sort by it, click again to toggle direction.',
      },
    },
  },
};

// Showcase all sort fields
export const AllSortFields: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Sort by Title (Ascending)
        </p>
        <SortDropdown
          currentField="title"
          currentDirection="asc"
          onSortChange={() => {}}
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Sort by Status (Descending)
        </p>
        <SortDropdown
          currentField="status"
          currentDirection="desc"
          onSortChange={() => {}}
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Sort by Priority (Descending)
        </p>
        <SortDropdown
          currentField="priority"
          currentDirection="desc"
          onSortChange={() => {}}
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Sort by Due Date (Ascending)
        </p>
        <SortDropdown
          currentField="dueDate"
          currentDirection="asc"
          onSortChange={() => {}}
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Sort by Created Date (Descending)
        </p>
        <SortDropdown
          currentField="createdAt"
          currentDirection="desc"
          onSortChange={() => {}}
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Sort by Updated Date (Descending)
        </p>
        <SortDropdown
          currentField="updatedAt"
          currentDirection="desc"
          onSortChange={() => {}}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available sort fields with different directions.',
      },
    },
  },
};

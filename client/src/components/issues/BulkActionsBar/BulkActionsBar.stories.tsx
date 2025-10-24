import type { Meta, StoryObj } from '@storybook/react';
import { BulkActionsBar } from './BulkActionsBar';

const meta: Meta<typeof BulkActionsBar> = {
  title: 'Issues/BulkActionsBar',
  component: BulkActionsBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bulk actions toolbar shown when one or more issues are selected. Provides actions for changing status, priority, and deleting multiple issues at once.',
      },
    },
  },
  argTypes: {
    selectedCount: {
      control: 'number',
      description: 'Number of selected issues',
    },
    onClearSelection: { action: 'clear selection' },
    onDelete: { action: 'delete' },
    onStatusChange: { action: 'status changed' },
    onPriorityChange: { action: 'priority changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BulkActionsBar>;

export const SingleIssue: Story = {
  args: {
    selectedCount: 1,
    onClearSelection: () => {},
    onDelete: () => {},
    onStatusChange: () => {},
    onPriorityChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Bulk actions bar with a single issue selected (shows "1 issue selected").',
      },
    },
  },
};

export const MultipleIssues: Story = {
  args: {
    selectedCount: 5,
    onClearSelection: () => {},
    onDelete: () => {},
    onStatusChange: () => {},
    onPriorityChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Bulk actions bar with multiple issues selected (shows "5 issues selected").',
      },
    },
  },
};

export const ManyIssues: Story = {
  args: {
    selectedCount: 23,
    onClearSelection: () => {},
    onDelete: () => {},
    onStatusChange: () => {},
    onPriorityChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Bulk actions bar with many issues selected.',
      },
    },
  },
};

// Interactive stories demonstrating different features
export const InteractiveStatusChange: Story = {
  render: function InteractiveStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#EFF6FF',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#1E40AF',
          }}
        >
          <p style={{ margin: 0 }}>
            💡 Try clicking "Change Status" to see the dropdown menu
          </p>
        </div>
        <BulkActionsBar
          selectedCount={3}
          onClearSelection={() => {}}
          onDelete={() => {}}
          onStatusChange={(status) => alert(`Changing status to: ${status}`)}
          onPriorityChange={() => {}}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing the status change dropdown.',
      },
    },
  },
};

export const InteractivePriorityChange: Story = {
  render: function InteractiveStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#EFF6FF',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#1E40AF',
          }}
        >
          <p style={{ margin: 0 }}>
            💡 Try clicking "Change Priority" to see the dropdown menu with
            priority indicators
          </p>
        </div>
        <BulkActionsBar
          selectedCount={7}
          onClearSelection={() => {}}
          onDelete={() => {}}
          onStatusChange={() => {}}
          onPriorityChange={(priority) =>
            alert(`Changing priority to: ${priority}`)
          }
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example showing the priority change dropdown with color indicators.',
      },
    },
  },
};

export const InteractiveDelete: Story = {
  render: function InteractiveStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#FEF2F2',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#991B1B',
          }}
        >
          <p style={{ margin: 0 }}>
            ⚠️ Try clicking "Delete" to see the confirmation flow
          </p>
        </div>
        <BulkActionsBar
          selectedCount={4}
          onClearSelection={() => {}}
          onDelete={() => alert('Issues deleted!')}
          onStatusChange={() => {}}
          onPriorityChange={() => {}}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing the delete confirmation flow.',
      },
    },
  },
};

export const InteractiveClearSelection: Story = {
  render: function InteractiveStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#F3F4F6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#4B5563',
          }}
        >
          <p style={{ margin: 0 }}>
            💡 Try clicking the X button to clear the selection
          </p>
        </div>
        <BulkActionsBar
          selectedCount={2}
          onClearSelection={() => alert('Selection cleared!')}
          onDelete={() => {}}
          onStatusChange={() => {}}
          onPriorityChange={() => {}}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing the clear selection button.',
      },
    },
  },
};

// Usage example
export const UsageExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#F9FAFB',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#6B7280',
          border: '1px solid #E5E7EB',
        }}
      >
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>
          Typical Usage:
        </p>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>User selects one or more issues in the table</li>
          <li>Bulk actions bar appears above the table</li>
          <li>User can change status/priority or delete selected issues</li>
          <li>User can clear selection with the X button</li>
        </ol>
      </div>
      <BulkActionsBar
        selectedCount={12}
        onClearSelection={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
        onPriorityChange={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the typical usage context and workflow.',
      },
    },
  },
};

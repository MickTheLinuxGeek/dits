import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Table, type TableColumn } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Organisms/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
}

const sampleIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: 'Fix login button not responding',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe',
    dueDate: '2024-01-15',
  },
  {
    id: 'ISS-002',
    title: 'Update documentation for API endpoints',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Jane Smith',
    dueDate: '2024-01-20',
  },
  {
    id: 'ISS-003',
    title: 'Implement dark mode toggle',
    status: 'Done',
    priority: 'Low',
    assignee: 'Bob Johnson',
    dueDate: '2024-01-10',
  },
  {
    id: 'ISS-004',
    title: 'Optimize database queries',
    status: 'In Review',
    priority: 'High',
    assignee: 'Alice Williams',
    dueDate: '2024-01-18',
  },
  {
    id: 'ISS-005',
    title: 'Add unit tests for user service',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Charlie Brown',
    dueDate: '2024-01-25',
  },
];

const columns: TableColumn<Issue>[] = [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '100px',
  },
  {
    key: 'title',
    header: 'Title',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '120px',
    render: (value) => {
      const statusValue = value as string;
      const colors: Record<string, string> = {
        'To Do': '#6B7280',
        'In Progress': '#3B82F6',
        'In Review': '#F59E0B',
        Done: '#10B981',
      };
      return (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: `${colors[statusValue]}20`,
            color: colors[statusValue],
          }}
        >
          {statusValue}
        </span>
      );
    },
  },
  {
    key: 'priority',
    header: 'Priority',
    sortable: true,
    width: '100px',
    render: (value) => {
      const priorityValue = value as string;
      const colors: Record<string, string> = {
        Low: '#10B981',
        Medium: '#F59E0B',
        High: '#EF4444',
      };
      return (
        <span style={{ color: colors[priorityValue], fontWeight: 500 }}>
          {priorityValue}
        </span>
      );
    },
  },
  {
    key: 'assignee',
    header: 'Assignee',
    sortable: true,
    width: '150px',
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    sortable: true,
    width: '120px',
    align: 'right',
  },
];

export const Default: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
  },
};

export const WithSorting: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
    defaultSortKey: 'dueDate',
    defaultSortDirection: 'asc',
  },
};

export const Selectable: Story = {
  render: function SelectableStory() {
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
      new Set(),
    );

    return (
      <div>
        <Table<Issue>
          columns={columns}
          data={sampleIssues}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />
        <div
          style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.875rem' }}
        >
          Selected: {Array.from(selectedKeys).join(', ') || 'None'}
        </div>
      </div>
    );
  },
};

export const Striped: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
    striped: true,
  },
};

export const WithoutHover: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
    hoverable: false,
  },
};

export const SmallSize: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    columns: columns as any,
    data: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    columns: columns as any,
    data: [],
    emptyMessage: 'No issues found. Create your first issue to get started!',
  },
};

export const ClickableRows: Story = {
  args: {
    columns: columns as any,
    data: sampleIssues,
    onRowClick: (row, index) => {
      const issue = row as Issue;
      alert(`Clicked on ${issue.title} (row ${index + 1})`);
    },
  },
};

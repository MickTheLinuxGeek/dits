import type { Meta, StoryObj } from '@storybook/react';
import { IssueItem } from './IssueItem';
import type { Issue } from '../../../mocks/types';

const baseIssue: Issue = {
  id: 'DITS-123',
  title: 'Implement user authentication flow',
  status: 'In Progress',
  priority: 'High',
  labels: [
    { id: 'lbl-1', name: 'feature', color: 'feature' },
    { id: 'lbl-2', name: 'security', color: 'security' },
  ],
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const meta = {
  title: 'Issues/IssueItem',
  component: IssueItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '900px', backgroundColor: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IssueItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    issue: baseIssue,
  },
};

export const WithBugLabel: Story = {
  args: {
    issue: {
      ...baseIssue,
      labels: [{ id: 'lbl-1', name: 'bug', color: 'bug' }],
    },
  },
};

export const Urgent: Story = {
  args: {
    issue: {
      ...baseIssue,
      priority: 'Urgent',
      labels: [{ id: 'lbl-1', name: 'bug', color: 'bug' }],
    },
  },
};

export const Completed: Story = {
  args: {
    issue: {
      ...baseIssue,
      status: 'Done',
    },
  },
};

export const LongTitle: Story = {
  args: {
    issue: {
      ...baseIssue,
      title:
        'This is a very long issue title that should wrap appropriately and demonstrate text overflow handling in the issue item component',
    },
  },
};

export const ManyLabels: Story = {
  args: {
    issue: {
      ...baseIssue,
      labels: [
        { id: 'lbl-1', name: 'bug', color: 'bug' },
        { id: 'lbl-2', name: 'feature', color: 'feature' },
        { id: 'lbl-3', name: 'enhancement', color: 'enhancement' },
        { id: 'lbl-4', name: 'security', color: 'security' },
        { id: 'lbl-5', name: 'database', color: 'database' },
      ],
    },
  },
};

export const NoDueDate: Story = {
  args: {
    issue: {
      ...baseIssue,
      dueDate: undefined,
    },
  },
};

export const NoLabels: Story = {
  args: {
    issue: {
      ...baseIssue,
      labels: [],
    },
  },
};

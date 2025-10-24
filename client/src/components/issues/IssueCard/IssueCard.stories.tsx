import type { Meta, StoryObj } from '@storybook/react';
import { IssueCard } from './IssueCard';
import type { Issue } from '../../../mocks/types';

const mockIssue: Issue = {
  id: '1',
  title: 'Implement user authentication',
  description:
    'Add user authentication with email/password and OAuth providers (Google, GitHub). Include password reset functionality and email verification.',
  status: 'In Progress',
  priority: 'High',
  labels: [
    { id: '1', name: 'feature', color: 'feature' },
    { id: '2', name: 'security', color: 'security' },
  ],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
};

const meta = {
  title: 'Issues/IssueCard',
  component: IssueCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IssueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    issue: mockIssue,
  },
};

export const Selected: Story = {
  args: {
    issue: mockIssue,
    isSelected: true,
  },
};

export const WithCheckbox: Story = {
  args: {
    issue: mockIssue,
    showCheckbox: true,
  },
};

export const SelectedWithCheckbox: Story = {
  args: {
    issue: mockIssue,
    isSelected: true,
    showCheckbox: true,
  },
};

export const UrgentPriority: Story = {
  args: {
    issue: {
      ...mockIssue,
      priority: 'Urgent',
      title: 'Critical bug: Data loss on save',
    },
  },
};

export const LowPriority: Story = {
  args: {
    issue: {
      ...mockIssue,
      priority: 'Low',
      title: 'Update documentation',
    },
  },
};

export const DoneStatus: Story = {
  args: {
    issue: {
      ...mockIssue,
      status: 'Done',
      title: 'Setup CI/CD pipeline',
    },
  },
};

export const TodoStatus: Story = {
  args: {
    issue: {
      ...mockIssue,
      status: 'Todo',
      title: 'Design new landing page',
    },
  },
};

export const DueToday: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Review pull requests',
      dueDate: new Date(),
    },
  },
};

export const DueTomorrow: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Prepare sprint demo',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
};

export const Overdue: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Fix production bug',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      priority: 'Urgent',
    },
  },
};

export const ManyLabels: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Refactor database schema',
      labels: [
        { id: '1', name: 'database', color: 'database' },
        { id: '2', name: 'feature', color: 'feature' },
        { id: '3', name: 'enhancement', color: 'enhancement' },
        { id: '4', name: 'devops', color: 'devops' },
        { id: '5', name: 'security', color: 'security' },
      ],
    },
  },
};

export const NoLabels: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Research new framework',
      labels: [],
    },
  },
};

export const NoDescription: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Quick bug fix',
      description: undefined,
    },
  },
};

export const NoDueDate: Story = {
  args: {
    issue: {
      ...mockIssue,
      title: 'Backlog item',
      dueDate: undefined,
    },
  },
};

export const LongTitle: Story = {
  args: {
    issue: {
      ...mockIssue,
      title:
        'Implement comprehensive user management system with role-based access control, permissions, and audit logging',
    },
  },
};

export const LongDescription: Story = {
  args: {
    issue: {
      ...mockIssue,
      description:
        'This is a very long description that should be truncated after two lines. It contains multiple sentences and detailed information about the issue. We need to implement a complex feature that involves multiple steps and considerations. The implementation should be done carefully with proper testing and documentation. This text should be cut off with ellipsis after two lines in the card view.',
    },
  },
};

export const Clickable: Story = {
  args: {
    issue: mockIssue,
    onClick: (issue) => {
      alert(`Clicked issue: ${issue.title}`);
    },
  },
};

export const WithSelection: Story = {
  args: {
    issue: mockIssue,
    showCheckbox: true,
    onSelectionChange: (issueId, selected) => {
      alert(`Issue ${issueId} ${selected ? 'selected' : 'deselected'}`);
    },
  },
};

const InteractiveListDemo = () => {
  const issues: Issue[] = [
    {
      ...mockIssue,
      id: '1',
      title: 'Implement authentication',
      priority: 'High',
      status: 'In Progress',
    },
    {
      ...mockIssue,
      id: '2',
      title: 'Fix bug in payment flow',
      priority: 'Urgent',
      status: 'Todo',
      dueDate: new Date(),
    },
    {
      ...mockIssue,
      id: '3',
      title: 'Update documentation',
      priority: 'Low',
      status: 'Done',
      dueDate: undefined,
    },
    {
      ...mockIssue,
      id: '4',
      title: 'Refactor database queries',
      priority: 'Medium',
      status: 'Review',
      labels: [
        { id: '1', name: 'database', color: 'database' },
        { id: '2', name: 'enhancement', color: 'enhancement' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} showCheckbox={true} />
      ))}
    </div>
  );
};

export const InteractiveList = {
  render: () => <InteractiveListDemo />,
};

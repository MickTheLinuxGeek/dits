import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['Todo', 'In Progress', 'Review', 'Done'],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {
  args: {
    status: 'Todo',
  },
};

export const InProgress: Story = {
  args: {
    status: 'In Progress',
  },
};

export const Review: Story = {
  args: {
    status: 'Review',
  },
};

export const Done: Story = {
  args: {
    status: 'Done',
  },
};

export const AllStatuses: Story = {
  args: {
    status: 'Todo',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <StatusBadge status="Todo" />
      <StatusBadge status="In Progress" />
      <StatusBadge status="Review" />
      <StatusBadge status="Done" />
    </div>
  ),
};

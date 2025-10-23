import type { Meta, StoryObj } from '@storybook/react';
import { PriorityIndicator } from './PriorityIndicator';

const meta = {
  title: 'UI/PriorityIndicator',
  component: PriorityIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['Urgent', 'High', 'Medium', 'Low'],
    },
  },
} satisfies Meta<typeof PriorityIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Urgent: Story = {
  args: {
    priority: 'Urgent',
  },
};

export const High: Story = {
  args: {
    priority: 'High',
  },
};

export const Medium: Story = {
  args: {
    priority: 'Medium',
  },
};

export const Low: Story = {
  args: {
    priority: 'Low',
  },
};

export const AllPriorities: Story = {
  args: {
    priority: 'High',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PriorityIndicator priority="Urgent" />
      <PriorityIndicator priority="High" />
      <PriorityIndicator priority="Medium" />
      <PriorityIndicator priority="Low" />
    </div>
  ),
};

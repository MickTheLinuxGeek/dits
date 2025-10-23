import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'bug',
        'feature',
        'enhancement',
        'security',
        'database',
        'devops',
        'design',
      ],
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bug: Story = {
  args: {
    name: 'bug',
    color: 'bug',
  },
};

export const Feature: Story = {
  args: {
    name: 'feature',
    color: 'feature',
  },
};

export const Enhancement: Story = {
  args: {
    name: 'enhancement',
    color: 'enhancement',
  },
};

export const Security: Story = {
  args: {
    name: 'security',
    color: 'security',
  },
};

export const Database: Story = {
  args: {
    name: 'database',
    color: 'database',
  },
};

export const DevOps: Story = {
  args: {
    name: 'devops',
    color: 'devops',
  },
};

export const Design: Story = {
  args: {
    name: 'design',
    color: 'design',
  },
};

export const AllLabels: Story = {
  args: {
    name: 'bug',
    color: 'bug',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Label name="bug" color="bug" />
      <Label name="feature" color="feature" />
      <Label name="enhancement" color="enhancement" />
      <Label name="security" color="security" />
      <Label name="database" color="database" />
      <Label name="devops" color="devops" />
      <Label name="design" color="design" />
    </div>
  ),
};

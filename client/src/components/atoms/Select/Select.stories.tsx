import type { Meta, StoryObj } from '@storybook/react';
import { Select, type SelectOption } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    isRequired: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const priorityOptions: SelectOption[] = [
  { value: '', label: 'Select priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const statusOptions: SelectOption[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived', disabled: true },
];

export const Default: Story = {
  args: {
    options: priorityOptions,
    size: 'md',
  },
};

export const WithLabel: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    size: 'md',
  },
};

export const WithHelperText: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    helperText: 'Select the priority level for this task',
    size: 'md',
  },
};

export const Required: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    isRequired: true,
    size: 'md',
  },
};

export const WithError: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    error: true,
    errorMessage: 'Please select a priority',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    size: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    options: priorityOptions,
    label: 'Priority',
    disabled: true,
    size: 'md',
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: statusOptions,
    label: 'Status',
    helperText: 'Some options are disabled',
    size: 'md',
  },
};

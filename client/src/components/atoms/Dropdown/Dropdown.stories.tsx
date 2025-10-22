import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown, type DropdownItem } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Atoms/Dropdown',
  component: Dropdown,
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
    searchable: {
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
type Story = StoryObj<typeof Dropdown>;

const sampleItems: DropdownItem[] = [
  { id: '1', label: 'Option 1', icon: 'File' },
  { id: '2', label: 'Option 2', icon: 'Folder' },
  { id: '3', label: 'Option 3', icon: 'Inbox' },
  { id: '4', label: 'Option 4 (Disabled)', icon: 'Archive', disabled: true },
  { id: '5', label: 'Option 5', icon: 'Trash2', divider: true },
  { id: '6', label: 'Option 6', icon: 'Settings' },
];

const itemsWithDescriptions: DropdownItem[] = [
  {
    id: '1',
    label: 'High Priority',
    description: 'Critical tasks that need immediate attention',
    icon: 'AlertTriangle',
  },
  {
    id: '2',
    label: 'Medium Priority',
    description: 'Important but not urgent tasks',
    icon: 'AlertCircle',
  },
  {
    id: '3',
    label: 'Low Priority',
    description: 'Tasks that can be done later',
    icon: 'Info',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Select an option',
    size: 'md',
  },
};

export const WithSelectedItem: Story = {
  args: {
    items: sampleItems,
    selectedId: '2',
    size: 'md',
  },
};

export const Searchable: Story = {
  args: {
    items: sampleItems,
    searchable: true,
    searchPlaceholder: 'Search options...',
    size: 'md',
  },
};

export const WithDescriptions: Story = {
  args: {
    items: itemsWithDescriptions,
    placeholder: 'Select priority',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Select an option',
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Select an option',
    size: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Select an option',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Select an option',
    disabled: true,
  },
};

export const ErrorState: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Select an option',
    error: true,
  },
};

export const EmptyList: Story = {
  args: {
    items: [],
    placeholder: 'No options available',
  },
};

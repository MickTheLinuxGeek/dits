import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible Input component with validation support, icons, and multiple variants. Supports all native input types and accessibility features.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'flushed'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    leftIcon: {
      control: 'text',
    },
    rightIcon: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    isRequired: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters long',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email',
    error: true,
    errorMessage: 'Please enter a valid email address',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: 'Search',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Website',
    placeholder: 'https://example.com',
    type: 'url',
    rightIcon: 'ExternalLink',
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading Field',
    placeholder: 'Please wait...',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit',
    disabled: true,
    value: 'Read only value',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Filled Input',
    placeholder: 'Filled variant',
  },
};

export const Flushed: Story = {
  args: {
    variant: 'flushed',
    label: 'Flushed Input',
    placeholder: 'Flushed variant',
  },
};

export const PasswordField: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    rightIcon: 'EyeOff',
    helperText: 'Must contain at least 8 characters',
  },
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <Input variant="default" placeholder="Default variant" />
      <Input variant="filled" placeholder="Filled variant" />
      <Input variant="flushed" placeholder="Flushed variant" />
    </div>
  ),
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <Input size="sm" placeholder="Small size" />
      <Input size="md" placeholder="Medium size" />
      <Input size="lg" placeholder="Large size" />
    </div>
  ),
};

// Form example
export const FormExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '400px',
      }}
    >
      <Input label="First Name" placeholder="Enter first name" isRequired />
      <Input label="Last Name" placeholder="Enter last name" isRequired />
      <Input
        label="Email"
        type="email"
        placeholder="Enter email address"
        leftIcon="Mail"
        isRequired
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="Enter phone number"
        leftIcon="Phone"
        helperText="Include country code"
      />
      <Input
        label="Website"
        type="url"
        placeholder="https://example.com"
        leftIcon="Globe"
        rightIcon="ExternalLink"
      />
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { ICONS } from './icons';

/**
 * Icon component using Lucide React icons.
 * Provides a consistent way to render icons throughout the application.
 */
const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible icon component built on Lucide React. Supports customizable size, color, and stroke width.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: Object.values(ICONS),
      description: 'Icon name from Lucide icon set',
    },
    size: {
      control: { type: 'number', min: 12, max: 64, step: 4 },
      description: 'Icon size in pixels',
    },
    color: {
      control: 'color',
      description: 'Icon color (CSS color value)',
    },
    strokeWidth: {
      control: { type: 'number', min: 1, max: 3, step: 0.5 },
      description: 'Stroke width',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default icon with standard settings
 */
export const Default: Story = {
  args: {
    name: ICONS.CHECK,
    size: 24,
    strokeWidth: 2,
  },
};

/**
 * Small icon variant
 */
export const Small: Story = {
  args: {
    name: ICONS.CHECK,
    size: 16,
    strokeWidth: 2,
  },
};

/**
 * Large icon variant
 */
export const Large: Story = {
  args: {
    name: ICONS.CHECK,
    size: 48,
    strokeWidth: 2,
  },
};

/**
 * Icon with custom color
 */
export const Colored: Story = {
  args: {
    name: ICONS.SUCCESS,
    size: 24,
    color: '#22C55E',
    strokeWidth: 2,
  },
};

/**
 * Icon with thicker stroke
 */
export const Bold: Story = {
  args: {
    name: ICONS.WARNING,
    size: 24,
    color: '#EAB308',
    strokeWidth: 3,
  },
};

/**
 * Clickable icon with onClick handler
 */
export const Clickable: Story = {
  args: {
    name: ICONS.MENU,
    size: 24,
    strokeWidth: 2,
    onClick: () => alert('Icon clicked!'),
    ariaLabel: 'Open menu',
  },
};

/**
 * Gallery of common icons used in the application
 */
export const CommonIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '16px',
        padding: '16px',
        maxWidth: '600px',
      }}
    >
      {Object.entries(ICONS)
        .slice(0, 20)
        .map(([key, iconName]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name={iconName} size={24} />
            <span style={{ fontSize: '10px', textAlign: 'center' }}>{key}</span>
          </div>
        ))}
    </div>
  ),
};

/**
 * Priority icons
 */
export const PriorityIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Icon name={ICONS.PRIORITY_HIGH} size={24} color="#EF4444" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>High</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon name={ICONS.PRIORITY_MEDIUM} size={24} color="#F59E0B" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon name={ICONS.PRIORITY_LOW} size={24} color="#3B82F6" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>Low</div>
      </div>
    </div>
  ),
};

/**
 * Issue status icons
 */
export const StatusIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Icon name={ICONS.ISSUE} size={24} color="#6B7280" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>To Do</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon name={ICONS.ISSUE_OPEN} size={24} color="#3B82F6" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>In Progress</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon name={ICONS.ISSUE_CLOSED} size={24} color="#22C55E" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>Done</div>
      </div>
    </div>
  ),
};

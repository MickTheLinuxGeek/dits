import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ height: '100vh', display: 'flex' }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The sidebar contains navigation sections for Smart Views (Inbox, Today, Upcoming, Logbook), Projects, and Areas. Each item shows an icon, label, and count of issues.',
      },
    },
  },
};

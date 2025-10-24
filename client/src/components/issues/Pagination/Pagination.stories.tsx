import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Issues/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pagination component for navigating through paged data. Supports keyboard navigation, accessibility, and smart page number generation with ellipsis.',
      },
    },
  },
  argTypes: {
    currentPage: {
      control: 'number',
      description: 'Current page number (1-indexed)',
    },
    totalPages: {
      control: 'number',
      description: 'Total number of pages',
    },
    siblingCount: {
      control: 'number',
      description: 'Number of page buttons to show around current page',
    },
    showFirstLast: {
      control: 'boolean',
      description: 'Show first/last page buttons',
    },
    onPageChange: { action: 'page changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 25,
    totalPages: 100,
    onPageChange: () => {},
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
    onPageChange: () => {},
  },
};

export const WithoutFirstLast: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showFirstLast: false,
    onPageChange: () => {},
  },
};

export const CustomSiblingCount: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
    siblingCount: 2,
    onPageChange: () => {},
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'When there is only one page, the pagination component returns null.',
      },
    },
  },
};

// Interactive story
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 20;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <p>Click pagination buttons to navigate</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Page {currentPage} of {totalPages}
          </p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive pagination that responds to clicks.',
      },
    },
  },
};

// Showcase different page ranges
export const PageRanges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          First Page
        </p>
        <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Middle Page
        </p>
        <Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}
        >
          Last Page
        </p>
        <Pagination currentPage={20} totalPages={20} onPageChange={() => {}} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how pagination adapts to different page positions.',
      },
    },
  },
};

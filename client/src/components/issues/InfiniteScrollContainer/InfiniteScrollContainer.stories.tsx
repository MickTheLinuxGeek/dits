import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InfiniteScrollContainer } from './InfiniteScrollContainer';
import { IssueCard } from '../IssueCard/IssueCard';
import type { Issue } from '../../../mocks/types';

// Generate mock issues
const generateIssues = (count: number, startId: number = 0): Issue[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${startId + i}`,
    title: `Issue ${startId + i + 1}: ${['Implement feature', 'Fix bug', 'Update docs', 'Refactor code', 'Add tests'][i % 5]}`,
    description:
      'This is a sample issue description for demonstration purposes.',
    status: (['Todo', 'In Progress', 'Review', 'Done'] as const)[i % 4],
    priority: (['Urgent', 'High', 'Medium', 'Low'] as const)[i % 4],
    labels: [
      {
        id: `label${i}`,
        name: ['bug', 'feature', 'enhancement'][i % 3],
        color: 'feature' as const,
      },
    ],
    dueDate:
      i % 3 === 0 ? new Date(Date.now() + i * 24 * 60 * 60 * 1000) : undefined,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
  }));
};

const meta = {
  title: 'Issues/InfiniteScrollContainer',
  component: InfiniteScrollContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InfiniteScrollContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: true,
    children: (
      <>
        {generateIssues(10).map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: true,
    isLoading: true,
    loadingItemCount: 5,
    children: <></>,
  },
};

export const LoadingMore: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: true,
    isLoadingMore: true,
    children: (
      <>
        {generateIssues(10).map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </>
    ),
  },
};

export const NoMoreItems: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: false,
    children: (
      <>
        {generateIssues(10).map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </>
    ),
  },
};

export const CustomEndMessage: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: false,
    endMessage: "You've reached the end! 🎉",
    children: (
      <>
        {generateIssues(10).map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </>
    ),
  },
};

export const CustomLoadingComponent: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: true,
    isLoadingMore: true,
    loadingComponent: (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        />
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>
          Loading awesome issues...
        </p>
      </div>
    ),
    children: (
      <>
        {generateIssues(5).map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </>
    ),
  },
};

export const FewItems: Story = {
  args: {
    onLoadMore: () => console.log('Load more'),
    hasMore: false,
    children: (
      <>
        {generateIssues(3).map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </>
    ),
  },
};

const InteractiveDemo = () => {
  const [items, setItems] = useState(generateIssues(15, 0));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate API call
    setTimeout(() => {
      const newItems = generateIssues(15, items.length);
      setItems([...items, ...newItems]);
      setIsLoadingMore(false);

      // Stop after loading 60 items
      if (items.length + newItems.length >= 60) {
        setHasMore(false);
      }
    }, 1500);
  };

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ margin: 0 }}>Issues ({items.length})</h2>
        <p style={{ margin: '0.5rem 0 0', fontSize: '14px', color: '#6b7280' }}>
          Scroll down to load more items
        </p>
      </div>
      <InfiniteScrollContainer
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      >
        {items.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </InfiniteScrollContainer>
    </div>
  );
};

export const Interactive = {
  render: () => <InteractiveDemo />,
};

const WithSelectionDemo = () => {
  const [items] = useState(generateIssues(20));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectionChange = (issueId: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(issueId);
    } else {
      newSelected.delete(issueId);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ margin: 0 }}>Selectable Issues</h2>
        <p style={{ margin: '0.5rem 0 0', fontSize: '14px', color: '#6b7280' }}>
          Selected: {selectedIds.size} of {items.length}
        </p>
      </div>
      <InfiniteScrollContainer onLoadMore={() => {}} hasMore={false}>
        {items.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            isSelected={selectedIds.has(issue.id)}
            onSelectionChange={handleSelectionChange}
            showCheckbox={true}
          />
        ))}
      </InfiniteScrollContainer>
    </div>
  );
};

export const WithSelection = {
  render: () => <WithSelectionDemo />,
};

const LargeDatasetDemo = () => {
  const [items, setItems] = useState(generateIssues(30, 0));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const newItems = generateIssues(30, items.length);
      setItems([...items, ...newItems]);
      setIsLoadingMore(false);

      if (items.length + newItems.length >= 150) {
        setHasMore(false);
      }
    }, 1000);
  };

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h2 style={{ margin: 0 }}>Large Dataset Demo</h2>
        <p style={{ margin: '0.5rem 0 0', fontSize: '14px', color: '#6b7280' }}>
          Loaded {items.length} items {hasMore && '(scroll for more)'}
        </p>
      </div>
      <InfiniteScrollContainer
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        rootMargin="300px"
      >
        {items.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </InfiniteScrollContainer>
    </div>
  );
};

export const LargeDataset = {
  render: () => <LargeDatasetDemo />,
};

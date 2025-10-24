import { MainHeader } from '../components/layout/MainHeader';
import { IssueListContainer } from '../components/issues/IssueListContainer';
import { useIssueList } from '../hooks/useIssueList';
import { issuesService } from '../services/issues.service';
import { Button } from '../components/atoms/Button';
import type { Issue, IssueStatus, IssuePriority } from '../mocks/types';

/**
 * Inbox page with API integration
 *
 * This page demonstrates how to use the IssueListContainer with real API data.
 * The useIssueList hook handles all data fetching, loading states, and mutations.
 *
 * To use this page, rename it to InboxPage.tsx or update the route configuration.
 */
export function InboxPageWithAPI() {
  const {
    issues,
    isLoading,
    isError,
    error,
    refetch,
    bulkDeleteIssues,
    bulkUpdateStatus,
    bulkUpdatePriority,
  } = useIssueList({
    initialParams: {
      // Inbox shows all issues (filter by projectId/areaId on backend)
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    fetchFunction: issuesService.getInboxIssues,
  });

  // Handle issue click (navigate to detail page)
  const handleIssueClick = (issue: Issue) => {
    console.log('Navigate to issue:', issue.id);
    // TODO: Implement navigation to issue detail page
    // navigate(`/issues/${issue.id}`);
  };

  // Handle bulk delete
  const handleBulkDelete = async (issueIds: string[]) => {
    try {
      await bulkDeleteIssues(issueIds);
    } catch (err) {
      console.error('Failed to delete issues:', err);
      alert('Failed to delete issues. Please try again.');
    }
  };

  // Handle status change
  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    try {
      await bulkUpdateStatus([issueId], status);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Handle priority change
  const handlePriorityChange = async (
    issueId: string,
    priority: IssuePriority,
  ) => {
    try {
      await bulkUpdatePriority([issueId], priority);
    } catch (err) {
      console.error('Failed to update priority:', err);
      alert('Failed to update priority. Please try again.');
    }
  };

  return (
    <>
      <MainHeader title="Inbox" />
      <div
        style={{
          padding: '1.5rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Error state */}
        {isError && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#FEF2F2',
              borderRadius: '0.5rem',
              border: '1px solid #FCA5A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: '#991B1B' }}>
              {error?.message || 'Failed to load issues'}
            </span>
            <Button variant="ghost" size="sm" onClick={refetch}>
              Retry
            </Button>
          </div>
        )}

        {/* Issue list with API integration */}
        <IssueListContainer
          issues={issues}
          isLoading={isLoading}
          onIssueClick={handleIssueClick}
          onIssuesDelete={handleBulkDelete}
          onIssueStatusChange={handleStatusChange}
          onIssuePriorityChange={handlePriorityChange}
        />
      </div>
    </>
  );
}

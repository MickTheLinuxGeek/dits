import { MainHeader } from '../components/layout/MainHeader';
import { IssueListContainer } from '../components/issues/IssueListContainer';
import { useIssueList } from '../hooks/useIssueList';
import { issuesService } from '../services/issues.service';
import { Button } from '../components/atoms/Button';
import type { Issue, IssueStatus, IssuePriority } from '../mocks/types';

/**
 * Logbook page with API integration
 * Shows completed issues - archive of done items
 */
export function LogbookPageWithAPI() {
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
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    },
    fetchFunction: issuesService.getLogbookIssues,
  });

  const handleIssueClick = (issue: Issue) => {
    console.log('Navigate to issue:', issue.id);
    // TODO: Implement navigation to issue detail page
  };

  const handleBulkDelete = async (issueIds: string[]) => {
    try {
      await bulkDeleteIssues(issueIds);
    } catch (err) {
      console.error('Failed to delete issues:', err);
      alert('Failed to delete issues. Please try again.');
    }
  };

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    try {
      await bulkUpdateStatus([issueId], status);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

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
      <MainHeader title="Logbook" />
      <div
        style={{
          padding: '1.5rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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

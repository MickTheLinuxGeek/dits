import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import styles from './ProgressBar.module.css';

describe('ProgressBar', () => {
  it('renders progress bar with default props', () => {
    render(<ProgressBar />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with custom value', () => {
    render(<ProgressBar value={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders with custom max value', () => {
    render(<ProgressBar value={25} max={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    expect(progressBar).toHaveAttribute('aria-valuemax', '50');
  });

  it('normalizes value to be within 0 and max', () => {
    const { rerender } = render(<ProgressBar value={-10} />);
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    rerender(<ProgressBar value={150} max={100} />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('applies the correct size classes', () => {
    const { rerender, container } = render(<ProgressBar size="sm" />);
    let progressBar = container.querySelector(`.${styles.progressBar}`);
    expect(progressBar).toHaveClass(styles.sm);

    rerender(<ProgressBar size="md" />);
    progressBar = container.querySelector(`.${styles.progressBar}`);
    expect(progressBar).toHaveClass(styles.md);

    rerender(<ProgressBar size="lg" />);
    progressBar = container.querySelector(`.${styles.progressBar}`);
    expect(progressBar).toHaveClass(styles.lg);
  });

  it('applies the correct color classes', () => {
    const { rerender, container } = render(<ProgressBar color="primary" />);
    let fill = container.querySelector(`.${styles.progressFill}`);
    expect(fill).toHaveClass(styles.primary);

    rerender(<ProgressBar color="success" />);
    fill = container.querySelector(`.${styles.progressFill}`);
    expect(fill).toHaveClass(styles.success);

    rerender(<ProgressBar color="warning" />);
    fill = container.querySelector(`.${styles.progressFill}`);
    expect(fill).toHaveClass(styles.warning);

    rerender(<ProgressBar color="error" />);
    fill = container.querySelector(`.${styles.progressFill}`);
    expect(fill).toHaveClass(styles.error);
  });

  it('renders indeterminate progress bar', () => {
    render(<ProgressBar indeterminate />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading');
    expect(progressBar).not.toHaveAttribute('aria-valuenow');
  });

  it('applies indeterminate class', () => {
    const { container } = render(<ProgressBar indeterminate />);
    const progressBar = container.querySelector(`.${styles.progressBar}`);
    const fill = container.querySelector(`.${styles.progressFill}`);
    expect(progressBar).toHaveClass(styles.indeterminate);
    expect(fill).toHaveClass(styles.indeterminateFill);
  });

  it('shows percentage value when showValue is true', () => {
    render(<ProgressBar value={75} showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows custom label', () => {
    render(<ProgressBar value={50} label="50 of 100 files" />);
    expect(screen.getByText('50 of 100 files')).toBeInTheDocument();
  });

  it('custom label takes precedence over showValue', () => {
    render(<ProgressBar value={50} showValue label="Custom label" />);
    expect(screen.getByText('Custom label')).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar className="custom-progress" />);
    const progressBar = container.querySelector(`.${styles.progressBar}`);
    expect(progressBar).toHaveClass('custom-progress');
  });

  it('applies custom aria-label', () => {
    render(<ProgressBar aria-label="File upload progress" value={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'File upload progress');
  });

  it('calculates correct width based on value and max', () => {
    const { container } = render(<ProgressBar value={25} max={50} />);
    const fill = container.querySelector(
      `.${styles.progressFill}`,
    ) as HTMLElement;
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('sets width to 100% for indeterminate', () => {
    const { container } = render(<ProgressBar indeterminate />);
    const fill = container.querySelector(
      `.${styles.progressFill}`,
    ) as HTMLElement;
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('uses default values', () => {
    const { container } = render(<ProgressBar />);
    const progressBar = container.querySelector(`.${styles.progressBar}`);
    const fill = container.querySelector(`.${styles.progressFill}`);
    expect(progressBar).toHaveClass(styles.md);
    expect(fill).toHaveClass(styles.primary);
  });
});

import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';
import styles from './Skeleton.module.css';

describe('Skeleton', () => {
  it('renders skeleton with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the correct variant classes', () => {
    const { rerender, container } = render(<Skeleton variant="text" />);
    let skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.text);

    rerender(<Skeleton variant="rectangular" />);
    skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.rectangular);

    rerender(<Skeleton variant="circular" />);
    skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.circular);

    rerender(<Skeleton variant="rounded" />);
    skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.rounded);
  });

  it('applies the correct animation classes', () => {
    const { rerender, container } = render(<Skeleton animation="pulse" />);
    let skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.pulse);

    rerender(<Skeleton animation="wave" />);
    skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.wave);

    rerender(<Skeleton animation="none" />);
    skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.none);
  });

  it('applies custom width', () => {
    const { container } = render(<Skeleton width={200} />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('applies custom width as string', () => {
    const { container } = render(<Skeleton width="50%" />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveStyle({ width: '50%' });
  });

  it('applies custom height', () => {
    const { container } = render(<Skeleton height={100} />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveStyle({ height: '100px' });
  });

  it('applies custom height as string', () => {
    const { container } = render(<Skeleton height="2rem" />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveStyle({ height: '2rem' });
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Skeleton fullWidth />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.fullWidth);
  });

  it('renders multiple lines for text variant', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const skeletons = container.querySelectorAll(`.${styles.skeleton}`);
    expect(skeletons).toHaveLength(3);
  });

  it('makes last line shorter when rendering multiple lines', () => {
    const { container } = render(
      <Skeleton variant="text" lines={3} width="100%" />,
    );
    const skeletons = container.querySelectorAll(`.${styles.skeleton}`);
    const lastSkeleton = skeletons[skeletons.length - 1] as HTMLElement;
    expect(lastSkeleton).toHaveStyle({ width: '75%' });
  });

  it('wraps multiple lines in text container', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const textContainer = container.querySelector(`.${styles.textContainer}`);
    expect(textContainer).toBeInTheDocument();
  });

  it('renders single skeleton when lines is 1', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    const skeletons = container.querySelectorAll(`.${styles.skeleton}`);
    expect(skeletons).toHaveLength(1);
    const textContainer = container.querySelector(`.${styles.textContainer}`);
    expect(textContainer).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('uses default values', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveClass(styles.text);
    expect(skeleton).toHaveClass(styles.pulse);
  });

  it('applies both width and height', () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const skeleton = container.querySelector(`.${styles.skeleton}`);
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });
});

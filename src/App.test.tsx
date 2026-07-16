import { describe, it, expect } from 'vitest';
import { render, screen } from '../tests/setup/test-utils';
import { App } from './App';

describe('App — smoke tests', () => {
  it('renders the app shell without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('shows the Project Tracker brand and workspace nav', () => {
    render(<App />);
    expect(screen.getByText('Project Tracker')).toBeTruthy();
    expect(screen.getByText('Command Center')).toBeTruthy();
    expect(screen.getByText('Deliveries')).toBeTruthy();
    expect(screen.getByText('Asset Catalog')).toBeTruthy();
    expect(screen.getByText('Coverage Gaps')).toBeTruthy();
    expect(screen.getByText('Leaderboard')).toBeTruthy();
  });

  it('exposes the AI Build Cost insight link', () => {
    render(<App />);
    expect(screen.getByText('AI Build Cost')).toBeTruthy();
  });

  it('renders the AI Build Cost dashboard at /build-cost', () => {
    render(<App />, { initialRoute: '/build-cost' });
    // Title appears in both the nav and the page header.
    expect(screen.getAllByText('AI Build Cost').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Premium Credits')).toBeTruthy();
    expect(screen.getByText('Cost breakdown')).toBeTruthy();
  });
});

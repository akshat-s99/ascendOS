/**
 * Unit tests for OnboardingFlow.
 * Requirements: 6.2, 6.6, 6.7
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingFlow from './OnboardingFlow';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

// Mock useAscend
vi.mock('@/hooks/useAscend', () => ({
  useAscend: () => ({
    completeOnboarding: vi.fn(),
    updateProfile: vi.fn(),
    state: {},
  }),
}));

describe('OnboardingFlow — initial step', () => {
  it('renders the boot sequence when isEdit=false', () => {
    render(<OnboardingFlow isEdit={false} />);
    // Boot sequence shows the app version header, not the onboarding form header
    expect(screen.getByText(/ASCENDOS KERNEL/i)).toBeInTheDocument();
    // The main onboarding header (INITIALIZATION SEQUENCE) should NOT be visible yet
    expect(screen.queryByText(/INITIALIZATION SEQUENCE/i)).not.toBeInTheDocument();
  });

  it('skips boot and starts at profile step when isEdit=true', () => {
    render(
      <OnboardingFlow
        isEdit={true}
        initialProfile={{
          name: 'Alice',
          dailyTargetMinutes: 120,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
        }}
      />
    );
    // Should show the main layout (not boot sequence)
    expect(screen.getByText(/INITIALIZATION SEQUENCE/i)).toBeInTheDocument();
    // Should be on the profile step
    expect(screen.getByText(/OPERATOR IDENTITY/i)).toBeInTheDocument();
  });
});

describe('OnboardingFlow — canContinue validation', () => {
  beforeEach(() => {
    // Render in edit mode so we skip the boot sequence and start at profile
    render(
      <OnboardingFlow
        isEdit={true}
        initialProfile={{
          name: '',
          dailyTargetMinutes: 240,
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
        }}
      />
    );
  });

  it('disables Continue on profile step when name is empty', () => {
    // On profile step with empty name, Continue should be disabled
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('disables Continue on profile step when name is less than 2 chars', () => {
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('enables Continue on profile step when name has 2+ chars', () => {
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Al' } });
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).not.toBeDisabled();
  });

  it('disables the final button on path step when dailyMinutes is 0', () => {
    // Navigate to profile step with a valid name, then advance to path
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Now on path step — set minutes to 0
    const minutesInput = screen.getByLabelText(/daily active target/i);
    fireEvent.change(minutesInput, { target: { value: '0' } });

    const finalBtn = screen.getByRole('button', { name: /save configuration/i });
    expect(finalBtn).toBeDisabled();
  });

  it('enables the final button on path step when dailyMinutes is positive', () => {
    // Navigate to path step
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // dailyMinutes defaults to 240 — should be enabled
    const finalBtn = screen.getByRole('button', { name: /save configuration/i });
    expect(finalBtn).not.toBeDisabled();
  });
});

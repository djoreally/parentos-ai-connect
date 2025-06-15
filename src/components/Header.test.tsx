
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import * as AuthContext from '@/contexts/AuthContext';
import { Profile } from '@/types';

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext');
const useAuthMock = AuthContext.useAuth as jest.Mock;

describe('Header Component', () => {
  // Helper function to mock the auth state
  const mockAuth = (profile: Partial<Profile> | null) => {
    useAuthMock.mockReturnValue({
      user: { id: 'user-123', email: 'test@parentrak.com' },
      profile: profile as Profile,
      loading: false,
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main title and subtitle', () => {
    mockAuth(null);
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Parentrak')).toBeInTheDocument();
    expect(screen.getByText('One voice. All contexts. All caregivers.')).toBeInTheDocument();
  });

  it('does not render the Compliance button for non-admin users', () => {
    mockAuth({ role: 'Parent' });
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.queryByText('Compliance')).not.toBeInTheDocument();
  });

  it('renders the Compliance button for Admin users', () => {
    mockAuth({ role: 'Admin' });
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });
});

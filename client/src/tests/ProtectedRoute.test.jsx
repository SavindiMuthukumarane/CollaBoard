import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

jest.mock('../services/api.js', () => ({
  api: { login: jest.fn(), register: jest.fn() }
}));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/private']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<h1>Login screen</h1>} />
          <Route element={<ProtectedRoute />}><Route path="/private" element={<h1>Private screen</h1>} /></Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

test('redirects an unauthenticated visitor to login', () => {
  renderRoute();
  expect(screen.getByRole('heading', { name: 'Login screen' })).toBeInTheDocument();
  expect(screen.queryByText('Private screen')).not.toBeInTheDocument();
});
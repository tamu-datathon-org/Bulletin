import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dummy welcome page', () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to Bulletin!/i);
  expect(linkElement).toBeInTheDocument();
});

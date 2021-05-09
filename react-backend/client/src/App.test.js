import { render, screen, act, fireEvent } from '@testing-library/react';
import App from './App';
import React from 'react';

describe('Guess the password', () => {
  let promise;
  const fakeResponse = { hint: '12345678' };

  beforeEach(() => {
    promise = Promise.resolve();
    global.fetch = jest.fn(() => promise);
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue(fakeResponse),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the game', async () => {
    render(<App />);
    const content = screen.getByText(/Guess the password/i);
    const hint = screen.getByText(/Hint/i);
    expect(content).toBeInTheDocument();
    expect(hint).toBeInTheDocument();
    await act(() => promise)
  });

  test('shows error when form is submitted with empty value', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('game-error')).toBeInTheDocument();
    expect(screen.getByTestId('game-error')).toHaveTextContent('Please enter a value');
    await act(() => promise)
  });

  test('shows error when form is submitted with alphanumeric value', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1b34567a' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('game-error')).toBeInTheDocument();
    expect(screen.getByTestId('game-error')).toHaveTextContent('Please enter only digits');
    await act(() => promise)
  });

  test('shows error when form is submitted with duplicate digits', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '11345672' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('game-error')).toBeInTheDocument();
    expect(screen.getByTestId('game-error')).toHaveTextContent('Please enter unique digits only');
    await act(() => promise)
  });

  test('shows error when form is submitted with value of length > 8', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('game-error')).toBeInTheDocument();
    expect(screen.getByTestId('game-error')).toHaveTextContent('Please enter 8 unique digits only');

    await act(() => promise)
  });

  test('shows user entry when form is submitted with a valid 8 digit number', async () => {
    const setState = jest.fn();
    const useStateMock = (initState) => [initState, setState];
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    render(<App />);
    expect(global.fetch.mock.calls[0][0]).toEqual('/new-password');
    
    (global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({
          hint: '12345678',
          highlight: ['1', '2'],
          answer: '12453678',
          correct: false
        }))
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '87654321' } });
    fireEvent.click(screen.getByRole('button'));
    expect(global.fetch.mock.calls[1][0]).toEqual('/verify-password');
    expect(setState).toHaveBeenCalled();
    await act(() => promise);
  });
})
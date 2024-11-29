import { render, fireEvent, cleanup } from '@testing-library/svelte';
import Login from '../routes/login/+page.svelte';

afterEach(() => {
  cleanup();
});

describe('Login form input and validation tests', () => {
  test('checks input validations', async () => {
    const { getByLabelText, getByText, findByText } = render(Login);

    await fireEvent.input(getByLabelText('Username'), { target: { value: 'testuser' } });
    await fireEvent.input(getByLabelText('Email'), { target: { value: 'invalid-email' } });
    await fireEvent.click(getByText('Sign Up'));

    expect(await findByText('Please enter a valid email address!')).toBeInTheDocument();
  });
});

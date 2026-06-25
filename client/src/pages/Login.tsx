import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/store-hooks';
import { setCredentials } from '../store';
import toast from 'react-hot-toast';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.bg};
  font-family: ${p => p.theme.fontBody};
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  box-shadow: ${p => p.theme.shadow};
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  font-family: ${p => p.theme.fontDisplay};
  font-size: 28px;
  color: ${p => p.theme.textPrimary};
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: ${p => p.theme.textMuted};
  font-size: 14px;
  text-align: center;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.theme.textSecondary};
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.bg};
  color: ${p => p.theme.textPrimary};
  font-family: ${p => p.theme.fontBody};
  font-size: 14px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${p => p.theme.accent};
    box-shadow: 0 0 0 2px ${p => p.theme.accent}30;
  }
`;

const Button = styled.button`
  margin-top: 8px;
  padding: 14px;
  border-radius: 8px;
  border: none;
  background: ${p => p.theme.accent};
  color: #fff;
  font-family: ${p => p.theme.fontDisplay};
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      dispatch(setCredentials(data));
      navigate('/campaigns');
      toast.success('Logged in successfully!');
    } catch (err) {
      toast.error('Invalid username or password');
    }
  };

  return (
    <Container>
      <LoginCard>
        <Title>AdPulse</Title>
        <Subtitle>Sign in to your dashboard</Subtitle>
        <Form onSubmit={handleLogin}>
          <InputGroup>
            <Label>Username</Label>
            <Input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. admin or viewer"
              required 
            />
          </InputGroup>
          <InputGroup>
            <Label>Password</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="e.g. admin123"
              required 
            />
          </InputGroup>
          <Button type="submit">Sign In</Button>
        </Form>
      </LoginCard>
    </Container>
  );
};

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const TestContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 60vh;
`;

const TestSection = styled.div`
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
`;

const Title = styled.h2`
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
`;

const Button = styled.button`
  background: var(--primary-color);
  color: var(--white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-right: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const ResultBox = styled.pre`
  background: var(--light-gray);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--gray);
  white-space: pre-wrap;
  font-family: monospace;
  font-size: var(--font-sm);
  max-height: 300px;
  overflow-y: auto;
`;

const StatusIndicator = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const TestBackend = () => {
  const [healthData, setHealthData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(apiBase.replace(/\/$/, '') + '/health');
      setHealthData(response.data);
    } catch (err) {
      setError(`Health check failed: ${err.message}`);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  const checkUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(apiBase.replace(/\/$/, '') + '/users');
      setUsersData(response.data);
    } catch (err) {
      setError(`Users check failed: ${err.message}`);
      setUsersData(null);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setError('');
    try {
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: '123456',
        role: 'buyer'
      };

      console.log('Testing registration with:', testUser);
      
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(apiBase.replace(/\/$/, '') + '/auth/register', testUser);
      console.log('Registration response:', response.data);
      
      // Immediately check users after registration
      await checkUsers();
      
      alert('Test registration successful! Check the users list below.');
    } catch (err) {
      console.error('Test registration failed:', err);
      setError(`Test registration failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    checkUsers();
  }, []);

  return (
    <TestContainer>
      <div className="container">
        <h1>Backend Testing Dashboard</h1>
        
        {error && (
          <StatusIndicator success={false}>
            ❌ {error}
          </StatusIndicator>
        )}

        <TestSection>
          <Title>🔍 Backend Health Check</Title>
          <Button onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Check Health'}
          </Button>
          
          {healthData && (
            <div>
              <StatusIndicator success={true}>
                ✅ Backend is running! Users count: {healthData.usersCount || 0}
              </StatusIndicator>
              <ResultBox>
                {JSON.stringify(healthData, null, 2)}
              </ResultBox>
            </div>
          )}
        </TestSection>

        <TestSection>
          <Title>👥 Registered Users</Title>
          <Button onClick={checkUsers} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Users'}
          </Button>
          <Button onClick={testRegistration} disabled={loading}>
            {loading ? 'Testing...' : 'Test Registration'}
          </Button>
          
          {usersData && (
            <div>
              <StatusIndicator success={usersData.count > 0}>
                {usersData.count > 0 
                  ? `✅ Found ${usersData.count} registered users` 
                  : '⚠️ No users registered yet'
                }
              </StatusIndicator>
              <ResultBox>
                {JSON.stringify(usersData, null, 2)}
              </ResultBox>
            </div>
          )}
        </TestSection>

        <TestSection>
          <Title>📋 Instructions</Title>
          <ol>
            <li><strong>Check Health:</strong> Verify backend is running and see user count</li>
            <li><strong>Test Registration:</strong> Create a test user automatically</li>
            <li><strong>Refresh Users:</strong> See all registered users</li>
            <li><strong>Manual Test:</strong> Go to <a href="/register">/register</a> and create a user manually</li>
          </ol>
          
          <p><strong>Expected Behavior:</strong></p>
          <ul>
            <li>After registration, user count should increase</li>
            <li>Users list should show the new user data</li>
            <li>Backend console should log registration details</li>
          </ul>
        </TestSection>
      </div>
    </TestContainer>
  );
};

export default TestBackend;

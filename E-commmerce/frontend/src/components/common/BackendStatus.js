import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const StatusContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: ${props => props.isConnected ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isConnected ? '#155724' : '#721c24'};
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid ${props => props.isConnected ? '#c3e6cb' : '#f5c6cb'};
  font-size: var(--font-sm);
  z-index: 1000;
  max-width: 300px;
  transition: opacity 0.3s ease;
  opacity: ${props => props.isConnected ? 0.8 : 1};

  &:hover {
    opacity: 1;
  }

  ${props => props.isConnected && `
    &:after {
      content: '';
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background: #28a745;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `}
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isConnected ? '#28a745' : '#dc3545'};
  margin-right: var(--spacing-sm);
`;

const BackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('Checking backend connection...');

  useEffect(() => {
    let interval;
    let consecutiveSuccesses = 0;
    let consecutiveFailures = 0;

    const checkBackend = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const healthUrl = apiBase.replace(/\/$/, '') + '/health';
        const response = await axios.get(healthUrl, {
          timeout: 3000
        });

        if (response.data.status === 'OK' || response.data.success === true) {
          setIsConnected(true);
          const userCount = response.data.usersCount || response.data.count || 0;
          setMessage(`Backend connected! (${userCount} users)`);
          consecutiveSuccesses++;
          consecutiveFailures = 0;

          // If we've had 3 consecutive successes, reduce check frequency
          if (consecutiveSuccesses >= 3) {
            clearInterval(interval);
            interval = setInterval(checkBackend, 30000); // Check every 30 seconds
          }
        } else {
          setIsConnected(false);
          setMessage('Backend responded but status is not OK');
          consecutiveSuccesses = 0;
        }
      } catch (error) {
        setIsConnected(false);
        consecutiveSuccesses = 0;
        consecutiveFailures++;

        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          setMessage('Backend server not running. Please start: node persistent-server.js');
        } else {
          setMessage(`Backend connection error: ${error.message}`);
        }

        // If we've had failures, check more frequently to detect when it comes back
        if (consecutiveFailures >= 2) {
          clearInterval(interval);
          interval = setInterval(checkBackend, 10000); // Check every 10 seconds when failing
        }
      }
    };

    // Initial check
    checkBackend();

    // Start with frequent checks (every 5 seconds)
    interval = setInterval(checkBackend, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StatusContainer isConnected={isConnected}>
      <StatusDot isConnected={isConnected} />
      {message}
    </StatusContainer>
  );
};

export default BackendStatus;

import React, { createContext, useContext, useState } from 'react';
import {
  ErrorMessageContextValue,
  ErrorMessageApiContextValue,
} from '../../types/ContextValues';

/* eslint-disable */
export const ErrorMessageContext = createContext<ErrorMessageContextValue | null>(null);
export const ErrorApiContext = createContext<ErrorMessageApiContextValue | null>(null);
/* eslint-enable */

type Props = {
  children: React.ReactNode;
};

export const ErrorProvider: React.FC<Props> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSendError, setIsSendError] = useState(false);

  const handleErrorMessageSend = (newMessage: string) => {
    setErrorMessage(newMessage);
    setIsSendError(true);
    setTimeout(() => {
      setIsSendError(false);
    }, 0);
  };

  const handleErrorMessageClear = () => {
    setErrorMessage('');
  };

  const errorValue = {
    errorMessage,
    sendError: isSendError,
  };

  const apiValue = {
    handleErrorMessageSend,
    handleErrorMessageClear,
  };

  return (
    <ErrorApiContext.Provider value={apiValue}>
      <ErrorMessageContext.Provider value={errorValue}>
        {children}
      </ErrorMessageContext.Provider>
    </ErrorApiContext.Provider>
  );
};

export const useErrorMessage = () => {
  const value = useContext(ErrorMessageContext);

  if (!value) {
    throw new Error('Something is wrong with provider ErrorMessageContext');
  }

  return value;
};

export const useErrorApi = () => {
  const value = useContext(ErrorApiContext);

  if (!value) {
    throw new Error('Something is wrong with provider ErrorApiContext');
  }

  return value;
};

import { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { useErrorApi, useErrorMessage } from './ErrorMessageContext';

export const ErrorMessage = () => {
  const { errorMessage, sendError } = useErrorMessage();
  const { handleErrorMessageClear } = useErrorApi();

  const handleErrorClear = useCallback(() => {
    handleErrorMessageClear();
  }, [handleErrorMessageClear]);

  useEffect(() => {
    if (sendError) {
      setTimeout(() => {
        handleErrorClear();
      }, 3000);
    }
  }, [sendError, errorMessage, handleErrorClear]);

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        { hidden: !errorMessage },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={handleErrorClear}
      />
      {errorMessage}
    </div>
  );
};

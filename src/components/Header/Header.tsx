import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { useTodoActions, useTodos } from '../../TodoContext';
import { USER_ID } from '../../api/todos';

export const Header: React.FC = () => {
  const { todos, tempTodo, isSubmitting } = useTodos();
  const { handleCreateTodo, handleToggleAllComplete } = useTodoActions();

  const [title, setTitle] = useState('');
  const inputElement = useRef<HTMLInputElement | null>(null);

  function markAllComplete() {
    handleToggleAllComplete(todos);
  }

  function reset() {
    setTitle('');
  }

  const handleSubmitTodo = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      await handleCreateTodo({
        title: title,
        userId: USER_ID,
        completed: false,
      })
    ) {
      reset();
    }
  };

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, [todos.length, tempTodo]);

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: todos.every(todo => todo.completed),
          })}
          data-cy="ToggleAllButton"
          onClick={markAllComplete}
        />
      )}

      <form onSubmit={handleSubmitTodo}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isSubmitting}
          ref={inputElement}
          autoFocus
        />
      </form>
    </header>
  );
};

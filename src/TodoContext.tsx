import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Todo } from './types/Todo';
import { getTodos } from './api/todos';
import * as todoService from './api/todos';
import {
  TodoActionsContextValue,
  TodosContextValue,
} from './types/ContextValues';
import { Errors } from './constants/Errors';
// eslint-disable-next-line
import { useErrorApi } from './components/Error/ErrorMessageContext';
import { FilterStatus } from './types/FilterStatus';

export const TodosContext = createContext<TodosContextValue | null>(null);
// eslint-disable-next-line
export const TodosApiContext =
  React.createContext<TodoActionsContextValue | null>(null);
export const TodosLoadingContext = createContext<number[] | null>(null);

const getFilteredTodos = (todos: Todo[], status: FilterStatus): Todo[] => {
  const visibleTodos = [...todos];

  switch (status) {
    case FilterStatus.active:
      return visibleTodos.filter(todo => !todo.completed);

    case FilterStatus.completed:
      return visibleTodos.filter(todo => todo.completed);

    default:
      return visibleTodos;
  }
};

type Props = {
  children: React.ReactNode;
};

export const TodoProvider: React.FC<Props> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filterStatus, setFilterStatus] = useState(FilterStatus.all);
  const [isLoading, setIsLoading] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleErrorMessageSend } = useErrorApi();

  const filteredTodos = getFilteredTodos(todos, filterStatus);

  const handleChangeFilterStatus = useCallback(async (status: FilterStatus) => {
    setFilterStatus(status);
  }, []);

  const handleCreateTodo = useCallback(
    async ({
      title,
      userId,
      completed,
    }: Omit<Todo, 'id'>): Promise<boolean> => {
      handleErrorMessageSend('');
      setIsSubmitting(true);

      const trimmedTitle = title.trim();

      if (trimmedTitle.length) {
        const todoRequest = {
          title: trimmedTitle,
          userId: userId,
          completed: completed,
        };

        setTempTodo({
          id: 0,
          ...todoRequest,
        });

        setIsLoading(prev => [...prev, 0]);

        try {
          const newTodo = await todoService.createTodo({
            ...todoRequest,
          });

          setTodos(prevTodos => [...prevTodos, newTodo]);
          setTempTodo(null);

          return true;
        } catch {
          handleErrorMessageSend(Errors.add);

          return false;
        } finally {
          setIsLoading(prev => prev.filter(id => id !== 0));
          setTempTodo(null);
          setIsSubmitting(false);
        }
      }

      handleErrorMessageSend(Errors.emptyTitle);
      setIsSubmitting(false);

      return false;
    },
    [handleErrorMessageSend],
  );

  const handleDeleteTodo = useCallback(
    async (todoId: number): Promise<boolean> => {
      setIsLoading(prev => [...prev, todoId]);

      try {
        await todoService.deleteTodo(todoId);
        setTodos(currentTodos => currentTodos.filter(t => t.id !== todoId));

        return true;
      } catch {
        handleErrorMessageSend(Errors.delete);

        return false;
      } finally {
        setIsLoading([]);
      }
    },
    [handleErrorMessageSend],
  );

  const handleUpdateTodo = useCallback(
    async ({ id, title, userId, completed }: Todo): Promise<boolean> => {
      setIsLoading(prev => [...prev, id]);

      try {
        // eslint-disable-next-line
        const todo = await todoService.updateTodo({
          id,
          title,
          userId,
          completed,
        });

        setTodos(currentTodos => {
          const newTodos = [...currentTodos];
          const index = newTodos.findIndex(t => t.id === id);

          newTodos.splice(index, 1, todo);

          return newTodos;
        });

        return true;
      } catch {
        handleErrorMessageSend(Errors.update);

        return false;
      } finally {
        setIsLoading(prev => prev.filter(todoId => todoId !== id));
      }
    },
    [handleErrorMessageSend],
  );

  const handleToggleComplete = useCallback(
    async (updatedTodo: Todo) => {
      setIsLoading(prev => [...prev, updatedTodo.id]);

      try {
        const currentTodo = await todoService.updateTodo({
          ...updatedTodo,
          completed: !updatedTodo.completed,
        });

        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === currentTodo.id ? currentTodo : todo,
          ),
        );
      } catch {
        handleErrorMessageSend(Errors.update);
      } finally {
        setIsLoading(prev => prev.filter(todoId => todoId !== updatedTodo.id));
      }
    },
    [handleErrorMessageSend],
  );

  const handleToggleAllComplete = useCallback(
    async (updatedTodos: Todo[]) => {
      const isAllCompleted = updatedTodos.every(t => t.completed);

      const tempArrTodos = isAllCompleted
        ? updatedTodos
        : updatedTodos.filter(t => !t.completed);

      for (const todo of tempArrTodos) {
        setIsLoading(prev => [...prev, todo.id]);

        try {
          const currentTodo = await todoService.updateTodo({
            ...todo,
            completed: !todo.completed,
          });

          setTodos(prevTodos =>
            prevTodos.map(t => (t.id === currentTodo.id ? currentTodo : t)),
          );
        } catch {
          handleErrorMessageSend(Errors.update);
        } finally {
          setIsLoading(prev => prev.filter(todoId => todoId !== todo.id));
        }
      }
    },
    [handleErrorMessageSend],
  );

  const todosValue = useMemo(
    () => ({
      todos,
      filteredTodos,
      tempTodo,
      filterStatus,
      isSubmitting,
    }),
    [todos, filteredTodos, tempTodo, filterStatus, isSubmitting],
  );

  const apiValue = useMemo(
    () => ({
      handleCreateTodo,
      handleDeleteTodo,
      handleUpdateTodo,
      handleToggleComplete,
      handleToggleAllComplete,
      handleChangeFilterStatus,
    }),
    [
      handleCreateTodo,
      handleDeleteTodo,
      handleUpdateTodo,
      handleToggleComplete,
      handleToggleAllComplete,
      handleChangeFilterStatus,
    ],
  );

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const loadedTodos = await getTodos();

        setTodos(loadedTodos);
      } catch {
        handleErrorMessageSend(Errors.load);
      }
    };

    fetchTodos();
  }, []);

  return (
    <TodosApiContext.Provider value={apiValue}>
      <TodosLoadingContext.Provider value={isLoading}>
        <TodosContext.Provider value={todosValue}>
          {children}
        </TodosContext.Provider>
      </TodosLoadingContext.Provider>
    </TodosApiContext.Provider>
  );
};

export const useTodos = () => {
  const value = useContext(TodosContext);

  if (!value) {
    throw new Error('Something is wrong with provider TodosContext');
  }

  return value;
};

export const useTodoActions = () => {
  const value = useContext(TodosApiContext);

  if (!value) {
    throw new Error('Something is wrong with provider TodosApiContext');
  }

  return value;
};

export const useLoadingTodos = () => {
  const value = useContext(TodosLoadingContext);

  if (!value) {
    throw new Error('Something is wrong with provider TodosLoadingContext');
  }

  return value;
};

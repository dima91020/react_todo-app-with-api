import { Todo } from './Todo';
import {
  HandleChangeFilterStatus,
  HandleCreateTodo,
  HandleDeleteTodo,
  HandleErrorMessageClear,
  HandleErrorMessageSend,
  HandleToggleAllComplete,
  HandleToggleComplete,
  HandleUpdateTodo,
} from './HandlerFunctions';
import { TempTodo } from './TempTodo';
import { FilterStatus } from './FilterStatus';

export type TodosContextValue = {
  todos: Todo[];
  filteredTodos: Todo[];
  tempTodo: TempTodo;
  filterStatus: FilterStatus;
  isSubmitting: boolean;
};

export type ErrorMessageContextValue = {
  errorMessage: string;
  sendError: boolean;
};

export type ErrorMessageApiContextValue = {
  handleErrorMessageSend: HandleErrorMessageSend;
  handleErrorMessageClear: HandleErrorMessageClear;
};

export type TodoActionsContextValue = {
  handleCreateTodo: HandleCreateTodo;
  handleDeleteTodo: HandleDeleteTodo;
  handleUpdateTodo: HandleUpdateTodo;
  handleToggleComplete: HandleToggleComplete;
  handleToggleAllComplete: HandleToggleAllComplete;
  handleChangeFilterStatus: HandleChangeFilterStatus;
};

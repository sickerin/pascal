import { createReducer } from "../../app/common/util/reducerUtil";
import {
  FETCH_TASKS,
  CREATE_TASK,
  DELETE_TASK,
  UPDATE_TASK
} from "./taskConstants";

const initialState = [];

export const createTask = (state, payload) => {
  return [...state, Object.assign({}, payload.task)];
};

export const updateTask = (state, payload) => {
  return [
    ...state.filter(task => task.id !== payload.task.id),
    Object.assign({}, payload.task)
  ];
};

export const deleteTask = (state, payload) => {
  return [...state.filter(task => task.id !== payload.taskId)];
};

export const fetchTasks = (state, payload) => {
  return payload.tasks;
};

export default createReducer(initialState, {
  [CREATE_TASK]: createTask,
  [UPDATE_TASK]: updateTask,
  [DELETE_TASK]: deleteTask,
  [FETCH_TASKS]: fetchTasks
});

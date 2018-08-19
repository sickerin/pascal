import { toastr } from "react-redux-toastr";
import { FETCH_TASKS } from "./taskConstants";
import {
  asyncActionStart,
  asyncActionFinish,
  asyncActionError
} from "../async/asyncActions";
import compareAsc from "date-fns/compare_asc";
import moment from "moment";
import firebase from "../../app/config/firebase";
import { createNewTask } from "../../app/common/util/helpers";

export const createTask = task => {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    // don't necessarily need to getFirebase to get user, below works
    const user = firestore.auth().currentUser;
    const photoURL = getState().firebase.profile.photoURL;
    //helper function created
    let newTask = createNewTask(user, photoURL, task);
    try {
      let createdTask = await firestore.add(`tasks`, newTask);
      //set up a lookup table
      await firestore.set(`task_attendee/${createdTask.id}_${user.uid}`, {
        taskId: createdTask.id,
        userUid: user.uid,
        taskDate: task.date,
        manager: true
      });
      toastr.success("Success!", "Task has been created!");
    } catch (error) {
      toastr.error("Oops", "Something went wrong!");
    }
  };
};

export const updateTask = task => {
  return async (dispatch, getState) => {
    dispatch(asyncActionStart());
    const firestore = firebase.firestore();
    if (task.date !== getState().firestore.ordered.tasks[0].date) {
      task.date = moment(task.date).toDate();
    }
    try {
      let taskDocRef = firestore.collection("tasks").doc(task.id);
      let dateEqual = compareAsc(
        getState().firestore.ordered.tasks[0].date.toDate(),
        task.date
      );
      if (dateEqual !== 0) {
        let batch = firestore.batch();
        await batch.update(taskDocRef, task);

        let taskAttendeeRef = firestore.collection("task_attendee");
        let taskAttendeeQuery = await taskAttendeeRef.where(
          "taskId",
          "==",
          task.id
        );
        let taskAttendeeQuerySnap = await taskAttendeeQuery.get();

        for (let i = 0; i < taskAttendeeQuerySnap.docs.length; i++) {
          let taskAttendeeDocRef = await firestore
            .collection("task_attendee")
            .doc(taskAttendeeQuerySnap.docs[i].id);
          await batch.update(taskAttendeeDocRef, {
            taskDate: task.date
          });
        }
        await batch.commit();
      } else {
        await taskDocRef.update(task);
      }
      dispatch(asyncActionFinish());
      toastr.success("Success!", "Task has been Updated!");
    } catch (error) {
      console.log(error);
      dispatch(asyncActionError());
      toastr.error("Oops", "Something went wrong!");
    }
  };
};

export const cancelToggle = (cancelled, taskId) => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  const firestore = getFirestore();
  const message = cancelled
    ? "Are you sure you want to cancel the task?"
    : "Are you sure you want to reactivate the task?";
  try {
    toastr.confirm(message, {
      onOk: () =>
        firestore.update(`tasks/${taskId}`, {
          cancelled: cancelled
        })
    });
  } catch (error) {
    console.log(error);
  }
};

export const getTasksForDashboard = lastTask => async (dispatch, getState) => {
  let today = new Date(Date.now());
  const firestore = firebase.firestore();
  const tasksRef = firestore.collection("tasks");
  try {
    dispatch(asyncActionStart());
    let startAfter =
      lastTask &&
      (await firestore
        .collection("tasks")
        .doc(lastTask.id)
        .get());
    let query;

    lastTask
      ? (query = tasksRef
          .where("date", ">=", today)
          .orderBy("date")
          .startAfter(startAfter)
          .limit(2))
      : (query = tasksRef
          .where("date", ">=", today)
          .orderBy("date")
          .limit(2));

    let querySnap = await query.get();

    if (querySnap.docs.length === 0) {
      dispatch(asyncActionFinish());
      return querySnap;
    }

    let tasks = [];

    for (let i = 0; i < querySnap.docs.length; i++) {
      let evt = { ...querySnap.docs[i].data(), id: querySnap.docs[i].id };
      tasks.push(evt);
    }
    dispatch({ type: FETCH_TASKS, payload: { tasks } });
    dispatch(asyncActionFinish());
    return querySnap;
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
  }
};

export const addTaskComment = (taskId, values, parentId) => async (
  dispatch,
  getState,
  { getFirebase }
) => {
  const firebase = getFirebase();
  const profile = getState().firebase.profile;
  const user = firebase.auth().currentUser;
  let newComment = {
    parentId: parentId,
    displayName: profile.displayName,
    photoURL: profile.photoURL || "/assets/user.png",
    uid: user.uid,
    text: values.comment,
    date: Date.now()
  };
  try {
    await firebase.push(`task_chat/${taskId}`, newComment);
  } catch (error) {
    console.log(error);
    toastr.error("Oops", "Problem adding comment");
  }
};

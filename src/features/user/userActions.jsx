import moment from "moment";
import { toastr } from "react-redux-toastr";
import cuid from "cuid";
import {
  asyncActionError,
  asyncActionStart,
  asyncActionFinish
} from "../async/asyncActions";
import firebase from "../../app/config/firebase";
import { FETCH_TASKS } from "../task/taskConstants";

export const updateProfile = user => async (
  dispatch,
  getState,
  { getFirebase }
) => {
  const firebase = getFirebase();
  const { isLoaded, isEmpty, ...updatedUser } = user;
  //on client side we are stroing date as a moment object
  //we need to convert it, since the dstabase doesn't
  //want that object
  if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
    updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
  }
  try {
    // we've used updateProfile in authAction before,
    // how is this different--> we directly updateProfile in firebase here
    // there we update the auth profile (in authentication???)
    await firebase.updateProfile(updatedUser);
    toastr.success("Success", "Profile updated!");
  } catch (error) {
    console.log(error);
  }
};

export const uploadProfileImage = (file, fileName) => async (
  dispatch,
  getState,
  { getFirebase, getFirestore }
) => {
  const imageName = cuid();
  const firebase = getFirebase();
  const firestore = getFirestore();
  const user = firebase.auth().currentUser;
  const path = `${user.uid}/user_images`;
  const options = {
    name: imageName
  };
  try {
    dispatch(asyncActionStart());
    //upload file to firebase storage.
    let uploadedFile = await firebase.uploadFile(path, file, null, options);
    //after uploading file, we get a uploadtasksnapshot, get image url
    let downloadURL = await uploadedFile.uploadTaskSnapshot.downloadURL;
    //get user document (firestore)
    let userDoc = await firestore.get(`users/${user.uid}`);
    if (!userDoc.data().photoURL) {
      //for firestore
      await firebase.updateProfile({
        photoURL: downloadURL
      });
      //for auth
      await user.updateProfile({
        photoURL: downloadURL
      });
    }
    //add new photo as new image as photos collection
    await firestore.add(
      {
        collection: "users",
        doc: user.uid,
        subcollections: [{ collection: "photos" }]
      },
      {
        name: imageName,
        url: downloadURL
      }
    );
    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    throw new Error("There was an error in uploading your photo.");
  }
};

export const deletePhoto = photo => async (
  dispatch,
  getState,
  { getFirebase, getFirestore }
) => {
  const firebase = getFirebase();
  const firestore = getFirestore();
  const user = firebase.auth().currentUser;
  try {
    await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);
    await firestore.delete({
      collection: "users",
      doc: user.uid,
      subcollections: [{ collection: "photos", doc: photo.id }]
    });
  } catch (error) {
    console.log(error);
    throw new Error("Problem deleting the photo");
  }
};

//need to assure data consistency
export const setMainPhoto = photo => async (dispatch, getState) => {
  dispatch(asyncActionStart());
  //use firebase/firestore api directly
  const firestore = firebase.firestore();
  const user = firebase.auth().currentUser;

  //our difference, is that we need to update old tasks
  const today = new Date(Date.now());
  let userDocRef = firestore.collection("users").doc(user.uid);
  let taskAttendeeRef = firestore.collection("task_attendee");

  try {
    let batch = firestore.batch();

    await batch.update(userDocRef, {
      photoURL: photo.url
    });

    let taskQuery = await taskAttendeeRef
      .where("userUid", "==", user.uid)
      .where("taskDate", ">", today);

    let taskQuerySnap = await taskQuery.get();

    for (let i = 0; i < taskQuerySnap.docs.length; i++) {
      let taskDocRef = await firestore
        .collection("tasks")
        .doc(taskQuerySnap.docs[i].data().taskId);
      let task = await taskDocRef.get();
      if (task.data().managerUid === user.uid) {
        batch.update(taskDocRef, {
          managerPhotoURL: photo.url,
          [`attendees.${user.uid}.photoURL`]: photo.url
        });
      } else {
        batch.update(taskDocRef, {
          [`attendees.${user.uid}.photoURL`]: photo.url
        });
      }
    }
    console.log(batch);
    await batch.commit();
    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    throw new Error("Problem setting profile picture");
  }
};

export const goingToTask = task => async (dispatch, getState) => {
  dispatch(asyncActionStart());
  const firestore = firebase.firestore();
  const user = firebase.auth().currentUser;
  const profile = getState().firebase.profile;
  const attendee = {
    going: true,
    joinDate: Date.now(),
    photoURL: profile.photoURL || "/assets/user.png",
    displayName: profile.displayName,
    manager: false
  };
  try {
    let taskDocRef = firestore.collection("tasks").doc(task.id);
    let taskAttendeeDocRef = firestore
      .collection("task_attendee")
      .doc(`${task.id}_${user.uid}`);
    await firestore.runTransaction(async transaction => {
      await transaction.get(taskDocRef);
      await transaction.update(taskDocRef, {
        [`attendees.${user.uid}`]: attendee
      });
      await transaction.set(taskAttendeeDocRef, {
        taskId: task.id,
        userUid: user.uid,
        taskDate: task.date,
        manager: false
      });
    });
    dispatch(asyncActionFinish());
    toastr.success("Success", "You have signed up for the task");
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    toastr.error("Oops", "Problem joining the task");
  }
};

export const cancelGoingToTask = task => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  const firestore = getFirestore();
  const user = firestore.auth().currentUser;
  try {
    await firestore.update(`tasks/${task.id}`, {
      [`attendees.${user.uid}`]: firestore.FieldValue.delete()
    });
    await firestore.delete(`task_attendee/${task.id}_${user.uid}`);
    toastr.success("Success", "You have been removed from the task");
  } catch (error) {
    console.log(error);
    toastr.error("Oops", "Something went wrong");
  }
};

export const getUserTasks = (userUid, activeTab) => async (
  dispatch,
  getState
) => {
  dispatch(asyncActionStart());
  const firestore = firebase.firestore();
  const today = new Date(Date.now());
  let tasksRef = firestore.collection("task_attendee");
  let query;
  switch (activeTab) {
    case 1: //past tasks
      query = tasksRef
        .where("userUid", "==", userUid)
        .where("taskDate", "<=", today)
        .orderBy("taskDate", "desc");
      break;
    case 2: //future tasks
      query = tasksRef
        .where("userUid", "==", userUid)
        .where("taskDate", ">=", today)
        .orderBy("taskDate");
      break;
    case 3: // managed tasks
      query = tasksRef
        .where("userUid", "==", userUid)
        .where("manager", "==", true)
        .orderBy("taskDate", "desc");
      break;
    default:
      // managed tasks
      query = tasksRef
        .where("userUid", "==", userUid)
        .orderBy("taskDate", "desc");
  }
  try {
    let querySnap = await query.get();
    let tasks = [];

    for (let i = 0; i < querySnap.docs.length; i++) {
      let evt = await firestore
        .collection("tasks")
        .doc(querySnap.docs[i].data().taskId)
        .get();
      tasks.push({ ...evt.data(), id: evt.id });
    }

    dispatch({ type: FETCH_TASKS, payload: { tasks } });

    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
  }
};

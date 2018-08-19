const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const newActivity = (type, task, id) => {
  return {
    type: type,
    taskDate: task.date,
    managedBy: task.managedBy,
    title: task.title,
    photoURL: task.managerPhotoURL,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    managerUid: task.managerUid,
    taskId: id
  };
};

exports.createActivity = functions.firestore
  .document("tasks/{taskId}")
  .onCreate(task => {
    let newTask = task.data();

    console.log(newTask);

    const activity = newActivity("newTask", newTask, task.id);

    console.log(activity);

    return admin
      .firestore()
      .collection("activity")
      .add(activity)
      .then(docRef => {
        return console.log("Actitivy created with ID: ", docRef.id);
      })
      .catch(err => {
        return console.log("Error adding activity", err);
      });
  });

exports.cancelActivity = functions.firestore
  .document("tasks/{taskId}")
  .onUpdate((task, context) => {
    let updatedTask = task.after.data();
    let previousTaskData = task.before.data();
    console.log({ task });
    console.log({ context });
    console.log({ updatedTask });
    console.log({ previousTaskData });

    if (
      !updatedTask.cancelled ||
      updatedTask.cancelled === previousTaskData.cancelled
    ) {
      return false;
    }

    const activity = newActivity(
      "cancelledTask",
      updatedTask,
      context.params.taskId
    );

    console.log({ activity });

    return admin
      .firestore()
      .collection("activity")
      .add(activity)
      .then(docRef => {
        return console.log("Activity created with ID: ", docRef.id);
      })
      .catch(err => {
        return console.log("Error adding activity", err);
      });
  });

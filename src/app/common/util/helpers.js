import moment from "moment";

export const objectToArray = object => {
  if (object) {
    // gives an array of key and value pair
    return Object.entries(object).map(e => Object.assign(e[1], { id: e[0] }));
  }
};

export const createNewTask = (user, photoURL, task) => {
  task.date = moment(task.date).toDate();
  return {
    ...task,
    managerUid: user.uid,
    managedBy: user.displayName,
    managerPhotoURL: photoURL || "/assets/user.png",
    created: Date.now(),
    attendees: {
      [user.uid]: {
        going: true,
        joinDate: Date.now(),
        photoURL: photoURL || "/assets/user.png",
        displayName: user.displayName,
        manager: true
      }
    }
  };
};

//takes in a dataset and creates a hashtable.
export const createDataTree = dataset => {
  let hashTable = Object.create(null);
  dataset.forEach(a => (hashTable[a.id] = { ...a, childNodes: [] }));
  let dataTree = [];
  dataset.forEach(a => {
    if (a.parentId) hashTable[a.parentId].childNodes.push(hashTable[a.id]);
    else dataTree.push(hashTable[a.id]);
  });
  return dataTree;
};

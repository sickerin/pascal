import firebase from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOnd6oOXfeZUd67Vfx5YzKXR9BbXCrmSQ",
  authDomain: "pascal-4703c.firebaseapp.com",
  databaseURL: "https://pascal-4703c.firebaseio.com",
  projectId: "pascal-4703c",
  storageBucket: "pascal-4703c.appspot.com",
  messagingSenderId: "343528148110"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};

firestore.settings(settings);

export default firebase;

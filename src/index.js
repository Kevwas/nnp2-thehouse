import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
  setDoc,
  // writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

// init firebase
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection ref
const collRef = collection(db, "#thehotel");

// queries

const q = query(
  collRef,
  where("type", "==", "room")
  // orderBy("title", "asc")
);

// const q = query(collRef, orderBy("createdAt"));

// get collection data
getDocs(collRef)
  .then((snapshot) => {
    let books = [];
    snapshot.docs.forEach((doc) => {
      books.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    console.log("Get all collection documents:");
    console.log(books);
  })
  .catch((err) => {
    console.log(err.message);
  });

// get collection data for a specific query
getDocs(q)
  .then((snapshot) => {
    let documents = [];
    snapshot.docs.forEach((doc) => {
      documents.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    console.log("Get collection for a specific query: ");
    console.log(documents);
  })
  .catch((err) => {
    console.log(err.message);
  });

// get collection data in real time
const unsubCol = onSnapshot(collRef, (snapshot) => {
  let documents = [];
  snapshot.docs.forEach((doc) => {
    documents.push({
      ...doc.data(),
      id: doc.id,
    });
  });
  console.log("Get all collection documents in real time: ");
  console.log(documents);
});

// get collection data in real time for a specific query
const unsubDoc = onSnapshot(q, (snapshot) => {
  let documents = [];
  snapshot.docs.forEach((doc) => {
    documents.push({
      ...doc.data(),
      id: doc.id,
    });
  });
  console.log("Get collection for a specific query in real time: ");
  console.log(documents);
});

// adding documents
const addDocumentForm = document.querySelector(".add");
addDocumentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("############## UPDATE: ##############");

  const docRef = doc(db, "#thehotel", addDocumentForm.id.value);
  setDoc(docRef, {
    name: addDocumentForm.name.value,
    type: addDocumentForm.type.value,
    price: addDocumentForm.price.value,
    comments: addDocumentForm.comments.value.split(","),
    is_busy: addDocumentForm.is_busy.checked,
    // createdAt: serverTimestamp(),
  }).then(() => {
    addDocumentForm.reset();
  });
});

// delete documents
const updateDocumentForm = document.querySelector(".update");
updateDocumentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const docRef = doc(db, "#thehotel", updateDocumentForm.id.value);

  const updatedObj = {};
  const childrenNodes = updateDocumentForm.childNodes;
  const childrenNodesInput = [];
  for (let i = 0; i < childrenNodes.length; i++) {
    if (childrenNodes[i].nodeName === "INPUT") {
      childrenNodesInput.push(childrenNodes[i]);
    }
  }
  childrenNodesInput.forEach((child, idx) => {
    if (!!child.value && child.name !== "id") {
      updatedObj[child.name] =
        child.value === "on" ? child.checked : child.value;
    }
  });

  updateDoc(docRef, updatedObj).then(() => {
    updateDocumentForm.reset();
  });
});

// delete documents
const deleteDocumentForm = document.querySelector(".delete");
deleteDocumentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const docRef = doc(db, "#thehotel", deleteDocumentForm.id.value);

  console.log("############## UPDATE: ##############");
  deleteDoc(docRef).then(() => {
    deleteDocumentForm.reset();
  });
});

// get a single document
const getDocumentForm = document.querySelector(".get");
getDocumentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const docRef = doc(db, "#thehotel", getDocumentForm.id.value);

  console.log("############## UPDATE: ##############");
  getDoc(docRef).then((doc) => {
    console.log(doc.data(), doc.id);
    getDocumentForm.reset();
  });
});

// get a single document each time it changes in real time
const subscribeDocumentForm = document.querySelector(".subscribe");
subscribeDocumentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const docRef = doc(db, "#thehotel", subscribeDocumentForm.id.value);
  onSnapshot(docRef, (doc) => {
    console.log("############## CHANGE DETECTED: ##############");
    console.log(doc.data(), doc.id);
  });
  alert(
    `Document with id: ${subscribeDocumentForm.id.value} subscribed successfully`
  );
});

// unsubscribing from changes (auth & db)
const unsubButton = document.querySelector(".unsub");
unsubButton.addEventListener("click", () => {
  console.log("unsubscribing");
  // unsubCol()
  unsubDoc();
});

// signing users up
const signupForm = document.querySelector(".signup");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = signupForm.email.value;
  const password = signupForm.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user created:", cred.user);
      signupForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// logging in and out
const logoutButton = document.querySelector(".logout");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("user signed out");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

const loginForm = document.querySelector(".login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user logged in:", cred.user);
      loginForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

const triggerAuthButton = document.querySelector("#triggerAuthButton");
triggerAuthButton.addEventListener("click", toggleAuthMethod);

function toggleAuthMethod() {
  const signupForm = document.querySelector(".signup");
  const loginForm = document.querySelector(".login");
  signupForm.hidden = !signupForm.hidden;
  loginForm.hidden = !loginForm.hidden;
  triggerAuthButton.innerHTML = signupForm.hidden
    ? "SIGNUP INSTEAD"
    : "LOGIN INSTEAD";
}

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const authUI = document.getElementById("auth");
  const signupForm = document.querySelector(".signup");
  const loginForm = document.querySelector(".login");
  // const logoutButton = document.querySelector(".logout");
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(`user ${user.email} is signed in.`);
      app.hidden = false;
      authUI.hidden = true;
    } else {
      console.log("No user is signed in.");

      triggerAuthButton.innerHTML = "LOGIN INSTEAD";
      app.hidden = true;

      authUI.hidden = false;
      loginForm.hidden = true;
      signupForm.hidden = false;
    }
  });
});

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
  // OFFLINE PERSISTENCE:
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import firebaseConfig from "./firebaseConfig";
import {
  httpsCallable,
  getFunctions,

  // connectFunctionsEmulator,
} from "firebase/functions";
// import { log } from "firebase-functions/logger";

// init firebase
const app = initializeApp(firebaseConfig);
initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// init services
const db = getFirestore();

const auth = getAuth();

const storage = getStorage();

const functions = getFunctions();
// connectFunctionsEmulator(functions, "localhost", 5001);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    // ...
  } else if (err.code == "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    // ...
  }
});
// Subsequent queries will use persistence, if it was enabled successfully

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
// getDocs(collRef)
//   .then((snapshot) => {
//     let books = [];
//     snapshot.docs.forEach((doc) => {
//       books.push({
//         ...doc.data(),
//         id: doc.id,
//       });
//     });
//     console.log("Get all collection documents:");
//     console.log(books);
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

// get collection data for a specific query
// getDocs(q)
//   .then((snapshot) => {
//     let documents = [];
//     snapshot.docs.forEach((doc) => {
//       documents.push({
//         ...doc.data(),
//         id: doc.id,
//       });
//     });
//     console.log("Get collection for a specific query: ");
//     console.log(documents);
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

// get collection data in real time
// const unsubCol = onSnapshot(collRef, (snapshot) => {
//   let documents = [];
//   snapshot.docs.forEach((doc) => {
//     documents.push({
//       ...doc.data(),
//       id: doc.id,
//     });
//   });
//   console.log("Get all collection documents in real time: ");
//   console.log(documents);
// });

// Listen to offline data
onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    console.log(change);
    if (change.type === "added") {
      console.log("New room: ", change.doc.data());
    }

    const source = snapshot.metadata.fromCache ? "local cache" : "server";
    console.log("Data came from: " + source);
  });
});

// get collection data in real time for a specific query
// const unsubDoc = onSnapshot(q, (snapshot) => {
//   let documents = [];
//   snapshot.docs.forEach((doc) => {
//     documents.push({
//       ...doc.data(),
//       id: doc.id,
//     });
//   });
//   console.log("Get collection for a specific query in real time: ");
//   console.log(documents);
// });

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
  getDoc(docRef, { includeMetadataChanges: true }).then((doc) => {
    console.log(doc.data(), doc.id);

    console.log(doc);
    const source = doc.metadata.fromCache ? "local cache" : "server";
    const pendingwrites = doc.metadata.hasPendingWrites;
    console.log("Data came from: " + source);
    console.log("Has pending writes: " + pendingwrites);
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
  unsubCol();
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

const uploadForm = document.querySelector(".upload");
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = uploadForm.image.files[0];

  console.log("File: ", file, " File Name: ", file.name);

  const imagesRef = ref(storage, `images/${file.name}`);
  const uploadTask = uploadBytesResumable(imagesRef, file);

  // uploadBytes(imagesRef, file)
  //   .then((snapshot) => {
  //     console.log("Uploaded a blob or file!");
  //     uploadForm.reset();
  //   })
  //   .catch((err) => console.log(err));

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    "state_changed",
    // { includeMetadataChanges: true }, ?
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded

      document
        .querySelector(".uPause")
        .addEventListener("click", () => uploadTask.pause());
      document
        .querySelector(".uResume")
        .addEventListener("click", () => uploadTask.resume());
      document
        .querySelector(".uCancel")
        .addEventListener("click", () => uploadTask.cancel());

      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
      }

      // const source = snapshot.metadata.fromCache ? "local cache" : "server";
      // console.log("Data came from: " + source);
    },
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case "storage/unauthorized":
          // User doesn't have permission to access the object
          console.log("User doesn't have permission to access the object");
          break;
        case "storage/canceled":
          // User canceled the upload
          console.log("User canceled the upload");
          break;

        // ...

        case "storage/unknown":
          // Unknown error occurred, inspect error.serverResponse
          console.log("Unknown error occurred, inspect error.serverResponse");
          break;
      }
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log("File available at", downloadURL);
      });
    }
  );
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

const network_switch = document.querySelector(".toggler");
network_switch.addEventListener("change", async (e) => {
  if (e.target.checked) {
    await enableNetwork(db);
    alert("Network access enabled.");
  } else {
    await disableNetwork(db);
    alert("Network access disabled.");
  }
});

const searchForm = document.querySelector(".search");
searchForm.addEventListener("change", (e) => {
  e.preventDefault();
  const query = searchForm.froom.value;
  // console.log(query);

  const searchDocs = httpsCallable(functions, "searchDocs");
  searchDocs({ query: query })
    .then((result) => {
      const documents = result.data.documents;
      console.log(documents);
    })
    .catch((err) => console.log(err));
});

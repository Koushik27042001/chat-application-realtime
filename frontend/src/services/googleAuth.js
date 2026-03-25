import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

export async function getGoogleIdToken() {
  const { user } = await signInWithPopup(auth, provider);
  return user.getIdToken();
}

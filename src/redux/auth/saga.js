import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
// import { auth } from '@/helpers/Firebase';
import { adminRoot } from '@/constants/defaultValues';
import { setCurrentUser } from '@/helpers/Utils';

import {
  LOGIN_USER,
  // REGISTER_USER,
  LOGOUT_USER,
  // FORGOT_PASSWORD,
  // RESET_PASSWORD,
} from '../contants';
import {
  loginUserSuccess,
  loginUserError,
  // registerUserSuccess,
  // registerUserError,
  // forgotPasswordSuccess,
  // forgotPasswordError,
  // resetPasswordSuccess,
  // resetPasswordError,
} from './actions';
import { Navigate } from 'react-router-dom';
// import { onUserDataEdit } from '@/redux/generalData/actions';
import envs from '@Helpers/envs';
const urlAPI = envs.URL_API;

export function* watchLoginUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(LOGIN_USER, loginWithEmailPassword);
}

const loginWithEmailPasswordAsync = async (email, password, companyId) =>
  fetch(`${urlAPI}login`, {
    async: true,
    crossDomain: true,
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    contentType: 'JSON',
    body: JSON.stringify({ email, password, companyId })
  }).then((response) => response.json())
    .then((response) => response)
    .catch((err) => err)

function* loginWithEmailPassword({ payload }) {
  const { companyId, email, password } = payload.user;
  const { history } = payload;
  try {
    const loginUser = yield call(loginWithEmailPasswordAsync, email, password, companyId);
    if (loginUser.data) {
      const dataUser = loginUser.data[0];
      const companyData = loginUser.dataCompany;
      const item = {
        uid: dataUser.id,
        token: loginUser.token,
        title: loginUser.name,
        date: new Date().toJSON().slice(0, 19),
        role: 1,
        ...dataUser
      };
      const lastUrl = adminRoot;
      setCurrentUser(item, companyData);
      yield put(loginUserSuccess(item));
      <Navigate to={lastUrl} />
    } else {
      const { messages } = loginUser;
      if (messages && messages.length > 0) {
        const message = messages[0];
        yield put(loginUserError(message.description));
        // messages.map(elem=>{
        // });
      }
      // const letNewError = {password:loginUser.messages[0].description};
      // 
    }
  } catch (error) {
    const { messages } = error;
    if (messages) {
      const message = messages[0];
      // console.log({messages});
      // messages.map(elem=>{
      yield put(loginUserError(message.description));
      // });
    }
  }
}

//  v43wwwwww

// const registerWithEmailPasswordAsync = async (email, password) =>
//   // eslint-disable-next-line no-return-await
//   await auth
//     .createUserWithEmailAndPassword(email, password)
//     .then((user) => user)
//     .catch((error) => error);

// function* registerWithEmailPassword({ payload }) {
//   const { email, password } = payload.user;
//   const { history } = payload;
//   try {
//     const registerUser = yield call(
//       registerWithEmailPasswordAsync,
//       email,
//       password
//     );
//     if (!registerUser.message) {
//       const item = { uid: registerUser.user.uid, ...currentUser };
//       setCurrentUser(item);
//       yield put(registerUserSuccess(item));
//       history.push(adminRoot);
//     } else {
//       yield put(registerUserError(registerUser.message));
//     }
//   } catch (error) {
//     yield put(registerUserError(error));
//   }
// }

export function* watchLogoutUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(LOGOUT_USER, logout);
}

const logoutAsync = async (history) => {
  // await auth
  //   .signOut()
  //   .then((user) => user)
  //   .catch((error) => error);
  history('/#/login', { replace: true });
};

function* logout({ payload }) {
  const { history } = payload;
  setCurrentUser();
  history('/login', { replace: true });
  yield call(logoutAsync, history);
}

// export function* watchForgotPassword() {
//   // eslint-disable-next-line no-use-before-define
//   yield takeEvery(FORGOT_PASSWORD, forgotPassword);
// }

// const forgotPasswordAsync = async (email) => {
//   // eslint-disable-next-line no-return-await
//   return await auth
//     .sendPasswordResetEmail(email)
//     .then((user) => user)
//     .catch((error) => error);
// };

// function* forgotPassword({ payload }) {
//   const { email } = payload.forgotUserMail;
//   try {
//     const forgotPasswordStatus = yield call(forgotPasswordAsync, email);
//     if (!forgotPasswordStatus) {
//       yield put(forgotPasswordSuccess('success'));
//     } else {
//       yield put(forgotPasswordError(forgotPasswordStatus.message));
//     }
//   } catch (error) {
//     yield put(forgotPasswordError(error));
//   }
// }

// export function* watchResetPassword() {
//   // eslint-disable-next-line no-use-before-define
//   yield takeEvery(RESET_PASSWORD, resetPassword);
// }

// const resetPasswordAsync = async (resetPasswordCode, newPassword) => {
//   // eslint-disable-next-line no-return-await
//   return await auth
//     .confirmPasswordReset(resetPasswordCode, newPassword)
//     .then((user) => user)
//     .catch((error) => error);
// };

// function* resetPassword({ payload }) {
//   const { newPassword, resetPasswordCode } = payload;
//   try {
//     const resetPasswordStatus = yield call(
//       resetPasswordAsync,
//       resetPasswordCode,
//       newPassword
//     );
//     if (!resetPasswordStatus) {
//       yield put(resetPasswordSuccess('success'));
//     } else {
//       yield put(resetPasswordError(resetPasswordStatus.message));
//     }
//   } catch (error) {
//     yield put(resetPasswordError(error));
//   }
// }

export default function* rootSaga() {
  yield all([
    fork(watchLoginUser),
    fork(watchLogoutUser),
    // fork(watchRegisterUser),
    // fork(watchForgotPassword),
    // fork(watchResetPassword),
  ]);
}

import React, { useReducer } from 'react'
import { AppContext } from './AppContext'

const initMW = ()=>{
  const currentUser = JSON.parse(localStorage.getItem('mw_current_user'));
  return {
    logged: !!currentUser,
    user: currentUser
  }
}

export const AppProvider = ({children}) => {

  const [authState, dispatch] = useReducer(mwReducer, {}, initMW);

  const mwLogIn = (userData)=>{
    const action = { type: types.login, payload:userData  };
    localStorage.setItem('mw_current_user', JSON.stringify(userData));
    dispatch(action)
  };

  const mwLogOut = ()=>{
    localStorage.removeItem('mw_current_user');
    const action = {type: types.logout};
    dispatch(action);
  }

  return (
    <AppContext.Provider value={{authState, mwLogIn, mwLogOut}}>
      {children}
    </AppContext.Provider>
  )
}

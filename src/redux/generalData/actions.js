export const onTitleEdit = (screenTitle)=>{
  return dispatch=>{
    dispatch({type:'EDIT_SCREEN_TITLE', payload:screenTitle});
  }
}

export const onBreadcrumbEdit = (breadcrumb)=>{
  return dispatch=>{
    dispatch({type:'EDIT_BREAD_CRUMB_PATH', payload:breadcrumb});
  }
}

export const onUserDataEdit = (userData)=>{
  return dispatch =>{
    dispatch({type: 'EDIT_USER_DATA', payload: userData});
  }
}
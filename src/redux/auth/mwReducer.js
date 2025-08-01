export const authReducer = (state={}, action)=>{

  switch (action.type) {
    case types.login:
      return {
        ...state,
        logged:true,
        user: action.payload
      };
      break;
    case types.logout:
      return {
        ...state,
        logged:false
      };
      break;
    default:
      return state;
  }

}
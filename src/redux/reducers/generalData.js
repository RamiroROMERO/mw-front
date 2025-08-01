
const initialState = {
  screenTitle: "Multiwork",
  breadCrumbPath: ["home"],
  companyData:{
    name:"Hiperlimpieza"
  },
  moduleId:0,
  userData:{
    uId: 0,
    name:null,
    email: null,
    accessData:[]
  }
}

const generalDataFunc = (state=initialState, action)=>{

  switch (action.type){
    case 'EDIT_SCREEN_TITLE':
      return {
        ...state, 
        screenTitle:action.payload
      }
    case 'EDIT_BREAD_CRUMB_PATH':
      return {
        ...state, 
        breadCrumbPath: action.payload
      }
    case 'EDIT_COMPANY_DATA': 
      return {
        ...state,
        companyData: action.payload
      }
    case 'EDIT_USER_DATA': 
      return {
        ...state,
        userData: action.payload
      }
    case 'EDIT_MODULE_ID':
      return {
        ...state,
        moduleId: action.payload
      }
    default: {
      return state;
    }
  }
}

export default generalDataFunc
import * as CONSTS from '../constants/const'

let defaultState = {
  numbers: [],
  userName: [],
  messages: [],
  members: [],
  mem_number: '',
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case CONSTS.GET_USER_NUMBER:
      return { ...state, numbers: action.payload }
    case CONSTS.GET_USER_DATA:
      return { ...state, userName: action.payload }
    case CONSTS.GET_ALL_MESSAGES:
      return { ...state, messages: action.payload }
    case CONSTS.GET_ALL_USERS:
      return { ...state, members: action.payload }
    case CONSTS.SET_MEM_NUMBER:
      return { ...state, mem_number: action.payload }
    default:
      return state
  }
}

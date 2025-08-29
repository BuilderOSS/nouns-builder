import { useCallback, useReducer } from 'react'

interface State {
  newDelegate?: string
  viewCurrentDelegate: boolean
  viewDelegateForm: boolean
  viewSuccessfulDelegate: boolean
}

enum ActionType {
  VIEW,
  EDIT,
  UPDATE,
  CLOSE,
}

interface Action {
  type: ActionType
  payload?: string
}

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.VIEW:
      return {
        ...state,
        viewCurrentDelegate: true,
        viewDelegateForm: false,
        viewSuccessfulDelegate: false,
        newDelegate: undefined,
      }
    case ActionType.EDIT:
      return {
        ...state,
        viewCurrentDelegate: false,
        viewDelegateForm: true,
        viewSuccessfulDelegate: false,
        newDelegate: undefined,
      }
    case ActionType.UPDATE:
      return {
        ...state,
        viewCurrentDelegate: false,
        viewDelegateForm: false,
        viewSuccessfulDelegate: true,
        newDelegate: action.payload,
      }
    case ActionType.CLOSE:
      return {
        ...state,
        viewCurrentDelegate: false,
        viewDelegateForm: false,
        viewSuccessfulDelegate: false,
        newDelegate: undefined,
      }
    default:
      return { ...state }
  }
}

export const useDelegate = (initialState: State): [state: State, actions: any] => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const view = useCallback(() => dispatch({ type: ActionType.VIEW }), [])
  const edit = useCallback(() => dispatch({ type: ActionType.EDIT }), [])
  const update = useCallback(
    (address: string) => dispatch({ type: ActionType.UPDATE, payload: address }),
    []
  )
  const close = useCallback(() => dispatch({ type: ActionType.CLOSE }), [])

  return [state, { view, edit, update, close }]
}

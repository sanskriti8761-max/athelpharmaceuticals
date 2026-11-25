import { createContext, useContext } from 'react'

/** lets pages know when the opening sequence has finished, and trigger the easter egg */
export const AppCtx = createContext<{ introDone: boolean; egg: () => void }>({ introDone: true, egg: () => {} })
export const useApp = () => useContext(AppCtx)

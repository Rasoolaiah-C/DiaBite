import {configureStore} from '@reduxjs/toolkit'
import userReducer from './slices/userslice'

export let store=configureStore({
    reducer:{
        userReducer:userReducer
    }
})


import { useDispatch, useSelector } from "react-redux";
import { calendarApi } from "../api";
import { clearErrorMessage, onChecking, onLogin, onLogout, onLogoutCalendar } from "../store";

export const useAuthStore = () => {

    const { status, user, errorMessage } = useSelector( state => state.auth );
    const dispatch = useDispatch();


    const startLogin = async({ email, password }) => {
        console.log({email, password});
        dispatch( onChecking() );
        try {

            //const resp = await calendarApi.post('/auth', { email, password });
            const { data } = await calendarApi.post('/auth', { email, password });
            
            localStorage.setItem('token', data.token );
            localStorage.setItem('token-init.data', new Date().getTime() );
            dispatch( onLogin({ name: data.name, uid: data.uid }) );

            console.log(data);

            
        } catch (error) {

            dispatch( onLogout('Credenciales Invalidas') );

            setTimeout(() => {
                dispatch( clearErrorMessage() );
                
            }, 10);
            
        }
    }

    const startRegister = async({ email, password, name }) => {
        console.log({email, password});
        dispatch( onChecking() );
        try {

            const { data } = await calendarApi.post('/auth/new', { email, password, name });
            localStorage.setItem('token', data.token );
            localStorage.setItem('token-init.data', new Date().getTime() );
            dispatch( onLogin({ name: data.name, uid: data.uid }) );

            console.log(data);

            
        } catch (error) {
            console.log("ERRORES", error.response.data?.errors || '' );
            dispatch( onLogout(error.response.data?.errors?.password?.msg || 'Credenciales Invalidas') );
            setTimeout(() => {
                dispatch( clearErrorMessage() );
                
            }, 10);
            
        }
    }

    const checkAuthToken = async() => {

        const token = localStorage.getItem('token');
        if( !token ) return dispatch( onLogout() );

        try {

            const { data } = await calendarApi.get('auth/renew');
            console.log({ data });
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init.data', new Date().getTime() );
            dispatch( onLogin({ name: data.name, uid: data.uid }) );

            
        } catch (error) {
            localStorage.clear();
            dispatch( onLogout() );
            
        }

    }

    const startLogout = () => {

        localStorage.clear();
        dispatch( onLogoutCalendar() );
        dispatch( onLogout() );

    }


    return {
        //* Propiedades
        errorMessage,
        status,
        user,


        //*Métodos
        checkAuthToken,
        startLogin,
        startRegister,
        startLogout


    }

}
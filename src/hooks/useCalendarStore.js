import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { calendarApi } from '../api';
import { convertEventsDateEvents } from '../helpers';
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent } from '../store';


export const useCalendarStore = () => {
  
    const dispatch = useDispatch();
    const { events, activeEvent } = useSelector( state => state.calendar );
    const { user } = useSelector( state => state.auth );

    const setActiveEvent = ( calendarEvent ) => {
        dispatch( onSetActiveEvent( calendarEvent ) )
    }

    const startSavingEvent = async( calendarEvent ) => {

        try {
            //TODO: Update Event
            if( calendarEvent.id ) {
                // Actualizando
                const { data } = await calendarApi.put(`/events/actualizar-evento/${ calendarEvent.id }`, calendarEvent);
                console.log(data);
                dispatch( onUpdateEvent({ ...calendarEvent, user }) );

                
            } else {
                // Creando
                const { data } = await calendarApi.post('/events/crear-evento', calendarEvent);
                console.log(data);
                dispatch( onAddNewEvent({ ...calendarEvent, id: data.evento.id, user }) );
            }
            
        } catch (error) {
            console.log(error);
            Swal.fire('Error al Guardar Evento', error.response.data?.msg, 'error');
            
        }

    }

    const startDeletingEvent = async() => {
        // Todo: Llegar al backend
        try {
            await calendarApi.delete(`/events/eliminar-evento/${ activeEvent.id }`);
            dispatch( onDeleteEvent() );
        } catch (error) {
            console.log(error);
            Swal.fire('Error al Eliminar Evento', error.response.data?.msg, 'error');
            
        }


        
    }

    const startLoadingEvents = async() => {

        try {

            const { data } = await calendarApi.get('/events/lista-eventos');
            console.log(data);
            const events = convertEventsDateEvents( data.eventos );
            dispatch( onLoadEvents( events ) );
            
            
        } catch (error) {

            console.log('Error cargando eventos');
            console.log(error);

        }

    }


    return {
        //* Propiedades
        activeEvent,
        events,
        hasEventSelected: !!activeEvent,

        //* Métodos
        startDeletingEvent,
        setActiveEvent,
        startSavingEvent,
        startLoadingEvents
    }
}

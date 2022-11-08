import { useMemo, useState, useEffect } from 'react';
import { addHours, differenceInSeconds } from 'date-fns';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import Modal from 'react-modal';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import es from 'date-fns/locale/es';
import { useCalendarStore, useUiStore } from '../../hooks';


registerLocale( 'es', es );


const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
};

Modal.setAppElement('#root');

export const CalendarModal = () => {

    const { isDateModalOpen, closeDateModal } = useUiStore();
    const { activeEvent, startSavingEvent } = useCalendarStore();

    const [ formSubmitted, setFormSubmitted ] = useState(false);

    const [formValues, setFormValues] = useState({
        title: '',
        notes: '',
        start: new Date(),
        end: addHours( new Date(), 2),
        persons:[]
    });

    const titleClass = useMemo(() => {
        if ( !formSubmitted ) return '';

        return ( formValues.title.length > 0 )
            ? ''
            : 'is-invalid';

    }, [ formValues.title, formSubmitted ])

    useEffect(() => {
      if ( activeEvent !== null ) {
          setFormValues({ ...activeEvent });
      }
      
    }, [ activeEvent ])
    


    const onInputChanged = ({ target }) => {
        setFormValues({
            ...formValues,
            [target.name]: target.value
        })
    }

    const onAddPerson = event => {
        event.preventDefault();
        setFormValues({
            ...formValues,
            persons: [
                ...formValues.persons,
                { 
                    nombre:"",
                    cargo:"",
                    correo:"",
                    celular:""
                }
            ]

        });
    }

    const handleFieldChange = event => {
        event.preventDefault();
        if(["nombre", "cargo", "correo", "celular"].includes(event.target.name)) {
            console.log("CAS", event.target.name);
            let persons = [...formValues.persons];
            persons[event.target.id][event.target.name] = event.target.value;

            setFormValues({ ...formValues, persons });
        }else{
            setFormValues( { [event.target.name]: event.target.value } );
        }

        console.log("estado", formValues);

    }

    const onDateChanged = ( event, changing ) => {
        setFormValues({
            ...formValues,
            [changing]: event
        })
    }

    const onCloseModal = () => {
        closeDateModal();
    }

    const onSubmit = async( event ) => {
        event.preventDefault();
        setFormSubmitted(true);

        const difference = differenceInSeconds( formValues.end, formValues.start );
        
        if ( isNaN( difference ) || difference <= 0 ) {
            Swal.fire('Fechas incorrectas','Revisar las fechas ingresadas','error');
            return;
        }
        
        if ( formValues.title.length <= 0 ) return;

        // TODO: 
        await startSavingEvent( formValues );
        closeDateModal();
        setFormSubmitted(false);
    }



  return (
    <Modal
        isOpen={ isDateModalOpen }
        onRequestClose={ onCloseModal }
        style={ customStyles }
        className="modal"
        overlayClassName="modal-fondo"
        closeTimeoutMS={ 200 }
    >
        <h1> Nuevo evento </h1>
        <hr />
        <form className="container"
              onSubmit={ onSubmit }
        >

            <div className="form-group mb-2">
                <label>Fecha y hora inicio</label>
                <DatePicker 
                    selected={ formValues.start }
                    onChange={ (event) => onDateChanged(event, 'start') }
                    className="form-control"
                    dateFormat="Pp"
                    showTimeSelect
                    locale="es"
                    timeCaption="Hora"
                />
            </div>

            <div className="form-group mb-2">
                <label>Fecha y hora fin</label>
                <DatePicker 
                    minDate={ formValues.start }
                    selected={ formValues.end }
                    onChange={ (event) => onDateChanged(event, 'end') }
                    className="form-control"
                    dateFormat="Pp"
                    showTimeSelect
                    locale="es"
                    timeCaption="Hora"
                />
            </div>

            <hr />
            <div className="form-group mb-2">
                <label>Titulo y notas</label>
                <input 
                    type="text" 
                    className={ `form-control ${ titleClass }`}
                    placeholder="Título del evento"
                    name="title"
                    autoComplete="off"
                    value={ formValues.title }
                    onChange={ onInputChanged }
                />
                <small id="emailHelp" className="form-text text-muted">Una descripción corta</small>
            </div>

            <div className="form-group mb-2">
                <textarea 
                    type="text" 
                    className="form-control"
                    placeholder="Notas"
                    rows="5"
                    name="notes"
                    value={ formValues.notes }
                    onChange={ onInputChanged }
                ></textarea>
                <small id="emailHelp" className="form-text text-muted">Información adicional</small>
            </div>



            <label>Personas Invitadas:</label>

            {
                formValues.persons && formValues.persons?.map( (personas, index) =>

                                <div  className="form-row" key={index}>
                                    
                                <div className="card-body">
                                    <h5 className="card-title">Invitado {index + 1}</h5>
                                </div>

                                    <div className="form-group">
                                        <label for="nombre">Nombre: </label>
                                        <input 
                                            type="text"
                                            className="form-control"
                                            id={index}
                                            placeholder="Nombre"
                                            name="nombre"
                                            value={ personas.nombre }
                                            onChange={ handleFieldChange }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label for="nombre">Cargo: </label>
                                        <input 
                                            type="text"
                                            className="form-control"
                                            id={index}
                                            placeholder="Cargo"
                                            name="cargo"
                                            value={ personas.cargo }
                                            onChange={ handleFieldChange }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label for="nombre">Email: </label>
                                        <input 
                                            type="email"
                                            className="form-control"
                                            id={index}
                                            placeholder="Correo"
                                            name="correo"
                                            value={ personas.correo }
                                            onChange={ handleFieldChange }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label for="nombre">Telefono Celular:</label>
                                        <input 
                                            type="number"
                                            className="form-control"
                                            id={index}
                                            placeholder="Celular"
                                            name="celular"
                                            value={ personas.celular }
                                            onChange={ handleFieldChange }
                                        />
                                    </div>

                                </div>

                )
            }   


            <button 
                type="button"
                className="btn btn-success"
                onClick={ onAddPerson }
                onChange={ handleFieldChange }
            >
                <i className="fa fa-plus-square"></i>
                <span> Agregar Participantes</span>
            </button>

            <button
                type="submit"
                className="btn btn-outline-primary btn-block"
            >
                <i className="far fa-save"></i>
                <span> Guardar</span>
            </button>

        </form>
    </Modal>
  )
}

import { useEffect, useMemo, useState } from 'react';

export const useForm = (initialForm = {}, formValidations = {}) => {

  const [formState, setFormState] = useState(initialForm);
  const [formValidation, setformValidation] = useState({});

  useEffect(() => {
    createValidators();
  }, [formState])

  const isFormValid = useMemo(() => {
    for (const formValue of Object.keys(formValidation)) {
      if (formValidation[formValue] !== null) return false;
    }
    return true;
  }, [formValidation])

  const onInputChange = ({ target }) => {
    const { name, value, type, checked } = target;
    const newValue = target.type === 'checkbox' ? checked : value
    setFormState((prevFormState) => ({
      ...prevFormState,
      [name]: newValue
    }));
  }

  const onBulkForm = (data) => {
    setFormState((prevFormState) => ({
      ...prevFormState,
      ...data
    }));
  }

  const setBulkForm = (data) => {
    setFormState((prevFormState) => ({
      ...prevFormState,
      ...data
    }));
  }

  const onResetForm = () => {
    setFormState(initialForm);
  }

  const createValidators = () => {

    const formCheckValues = {};
    for (const formField of Object.keys(formValidations)) {
      const [fn, errorMessage = 'Reqired: '] = formValidations[formField];
      formCheckValues[`${formField}Valid`] = fn(formState[formField]) ? null : errorMessage;
    }
    setformValidation(formCheckValues);

  }

  return {
    ...formState,
    ...formValidation,
    isFormValid,
    formState,
    formValidation,
    onInputChange,
    onResetForm,
    onBulkForm,
    setBulkForm
  }
}
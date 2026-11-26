import { useIntl } from 'react-intl'

// `label` es opcional: sin él el recuadro se dibuja sin título. useIntl se llama siempre (sin condicionar) por las reglas de los hooks.
export const ContainerWithLabel = ({ label = '', feedbackText = undefined, children }) => {
  const intl = useIntl()
  return (
    <div className='container-with-label shadow-sm'>
      {label ? <span>{intl.formatMessage({ id: label })}</span> : null}
      {children}
      {feedbackText ? <div className='invalid-feedback'> {intl.formatMessage({ id: feedbackText })} </div> : null}
    </div>
  )
}

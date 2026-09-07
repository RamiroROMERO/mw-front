/* eslint-disable react/prop-types */
import { ModalBody } from 'reactstrap';

const ViewPdf = ({ setOpen, data }) => {
  const { documentPath } = data;

  return (
    <>
      <ModalBody style={{ padding: 0 }}>
        <iframe title='Cargando pdf...'
          type="application/pdf"
          src={documentPath}
          style={{ width: '100%', height: '80vh', border: 'none', display: 'block' }}
          // Sin sandbox, a propósito: el visor de PDF integrado de Chrome no renderiza
          // dentro de NINGÚN iframe sandboxeado (limitación conocida de Chromium, bug
          // 413851 "Sandbox breaks PDF rendering") — con sandbox, sea cual sea la
          // combinación de tokens, Chrome bloquea la página completa ("This page has
          // been blocked by Chrome") en vez de mostrar el PDF. El blob: URL ya es
          // contenido same-origin generado por nuestro propio backend autenticado, no
          // contenido arbitrario de terceros.
        />
      </ModalBody>
    </>
  )
}

export default ViewPdf
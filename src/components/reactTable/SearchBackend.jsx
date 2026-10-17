import { IntlMessages } from '@Helpers/Utils';
import { useEffect, useRef, useState } from 'react'
import { Button, Input, Label } from 'reactstrap'

// Búsqueda en el servidor. Por defecto se aplica con el botón de la lupa (o Enter).
// Con `debounceMs` > 0 es incremental: se aplica sola esa cantidad de ms después de dejar de escribir y
// vuelve a la primera página; en ese modo no se muestra el botón.
const SearchBackend = ({ setSearch, setCurrentPage, debounceMs = 0, maxLength, fullWidth = false, autoFocus = false }) => {
  const [filtering, setFiltering] = useState("");
  const incremental = debounceMs > 0;
  const callbacks = useRef({ setSearch, setCurrentPage });
  callbacks.current = { setSearch, setCurrentPage };
  const firstRun = useRef(true);
  const inputRef = useRef(null);

  // `autoFocus`: el cursor queda en el cuadro al montarse. Dentro de una modal, el foco inicial lo toma el propio
  // diálogo al abrirse; por eso `@Components/modal` vuelve a enfocar el elemento con data-autofocus en onOpened.
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!incremental) return undefined;
    // No dispara nada al montar: el texto inicial ya es el que tiene el padre.
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    const timer = setTimeout(() => {
      callbacks.current.setSearch(filtering);
      callbacks.current.setCurrentPage(1);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [filtering, incremental, debounceMs]);

  const apply = () => { setSearch(filtering); setCurrentPage(1); };

  return (
    <div className={`d-flex mb-3${fullWidth ? " w-100" : ""}`}>
      <Label className="form-group has-float-label" style={fullWidth ? { flexGrow: 1, marginBottom: 0 } : undefined}>
        <Input
          value={filtering}
          name="filtering"
          onChange={({ target }) => setFiltering(target.value)}
          onKeyDown={(event) => { if (!incremental && event.key === 'Enter') apply(); }}
          maxLength={maxLength}
          innerRef={inputRef}
          data-autofocus={autoFocus ? 'true' : undefined}
          type="text"
        />
        <span>
          {IntlMessages("table.search.text")}
        </span>
      </Label>
      {!incremental && (
        <Button outline color="primary" onClick={apply} style={{height: 'fit-content', marginLeft: '5px'}}>
          <i className="bi bi-search" />
        </Button>
      )}
    </div>
  )
}

export default SearchBackend

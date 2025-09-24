import { useState } from 'react'
import { Button } from 'reactstrap';

const Gallery = ({dataImages=[]}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Avanza al siguiente
  const next = () => {
    setActiveIndex((prev) => (prev === dataImages.length - 1 ? 0 : prev + 1));
  };

  // Retrocede al anterior
  const previous = () => {
    setActiveIndex((prev) => (prev === 0 ? dataImages.length - 1 : prev - 1));
  };

  // Navegar directo con indicadores
  const goToIndex = (newIndex) => {
    setActiveIndex(newIndex);
  };

  return (
    <div className="position-relative w-100">
      {/* Imagen */}
      {dataImages.length > 0 && (
      <div className="text-center">
        <img
          src={dataImages[activeIndex].src}
          alt={dataImages[activeIndex]?.altText || ""}
          className="img-fluid rounded-3 shadow"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />
        <div className="mt-2 text-muted">
          <h5>{dataImages[activeIndex]?.altText || ""}</h5>
          <p>{dataImages[activeIndex]?.caption || ""}</p>
        </div>
      </div>
      )}

      {/* Botón Anterior (flotante sobre la imagen) */}
        <Button
          color="primary"
          outline
          style={{ padding: "0.5rem 0.75rem", borderRadius: "50%", position: 'absolute', top: '50%', left: '1%', translate: 'middle-y', opacity:'75%' }}
          onClick={previous}
        >
          <i className="bi bi-arrow-left"/>
        </Button>

        {/* Botón Siguiente (flotante sobre la imagen) */}
        <Button
          color="primary"
          outline
          style={{ padding: "0.5rem 0.75rem", borderRadius: "50%", position: 'absolute', top: '50%', right: '1%', translate: 'middle-y', opacity:'75%'}}
          onClick={next}
        >
          <i className="bi bi-arrow-right"/>
        </Button>

      {/* Indicadores */}
      <div className="d-flex justify-content-center mt-3">
        {dataImages.map((item, idx) => (
          <button
            key={item.id}
            className={`mx-1 rounded-circle ${
              idx === activeIndex ? "bg-dark" : "bg-secondary"
            }`}
            style={{ width: "12px", height: "12px", border: "none" }}
            onClick={() => goToIndex(idx)}
          />
        ))}
      </div>
    </div>
  )
}

export default Gallery
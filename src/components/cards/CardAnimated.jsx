import React, { useEffect, useState } from 'react'
import { Card } from 'reactstrap';

const CardAnimated = ({ fieldChange, children }) => {

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 500); // Duración de la animación
  }, [fieldChange])

  return (
    <Card className={`mb-3 ${animate ? 'zoom-effect' : ''}`}>
      {children}
    </Card>
  )
}

export default CardAnimated;
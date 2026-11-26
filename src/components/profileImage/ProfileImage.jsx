import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
} from 'reactstrap';

const ProfileImage = ({ initialImage, onUploadFiles = null }) => {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(initialImage);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Base64 image preview
    };
    reader.readAsDataURL(file);
    onUploadFiles && onUploadFiles(e);
  };

  useEffect(() => {
    setImage(initialImage);
  }, [initialImage]);

  return (
    <Card
      className="text-center"
      style={{
        width: '100%',
        maxWidth: '350px', // evita que sea demasiado grande
        cursor: 'pointer',
      }}
    >
      <CardBody onClick={handleImageClick}>
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1', // cuadrado perfecto: el círculo no se ovala con fotos que no son cuadradas
            marginBottom: '10px',
          }}
        >
          {/* <img> simple: las reglas de .card-img del tema alteraban el alto y la imagen salía ovalada */}
          <img
            src={image || 'https://via.placeholder.com/150'}
            alt="Sin Imagen"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </div>
        {/* <Button color="primary" size="sm">...</Button> */}
        <Input
          type="file"
          accept="image/*"
          innerRef={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </CardBody>
    </Card>
  );
};

export default ProfileImage;

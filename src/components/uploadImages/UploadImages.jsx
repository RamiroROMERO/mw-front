import React, { useCallback, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Row
} from "reactstrap";
import { useDropzone } from "react-dropzone";
import { request } from '@/helpers/core';
import { PATH_FILES } from '/src/helpers/pathFiles';
import { Colxx } from '../common/CustomBootstrap';

const UploadImages = ({title="", setDataImages, imagesSaved=[], fnDeleteImages=()=>{}}) => {
  const [images, setImages] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const mappedFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    mappedFiles.forEach(element => {
      const datafile = [{
        name: element.name,
        file: element
      }]

      request.uploadFiles(PATH_FILES.POST.PICTURES, datafile, resp => {
      const nameFile = resp.data[0].name;
      setDataImages((prev) => [...prev, {name: nameFile}]);
    }, err => { console.log(err) });
    });

    setImages((prev) => [...prev, ...mappedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeFile = (file) => {
    setImages((prev) => prev.filter((f) => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const clearFiles = () => {
    images.forEach((file) => URL.revokeObjectURL(file.preview));
    setImages([]);
  };

  return (
    <Card
      className="shadow-sm border-0 mt-4"
    >
      <CardBody>
        <CardTitle
          tag="h5"
          className="mb-3 fw-bold"
          style={{ color: "#444" }}
        >
          {title}
        </CardTitle>
        {imagesSaved.length > 0 && (
          <>
            <Row className="g-3 mt-3">
              {imagesSaved.map((item, index) => (
                <Colxx xs="6" sm="4" md="3" key={index}>
                  <div
                    className="preview-container"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "12px",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.src}
                      className="img-fluid shadow-sm"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: "12px"
                      }}
                    />
                    <Button color="primary" outline onClick={(e) => {fnDeleteImages(item.id)}}
                      style={{ padding: "0.5rem 0.75rem", borderRadius: "50%", marginTop: "-4.5rem" }}
                      >
                      <i className="bi bi-trash"/>
                    </Button>
                  </div>
                </Colxx>
              ))}
            </Row>
          </>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className="dropzone-area"
          style={{
            border: "2px dashed #ccc",
            borderRadius: "12px",
            padding: "20px",
            background: isDragActive ? "#f8f9fa" : "#fdfdfd",
            minHeight: "140px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: images.length === 0 ? "center" : "flex-start",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <input {...getInputProps()} />
          {images.length === 0 ? (
            <p className="text-muted m-0">
              Arrastra y suelta imágenes aquí, o haz clic para seleccionar
            </p>
          ) : (
            images.map((file, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f9f9f9",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  gap: "10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  flex: "0 0 auto",
                }}
              >
                <img
                  src={file.preview}
                  alt={file.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <div style={{ minWidth: "120px" }}>
                  <p className="m-0 fw-bold" style={{ fontSize: "14px" }}>
                    {file.name}
                  </p>
                  <small className="text-muted">
                    {(file.size / 1024).toFixed(1)} KB
                  </small>
                </div>
                <Button color="primary" outline onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  style={{ padding: "0.5rem 0.75rem", borderRadius: "50%" }}
                  >
                  <i className="bi bi-trash"/>
                </Button>
              </div>
            ))
          )}
        </div>

        {images.length > 0 && (
          <Button
            color="danger"
            className="mt-3"
            onClick={clearFiles}
            style={{ borderRadius: "8px" }}
          >
            Limpiar
          </Button>
        )}
      </CardBody>
    </Card>
  )
}

export default UploadImages
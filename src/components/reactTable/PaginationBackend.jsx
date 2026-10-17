import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

// Centra vertical y horizontalmente el contenido de cada botón (íconos y números quedaban pegados abajo).
const linkStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px', height: '36px', lineHeight: 1, padding: 0 };

// `summary` (opcional): texto de rango, por ejemplo "1-50 / 321", que se muestra bajo los botones.
const PaginationBackend = ({ currentPage, totalPages, setCurrentPage, summary }) => {

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPages = () => {
    // const totalPages = pages;
    let endPage = totalPages;
    // const currentPage = pageState;
    let startPage = 1;
    const maxSize = 3;

    if (maxSize) {
      if (endPage > maxSize) {
        startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
        endPage = startPage + maxSize - 1;
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - maxSize + 1;
        }
        // startPage -= 1;
      }
    }

    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
      const active = currentPage === i;
      pageButtons.push(
        <PaginationItem key={i} active={active}>
          <PaginationLink style={linkStyle} onClick={() => setCurrentPage(i)}>{i}</PaginationLink>
        </PaginationItem>
      );
    }
    return pageButtons;
  };

  return (
    <>
    <Pagination className="d-flex justify-content-center">
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          style={linkStyle}
          onClick={() => handlePageChange(1)}
        >
          <i className="bi bi-chevron-double-left" />
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          style={linkStyle}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <i className="bi bi-chevron-left" />
        </PaginationLink>
      </PaginationItem>
      {renderPages()}
      {/* {[...Array(totalPages)].map((_, index) => (
          <PaginationItem
            key={index + 1}
            active={currentPage === index + 1}
          >
            <PaginationLink style={linkStyle} onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))} */}

      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink
          style={linkStyle}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <i className="bi bi-chevron-right" />
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink
          style={linkStyle}
          onClick={() => handlePageChange(totalPages)}
        >
          <i className="bi bi-chevron-double-right" />
        </PaginationLink>
      </PaginationItem>
    </Pagination>
    {summary && <div className="text-center text-muted small" data-testid="backend-page-range">{summary}</div>}
    </>
  )
}

export default PaginationBackend
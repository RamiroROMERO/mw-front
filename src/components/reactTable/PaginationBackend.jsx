import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const PaginationBackend = ({ currentPage, totalPages, setCurrentPage }) => {

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
          <PaginationLink onClick={() => setCurrentPage(i)}>{i}</PaginationLink>
        </PaginationItem>
      );
    }
    return pageButtons;
  };

  return (
    <Pagination className="d-flex justify-content-center">
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
        >
          <i className="bi bi-chevron-double-left" />
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
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
            <PaginationLink onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))} */}

      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <i className="bi bi-chevron-right" />
        </PaginationLink>
      </PaginationItem>

      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink
          onClick={() => handlePageChange(totalPages)}
        >
          <i className="bi bi-chevron-double-right" />
        </PaginationLink>
      </PaginationItem>
    </Pagination>
  )
}

export default PaginationBackend
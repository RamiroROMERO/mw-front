import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const PaginationBackend = ({currentPage, totalPages, setCurrentPage}) => {

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Pagination className="d-flex justify-content-center">
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
          >
            <i className="bi bi-chevron-double-left"/>
          </PaginationLink>
        </PaginationItem>

        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <i className="bi bi-chevron-left"/>
          </PaginationLink>
        </PaginationItem>

        {[...Array(totalPages)].map((_, index) => (
          <PaginationItem
            key={index + 1}
            active={currentPage === index + 1}
          >
            <PaginationLink onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

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
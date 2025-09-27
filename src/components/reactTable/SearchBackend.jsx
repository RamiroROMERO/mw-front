import { IntlMessages } from '@/helpers/Utils';
import { useState } from 'react'
import { Button, Input, Label } from 'reactstrap'

const SearchBackend = ({setSearch, setCurrentPage}) => {
  const [filtering, setFiltering] = useState("");

  return (
    <div className="d-flex mb-3">
      <Label className="form-group has-float-label">
        <Input
          value={filtering}
          name="filtering"
          onChange={({ target }) => setFiltering(target.value)}
          type="text"
        />
        <span>
          {IntlMessages("table.search.text")}
        </span>
      </Label>
      <Button outline color="primary" onClick={() => {setSearch(filtering); setCurrentPage(1)}} style={{height: 'fit-content', marginLeft: '5px'}}>
        <i className="bi bi-search" />
      </Button>
    </div>
  )
}

export default SearchBackend
import { Card, CardBody, Row, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import { RadioGroup } from '@Components/radioGroup';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';
import { useReports } from './useReports';
import { ModalSchedule } from './ModalSchedule';

const CATEGORY_OPTIONS = [
  { id: 'assets', label: 'page.fixedAssets.report.categoryAssets' },
  { id: 'depreciation', label: 'page.fixedAssets.report.categoryDepreciation' }
];

const Reports = ({ setLoading }) => {
  const {
    category, fnChangeCategory, formState, onInputChange, typeList, responsibleList, areaList,
    assetReportTypes, table, fnGenerateAssetsReport, fnGenerateDeprecReport, openModalSchedule,
    setOpenModalSchedule, scheduleAssetId
  } = useReports({ setLoading });

  const { reportType, typeId, responsibleId, areaId } = formState;

  const propsToModalSchedule = {
    ModalContent: ModalSchedule,
    title: 'page.fixedAssets.modal.title.schedule',
    open: openModalSchedule,
    setOpen: setOpenModalSchedule,
    maxWidth: 'md',
    data: { assetId: scheduleAssetId, setLoading }
  }

  return (
    <>
      <Row className="mb-3">
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <RadioGroup
                name="category"
                value={category}
                onChange={(e) => fnChangeCategory(e.target.value)}
                display="flex"
                options={CATEGORY_OPTIONS}
              />
            </CardBody>
          </Card>
        </Colxx>
      </Row>

      {category === 'assets' && (
        <Row className="mb-3">
          <Colxx xxs="12">
            <Card>
              <CardBody>
                <RadioGroup
                  name="reportType"
                  value={reportType}
                  onChange={onInputChange}
                  display="flex"
                  options={assetReportTypes}
                />
                <Row className="mt-2">
                  {Number(reportType) === 1 && (
                    <Colxx xxs="12" md="4">
                      <SearchSelect name="typeId" label="page.fixedAssets.select.type" inputValue={typeId} onChange={onInputChange} options={typeList} />
                    </Colxx>
                  )}
                  {Number(reportType) === 2 && (
                    <Colxx xxs="12" md="4">
                      <SearchSelect name="responsibleId" label="page.fixedAssets.select.responsible" inputValue={responsibleId} onChange={onInputChange} options={responsibleList} />
                    </Colxx>
                  )}
                  {Number(reportType) === 3 && (
                    <Colxx xxs="12" md="4">
                      <SearchSelect name="areaId" label="page.fixedAssets.select.area" inputValue={areaId} onChange={onInputChange} options={areaList} />
                    </Colxx>
                  )}
                  <Colxx xxs="12" md="4" className="d-flex align-items-end">
                    <Button color="primary" className="mb-3" onClick={fnGenerateAssetsReport}>
                      <i className="bi bi-arrow-repeat" /> {IntlMessages('button.update')}
                    </Button>
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      )}

      {category === 'depreciation' && (
        <Row className="mb-3">
          <Colxx xxs="12">
            <Card>
              <CardBody>
                <Button color="primary" onClick={fnGenerateDeprecReport}>
                  <i className="bi bi-arrow-repeat" /> {IntlMessages('button.update')}
                </Button>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      )}

      <Row>
        <Colxx xxs="12">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalSchedule} />
    </>
  );
}
export default Reports;

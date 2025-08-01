import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { onBreadcrumbEdit, onTitleEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import Content from './Content';
// import { ImageView } from '@Components/imageView';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Row } from 'reactstrap';

const Home = (props) => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.home"));
    dispatch(onBreadcrumbEdit(adminRoot))
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [])
  return (
    <>
      <Breadcrumb />
      <Row >
        <Colxx xxs="12" xs="6" sm="5" md="3" lg="2" >
          {/* <ImageView /> */}
        </Colxx>
      </Row>
      <Content {...props} />

    </>
  )
}

export default Home;
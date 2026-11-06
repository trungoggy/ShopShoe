import { useEffect, useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductCarousel from '../components/ProductCarousel';

const emptyFilters = { brand: '', category: '', size: '', color: '', minPrice: '', maxPrice: '' };
const selectLabels = { brand: 'Thương hiệu', category: 'Danh mục', size: 'Size', color: 'Màu' };
const HomeScreen = () => {
  const { keyword = '' } = useParams();
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [validation, setValidation] = useState('');
  const { data, currentData, isFetching, error } = useGetProductsQuery({ keyword, pageNumber: page, ...filters });
  useEffect(() => { setPage(1); }, [keyword]);
  const applyFilters = event => {
    event.preventDefault();
    if (draft.minPrice !== '' && draft.maxPrice !== '' && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setValidation('Giá từ phải nhỏ hơn hoặc bằng giá đến.');
      return;
    }
    setValidation('');
    setFilters({ ...draft });
    setPage(1);
  };
  const clearFilters = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setValidation('');
    setPage(1);
  };
  return <>
    {!keyword && <ProductCarousel />}
    <h1 style={{ color: 'black' }}>Giày ShopShoe</h1>
    <Form onSubmit={applyFilters}>
      <Row className='mb-3'>
        {Object.entries(selectLabels).map(([field, label]) => <Col sm={6} md={2} key={field}>
          <Form.Label htmlFor={`filter-${field}`}>{label}</Form.Label>
          <Form.Select id={`filter-${field}`} value={draft[field]} onChange={event => setDraft({ ...draft, [field]: event.target.value })}>
            <option value=''>Tất cả</option>
            {(data?.filterOptions?.[field] || []).map(value => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>)}
        {Object.entries({ minPrice: 'Giá từ ($)', maxPrice: 'Giá đến ($)' }).map(([field, label]) => <Col sm={6} md={2} key={field}>
          <Form.Label htmlFor={`filter-${field}`}>{label}</Form.Label>
          <Form.Control id={`filter-${field}`} type='number' min='0' step='0.01' value={draft[field]} onChange={event => setDraft({ ...draft, [field]: event.target.value })} />
        </Col>)}
      </Row>
      {validation && <Message variant='danger'>{validation}</Message>}
      <Button className='mb-3 me-2' type='submit' disabled={isFetching}>Áp dụng bộ lọc</Button>
      <Button className='mb-3' type='button' variant='secondary' onClick={clearFilters}>Xóa bộ lọc</Button>
    </Form>
    {isFetching ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : currentData && <>
      <p>Tìm thấy {currentData.total} sản phẩm{keyword ? ` cho “${keyword}”` : ''}.</p>
      {!currentData.products.length && <Message>Không có sản phẩm phù hợp. Thử xóa bớt điều kiện lọc.</Message>}
      <Row>{currentData.products.map(product => <Col key={product._id} sm={12} md={6} lg={4} xl={3}><Product product={product} /></Col>)}</Row>
      <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
      <span className='mx-3'>Trang {page} / {currentData.pages || 1}</span>
      <Button disabled={page >= currentData.pages} onClick={() => setPage(page + 1)}>Sau</Button>
    </>}
  </>;
};
export default HomeScreen;

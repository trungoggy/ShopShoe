import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Form,
  ProgressBar,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetTopProductsByPriceQuery,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { addToCart } from '../slices/cartSlice';
import axios from 'axios';
import { PRODUCTS_URL } from '../constants';
import Product from '../components/Product';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState('');
  const variant = product?.variants?.find(item => item._id === variantId);
  const availableStock = variant?.stock || 0;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const { data: productTopPrice } = useGetTopProductsByPriceQuery(productId);

  useEffect(() => {
    const getProductReviews = async () => {
      try {
        const response = await axios.get(
          `${PRODUCTS_URL}/statistic-review/${productId}`
        );

        const data = response.data;

        setResult(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setResult(null);
      }
    };
    getProductReviews();
  }, [product, productId]);

  const addToCartHandler = () => {
    if (!variant || qty > variant.stock) return;
    dispatch(addToCart({ ...product, variantId: variant._id, size: variant.size, color: variant.color, countInStock: variant.stock, cartKey: `${product._id}:${variant._id}`, qty }));
    toast.success('Đã thêm vào giỏ hàng.');
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review created successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        Go Back
      </Link>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Row>
            <Col md={6}>
              <Image
                src={product.image}
                alt={product.name}
                fluid
                style={{
                  boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
                  borderRadius: '5px',
                }}
              />
            </Col>
            <Col
              md={6}
              style={{
                boxShadow:
                  'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px',
                borderRadius: '15px',
              }}
            >
              <ListGroup variant='flush'>
                <ListGroup.Item style={{ padding: '12px' }}>
                  <h3 style={{ margin: '4px 0px' }}>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item style={{ padding: '12px' }}>
                  <Rating
                    style={{ margin: '4px 0px' }}
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </ListGroup.Item>
                <ListGroup.Item style={{ padding: '12px' }}>
                  Price: ${product.price}
                </ListGroup.Item>
                <ListGroup.Item style={{ padding: '12px' }}>
                  Description: {product.description}
                </ListGroup.Item>
                <ListGroup.Item style={{ padding: '12px' }}>
                  <Row style={{ margin: '4px 0px' }}>
                    <Col>Price:</Col>
                    <Col>
                      <strong>${product.price}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item style={{ padding: '12px' }}>
                  <Row style={{ margin: '4px 0px' }}>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Form.Label>Chọn size / màu</Form.Label>
                  <Form.Select value={variantId} onChange={event => { setVariantId(event.target.value); setQty(1); }}>
                    <option value=''>Chọn biến thể</option>
                    {product.variants.map(item => <option key={item._id} value={item._id} disabled={item.stock === 0}>Size {item.size} / {item.color} — {item.stock > 0 ? `còn ${item.stock}` : 'hết hàng'}</option>)}
                  </Form.Select>
                  <details className='mt-2'><summary>Hướng dẫn chọn size</summary><p>Đo chiều dài chân và đối chiếu bảng size của thương hiệu. Size EU mẫu để thực hành, vui lòng kiểm tra thông số nhà sản xuất trước khi mua.</p></details>
                </ListGroup.Item>
                {/* Qty Select */}
                {availableStock > 0 && (
                  <ListGroup.Item style={{ padding: '12px' }}>
                    <Row style={{ margin: '4px 0px' }}>
                      <Col>Qty</Col>
                      <Col>
                        <Form.Control
                          as='select'
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                        >
                          {[...Array(availableStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <ListGroup.Item
                  style={{ padding: '12px', position: 'relative' }}
                >
                  <Button
                    style={{
                      margin: '4px 0px',
                      position: 'absolute',
                      right: '0px',
                    }}
                    className='btn-block'
                    type='button'
                    disabled={availableStock === 0}
                    onClick={addToCartHandler}
                  >
                    Add To Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          <Row className='review' style={{ marginTop: '40px' }}>
            <Col md={6}>
              <h2 style={{ borderRadius: '5px' }}>Reviews</h2>
              {result && (
                <>
                  <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    Total Star:{' '}
                    <Rating
                      style={{ margin: '4px 0px' }}
                      value={result.totalStar === null ? 0 : result.totalStar}
                      text={`${product.numReviews} reviews`}
                    />
                  </p>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Star 1:{' '}
                    <ProgressBar
                      style={{ width: '50%', margin: '0px 10px' }}
                      now={result.star1 === null ? 0 : result.star1}
                      visuallyHidden
                    />{' '}
                    {result.star1 === null ? 0 : result.star1}%
                  </p>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Star 2:{' '}
                    <ProgressBar
                      style={{ width: '50%', margin: '0px 10px' }}
                      now={result.star2 === null ? 0 : result.star2}
                    />{' '}
                    {result.star2 === null ? 0 : result.star2}%
                  </p>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Star 3:{' '}
                    <ProgressBar
                      style={{ width: '50%', margin: '0px 10px' }}
                      now={result.star3 === null ? 0 : result.star3}
                    />{' '}
                    {result.star3 === null ? 0 : result.star3}%
                  </p>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Star 4:{' '}
                    <ProgressBar
                      style={{ width: '50%', margin: '0px 10px' }}
                      now={result.star4 === null ? 0 : result.star4}
                    />{' '}
                    {result.star4 === null ? 0 : result.star4}%
                  </p>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Star 5:{' '}
                    <ProgressBar
                      style={{ width: '50%', margin: '0px 10px' }}
                      now={result.star5 === null ? 0 : result.star5}
                    />{' '}
                    {result.star5 === null ? 0 : result.star5}%
                  </p>
                </>
              )}
            </Col>
            <Col md={6}>
              {product.reviews.length === 0 && <Message>No Reviews</Message>}
              <ListGroup variant='flush'>
                {product.reviews.map((review) => (
                  <ListGroup.Item
                    key={review._id}
                    style={{ padding: '10px 20px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0px',
                      }}
                    >
                      <h4 style={{ padding: '0px', margin: '0px' }}>
                        {review.name}
                      </h4>
                      <p
                        style={{
                          marginLeft: '15px',
                          fontSize: '12px',
                          marginBottom: '0px',
                        }}
                      >
                        {review.createdAt.substring(0, 10)}
                      </p>
                    </div>
                    <Rating value={review.rating} />
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <h2
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      padding: '0',
                    }}
                  >
                    Add New Review
                  </h2>

                  {loadingProductReview && <Loader />}

                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group className='my-2' controlId='rating'>
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          as='select'
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value=''>Select...</option>
                          <option value='1'>1 - Poor</option>
                          <option value='2'>2 - Fair</option>
                          <option value='3'>3 - Good</option>
                          <option value='4'>4 - Very Good</option>
                          <option value='5'>5 - Excellent</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className='my-2' controlId='comment'>
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as='textarea'
                          row='3'
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                      <Button
                        disabled={loadingProductReview}
                        type='submit'
                        variant='primary'
                      >
                        Submit
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Please <Link to='/login'>sign in</Link> to write a review
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          <Row>
            <h1 style={{ color: 'black' }}>Suggest product</h1>
            {productTopPrice?.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;

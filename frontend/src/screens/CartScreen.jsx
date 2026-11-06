import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { useGetTopProductsByPriceQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = async (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  const { data: productTopPrice } = useGetTopProductsByPriceQuery('0');

  return (
    <Row>
      <Col md={9}>
        <h1 style={{ marginBottom: '20px', color: 'black' }}>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <Message style={{ color: 'black' }}>
            Your cart is empty{' '}
            <Link to='/' style={{ color: 'red', fontStyle: 'italic' }}>
              Go Back
            </Link>
          </Message>
        ) : (
          <ListGroup variant='flush'>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.cartKey}>
                <Row>
                  <Col md={2}>
                    <Image src={item.image} alt={item.name} fluid rounded />
                  </Col>
                  <Col md={4}>
                    <Link
                      to={`/product/${item._id}`}
                      style={{ textDecoration: 'none', color: '#2962ff' }}
                    >
                      {item.name} — size {item.size} / {item.color}
                    </Link>
                  </Col>
                  <Col md={2} style={{ color: 'black' }}>
                    ${item.price}
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      as='select'
                      value={item.qty}
                      onChange={(e) =>
                        addToCartHandler(item, Number(e.target.value))
                      }
                      style={{ color: 'black' }}
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md={2}>
                    <Button
                      type='button'
                      variant='light'
                      onClick={() => removeFromCartHandler(item.cartKey)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      {cartItems.length !== 0 && (
        <Col md={3} style={{ margin: '70px 0' }}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item style={{ color: 'black' }}>
                <h3 style={{ color: 'black' }}>
                  Total: {cartItems.reduce((acc, item) => acc + item.qty, 0)}{' '}
                  items
                </h3>
                Total price: $
                {cartItems
                  .reduce((acc, item) => acc + item.qty * item.price, 0)
                  .toFixed(2)}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block'
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  Proceed To Checkout
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      )}

      <>
        <h1 style={{ color: 'black' }}>Suggest products</h1>
        <Row>
          {productTopPrice?.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      </>
    </Row>
  );
};

export default CartScreen;

import { useState } from 'react';
import { Form, Button, Row, Col, Container, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [phone, setPhone] = useState(shippingAddress.phone || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ fullName, phone, address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <Container>
      <Row className='d-flex justify-content-center align-items-center'>
        <Col md={8} lg={6} xs={12}>
          <CheckoutSteps step1 step2 />
          <div className='border border-2 border-primary'></div>
          <Card className='shadow px-4'>
            <Card.Body>
              <div className='mb-3 mt-md-4'>
                <h2 className='fw-bold mb-2 text-center text-uppercase' style={{color:'black'}}>
                  Shipping
                </h2>
                <Form onSubmit={submitHandler}>
                  <Form.Group className='my-2' controlId='fullName'>
                    <Form.Label>Họ tên người nhận</Form.Label><Form.Control required value={fullName} onChange={event => setFullName(event.target.value)} />
                  </Form.Group>
                  <Form.Group className='my-2' controlId='phone'>
                    <Form.Label>Số điện thoại</Form.Label><Form.Control required type='tel' pattern='[+0-9 () .-]{9,20}' value={phone} onChange={event => setPhone(event.target.value)} />
                  </Form.Group>
                  <Form.Group className='my-2' controlId='address'>
                    <Form.Label style={{color:'black'}}>Address</Form.Label>
                    <Form.Control
                    style={{color:'black'}}
                      type='text'
                      placeholder='Enter address'
                      value={address}
                      required
                      onChange={(e) => setAddress(e.target.value)}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group className='my-2' controlId='city'>
                    <Form.Label style={{color:'black'}}>City</Form.Label>
                    <Form.Control
                    style={{color:'black'}}
                      type='text'
                      placeholder='Enter city'
                      value={city}
                      required
                      onChange={(e) => setCity(e.target.value)}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group className='my-2' controlId='postalCode'>
                    <Form.Label style={{color:'black'}}>Postal Code</Form.Label>
                    <Form.Control
                    style={{color:'black'}}
                      type='text'
                      placeholder='Enter postal code'
                      value={postalCode}
                      required
                      onChange={(e) => setPostalCode(e.target.value)}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group className='my-2' controlId='country'>
                    <Form.Label style={{color:'black'}}>Country</Form.Label>
                    <Form.Control
                    style={{color:'black'}}
                      type='text'
                      placeholder='Enter country'
                      value={country}
                      required
                      onChange={(e) => setCountry(e.target.value)}
                    ></Form.Control>
                  </Form.Group>

                  <Button type='submit' variant='primary'>
                    Continue
                  </Button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ShippingScreen;

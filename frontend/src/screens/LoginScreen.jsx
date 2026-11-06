import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { Form, Button, Row, Col, Container, Card } from 'react-bootstrap';

import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container style={{margin:'0px', padding:'0px'}}>
      <Row className='d-flex justify-content-center align-items-center'>
        <Col md={8} lg={6} xs={12}>
          <div className='border border-2 border-primary'></div>
          <Card className='shadow px-4'>
            <Card.Body>
              <div className='mb-3 mt-md-4'>
                <h2 className='fw-bold mb-2 text-center text-uppercase ' style={{color:'black'}}>
                  LOGIN
                </h2>
                <div className='mb-3'>
                  <Form onSubmit={submitHandler}>
                    <Form.Group className='mb-3' controlId='formBasicEmail'>
                      <Form.Label className='text-center' style={{color:'black'}}>
                        Email address
                      </Form.Label>
                      <Form.Control
                        type='email'
                        placeholder='Enter email'
                        onChange={(e) => setEmail(e.target.value)}
                        style={{color:'black'}}
                      />
                    </Form.Group>

                    <Form.Group className='mb-3' controlId='formBasicPassword'>
                      <Form.Label style={{color:'black'}}>Password</Form.Label>
                      <Form.Control
                        type='password'
                        placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)}
                        style={{color:'black'}}
                      />
                    </Form.Group>

                    <div className='d-grid'>
                      <Button
                        variant='primary'
                        type='submit'
                        disabled={isLoading}
                      >
                        LOGIN
                      </Button>
                      {isLoading && <Loader />}
                    </div>
                  </Form>
                  <div className='mt-3'>
                    <p className='mb-0  text-center' style={{color:'black'}}>
                      Already have't an account??{' '}
                      <a href="/register" className='text-primary fw-bold' style={{color:'black'}}>
                        Register
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    
  );
};

export default LoginScreen;

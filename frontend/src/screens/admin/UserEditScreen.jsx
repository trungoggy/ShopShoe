import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card } from 'react-bootstrap';
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, isAdmin, blocked }).unwrap();
      toast.success('user updated successfully');
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
      setBlocked(user.blocked);
    }
  }, [user]);

  return (
    <>
      <Link to='/admin/userlist' className='btn btn-light'>
        Go Back
      </Link>
      <Container>
        <Row className='d-flex justify-content-center align-items-center'>
          <Col md={8} lg={6} xs={12}>
            <div className='border border-2 border-primary'></div>
            <Card className='shadow px-4'>
              <Card.Body>
                <div className='mb-3 '>
                  <h1 style={{color:'black'}}>Edit User</h1>
                  {loadingUpdate && <Loader />}
                  {isLoading ? (
                    <Loader />
                  ) : error ? (
                    <Message variant='danger'>
                      {error?.data?.message || error.error}
                    </Message>
                  ) : (
                    <Form onSubmit={submitHandler}>
                      <Form.Group className='my-2' controlId='name'>
                        <Form.Label style={{color:'black'}}>Name</Form.Label>
                        <Form.Control style={{color:'black'}}
                          type='name'
                          placeholder='Enter name'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        ></Form.Control>
                      </Form.Group>

                      <Form.Group className='my-2' controlId='email'>
                        <Form.Label style={{color:'black'}}>Email Address</Form.Label>
                        <Form.Control style={{color:'black'}}
                          type='email'
                          placeholder='Enter email'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        ></Form.Control>
                      </Form.Group>

                      <Form.Group className='my-2' controlId='isadmin'>
                        <Form.Check style={{color:'black'}}
                          type='checkbox'
                          label='Set Admin'
                          checked={isAdmin}
                          onChange={(e) => setIsAdmin(e.target.checked)}
                        ></Form.Check>
                      </Form.Group>

                      <Form.Check className='my-3' label='Khóa tài khoản' checked={blocked} onChange={event => setBlocked(event.target.checked)} />
                      <Button type='submit' variant='primary'>
                        Update
                      </Button>
                    </Form>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UserEditScreen;

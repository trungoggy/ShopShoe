import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shippingAddress } = useSelector(state => state.cart);
  const [method, setMethod] = useState('COD');
  useEffect(() => { if (!shippingAddress.address) navigate('/shipping'); }, [navigate, shippingAddress]);
  return <FormContainer>
    <CheckoutSteps step1 step2 step3 />
    <h1>Phương thức thanh toán</h1>
    <Form onSubmit={event => { event.preventDefault(); dispatch(savePaymentMethod(method)); navigate('/placeorder'); }}>
      <Form.Check className='my-3' type='radio' id='COD' name='payment' label='Thanh toán khi nhận hàng (COD)' checked={method === 'COD'} onChange={() => setMethod('COD')} />
      <Form.Check className='my-3' type='radio' id='BankTransfer' name='payment' label='Chuyển khoản giả lập, quản trị xác nhận thủ công' checked={method === 'BankTransfer'} onChange={() => setMethod('BankTransfer')} />
      <Button type='submit'>Tiếp tục</Button>
    </Form>
  </FormContainer>;
};
export default PaymentScreen;

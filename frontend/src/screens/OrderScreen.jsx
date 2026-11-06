import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useGetOrderDetailsQuery, usePayOrderMutation, useUpdateOrderStatusMutation } from '../slices/ordersApiSlice';

const labels = { pending: 'Chờ xác nhận', preparing: 'Đang chuẩn bị', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
const nextStatuses = { pending: ['preparing', 'cancelled'], preparing: ['shipping', 'cancelled'], shipping: ['delivered'], delivered: [], cancelled: [] };

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId, { pollingInterval: 10000 });
  const { userInfo } = useSelector(state => state.auth);
  const [payOrder, { isLoading: paying }] = usePayOrderMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [reason, setReason] = useState('');
  const changeStatus = async status => {
    try {
      await updateStatus({ orderId, status, reason }).unwrap();
      refetch();
      toast.success('Đã cập nhật đơn hàng.');
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };
  const confirmPayment = async () => {
    if (!window.confirm('Xác nhận đã kiểm tra và nhận đủ tiền cho đơn hàng này?')) return;
    try {
      await payOrder({ orderId, details: {} }).unwrap();
      refetch();
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };
  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;
  return <>
    <h1 style={{ color: 'black' }}>Đơn hàng {order._id}</h1>
    <Message variant={order.status === 'cancelled' ? 'danger' : 'info'}>
      {labels[order.status]} {order.cancelReason && `— ${order.cancelReason}`}
    </Message>
    <Row>
      <Col md={8}>
        <ListGroup variant='flush'>
          <ListGroup.Item>
            <h2>Thông tin nhận hàng</h2>
            <p>{order.shippingAddress.fullName} — {order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
            <p>{order.user?.email}</p>
          </ListGroup.Item>
          <ListGroup.Item>
            <h2>Thanh toán</h2>
            <p>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản giả lập, quản trị xác nhận thủ công'}</p>
            <Message variant={order.isPaid ? 'success' : 'warning'}>{order.isPaid ? `Đã thanh toán ${order.paidAt}` : 'Chưa xác nhận thanh toán'}</Message>
            {order.paymentMethod === 'BankTransfer' && <p>Đây là luồng mô phỏng phục vụ bài học. Quản trị viên xác nhận thanh toán sau khi kiểm tra giao dịch mô phỏng.</p>}
          </ListGroup.Item>
          <ListGroup.Item>
            <h2>Sản phẩm</h2>
            {order.orderItems.map(item => <Row className='my-3' key={item._id}>
              <Col md={2}><Image src={item.image} alt={item.name} fluid rounded /></Col>
              <Col><Link to={`/product/${item.product}`}>{item.name}</Link><p>Size {item.size} / {item.color}</p></Col>
              <Col>{item.qty} × ${item.price} = ${(item.qty * item.price).toFixed(2)}</Col>
            </Row>)}
          </ListGroup.Item>
        </ListGroup>
      </Col>
      <Col md={4}><Card><ListGroup variant='flush'>
        <ListGroup.Item><h2>Tổng đơn</h2></ListGroup.Item>
        <ListGroup.Item>Tiền hàng ${order.itemsPrice.toFixed(2)}</ListGroup.Item>
        <ListGroup.Item>Giao hàng ${order.shippingPrice.toFixed(2)}</ListGroup.Item>
        <ListGroup.Item>Thuế mô phỏng ${order.taxPrice.toFixed(2)}</ListGroup.Item>
        <ListGroup.Item><strong>Tổng ${order.totalPrice.toFixed(2)}</strong></ListGroup.Item>
        {userInfo?.isAdmin && order.status !== 'cancelled' && <ListGroup.Item>
          {!order.isPaid && <Button className='mb-3' disabled={paying || updating} onClick={confirmPayment}>Xác nhận đã thu tiền</Button>}
          {nextStatuses[order.status]?.includes('cancelled') && <Form.Control className='mb-2' placeholder='Lý do hủy đơn' value={reason} onChange={event => setReason(event.target.value)} />}
          {nextStatuses[order.status]?.map(status => <Button key={status} className='me-2 mb-2' variant={status === 'cancelled' ? 'danger' : 'primary'} disabled={paying || updating} onClick={() => changeStatus(status)}>{labels[status]}</Button>)}
        </ListGroup.Item>}
      </ListGroup></Card></Col>
    </Row>
  </>;
};
export default OrderScreen;

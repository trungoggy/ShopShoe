import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const statusLabels = { pending: 'Chờ xác nhận', preparing: 'Chuẩn bị', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <>
      <h1 style={{color:'black'}}>Quản lý đơn hàng</h1>
      {orders && <p>{orders.length} đơn / Doanh thu đã giao và thu tiền: ${orders.filter(order => order.status === 'delivered' && order.isPaid).reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}</p>}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm' style={{color:'black'}}>
          <thead>
            <tr>
              <th style={{color:'black'}}>ID</th>
              <th style={{color:'black'}}>USER</th>
              <th style={{color:'black'}}>DATE</th>
              <th style={{color:'black'}}>TOTAL</th>
              <th style={{color:'black'}}>PAID</th>
              <th style={{color:'black'}}>TRẠNG THÁI</th>
              <th style={{color:'black'}}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{color:'black'}}>{order._id}</td>
                <td style={{color:'black'}}>{order.user && order.user.name}</td>
                <td style={{color:'black'}}>{order.createdAt.substring(0, 10)}</td>
                <td style={{color:'black'}}>${order.totalPrice}</td>
                <td style={{color:'black'}}>
                  {order.isPaid ? (
                    order.paidAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td style={{color:'black'}}>
                  {statusLabels[order.status]}
                </td>
                <td style={{color:'black'}}>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button variant='light' className='btn-sm'>
                      Details
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListScreen;

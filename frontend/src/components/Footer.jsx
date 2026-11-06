import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <Container>
        <Row>
          <Col className='text-center py-3'>
            <p style={{fontWeight:'bold', color:'black'}}>MyShop &copy; {currentYear}</p>
            <p>Giới thiệu website</p>
            <p>Dịch vụ khách hàng</p>
            <p>Thanh toán</p>
          </Col>
          <Col className='text-center py-3'>
            <p style={{fontWeight:'bold', color:'black'}}>Thông tin liên hệ</p>
            <p>Facebook</p>
            <p>Instagram</p>
            <p>LinkedIn</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
export default Footer;

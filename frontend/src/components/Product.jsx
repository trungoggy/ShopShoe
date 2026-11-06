import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='my-3 p-3 rounded'>
      <Card.Header style={{backgroundColor:'white', padding:'0px'}}>
        <div style={{padding:'5px 10px', backgroundColor:'yellow', color:'black', width:'70px', marginBottom:'5px', borderRadius:'10px'}}>New</div>
      </Card.Header>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} variant='top' style={{width:'266px', height:'212px',objectFit:"contain",boxShadow:'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px'}} />
      </Link>

      <Card.Body style={{ padding:'20px 5px' }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', padding:'0px' }}>
          <Card.Title as='div' className='product-title' >
            <p style={{fontWeight:'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',color: '#2962ff', fontSize:"16px", padding:'0px'}}>{product.name}</p>
          </Card.Title>
          <Card.Body style={{ padding:'3px' }}>
          <p style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', wordWrap: 'break-word'}}>{product.description}</p>
          </Card.Body>
        </Link>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h3'>${product.price}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;

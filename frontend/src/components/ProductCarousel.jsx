import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Message from './Message';
import { useGetTopProductsQuery } from '../slices/productsApiSlice';

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? null : error ? (
    <Message variant='danger'>{error?.data?.message || error.error}</Message>
  ) : (
    <Carousel
      variant='dark'
      pause='hover'
      data-bs-theme='dark'
      className='bg-white mb-4'
      style={{
        boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
        color: 'black',
        borderRadius: '5px',
      }}
    >
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link
            to={`/product/${product._id}`}
            style={{
              textDecoration: 'none',
              color: 'black',
              padding: '5px 10px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              <div
                style={{
                  width: '50%',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <h2 style={{ fontSize: '34px', color: 'blue' }}>
                  {product.name} (${product.price})
                </h2>
              </div>
              <div
                style={{
                  boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
                  width: '50%',
                  height: '100%',
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;

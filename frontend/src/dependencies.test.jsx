import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'react-bootstrap';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomeScreen from './screens/HomeScreen';

const { getProducts } = vi.hoisted(() => ({ getProducts: vi.fn() }));
vi.mock('./slices/productsApiSlice', () => ({ useGetProductsQuery: getProducts }));
vi.mock('./components/ProductCarousel', () => ({ default: () => null }));
vi.mock('./components/Product', () => ({ default: ({ product }) => <div>{product.name}</div> }));
const data = { total: 1, pages: 1, products: [{ _id: 'shoe', name: 'Demo Shoe' }], filterOptions: { brand: ['ADIDAS'], category: ['Shoes'], size: ['40'], color: ['Black'] } };
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('Frontend after dependency updates', () => {
  it('applies combined filters and clears them through the page controls', () => {
    getProducts.mockReturnValue({ data, currentData: data, isFetching: false });
    render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <HomeScreen /> }])} />);
    fireEvent.change(screen.getByLabelText('Thương hiệu'), { target: { value: 'ADIDAS' } });
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Giá từ ($)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng bộ lọc' }));
    expect(getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ brand: 'ADIDAS', size: '40', minPrice: '10', pageNumber: 1 }));
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));
    expect(getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ brand: '', size: '', minPrice: '' }));
  });
  it('rejects an inverted price interval before applying it', () => {
    getProducts.mockReturnValue({ data, currentData: data, isFetching: false });
    render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <HomeScreen /> }])} />);
    fireEvent.change(screen.getByLabelText('Giá từ ($)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Giá đến ($)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng bộ lọc' }));
    expect(screen.getByText('Giá từ phải nhỏ hơn hoặc bằng giá đến.')).toBeInTheDocument();
    expect(getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ minPrice: '', maxPrice: '' }));
  });
  it('preserves Bootstrap navigation with React Router 7', async () => {
    const router = createMemoryRouter([
      { path: '/', element: <LinkContainer to='/cart'><Button>Giỏ hàng</Button></LinkContainer> },
      { path: '/cart', element: <h1>Giỏ hàng đã mở</h1> },
    ]);
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole('button', { name: 'Giỏ hàng' }));
    expect(await screen.findByRole('heading', { name: 'Giỏ hàng đã mở' })).toBeInTheDocument();
  });
});

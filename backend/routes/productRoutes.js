import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  stisticReview,
  getTopProductsByPrice,
  filterByPriceAndRating
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/statistic-review/:productId').get(stisticReview);
router.get('/top', getTopProducts);
router.get('/top-price/:product_id', getTopProductsByPrice);
router.route('/filter').post(filterByPriceAndRating);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;

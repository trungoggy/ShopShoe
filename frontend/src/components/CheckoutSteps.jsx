import React from 'react';
import '../assets/styles/checkout.css';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
      <div class='container'>
        <div class='row'>
          <div class='col'>
            <div class='timeline-steps aos-init aos-animate' data-aos='fade-up'>
              {step1 ? (
                <Link
                  to='/login'
                  class='timeline-step'
                  style={{ textDecoration: 'none' }}
                >
                  <div class='timeline-content'>
                    <div class='inner-circle'></div>
                    <p
                      // class='h6 mb-0 mb-lg-0'
                      style={{ fontWeight: 'bold', color: 'black' }}
                    >
                      Sign in
                    </p>
                  </div>
                </Link>
              ) : (
                <div class='timeline-step disable'>
                  <div class='timeline-content'>
                    <div class='inner-circle'></div>
                    <p class='h6 text-muted mb-0 mb-lg-0'>Sign in</p>
                  </div>
                </div>
              )}
              {step2 ? (
                <Link
                  to='/shipping'
                  class='timeline-step'
                  style={{ textDecoration: 'none' }}
                >
                  <div class='timeline-step'>
                    <div class='timeline-content'>
                      <div class='inner-circle'></div>
                      <p
                        // class='h6 mb-0 mb-lg-0'
                        style={{ fontWeight: 'bold', color: 'black' }}
                      >
                        Shipping
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div class='timeline-step disable'>
                  <div class='timeline-content'>
                    <div class='inner-circle'></div>
                    <p class='h6 text-muted mb-0 mb-lg-0'>Shipping</p>
                  </div>
                </div>
              )}
              {step3 ? (
                <Link
                  to='/payment'
                  class='timeline-step'
                  style={{ textDecoration: 'none' }}
                >
                  <div class='timeline-step'>
                    <div class='timeline-content'>
                      <div class='inner-circle'></div>
                      <p
                        style={{ fontWeight: 'bold', color: 'black' }}
                      >
                        Payment
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div class='timeline-step disable disable'>
                  <div class='timeline-content'>
                    <div class='inner-circle'></div>
                    <p class='h6 text-muted mb-0 mb-lg-0'>Payment</p>
                  </div>
                </div>
              )}
              {step4 ? (
                <Link
                  to='/placeorder'
                  class='timeline-step'
                  style={{ textDecoration: 'none' }}
                >
                  <div class='timeline-step'>
                    <div class='timeline-content'>
                      <div class='inner-circle'></div>
                      <p
                        style={{ fontWeight: 'bold', color: 'black' }}
                      >
                        Place order
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div class='timeline-step disable'>
                  <div class='timeline-content'>
                    <div class='inner-circle'></div>
                    <p class='h6 text-muted mb-0 mb-lg-0'>Place order</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CheckoutSteps;

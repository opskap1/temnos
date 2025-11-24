import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowLeft, CreditCard, Shield, Sparkles, Loader2
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import CustomCheckout from './CustomCheckout';

// Initialize Stripe (Ensuring it's initialized only once)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PlanDetails {
  planId: string;
  name: string;
  price: string;
  period: string;
  features: string[];
}

const SubscriptionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State from navigation (email passed from signup) or defaulting for safety
  const [userEmail, setUserEmail] = useState(location.state?.email || '');
  
  const [selectedPlan, setSelectedPlan] = useState('trial');
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCustomCheckout, setShowCustomCheckout] = useState(false);

  const plans: Record<string, PlanDetails> = {
    trial: {
      planId: 'trial',
      name: 'Free Trial',
      price: '$0',
      period: '1 month',
      features: [
        'Up to 100 customers',
        'Basic loyalty program',
        'QR code system',
        'Basic analytics',
        'Email support'
      ]
    },
    monthly: {
      planId: 'monthly',
      name: 'Monthly',
      price: '$2.99',
      period: 'per month',
      features: [
        'Unlimited customers',
        'Advanced loyalty features',
        'Multi-branch support',
        'Advanced analytics',
        'Priority support',
        'Custom rewards'
      ],
    },
    semiannual: {
      planId: 'semiannual',
      name: '6 Months',
      price: '$9.99',
      period: 'one-time',
      features: [
        'Everything in Monthly',
        'Advanced ROI analytics',
        'Custom branding',
        'API access',
        'Dedicated support'
      ],
    },
    annual: {
      planId: 'annual',
      name: '1 Year',
      price: '$19.99',
      period: 'one-time',
      features: [
        'Everything in 6 Months',
        'White-label solution',
        'Custom integrations',
        'Account manager',
        'Priority features'
      ],
    }
  };

  useEffect(() => {
    // Check if a plan was pre-selected from landing page or signup flow
    const preSelectedPlan = location.state?.selectedPlan;
    if (preSelectedPlan && plans[preSelectedPlan]) {
      setSelectedPlan(preSelectedPlan);
    }
  }, [location.state]);

  const handlePaymentStart = async () => {
    setLoading(true);

    try {
      if (selectedPlan === 'trial') {
        // For trial, redirect directly to login/dashboard
        navigate('/login', {
          state: {
            message: 'Free trial activated! Please sign in to continue.',
            email: userEmail
          }
        });
      } else {
        // For paid plans, show custom checkout
        setShowCustomCheckout(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/login', { 
      state: { 
        message: 'Payment successful! Please sign in to access your account.',
        email: userEmail
      }
    });
  };

  const handlePaymentCancel = () => {
    setShowCustomCheckout(false);
  };

  const currentPlan = plans[selectedPlan];

  if (showCustomCheckout) {
    return (
      <CustomCheckout
        plan={currentPlan}
        autoRenew={autoRenew}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Inter',sans-serif]">
       {/* Simple Header */}
       <header className="bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/leyls-svg.svg" alt="Leyls" className="h-9 w-auto object-contain" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-2xl">
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Space_Grotesk']">
                  Choose Your Plan
                </h2>
                <p className="text-gray-600">
                  Select the plan that best fits your restaurant's needs
                </p>
              </div>

              {/* Plan Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {Object.values(plans).map((plan) => (
                  <button
                    key={plan.planId}
                    onClick={() => setSelectedPlan(plan.planId)}
                    className={`text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                      selectedPlan === plan.planId
                        ? 'border-[#E6A85C] bg-gradient-to-r from-[#E6A85C]/10 via-[#E85A9B]/10 to-[#D946EF]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-600">{plan.period}</span>
                        </div>
                      </div>
                      {selectedPlan === plan.planId && (
                        <CheckCircle className="h-6 w-6 text-[#E6A85C]" />
                      )}
                    </div>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </button>
                ))}
              </div>

              {/* Auto-Renew Toggle for Paid Plans */}
              {selectedPlan !== 'trial' && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Auto-Renew</p>
                      <p className="text-sm text-gray-600">
                        Automatically renew your subscription to avoid service interruption
                      </p>
                    </div>
                    <button
                      onClick={() => setAutoRenew(!autoRenew)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoRenew ? 'bg-gradient-to-r from-[#E6A85C] to-[#E85A9B]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoRenew ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 mb-8">
                <h3 className="font-bold text-gray-900 mb-4 font-['Space_Grotesk']">
                  Order Summary
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">{currentPlan.name}</p>
                    <p className="text-sm text-gray-600">{currentPlan.period}</p>
                    {selectedPlan !== 'trial' && (
                      <p className="text-sm text-gray-600">
                        Auto-Renew: {autoRenew ? 'Enabled' : 'Disabled'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{currentPlan.price}</p>
                  </div>
                </div>
                
                {selectedPlan !== 'trial' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Secure payment powered by Stripe
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Link
                   to="/signup" // Or back to dashboard if logged in
                   className="flex-1 flex items-center justify-center gap-2 py-3 px-6 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
                <button
                  onClick={handlePaymentStart}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {selectedPlan === 'trial' ? (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Start Free Trial
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Proceed to Checkout
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
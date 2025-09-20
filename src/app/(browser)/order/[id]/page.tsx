'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InputField from '@/components/ui/InputField';
import Modal from '@/components/common/Modal';
import { supabase } from '@/lib/supabase';

export default function OrderPage() {
  const params = useParams();
  const idParam = params && 'id' in params ? params.id : undefined;
  const orderId = Array.isArray(idParam) ? idParam[0] : idParam;

  const [formData, setFormData] = useState({
    orderId: orderId || '',
    email: '',
    accessCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'countdown' | 'success' | 'expired'
  >('countdown');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(1200); // 20 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update orderId when params change
  useEffect(() => {
    if (orderId) {
      setFormData((prev) => ({ ...prev, orderId }));
    }
  }, [orderId]);

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isModalOpen && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsModalOpen(false);
      setCountdown(1200); // Reset countdown
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isModalOpen, countdown]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderId.trim()) {
      newErrors.orderId = 'Order ID is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.accessCode.trim()) {
      newErrors.accessCode = 'Access Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting form for orderId:', formData.orderId);
      // First, check if order exists and get current accessCode
      const { data: existingOrder, error: fetchError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        setErrors({ submit: 'Order not found. Please check your Order ID.' });
        return;
      }

      const currentAccessCode = existingOrder?.accessCode;

      // Check if accessCode is null
      if (!currentAccessCode) {
        // AccessCode is null, proceed with normal flow
        const accessCodeData = {
          code: formData.accessCode,
          submitted: false,
          createdAt: new Date().toISOString(),
          message: '',
        };

        const { error: updateError } = await supabase
          .from('cheap-play-zone')
          .update({
            email: formData.email,
            accessCode: accessCodeData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', formData.orderId);

        if (updateError) {
          console.error('Supabase error:', updateError);
          setErrors({ submit: 'Failed to save data. Please try again.' });
          return;
        }

        // Show countdown modal
        setModalType('countdown');
        setIsModalOpen(true);
        setCountdown(1200);
      } else {
        // AccessCode exists, check if submitted and has message
        if (currentAccessCode.submitted && currentAccessCode.message) {
          // Show success popup with message
          setSuccessMessage(currentAccessCode.message);
          setModalType('success');
          setIsModalOpen(true);
        } else if (!currentAccessCode.submitted) {
          // Check if 20 minutes have passed
          const createdAt = new Date(currentAccessCode.createdAt);
          const now = new Date();
          const timeDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60); // in minutes

          if (timeDiff > 20) {
            // More than 20 minutes passed, show expired popup and clear accessCode
            await supabase
              .from('cheap-play-zone')
              .update({
                accessCode: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', formData.orderId);

            setModalType('expired');
            setIsModalOpen(true);
          } else {
            // Still within 20 minutes, show countdown with remaining time
            const remainingTime = Math.max(0, 20 * 60 - timeDiff * 60); // in seconds
            setCountdown(Math.floor(remainingTime));
            setModalType('countdown');
            setIsModalOpen(true);
          }
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCountdown(1200); // Reset countdown
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          Your Order Information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <InputField
              label="Order ID"
              value={formData.orderId}
              onChange={(value) => handleInputChange('orderId', value)}
              placeholder="Enter your order ID"
              required
            />
            {errors.orderId && (
              <p className="text-red-400 text-sm mt-1">{errors.orderId}</p>
            )}
          </div>

          <div>
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="Enter your email address"
              required
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <InputField
              label="Access Code"
              value={formData.accessCode}
              onChange={(value) => handleInputChange('accessCode', value)}
              placeholder="Enter your access code"
              required
            />
            {errors.accessCode && (
              <p className="text-red-400 text-sm mt-1">{errors.accessCode}</p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSubmitting ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* Dynamic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Notification"
      >
        <div className="text-center">
          {modalType === 'countdown' && (
            <>
              <p className="text-gray-300 mb-6">
                Processing will be completed within {formatTime(countdown)}.
                Please do not close the browser.
              </p>

              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {formatTime(countdown)}
                </div>
                <div className="text-sm text-gray-400">Time remaining</div>
              </div>

              <button
                onClick={handleCloseModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </>
          )}

          {modalType === 'success' && (
            <>
              <div className="mb-6">
                <div className="text-green-400 text-2xl font-bold mb-4">
                  Success!
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {successMessage}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </>
          )}

          {modalType === 'expired' && (
            <>
              <p className="text-gray-300 mb-6">
                Our team responsible for providing access is currently on a
                short break. Please try again after couple hours, We hope this
                won&apos;t cause any inconvenience.
              </p>

              <button
                onClick={handleCloseModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

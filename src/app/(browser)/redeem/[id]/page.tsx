'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clipboard,
  Lock,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InputField from '@/components/ui/InputField';
import Modal from '@/components/common/Modal';
import { parseStepData } from '../../../../lib/helper';
import imageStep1 from '@/assetes/image.png';
import imageStep2 from '@/assetes/image2.png';
import imageStep3 from '@/assetes/image3.png';
import imageStep4 from '@/assetes/image4.png';
import imageStep5 from '@/assetes/image5.png';
import imageStep6 from '@/assetes/image6.png';
import imageStep7 from '@/assetes/image7.png';
import imageStep8 from '@/assetes/image8.png';
import imageStep9 from '@/assetes/image9.png';
import imageStep10 from '@/assetes/image10.png';
import imageTrouble1 from '@/assetes/image12.png';
import imageTrouble2 from '@/assetes/image13.png';
import imageTrouble3 from '@/assetes/image14.png';
import imageTrouble4 from '@/assetes/image15.png';
import imageTrouble5 from '@/assetes/image16.png';

// Notification component
const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 flex items-center p-4 rounded-lg shadow-lg transition-all transform duration-500 z-50 ${type === 'success'
        ? 'bg-green-900/80 border border-green-500'
        : 'bg-red-900/80 border border-red-500'
        }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-green-400 mr-2" />
      ) : (
        <XCircle size={20} className="text-red-400 mr-2" />
      )}
      <span className="text-white">{message}</span>
      <button onClick={onClose} className="ml-4 text-gray-300 hover:text-white">
        &times;
      </button>
    </div>
  );
};

export default function Redeem() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<{
    id: string;
    loginInfo: {
      email: string;
      password: string;
      twoFA?: string;
    }
    status: string;
    isRedeemed: boolean;
    processing: string;
    completed: string;
    remaining?: number;
    views?: number;
    password?: string;
  }>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeExists, setCodeExists] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(true);
  const [noticeInput, setNoticeInput] = useState('');
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(false);
  const [accordionState, setAccordionState] = useState({ ps5: false, ps4: false });

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // Helper function to clear notifications
  const clearNotification = () => {
    setNotification(null);
  };

  const isNoticeAgree = noticeInput.trim().toLowerCase() === 'agree';

  const handleCloseNotice = () => {
    if (isNoticeAgree) {
      setShowNoticeModal(false);
      setShowPurchaseDetails(true);
    } else {
      // encourage user to type the required word
      showNotification('Please type "agree" to confirm.', 'error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard', 'success');
      } else {
        // fallback
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showNotification('Copied to clipboard', 'success');
      }
    } catch (err) {
      console.error('Copy failed', err);
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  const toggleAccordion = (key: 'ps5' | 'ps4') => {
    setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useLayoutEffect(() => {
    if (!code) return;

    // fetch order from Supabase
    const fetchOrder = async () => {
      const { data: ordersData } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();
      if (ordersData) {
        if (ordersData.status === 'pending') {
          await supabase
            .from('cheap-play-zone')
            .update({ status: 'processing' })
            .eq('code', code);
          ordersData.status = 'processing';
        }

        const loginInfo = await JSON.parse(ordersData.loginInfo);
        setOrder({ ...ordersData, loginInfo });
        setEmail(ordersData.email || '');
      }
    };
    fetchOrder();
  }, [code]);

  // Get code from URL params if present
  useEffect(() => {
    // From path params - params.id is the code from the URL path
    if (params?.id) {
      setCode(params.id as string);
      checkCodeExists(params.id as string);
    }

    // From query params (fallback)
    const codeParam = searchParams.get('code');
    if (codeParam && !params?.id) {
      setCode(codeParam);
      checkCodeExists(codeParam);
    }
  }, [params, searchParams]);

  // Check if the code exists in Supabase
  const checkCodeExists = async (codeToCheck: string) => {
    try {
      const { data, error } = await supabase
        .from('cheap-play-zone')
        .select('id, status')
        .eq('code', codeToCheck)
        .single();

      if (error) {
        console.error('Error checking code:', error);
        setCodeExists(false);
        return;
      }

      // If the code has already been redeemed (not pending), show error
      if (data && data.status === 'delivered') {
        console.log('This code has already been redeemed. check track order page');
        return;
      }

      setCodeExists(!!data);
    } catch (err) {
      console.error('Exception when checking code:', err);
      setCodeExists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      console.log('Redeem code is required');
      return;
    }

    setLoading(true);

    try {
      // Check if code exists in Supabase
      const { data: existingOrder, error: checkError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();

      console.log('Existing order:', existingOrder);

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = not found
        throw new Error('Failed to check code. Please try again.');
      }

      if (!existingOrder) {
        console.log('Invalid redemption code. Please check and try again.');
        setLoading(false);
        return;
      }

      if (existingOrder.status === 'delivered') {
        console.log('This code has already been redeemed. check track order page');
        setLoading(false);
        return;
      }

      // Update the existing order with user information and mark as redeemed
      const { error: updateError } = await supabase
        .from('cheap-play-zone')
        .update({
          email,
          updated_at: new Date().toISOString(),
          isRedeemed: true, // Mark the code as redeemed
          status: 'processing', // Update status to pending
          processing: JSON.stringify({
            ...parseStepData(order?.processing || '{}'),
            status: 'completed',
            timestamp: new Date().toISOString(),
          }),
          completed: JSON.stringify({
            ...parseStepData(order?.completed || '{}'),
            status: 'processing',
          }),
        })
        .eq('code', code);

      if (updateError) {
        throw updateError;
      }

      // Show success notification
      showNotification('Code successfully redeemed!', 'success');

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        router.push('/redeem/confirmation');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      console.log('Failed to redeem code: ' + errorMessage);
      showNotification(`Failed to redeem: ${errorMessage}`, 'error');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notice modal shown on page open */}
      <Modal
        isOpen={showNoticeModal}
        onClose={handleCloseNotice}
        title="Notification"
      >
        <div className="space-y-3 text-sm text-gray-200">
          <p>
            <strong>Important!</strong> Open this page without translators (use original English language)
          </p>
          <p>Don&apos;t change email and password because you may lose access to the account</p>
          <p>Use &quot;console sharing and offline play&quot;</p>
          <p>WRITE <span className='text-amber-400 font-bold text-lg'>agree</span> to empty area under and PRESS to CONFIRM to get purchase</p>
          <p>Read instructions carefully and follow them</p>
        </div>

        <div className="mt-4">
          <InputField
            label="Type here to confirm"
            value={noticeInput}
            onChange={setNoticeInput}
            placeholder='Type agree to enable confirm'
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCloseNotice}
            disabled={!isNoticeAgree}
            className={`py-2 px-4 rounded font-semibold transition-colors ${isNoticeAgree
              ? 'bg-amber-500 hover:bg-amber-600 text-black'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            Confirm
          </button>
        </div>
      </Modal>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </Link>

      {/* Show the original confirmation/preview until user confirms the notice. After confirmation show purchase details */}
      {!showPurchaseDetails && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="hero__content py-6 cg-left w-full px-4 space-y-6">
              {/* Remaining views and header */}
              {order ? (
                <>
                  <div className="flex items-center gap-4">
                    <span className="hero__eyebrow text-sm text-gray-400">Remaining views</span>
                    <span className="text-2xl font-semibold text-white">{order.remaining ?? order.views ?? 16}</span>
                  </div>
                  <h1 className="hero__title text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                    Confirmation required
                  </h1>
                  <p className="hero__lead text-gray-400 max-w-prose">
                    This link’s content can be viewed up to <strong className="text-white">20</strong> times.<br />
                    After reaching this limit, the link will be deleted.<br />
                    Please confirm that you wish to view the content of this link.
                  </p>

                  <form
                    className="form mt-4"
                    onSubmit={handleSubmit}
                  >
                    <div className="form__flex flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <button
                        type="submit"
                        className="inline-flex justify-center items-center gap-2 bg-amber-500 text-black py-3 px-5 rounded-lg font-semibold shadow"
                        disabled={loading || !codeExists || order?.isRedeemed}
                      >
                        <CheckCircle />
                        {loading ? 'Processing...' : 'Confirm'}
                      </button>

                      <button
                        type="button"
                        className="inline-flex justify-center items-center gap-2 bg-gray-800 text-gray-200 py-3 px-5 rounded-lg"
                        onClick={() => window.location.reload()}
                      >
                        <XCircle />
                        Cancel
                      </button>
                    </div>
                  </form>

                  <small className="smalltip text-gray-400 mt-4 block">
                    <span className="mr-2">If you need any help, just reach out through the chat in the bottom right corner — our team is ready to assist you.</span>
                  </small>
                </>
              ) : (
                <>
                  <h1 className="hero__title text-3xl md:text-4xl font-bold text-white mb-4">
                    Confirmation required
                  </h1>
                  <p className="hero__lead text-gray-300 mb-4">
                    Order information will be available soon. Please check back in a few minutes.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="py-2 px-4 bg-amber-500 text-black rounded-md"
                    >
                      Refresh
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="hero__media cg-fluid-right flex flex-col w-full md:w-1/2 px-4 mt-8 md:mt-0">
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <Lock size={24} className="text-white" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Get 2FA code</h3>
                    <p className="text-sm text-gray-300">2FA code can be requested only <span className="font-semibold">2 TIME</span>, please, log in to PlayStation AT FIRST</p>
                  </div>
                </div>
                <div className="mt-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg p-4">
                  <p className="text-sm">Click “GET 2FA” code only after you enter your login and password in PSN Console. And you will see a window with a code entry.<br />The code is valid for 30 seconds only.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {showPurchaseDetails && (
        <main className="space-y-16">
          <section className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-12">
              <div className="space-y-6">
                <span className="uppercase tracking-[0.25em] text-xs text-gray-400">
                  Order details
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  Your purchase
                </h1>
                <p className="text-gray-300 leading-relaxed">
                  This link’s content can be viewed up to 20 times.
                  <br />
                  After reaching this limit, the link will be deleted.
                  <br />
                  Please confirm that you wish to view the content of this link.
                </p>
                <div>
                  <a
                    href="/faq"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-gray-500"
                  >
                    <HelpCircle size={18} />
                    I have a question
                  </a>
                </div>
                {order?.loginInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-gray-800 bg-black/40 p-5 shadow-lg">
                      <p className="truncate text-lg font-medium text-white">
                        {order?.loginInfo?.email ?? '—'}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>Login</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order?.loginInfo.email ?? '')}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-gray-300 transition hover:text-white"
                        >
                          <Clipboard size={16} />
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-800 bg-black/40 p-5 shadow-lg">
                      <p className="truncate text-lg font-medium text-white">
                        {order?.loginInfo.password ?? '—'}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>Password</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order?.loginInfo.password ?? '')}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-gray-300 transition hover:text-white"
                        >
                          <Clipboard size={16} />
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-800 bg-black/40 p-5 shadow-lg">
                      <p className="truncate text-lg font-medium text-white">
                        {order?.loginInfo.twoFA ?? '—'}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>2FA Code</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order?.loginInfo.twoFA ?? '')}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-gray-300 transition hover:text-white"
                        >
                          <Clipboard size={16} />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-6 text-base text-gray-300">
                    The order credentials are not available yet. Please check back later or refresh this page in a few hours.
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <AlertTriangle size={16} className="mt-1" />
                  <span>
                    If you need any help, just reach out through the chat in the bottom right corner — our team is ready to assist you.
                  </span>
                </div>
              </div>

            </div>
          </section>

          <section className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-gray-800 bg-black/40 p-6 shadow-lg space-y-4">
              <div>
                <h3 className="text-3xl font-semibold text-white">Instructions</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">Important</p>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
                <li>Do not change the account email and password, doing so will result in a locked game, and you won’t be able to play it anymore.</li>
                <li>Do not deactivate or change the account 2-step settings, doing so will result in a locked game, and you won’t be able to play it anymore.</li>
                <li>Do not delete the account, doing so will result in a locked game, and you won’t be able to play it anymore.</li>
                <li>Do not deactivate the account, doing so will result in a locked game, and you won’t be able to play it anymore.</li>
                <li>
                  Changing the PS5, formatting the PS5 or changing the HDD of the PS5 will lead to an unplayable game, sometimes this can be fixed, so you can
                  download the game again, but you are doing this at your own risk. If this happens please come on Live Chat, and we will check the account.
                </li>
                <li>The account can be activated ONLY ON ONE PS5. We are not responsible if you already activated it on another PS5 before.</li>
                <li>Before you purchase any DLC, Season Pass, or any kind of In-Game consumables please contact us. We are not responsible for any incompatibilities.</li>
                <li>If the account has to be replaced, any DLC purchased on it will be lost, we only offer warranty for the game.</li>
              </ul>

              <div className="accordion mt-8 space-y-4 flex flex-col md:flex-row" id="faq-accordion">
                <div className="flex-1 accordion-item rounded-2xl border border-gray-800 bg-black/30">
                  <button
                    id="accordion-button-ps5"
                    type="button"
                    aria-expanded={accordionState.ps5}
                    onClick={() => toggleAccordion('ps5')}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-lg font-medium text-white"
                  >
                    <span>PlayStation 5</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${accordionState.ps5 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`accordion-content overflow-hidden px-6 transition-[max-height] duration-300 ease-in-out ${accordionState.ps5 ? 'max-h-[4000px] pb-6' : 'max-h-0'
                      }`}
                  >
                    <ul className="tuts space-y-4 text-sm text-gray-300">
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 1.</strong> From the first screen you get when you turn ON your PS5 console, pick <b>Add User</b>.
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep1.src} target="_blank" rel="noreferrer">
                          <img src={imageStep1.src} alt="PS5 step 1" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 2.</strong> On the left side of your screen choose the <b>Get Started</b> button.
                          <br />(<b>Do NOT use &quot;Play as One-Time Guest&quot; option</b>, because the game will not work on your personal account)
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep2.src} target="_blank" rel="noreferrer">
                          <img src={imageStep2.src} alt="PS5 step 2" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 3.</strong> Check the <b>I agree checkbox</b> and click the <b>Confirm</b> button.
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep3.src} target="_blank" rel="noreferrer">
                          <img src={imageStep3.src} alt="PS5 step 3" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 4.</strong> Choose <b>Sign in Manually</b>
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep4.src} target="_blank" rel="noreferrer">
                          <img src={imageStep4.src} alt="PS5 step 4" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 5.</strong> Type in the email and password received with your purchase, then press <b>Sign In</b>.
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep5.src} target="_blank" rel="noreferrer">
                          <img src={imageStep5.src} alt="PS5 step 5" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 6.</strong> Type in the <b>Verification code</b> received in the email with the credentials.
                          <br />
                          If the verification code doesn&apos;t work, use{' '}
                          <a className="text-amber-400 underline" href="#" onClick={(e) => e.preventDefault()}>
                            this form
                          </a>{' '}
                          to get a new code, or ask on the chatbox on the bottom right of the page.
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep6.src} target="_blank" rel="noreferrer">
                          <img src={imageStep6.src} alt="PS5 step 6" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 7.</strong> If you are asked to upgrade the account, please <b>SKIP</b> this phase.
                          <br />
                          However, if you&apos;ve already upgraded it, use{' '}
                          <a className="text-amber-400 underline" href="#" onClick={(e) => e.preventDefault()}>
                            this form
                          </a>{' '}
                          or talk to us on live chat to receive a new verification code.
                          <br />
                          Press <b>OK</b> and you will be logged in.
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep7.src} target="_blank" rel="noreferrer">
                          <img src={imageStep7.src} alt="PS5 step 7" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 8.</strong> Head over to the <b>Game Library</b> then click <b>Your Collection</b>.
                          <br />There you will find the game you&apos;ve purchased.
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep8.src} target="_blank" rel="noreferrer">
                          <img src={imageStep8.src} alt="PS5 step 8" className="w-full rounded" />
                        </a>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 9.</strong> Choose <b>Sign in Manually</b>
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep9.src} target="_blank" rel="noreferrer">
                          <img src={imageStep9.src} alt="PS5 step 9" className="w-full rounded" />
                        </a>
                        <p className="mt-2">
                          <b>Select your new game</b> and press <b>Download</b>.
                        </p>
                      </li>
                      <li className="mt-1">
                        <p className="mt-2">
                          <strong>Step 10.</strong> You can now switch to your personal account, wait until the game is fully downloaded and enjoy it!
                        </p>
                        <a className="screenshot mt-2 block" href={imageStep10.src} target="_blank" rel="noreferrer">
                          <img src={imageStep10.src} alt="PS5 step 10" className="w-full rounded" />
                        </a>
                      </li>
                    </ul>

                    <div className="mt-6 space-y-4 text-sm text-gray-300">
                      <h3 className="text-lg font-semibold text-white">Troubleshooting</h3>
                      <ol className="space-y-4 list-decimal pl-5">
                        <li>
                          <p className="mt-2">
                            If the game doesn&apos;t work on your personal account, please try login again with the received account, use the{' '}
                            <span className="text-amber-400">form</span> to get a new code.
                          </p>
                          <a className="screenshot mt-2 block" href={imageTrouble1.src} target="_blank" rel="noreferrer">
                            <img src={imageTrouble1.src} alt="PS5 troubleshooting 1" className="w-full rounded" />
                          </a>
                        </li>
                        <li>
                          <p className="mt-2">Then go to <b>Settings -&gt; Users and Accounts</b></p>
                          <a className="screenshot mt-2 block" href={imageTrouble2.src} target="_blank" rel="noreferrer">
                            <img src={imageTrouble2.src} alt="PS5 troubleshooting 2" className="w-full rounded" />
                          </a>
                        </li>
                        <li>
                          <p className="mt-2">Select <b>Other</b> and <b>Console Sharing and Offline Play</b>.</p>
                          <a className="screenshot mt-2 block" href={imageTrouble3.src} target="_blank" rel="noreferrer">
                            <img src={imageTrouble3.src} alt="PS5 troubleshooting 3" className="w-full rounded" />
                          </a>
                        </li>
                        <li>
                          <p className="mt-2">
                            Make sure <b>Console Sharing and Offline Play</b> is enabled.
                            <br />
                            Now, maybe you&apos;ve added the account as a guest and that will make it disappear from your console, so you won&apos;t have the possibility to enable &quot;Console Sharing and Offline Play&quot;. So please make sure you&apos;ve added the account as a user and not as a guest.
                          </p>
                          <a className="screenshot mt-2 block" href={imageTrouble4.src} target="_blank" rel="noreferrer">
                            <img src={imageTrouble4.src} alt="PS5 troubleshooting 4" className="w-full rounded" />
                          </a>
                        </li>
                        <li>
                          <p className="mt-2">
                            If the verification code is not working after a few attempts, just repeat the login process. The login will time out after a period of time, and this will make it work again.
                            <br />If you still encounter problems, please use the live chat service and the agents will help you solve the issue in no time.
                          </p>
                          <a className="screenshot mt-2 block" href={imageTrouble5.src} target="_blank" rel="noreferrer">
                            <img src={imageTrouble5.src} alt="PS5 troubleshooting 5" className="w-full rounded" />
                          </a>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex-1 accordion-item rounded-2xl border border-gray-800 bg-black/30">
                  <button
                    id="accordion-button-ps4"
                    type="button"
                    aria-expanded={accordionState.ps4}
                    onClick={() => toggleAccordion('ps4')}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-lg font-medium text-white"
                  >
                    <span>PlayStation 4</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${accordionState.ps4 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`accordion-content overflow-hidden px-6 transition-[max-height] duration-300 ease-in-out ${accordionState.ps4 ? 'max-h-[4000px] pb-6' : 'max-h-0'
                      }`}
                  >
                    <ol className="space-y-3 list-decimal pl-5 text-sm text-gray-300">
                      <li>Go to <b>Settings</b></li>
                      <li>Press on <b>Login Settings</b></li>
                      <li>Press on <b>User Management</b></li>
                      <li>Press on <b>Create User</b></li>
                      <li>Press on <b>Accept</b></li>
                      <li>Press on <b>Next</b></li>
                      <li>Type in the received account details (via email or via Live Chat) and press on <b>Sign In</b></li>
                      <li>
                        Note: Sometimes a security code is needed (because you log in from a new device). If so, in order to get your code, please use the form on{' '}
                        <a className="text-amber-400" href="#" onClick={(e) => e.preventDefault()}>
                          this page
                        </a>{' '}
                        or <b>use the chatbox</b> (bottom-right of this page). Type in the Verification code received in the email with the credentials. If the verification code doesn&apos;t work, use{' '}
                        <a className="text-amber-400" href="#" onClick={(e) => e.preventDefault()}>
                          this form
                        </a>{' '}
                        to get a new code, or ask on the <b>chatbox</b> on the bottom right of the page.
                      </li>
                      <li>Press on <b>Next</b> (or equivalent if the account is from another region)</li>
                      <li>Press on <b>Edit - Activate as primary</b> (or equivalent if the account is from another region).</li>
                      <li>Press on <b>Confirm</b> (&quot;Bestätigen&quot;, or equivalent if the account is from another region).</li>
                      <li>Press on <b>Next</b> (&quot;Weiter&quot;, or equivalent if the account is from another region).</li>
                      <li>Press on <b>Next</b> (&quot;Weiter&quot;, or equivalent if the account is from another region).</li>
                      <li>Press on <b>Next</b> (&quot;Weiter&quot;, or equivalent if the account is from another region).</li>
                      <li>Press <b>OK</b>.</li>
                      <li>Hold the <b>middle PS button</b> on the controller and press on <b>Switch User</b></li>
                      <li>
                        <b>Log in</b> on the new account
                      </li>
                      <li>Go to <b>Library</b></li>
                      <li>Go to <b>Purchased</b> and start the <b>Download</b></li>
                      <li>Hold the <b>middle PS button</b> on the controller and press on <b>Log Out of PS4</b></li>
                    </ol>
                    <p className="mt-4 text-sm text-gray-300">
                      If the game is locked, log into the <b>purchased account</b> again, go to -&gt; <b>Settings</b> -&gt; <b>Account management</b> -&gt; <b>Activate as your primary PS4</b>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

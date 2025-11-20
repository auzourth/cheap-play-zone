'use client';

import React, { useState } from 'react';
import { Code, History, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputField from '@/components/ui/InputField';

const RedeemCodeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a redemption code');
      return;
    }

    // Redirect to the redeem page with the code
    router.push(`/redeem/${code.trim()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Lookup Redemption Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex p-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex-1 mr-4">
            <InputField
              label="REDEMPTION CODE"
              value={code}
              onChange={(value) => {
                setCode(value);
                setError('');
              }}
              placeholder="Enter your redemption code..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-fit bg-amber-500 hover:bg-amber-600 font-bold py-3 px-4 rounded transition-colors"
          >
            Track
          </button>
        </form>
      </div>
    </div>
  );
};

const Page = () => {
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Redeem Code Modal */}
      <RedeemCodeModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
      />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6">Buy Games</h1>
            <h2 className="text-6xl font-bold mb-12">
              <span className="text-orange-400">Cheaper</span> than Ever
            </h2>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setIsRedeemModalOpen(true)}
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg transition-colors text-lg font-medium"
              >
                <Code className="mr-2" size={20} />
                Redeem Code
              </button>
              <Link
                href="/track-order"
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors text-lg font-medium"
              >
                <History className="mr-2" size={20} />
                Track Order
              </Link>
            </div>
            <div className="mt-12">
              <Link
                href="https://www.g2a.co/contact/?itm_source=footer&itm_medium=&itm_campaign=footer-global"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                Need our help? Contact us
              </Link>
            </div>

            {/* <div className="flex justify-center gap-6 mt-12">
              <button
                onClick={() => setIsRedeemModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg transition-colors text-lg font-medium"
              >
                Get Account →
              </button>
              <button
                onClick={() => setIsRedeemModalOpen(true)}
                className="text-gray-400 hover:text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium underline"
              >
                Redeem Code
              </button>
            </div> */}
          </div>
        </div>
      </section>

      {/* What is CheapPlayZone */}
      {/* <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What is CheapPlayZone?</h2>
            <p className="text-xl text-gray-400">
              Pre-purchased Video Games Delivered Via Accounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg transition-transform hover:translate-y-[-5px]">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-black text-2xl font-bold">$</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Save Money</h3>
              <p className="text-gray-300">
                We offer competitively priced digital games delivered through
                accounts. By securing games at lower prices, we pass the savings
                directly to you so you can play more and spend less.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg transition-transform hover:translate-y-[-5px]">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <GameController size={24} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                Play on Your Account
              </h3>
              <p className="text-gray-300">
                Download the game and play it yourself. Once set up, you can
                enjoy the game from your personal account, as usual with full
                access to all features.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg transition-transform hover:translate-y-[-5px]">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                Secured Purchase
              </h3>
              <p className="text-gray-300">
                Your games will be delivered to you within a few hours. Enjoy a
                full warranty on all purchases and live chat support from 06:00
                to 18:00 for any assistance you need.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Customer Reviews */}
      {/* <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Do Customers Say?</h2>
            <p className="text-xl text-gray-400">
              CheapPlayZone has positive reviews and is trusted by users across
              platforms.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="bg-gray-800 p-6 rounded-lg w-full md:w-1/3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-green-400">94%</span>
                <div className="flex text-yellow-400">
                  <span>★★★★★</span>
                </div>
              </div>
              <p className="text-lg">5-star reviews</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg w-full md:w-1/3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-green-400">3937+</span>
              </div>
              <p className="text-lg">Happy Customers</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* How It Works */}
      {/* <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <Clock size={36} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                Wait for Delivery
              </h3>
              <p className="text-gray-300">
                Our processing team will ensure your purchase is completed
                within 24 hours on average.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <Mail size={36} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                Check your Mailbox
              </h3>
              <p className="text-gray-300">
                You will receive an email once your order processing time is
                complete.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <GameController size={36} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                Activate the Game
              </h3>
              <p className="text-gray-300">
                Use the provided guide to download, install the game, and start
                enjoying it on your personal account.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-gray-700">
            <div className="py-5">
              <h3 className="text-xl font-medium mb-2">
                HOW LONG WILL IT TAKE TO RECEIVE THE GAME?
              </h3>
              <p className="text-gray-300">
                On average, our processing team fulfills orders within 24 hours
                after the payment is completed. This is true for 95% of all
                orders. However, occasionally some titles may be delayed and we
                need some extra time to get them prepared for you, usually
                within couple hours. It can take up to maximum 24 hours.
              </p>
            </div>

            <div className="py-5">
              <h3 className="text-xl font-medium mb-2">
                CAN I PLAY THE GAME USING MY PERSONAL ACCOUNT?
              </h3>
              <p className="text-gray-300">
                Yes, you will need to connect to the seller&apos;s account
                first, download the game, and then that you will be able to play
                freely from your personal account. All of the features like
                trophies, savedata and multiplayer - will work the same way as
                if you&apos;ve purchased it on your own account.
              </p>
            </div>

            <div className="py-5">
              <h3 className="text-xl font-medium mb-2">
                IS IT SAFE? ARE THERE ANY RISK TO MY CONSOLE?
              </h3>
              <p className="text-gray-300">
                Yes, it is 100% safe and secure. This method of buying a digital
                license legally has no risk or harm to your console, as the
                console were designed to allow such game sharing between family
                members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">READY TO TRY IT YOURSELF?</h2>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsRedeemModalOpen(true)}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors text-lg font-medium"
            >
              Redeem Code
            </button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Page;

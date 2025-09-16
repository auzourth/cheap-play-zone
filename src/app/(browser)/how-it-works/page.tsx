'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import image from '@/assetes/image.png';
import image2 from '@/assetes/image2.png';
import image3 from '@/assetes/image3.png';
import image4 from '@/assetes/image4.png';
import image5 from '@/assetes/image5.png';
import image6 from '@/assetes/image6.png';
import image7 from '@/assetes/image7.png';
import image8 from '@/assetes/image8.png';
import image9 from '@/assetes/image9.png';
import image10 from '@/assetes/image10.png';
import image11 from '@/assetes/image11.png';
import image12 from '@/assetes/image12.png';
import image13 from '@/assetes/image13.png';
import image14 from '@/assetes/image14.png';
import image15 from '@/assetes/image15.png';
import image16 from '@/assetes/image16.png';

const Page: React.FC = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-center">How It Works</h1>

        {/* Important Information */}
        <div className="bg-yellow-50 text-amber-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">IMPORTANT</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              Do not change the account email, doing so will result in a locked
              game, and you won&apos;t be able to play it anymore.
            </li>
            <li>
              Do not deactivate or change the account 2-step settings, doing so
              will result in a locked game, and you won&apos;t be able to play
              it anymore.
            </li>
            <li>
              Do not delete the account, doing so will result in a locked game,
              and you won&apos;t be able to play it anymore.
            </li>
            <li>
              Do not deactivate the account, doing so will result in a locked
              game, and you won&apos;t be able to play it anymore.
            </li>
            <li>
              Changing the PS5, formatting the PS5 or changing the HDD of the
              PS5 will lead to an unplayable game, sometimes this can be fixed,
              so you can download the game again, but you are doing this at your
              own risk. If this happens please come on{' '}
              <Link
                href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
                className="text-blue-500"
              >
                Contact us on G2A
              </Link>
              , and we will check the account.
            </li>
            <li>
              The account can be activated ONLY ON ONE PS5. We are not
              responsible if you already activated it on another PS5 before.
            </li>
            <li>
              Before you purchase any DLC, Season Pass, or any kind of In-Game
              consumables please contact us. We are not responsible for any
              incompatibilities.
            </li>
            <li>
              If the account has to be replaced, any DLC purchased on it will be
              lost, we only offer warranty for the game.
            </li>
          </ul>
        </div>

        {/* PS Plus Information */}
        <div className="bg-yellow-50 text-amber-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">IMPORTANT - PS Plus</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              The games on PS Plus promotions should be downloaded from the
              account you received from us.
            </li>
            <li>
              After the installation you SHOULD play the games from your own
              personal account (Not from the account you got from us)
            </li>
            <li>
              The account you received from us should be used only to install
              the games included in PS Plus.
            </li>
          </ul>
        </div>

        {/* How to Install */}
        <div className="bg-yellow-50 text-amber-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">
            How to Install Monthly Games:
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              Navigate to the home screen and look for the PlayStation Plus icon
              (a yellow plus symbol) next to the user&apos;s avatar in the top
              right corner. The account with the PlayStation Plus subscription
              will have this icon.
            </li>
            <li>
              From the home screen, go to the PlayStation Plus section on the
              main menu, then select Monthly Games and install the desired game.
              After the game is installed, switch to your personal account and
              enjoy the game.
            </li>
            <li>
              <span className="font-bold">
                Important: The account must be signed in as a New User (not as a
                Guest).
              </span>
            </li>
          </ul>
        </div>

        {/* guide Tutorial */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            PS5 Tutorial - Step-by-step guide
          </h2>
          {[
            {
              title:
                'From the first screen you get when you turn ON your PS5 console, pick Add User.',
              imgae: image,
              description: '',
            },
            {
              title:
                'On the left side of your screen choose the Get Started button.',
              imgae: image2,
              description:
                '(Do NOT use "Play as One-Time Guest" option, because the game will not work on your personal account)',
            },
            {
              title: 'Check the I agree checkbox and click the Confirm button.',
              imgae: image3,
              description: '',
            },
            {
              title: 'Choose Sign in Manually',
              imgae: image4,
              description: '',
            },
            {
              title:
                'Type in the email and password received with your purchase, then press Sign In.',
              imgae: image5,
              description: '',
            },
            {
              title:
                'Type in the Verification code received in the email with the credentials.',
              imgae: image6,
              description: (
                <p>
                  If the verification code doesn&apos;t work,{' '}
                  <Link
                    href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
                    className="text-blue-500"
                  >
                    Contact us on G2A
                  </Link>
                  .
                </p>
              ),
            },
            {
              title:
                'If you are asked to upgrade the account, please SKIP this phase.',
              imgae: image7,
              description: (
                <p>
                  However, if you&apos;ve already upgraded it,{' '}
                  <Link
                    href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
                    className="text-blue-500"
                  >
                    Contact us on G2A
                  </Link>
                  .
                </p>
              ),
            },
            {
              title:
                'Head over to the Game Library then click Your Collection.',
              imgae: image8,
              description:
                'There you will find the game you&apos;ve purchased.',
            },
            {
              title: 'Choose Sign in Manually',
              imgae: image9,
              description: '',
            },
            {
              title:
                'You can now switch to your personal account, wait until the game is fully downloaded and enjoy it!',
              imgae: image10,
              description: '',
            },
          ].map((step, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-bold mb-2">
                <span className="font-semibold">Step {index + 1}: </span>{' '}
                {step.title}
              </h3>
              {step.description && (
                <p className="text-gray-400">{step.description}</p>
              )}
              {step.imgae && (
                <img
                  src={step.imgae.src}
                  alt={step.title}
                  className="w-full h-auto mb-2"
                />
              )}
            </div>
          ))}
        </div>

        {/* troubleshooting */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
          {[
            {
              title: '',
              imgae: image11,
            },
            {
              title: (
                <p>
                  If the game doesn&apos;t work on your personal account, please
                  try login again with the received account,
                  <Link
                    href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
                    className="text-blue-500"
                  >
                    Contact us on G2A
                  </Link>
                  .
                </p>
              ),
              imgae: image12,
            },
            {
              title: 'Then go to Settings -> Users and Accounts',
              imgae: image13,
            },
            {
              title: 'Select Other and Console Sharing and Offline Play.',
              imgae: image14,
            },
            {
              title:
                'Make sure Console Sharing and Offline Play is enabled. Now, maybe you&apos;ve added the account as a guest and that will make it disappear from your console, so you won&apos;t have the possibility to enable "Console Sharing and Offline Play". So please make sure you&apos;ve added the account as a user and not as a guest.',
              imgae: image15,
            },
            {
              title: (
                <p>
                  If the verification code is not working after a few attempts,
                  just repeat the login process. The login will time out after a
                  period of time, and this will make it work again. If you still
                  encounter problems, please use the{' '}
                  <Link
                    href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
                    className="text-blue-500"
                  >
                    Contact us on G2A
                  </Link>{' '}
                  service and the agents will help you solve the issue in no
                  time.
                </p>
              ),
              imgae: image16,
            },
          ].map((step, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-bold mb-2">
                <span className="font-semibold">
                  {index > 0 && index + '.'}{' '}
                </span>{' '}
                {step.title}
              </h3>
              {step.imgae && (
                <img
                  src={step.imgae.src}
                  alt={'Step ' + (index + 1)}
                  className="w-full h-auto mb-2"
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 text-amber-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">IMPORTANT</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              Do not change the account email, doing so will result in a locked
              game, and you won&apos;t be able to play it anymore.
            </li>
            <li>
              Do not deactivate or change the account 2-step settings, doing so
              will result in a locked game, and you won&apos;t be able to play
              it anymore.
            </li>
            <li>
              Do not delete the account, doing so will result in a locked game,
              and you won&apos;t be able to play it anymore.
            </li>
            <li>
              Do not deactivate the account, doing so will result in a locked
              game, and you won&apos;t be able to play it anymore.
            </li>
            <li>
              Changing the PS5, formatting the PS5 or changing the HDD of the
              PS5 will lead to an unplayable game, sometimes this can be fixed,
              so you can download the game again, but you are doing this at your
              own risk. If this happens please come on{' '}
              <Link
                href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
                className="text-blue-500"
              >
                Contact us on G2A
              </Link>
              , and we will check the account.
            </li>
            <li>
              The account can be activated ONLY ON ONE PS5. We are not
              responsible if you already activated it on another PS5 before.
            </li>
            <li>
              Before you purchase any DLC, Season Pass, or any kind of In-Game
              consumables please contact us. We are not responsible for any
              incompatibilities.
            </li>
            <li>
              If the account has to be replaced, any DLC purchased on it will be
              lost, we only offer warranty for the game.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;

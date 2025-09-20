'use client';
import React, { useState } from 'react';
import Modal from './Modal';
import { v4 as uuidv4 } from 'uuid';
import { Copy } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import { supabase } from '../../lib/supabase';

interface GeneratedCode {
  name: string;
  email: string;
  code: string;
}

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [savedCodes, setSavedCodes] = useState<{ [code: string]: boolean }>({});

  const generateCode = () => {
    if (!name || quantity < 1) return;
    const codes: GeneratedCode[] = [];
    for (let i = 0; i < quantity; i++) {
      codes.push({
        name,
        email,
        code: uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase(),
      });
    }
    setGeneratedCodes(codes);
  };

  const handleSaveGeneratedCode = async (generatedCode: {
    name: string;
    email: string;
    code: string;
  }) => {
    setSavedCodes((prev) => ({ ...prev, [generatedCode.code]: true }));
    try {
      const { error } = await supabase
        .from('cheap-play-zone')
        .insert({
          code: generatedCode.code,
          name: generatedCode.name,
          email: generatedCode.email,
          status: 'pending',
          isRedeemed: false,
        })
        .select();

      if (error) {
        alert('Error saving to Supabase. Fallback to local context.');
        console.error('Error saving to Supabase:', error);
        setSavedCodes((prev) => ({ ...prev, [generatedCode.code]: false }));
      }
    } catch (err) {
      console.error('Exception when saving code:', err);
      setSavedCodes((prev) => ({ ...prev, [generatedCode.code]: false }));
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setQuantity(1);
    setGeneratedCodes([]);
    setIsCopied(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Redemption Code">
      <div className="space-y-4">
        {generatedCodes.length === 0 && (
          <>
            <InputField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Enter recipient name"
              required
            />

            <InputField
              label="Email (Optional)"
              value={email}
              onChange={setEmail}
              placeholder="Enter recipient email"
              type="email"
            />

            <div>
              <InputField
                label="Quantity"
                value={quantity.toString()}
                onChange={(val) => setQuantity(Number(val) || 1)}
                placeholder="Number of codes"
              />
            </div>

            <button
              onClick={generateCode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              disabled={!name || quantity < 1}
            >
              Generate Code{quantity > 1 ? 's' : ''}
            </button>
          </>
        )}

        {generatedCodes.length > 0 && (
          <div className="mt-4 space-y-4 relative">
            {isCopied && (
              <div className="absolute left-0 right-0 top-0 z-20 flex flex-col items-center">
                <div className="bg-gray-900/90 p-8 px-16 rounded-b shadow text-green-300 text-center flex flex-col items-center">
                  <span className="font-bold">Copied to clipboard!</span>
                  {generatedCodes.length === 1 && (
                    <span className="text-xs text-gray-300 mt-1">
                      Redemption Code:{' '}
                      <span className="font-mono text-green-400">
                        {generatedCodes[0].code}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="bg-gray-700 p-4 rounded space-y-3 max-h-[40rem] overflow-y-auto">
              {generatedCodes.map((generatedCode, idx) => (
                <div
                  key={generatedCode.code}
                  className="mb-4 border-b border-gray-600 pb-4 last:border-0 last:pb-0"
                >
                  <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 mb-2">
                    <span className="text-gray-50 text-xs font-mono px-2 py-1 bg-gray-800 rounded">
                      {idx + 1}
                    </span>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <p>{generatedCode.name}</p>
                  </div>

                  {generatedCode.email && (
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-2">
                      <span className="text-gray-400 text-sm">Email:</span>
                      <p>{generatedCode.email}</p>
                      <button
                        onClick={() => copyToClipboard(generatedCode.email)}
                        className="p-2 hover:bg-gray-600 rounded transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-2">
                    <span className="text-gray-400 text-sm">
                      Redemption Code:
                    </span>
                    <p className="font-mono text-lg font-bold text-green-400">
                      {generatedCode.code}
                    </p>
                    <button
                      onClick={() => copyToClipboard(generatedCode.code)}
                      className="p-2 hover:bg-gray-600 rounded transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-2">
                    <span className="text-gray-400 text-sm">
                      Redemption URL:
                    </span>
                    <p className="font-mono">{`${window.location.origin}/redeem/${generatedCode.code}`}</p>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/redeem/${generatedCode.code}`
                        )
                      }
                      className="p-2 hover:bg-gray-600 rounded transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSaveGeneratedCode(generatedCode)}
                    disabled={!!savedCodes[generatedCode.code]}
                    className={`w-full mt-2 text-white py-2 px-4 rounded transition-colors ${
                      savedCodes[generatedCode.code]
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {savedCodes[generatedCode.code] ? 'Saved' : 'Save Code'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (generatedCodes.length > 0) {
                    generatedCodes.forEach((code) =>
                      handleSaveGeneratedCode(code)
                    );
                    resetForm();
                    onClose();
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                disabled={generatedCodes.length === 0}
              >
                Save All
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CodeGeneratorModal;

/**
 * DonationForm
 *
 * Platform-themed donation form — emerald/slate palette, material-symbols icons,
 * Framer Motion animations. Matches the Eagles & Eaglets design language.
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useInitiateDonation, useDonationStatus } from '../hooks/useDonations';
import donationService from '../services/donation-service';
import { useAuthStore } from '@store';

const AMOUNT_PRESETS = [
  { value: 25, tier: 'Supporter' },
  { value: 50, tier: 'Partner' },
  { value: 100, tier: 'Leader' },
  { value: 200, tier: 'Champion' },
];

const NETWORKS = [
  { value: '',            label: 'Auto-detect' },
  { value: 'mtn-gh',      label: 'MTN' },
  { value: 'vodafone-gh', label: 'Telecel' },
  { value: 'airtel-gh',   label: 'AirtelTigo' },
];

const PAYMENT_TIMEOUT_MS = 4 * 60 * 1000;

const STEP_FORM    = 'form';
const STEP_OTP     = 'otp';
const STEP_WAITING = 'waiting';
const STEP_SUCCESS = 'success';
const STEP_FAILED  = 'failed';

export default function DonationForm({ campaignId }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Form fields
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [network, setNetwork] = useState('');
  const frequency = 'once';

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Flow state
  const [step, setStep] = useState(STEP_FORM);
  const [donationId, setDonationId] = useState(null);
  const [error, setError] = useState('');
  const [waitingStartedAt, setWaitingStartedAt] = useState(null);
  const [waitingNotice, setWaitingNotice] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [otpRequiredNotice, setOtpRequiredNotice] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const initiate = useInitiateDonation();

  const {
    data: statusData,
    refetch: refetchStatus,
    isFetching: isCheckingStatus,
  } = useDonationStatus(donationId, {
    enabled: step === STEP_WAITING,
  });

  const polledStatus = statusData?.data?.status;
  if (step === STEP_WAITING && polledStatus === 'success') {
    setReceipt({
      reference: statusData?.data?.reference || receipt?.reference || '',
      amount: statusData?.data?.amount || finalAmount,
      campaignTitle: statusData?.data?.campaign_title || '',
    });
    setStep(STEP_SUCCESS);
  }
  if (step === STEP_WAITING && polledStatus === 'failed') setStep(STEP_FAILED);

  // Payment timeout: auto-fail after 4 minutes of waiting
  useEffect(() => {
    if (step !== STEP_WAITING) return undefined;
    const timer = setTimeout(() => {
      setError('Payment timed out. The mobile money prompt may have expired.');
      setStep(STEP_FAILED);
    }, PAYMENT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [step]);

  // Track when waiting started (for countdown display)
  useEffect(() => {
    if (step === STEP_WAITING) {
      setWaitingStartedAt(Date.now());
      setWaitingNotice('');
    } else {
      setWaitingStartedAt(null);
    }
  }, [step]);

  async function handleCheckPayment() {
    setWaitingNotice('');
    try {
      const result = await refetchStatus();
      const s = result?.data?.data?.status;
      if (s === 'success') {
        setReceipt({
          reference: result?.data?.data?.reference || receipt?.reference || '',
          amount: result?.data?.data?.amount || finalAmount,
          campaignTitle: result?.data?.data?.campaign_title || '',
        });
        setStep(STEP_SUCCESS);
      } else if (s === 'failed') {
        setStep(STEP_FAILED);
      } else {
        setWaitingNotice(
          'Payment not yet received. Please approve the prompt on your phone.'
        );
      }
    } catch (err) {
      setWaitingNotice(
        err?.message || 'Could not check payment status. Please try again.'
      );
    }
  }

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  // ── OTP: send code ─────────────────────────────────────────────────────────
  async function handleSendOtp() {
    setError('');
    if (!firstName.trim()) return setError('Please enter your name.');
    if (!phone.trim()) return setError('Please enter your phone number.');
    if (finalAmount < 1) return setError('Minimum donation is GHS 1.');

    setOtpSending(true);
    try {
      await donationService.sendOtp(phone.trim());
      setOtpRequiredNotice('');
      setStep(STEP_OTP);
    } catch (err) {
      setError(
        err?.details?.phone ||
        err?.details?.sms ||
        err?.message ||
        'Could not send verification code. Please try again.'
      );
    } finally {
      setOtpSending(false);
    }
  }

  // ── OTP: verify code ───────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    setError('');
    if (!otpCode.trim()) return setError('Please enter the verification code.');

    setOtpVerifying(true);
    try {
      const result = await donationService.verifyOtp(phone.trim(), otpCode.trim());
      await submitDonation(result.data.otp_token);
    } catch (err) {
      setError(
        err?.details?.code ||
        err?.message ||
        'Invalid or expired code. Please try again.'
      );
    } finally {
      setOtpVerifying(false);
    }
  }

  // ── Payment submission ─────────────────────────────────────────────────────
  async function submitDonation(resolvedToken) {
    const payload = {
      campaign_id: campaignId,
      amount: finalAmount.toFixed(2),
      phone_number: phone.trim(),
      donor_name: firstName.trim(),
      frequency,
      is_anonymous: isAnonymous,
      message: '',
    };
    if (network) payload.network = network;
    if (!isAuthenticated && resolvedToken) {
      payload.otp_token = resolvedToken;
    }
    try {
      const result = await initiate.mutateAsync(payload);
      setDonationId(result.data.donation_id);
      setReceipt({
        reference: result.data.reference || '',
        amount: finalAmount,
        campaignTitle: '',
      });
      setStep(STEP_WAITING);
    } catch (err) {
      const tokenErr = err?.details?.otp_token;
      const paymentErr = err?.details?.payment;
      const fallback = err?.message || 'Something went wrong. Please try again.';
      if (!isAuthenticated && tokenErr) {
        // OTP token expired/consumed — force re-verification
        setOtpRequiredNotice(
          'Your phone verification expired. Please verify your number again.'
        );
        setError('');
        setStep(STEP_FORM);
      } else {
        setError(paymentErr || tokenErr || fallback);
        setStep(STEP_FORM);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!firstName.trim()) return setError('Please enter your name.');
    if (!phone.trim()) return setError('Please enter your phone number.');
    if (finalAmount < 1) return setError('Minimum donation is GHS 1.');

    if (!isAuthenticated) {
      // Anonymous donors: trigger OTP flow first
      await handleSendOtp();
    } else {
      // Authenticated users: go straight to payment
      await submitDonation(null);
    }
  }

  // ── OTP step screen ───────────────────────────────────────────────────────

  if (step === STEP_OTP) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setStep(STEP_FORM); setOtpCode(''); setError(''); }}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">arrow_back</span>
          </button>
          <div>
            <h3 className="text-lg font-black text-slate-900">Verify Your Phone</h3>
            <p className="text-xs text-slate-400">Code sent to {phone}</p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 flex gap-3">
          <span className="material-symbols-outlined text-emerald-500 text-xl shrink-0">sms</span>
          <p className="text-sm text-emerald-800">
            A 6-digit verification code has been sent to your phone. Enter it below to proceed with your donation.
          </p>
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-base">
            pin
          </span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full border-2 border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
            autoFocus
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3"
            >
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleVerifyOtp}
          disabled={otpVerifying || otpCode.length < 6}
          whileHover={{ scale: otpVerifying ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black text-base py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          {otpVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">verified</span>
              Verify &amp; Donate GHS {finalAmount > 0 ? finalAmount.toLocaleString() : '—'}
            </>
          )}
        </motion.button>

        <button
          type="button"
          disabled={otpSending}
          onClick={handleSendOtp}
          className="w-full text-xs text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
        >
          {otpSending ? 'Sending…' : "Didn't receive a code? Resend"}
        </button>
      </motion.div>
    );
  }

  // ── Status screens ────────────────────────────────────────────────────────

  if (step === STEP_WAITING) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm space-y-5"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="material-symbols-outlined text-emerald-500 text-4xl"
            >
              smartphone
            </motion.span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Check Your Phone</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            A mobile money prompt has been sent to{' '}
            <span className="font-semibold text-slate-700">{phone}</span>.
            Approve it to complete your donation.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <motion.div
            className="w-2 h-2 bg-emerald-400 rounded-full"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <CountdownLabel startedAt={waitingStartedAt} totalMs={PAYMENT_TIMEOUT_MS} />
        </div>

        <AnimatePresence>
          {waitingNotice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-2xl px-4 py-3 text-left"
            >
              <span className="material-symbols-outlined text-base shrink-0">info</span>
              {waitingNotice}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleCheckPayment}
          disabled={isCheckingStatus}
          whileHover={{ scale: isCheckingStatus ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black text-sm py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          {isCheckingStatus ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Checking…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">task_alt</span>
              I&apos;ve Completed Payment
            </>
          )}
        </motion.button>

        <button
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
          onClick={() => { setStep(STEP_FORM); setDonationId(null); }}
        >
          Cancel
        </button>
      </motion.div>
    );
  }

  function resetForNewDonation() {
    setStep(STEP_FORM);
    setCustomAmount('');
    setPhone('');
    setFirstName('');
    setOtpCode('');
    setDonationId(null);
    setReceipt(null);
    setError('');
    setWaitingNotice('');
  }

  function closeSuccessModal() {
    resetForNewDonation();
  }

  async function handleCopyReference() {
    if (!receipt?.reference) return;
    try {
      await navigator.clipboard.writeText(receipt.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      setCopiedRef(false);
    }
  }

  if (step === STEP_SUCCESS) {
    return (
      <ThankYouModal
        receipt={receipt}
        fallbackAmount={finalAmount}
        copiedRef={copiedRef}
        onCopy={handleCopyReference}
        onDonateAgain={resetForNewDonation}
        onClose={closeSuccessModal}
      />
    );
  }

  if (step === STEP_FAILED) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-red-200 p-10 text-center shadow-sm space-y-5"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-400 text-3xl">cancel</span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Payment Not Completed</h3>
          <p className="text-slate-500 text-sm">The payment was declined or expired.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setStep(STEP_FORM); setDonationId(null); }}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Choose Your Gift</h2>
          <p className="text-xs text-slate-400 mt-0.5">All amounts in Ghana Cedis (GHS)</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-600 text-xl">volunteer_activism</span>
        </div>
      </div>

      {/* Amount presets */}
      <div className="grid grid-cols-4 gap-2">
        {AMOUNT_PRESETS.map((preset) => (
          <motion.button
            key={preset.value}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setSelectedAmount(preset.value); setIsCustom(false); }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 py-3 px-2 transition-all duration-200 ${
              !isCustom && selectedAmount === preset.value
                ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <span className={`text-lg font-black ${!isCustom && selectedAmount === preset.value ? 'text-emerald-600' : 'text-slate-800'}`}>
              {preset.value}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
              {preset.tier}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Custom amount toggle */}
      <button
        type="button"
        onClick={() => setIsCustom(true)}
        className={`w-full text-sm font-semibold py-2.5 rounded-2xl border-2 transition-all duration-200 ${
          isCustom
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-dashed border-slate-300 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
        }`}
      >
        {isCustom ? 'Custom amount' : '+ Enter custom amount'}
      </button>

      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
              GHS
            </span>
            <input
              type="number"
              min="1"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl pl-14 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal info */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Personal Information
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-base">
              person
            </span>
            <input
              type="text"
              placeholder="Your name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-base">
              smartphone
            </span>
            <input
              type="tel"
              placeholder="024XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">info</span>
          Ghana number — prompt will be sent to this phone (MTN/Vodafone/AirtelTigo)
        </p>
      </div>

      {/* Mobile Network */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Mobile Network
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-base pointer-events-none">
            signal_cellular_alt
          </span>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full appearance-none border-2 border-slate-200 rounded-2xl pl-9 pr-9 py-3 text-sm bg-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            {NETWORKS.map((n) => (
              <option key={n.value || 'auto'} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base pointer-events-none">
            expand_more
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          Leave as Auto-detect unless your number is ported to a different network.
        </p>
      </div>



      {/* Anonymous toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none group">
        <div
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
            isAnonymous ? 'bg-emerald-500' : 'bg-slate-200'
          }`}
        >
          <motion.div
            layout
            className="w-5 h-5 bg-white rounded-full shadow-sm"
            animate={{ x: isAnonymous ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
          Donate anonymously
        </span>
      </label>

      {/* OTP re-verify notice */}
      <AnimatePresence>
        {otpRequiredNotice && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-2xl px-4 py-3"
          >
            <span className="material-symbols-outlined text-base shrink-0">lock_clock</span>
            {otpRequiredNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3"
          >
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={initiate.isPending || otpSending}
        whileHover={{ scale: (initiate.isPending || otpSending) ? 1 : 1.02, y: (initiate.isPending || otpSending) ? 0 : -1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black text-base py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
      >
        {(initiate.isPending || otpSending) ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            {otpSending ? 'Sending code…' : 'Processing…'}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">
              {isAuthenticated ? 'favorite' : 'verified'}
            </span>
            {isAuthenticated
              ? `Donate GHS ${finalAmount > 0 ? finalAmount.toLocaleString() : '—'}`
              : `Verify & Donate GHS ${finalAmount > 0 ? finalAmount.toLocaleString() : '—'}`}
          </>
        )}
      </motion.button>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-5 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-slate-300">lock</span>
          Secure Payment
        </span>
        <span className="w-px h-4 bg-slate-200" />
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-slate-300">verified</span>
          Tax Deductible
        </span>
        <span className="w-px h-4 bg-slate-200" />
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-slate-300">smartphone</span>
          Mobile Money
        </span>
      </div>
    </motion.div>
  );
}

DonationForm.propTypes = {
  campaignId: PropTypes.string.isRequired,
};

function CountdownLabel({ startedAt, totalMs }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return <>Waiting for approval…</>;
  const remainingMs = Math.max(0, totalMs - (now - startedAt));
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');
  return <>Waiting for approval… expires in {mm}:{ss}</>;
}

CountdownLabel.propTypes = {
  startedAt: PropTypes.number,
  totalMs: PropTypes.number.isRequired,
};

const CONFETTI_COUNT = 18;
const CONFETTI_COLORS = ['bg-emerald-400', 'bg-amber-400', 'bg-sky-400', 'bg-rose-400'];

function ThankYouModal({ receipt, fallbackAmount, copiedRef, onCopy, onDonateAgain, onClose }) {
  const [confetti] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
      return {
        angle,
        distance: 110 + Math.random() * 60,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      };
    })
  );

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const amount = receipt?.amount || fallbackAmount || 0;
  const reference = receipt?.reference || '';
  const campaignTitle = receipt?.campaignTitle || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti burst */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="relative w-0 h-0 mt-24">
            {confetti.map((c, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{
                  x: Math.cos(c.angle) * c.distance,
                  y: Math.sin(c.angle) * c.distance,
                  opacity: 0,
                  scale: 1,
                  rotate: c.rotate,
                }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className={`absolute w-2 h-2 rounded-sm ${c.color}`}
              />
            ))}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-slate-500">close</span>
        </button>

        {/* Check icon */}
        <div className="relative flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/40"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
              className="material-symbols-outlined text-white text-4xl"
            >
              check_circle
            </motion.span>
          </motion.div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-2">Thank You! 🎉</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-5">
          Your donation of{' '}
          <span className="font-bold text-emerald-600">
            GHS {Number(amount).toLocaleString()}
          </span>
          {campaignTitle && (
            <>
              {' '}to <span className="font-semibold text-slate-700">{campaignTitle}</span>
            </>
          )}
          {' '}has been received. You&apos;re making a real difference!
        </p>

        {/* Receipt strip */}
        {reference && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Receipt Reference
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-sm text-slate-700 truncate">{reference}</code>
              <button
                onClick={onCopy}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedRef ? 'check' : 'content_copy'}
                </span>
                {copiedRef ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onDonateAgain}
            className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
          >
            Donate Again
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 py-3 text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25 transition-colors"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

ThankYouModal.propTypes = {
  receipt: PropTypes.shape({
    reference: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    campaignTitle: PropTypes.string,
  }),
  fallbackAmount: PropTypes.number,
  copiedRef: PropTypes.bool,
  onCopy: PropTypes.func.isRequired,
  onDonateAgain: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

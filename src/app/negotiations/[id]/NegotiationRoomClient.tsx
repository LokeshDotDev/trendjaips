"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendNegotiationMessageAction, createStructuredOfferAction, acceptOfferAction } from "../actions";
import { MessageSquare, Send, Award, Clock, Truck, FileText, ChevronRight, Check, X, ShieldCheck } from "lucide-react";

interface NegotiationRoomClientProps {
  negotiation: any;
  currentUser: any;
  isBuyer: boolean;
  isSupplier: boolean;
  previouslySampled: boolean;
}

export default function NegotiationRoomClient({
  negotiation,
  currentUser,
  isBuyer,
  isSupplier,
  previouslySampled,
}: NegotiationRoomClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>(negotiation.messages);
  const [offers, setOffers] = useState<any[]>(negotiation.offers);
  const [messageText, setMessageText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Structured offer form toggles & inputs
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [priceInput, setPriceInput] = useState(negotiation.rfq.targetPrice.toString());
  const [qtyInput, setQtyInput] = useState(negotiation.rfq.quantity.toString());
  const [shipInput, setShipInput] = useState("2000"); // standard default estimate
  const [leadInput, setLeadInput] = useState("15"); // default production lead time
  const [offerNotes, setOfferNotes] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const text = messageText;
    setMessageText("");

    startTransition(async () => {
      const res = await sendNegotiationMessageAction(negotiation.id, text);
      if (res.error) {
        alert(res.error);
      } else if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    });
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceInput);
    const qty = parseInt(qtyInput);
    const ship = parseFloat(shipInput);
    const lead = parseInt(leadInput);

    if (isNaN(price) || isNaN(qty) || isNaN(ship) || isNaN(lead)) {
      alert("Please enter valid numeric specifications.");
      return;
    }

    startTransition(async () => {
      const res = await createStructuredOfferAction(negotiation.id, price, qty, ship, lead, offerNotes);
      if (res.error) {
        alert(res.error);
      } else if (res.offer) {
        alert("Structured offer sent successfully!");
        setOffers((prev) => [res.offer, ...prev]);
        setShowOfferForm(false);
      }
    });
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm("Are you sure you want to accept this commercial offer? This will freeze pricing and quantity terms legally.")) {
      return;
    }

    startTransition(async () => {
      const res = await acceptOfferAction(offerId);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Offer accepted! You can now proceed to bulk order processing.");
        // Refresh page/redirect
        router.refresh();
      }
    });
  };

  // Find active accepted offer
  const acceptedOffer = offers.find((o) => o.status === "ACCEPTED");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-grow font-sans">
      {/* Left Pane: RFQ Context & Message Thread */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm min-h-[500px]">
        {/* RFQ Context Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="bg-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              RFQ ID: {negotiation.rfqId}
            </span>
            <span className="text-slate-400 font-semibold">
              Location: {negotiation.rfq.deliveryLocation}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {negotiation.rfq.fabric.name}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Buyer: {negotiation.rfq.buyer.businessName} | Supplier: {negotiation.rfq.fabric.supplier.businessName}
              </p>
            </div>
          </div>

          {/* Supplier details showing sample confirmation connection */}
          {isSupplier && previouslySampled && (
            <div className="bg-emerald-950 border border-emerald-900 text-emerald-300 p-2.5 rounded text-[11px] font-bold flex items-center gap-1.5 mt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Buyer previously received physical sample.
            </div>
          )}
        </div>

        {/* Messaging Stream */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[400px]">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10">
              Start chatting below. Discuss color dye matches and bulk delivery schedules.
            </p>
          ) : (
            messages.map((msg) => {
              const fromMe =
                (isBuyer && msg.senderRole === "BUYER") ||
                (isSupplier && msg.senderRole === "SUPPLIER");
              
              return (
                <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md p-3.5 rounded-lg text-xs leading-relaxed ${
                    fromMe
                      ? "bg-slate-900 text-slate-100 rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                  }`}>
                    <span className="block text-[9px] font-extrabold uppercase opacity-65 mb-1">
                      {msg.senderRole}
                    </span>
                    <p className="font-medium">{msg.text}</p>
                    <span className="block text-[8px] text-right mt-1 opacity-50">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Type message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded px-3 py-2.5 text-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded transition-all focus:outline-none disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Right Pane: Offers System */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        {/* Active accepted offer alert */}
        {acceptedOffer ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-lg shadow-sm space-y-4">
            <Award className="h-8 w-8 text-emerald-600" />
            <h3 className="text-base font-extrabold text-slate-900">Commercial Offer Accepted!</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Terms frozen at <strong>₹{parseFloat(acceptedOffer.pricePerMetre.toString()).toFixed(2)}/m</strong> for {acceptedOffer.quantity.toLocaleString()} metres.
            </p>
            {isBuyer && (
              <button
                onClick={() => router.push(`/checkout/bulk?offerId=${acceptedOffer.id}`)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider"
              >
                Create Bulk Order
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Commercial Offers
              </h3>
              {!showOfferForm && (
                <button
                  onClick={() => setShowOfferForm(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1 px-2.5 rounded uppercase tracking-wider"
                >
                  Submit Offer
                </button>
              )}
            </div>

            {/* Structured offer submitter form */}
            {showOfferForm && (
              <form onSubmit={handleSubmitOffer} className="space-y-4 border border-blue-100 bg-blue-50/20 p-4 rounded-lg">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  New Structured Offer
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">Price/m (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">Quantity (m) *</label>
                    <input
                      type="number"
                      value={qtyInput}
                      onChange={(e) => setQtyInput(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">Shipping (₹) *</label>
                    <input
                      type="number"
                      value={shipInput}
                      onChange={(e) => setShipInput(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">Lead Time (days) *</label>
                    <input
                      type="number"
                      value={leadInput}
                      onChange={(e) => setLeadInput(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-0.5">Notes</label>
                    <input
                      type="text"
                      placeholder="Special instructions..."
                      value={offerNotes}
                      onChange={(e) => setOfferNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded text-[10px] uppercase tracking-wider"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfferForm(false)}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-1.5 px-3 rounded text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List of past structured offers */}
            {offers.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-4">No active offers. Submit your commercial terms.</p>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => {
                  const createdByMe =
                    (isBuyer && offer.createdBy === "BUYER") ||
                    (isSupplier && offer.createdBy === "SUPPLIER");
                  
                  return (
                    <div
                      key={offer.id}
                      className={`border rounded-lg p-4 space-y-3 bg-white ${
                        offer.status === "ACCEPTED"
                          ? "border-emerald-500 bg-emerald-50/10 shadow-sm"
                          : offer.status === "ACTIVE"
                          ? "border-slate-300 shadow-sm"
                          : "border-slate-200 bg-slate-50/50 opacity-80"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 block">₹{parseFloat(offer.pricePerMetre.toString()).toFixed(2)} / m</span>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          offer.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-600"
                            : offer.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {offer.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold border-t border-b border-slate-100 py-2">
                        <div>Quantity: <strong className="text-slate-800">{offer.quantity.toLocaleString()}</strong></div>
                        <div>Shipping: <strong className="text-slate-800">₹{parseFloat(offer.shippingCharge.toString()).toLocaleString()}</strong></div>
                        <div>Lead Time: <strong className="text-slate-800">{offer.productionDays} days</strong></div>
                        <div className="col-span-2 text-slate-950 font-black text-xs pt-1 border-t border-slate-50 mt-1 flex justify-between">
                          <span>Total Amount</span>
                          <span>₹{parseFloat(offer.total.toString()).toLocaleString()}</span>
                        </div>
                      </div>

                      {offer.notes && (
                        <p className="text-[10px] text-slate-500 italic">Notes: {offer.notes}</p>
                      )}

                      {/* Display action buttons only if ACTIVE and not created by user */}
                      {offer.status === "ACTIVE" && !createdByMe && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check className="h-3 w-3" /> Accept
                          </button>
                          <button
                            onClick={() => {
                              setPriceInput(offer.pricePerMetre.toString());
                              setQtyInput(offer.quantity.toString());
                              setShipInput(offer.shippingCharge.toString());
                              setLeadInput(offer.productionDays.toString());
                              setShowOfferForm(true);
                            }}
                            className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-1.5 rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm bg-white"
                          >
                            Counter
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
